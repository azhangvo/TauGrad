import { ToastsStore } from "react-toasts";

var token = "";

var waitingComponents = [];

class API {
  static info = {};
  static image = "/content/placeholder.png";
  static datasets = [];
  static status = [];
  static results = [];
  static total = 0;
  static lastProblem = "";
  // static status = [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2];
  // static results = [true, true, true, true, true, false, false, false, false, false];
  // static total = 5;
  // static lastProblem = "sum";
  static getLoginStatus() {
    return token !== "";
  }

  static checkRemember() {
    if (
      localStorage.getItem("token") &&
      localStorage.getItem("token").startsWith("ey")
    ) {
      token = localStorage.getItem("token");
      this.retrieveInfo();
    }
  }

  static retrieveInfo() {
    return new Promise((resolve, reject) => {
      fetch("/api/user", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then(
        (resp) => {
          if (resp.status === 200) {
            resp.json().then((resp) => {
              this.info = resp;
              this.started = resp.started;
              this.ended = resp.ended;
              if (!this.info.profile)
                this.info.profile = "/content/account_box_dark.svg";
              this.image = "/images/" + resp.image;
              waitingComponents.forEach((component) => {
                component.forceUpdate();
              });
              resolve();
            });
          } else {
            resp.json().then((resp) => {
              ToastsStore.error(resp.message, 10000);
              if (resp.message === "Login is invalid") {
                token = "";
                localStorage.removeItem("token");
                waitingComponents.forEach((component) => {
                  component.forceUpdate();
                });
              }
              resolve();
            });
          }
        },
        (err) => {
          console.log(err);
        }
      );
    });
  }

  static updateInfo(changes) {
    return new Promise((resolve, reject) => {
      if (changes.team) {
        fetch("/api/confirmTeam", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ teamcode: changes.team }),
        }).then(
          (resp) => {
            if (resp.status === 200) {
              resp.json().then((resp) => {
                this.info.team = resp.team;
                waitingComponents.forEach((component) => {
                  component.forceUpdate();
                });
                resolve();
              });
            } else {
              resp.json().then((resp) => {
                ToastsStore.error(resp.message, 10000);
                resolve();
              });
            }
          },
          (err) => {
            console.log(err);
          }
        );
      } else {
        resolve();
      }
    });
  }

  static waitUpdate(component) {
    waitingComponents.push(component);
  }

  static getInfo() {
    return this.info;
  }

  static startTime() {
    return new Promise((resolve, reject) => {
      fetch("/api/startTime", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then((resp) => {
        if (resp.status === 200) {
          API.started = true;
          resolve();
        } else {
          resp.json().then((resp) => {
            ToastsStore.error(resp.message, 10000);
            resolve(false);
          });
        }
      });
    });
  }

  static getProblems() {
    return new Promise((resolve, reject) => {
      fetch("/api/problems", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then(
        (resp) => {
          if (resp.status === 200) {
            resp.json().then((resp) => {
              resolve(resp.problems);
            });
          } else {
            resp.json().then((resp) => {
              ToastsStore.error(resp.message);
              resolve(false);
            });
          }
        },
        (err) => {
          console.log(err);
        }
      );
    });
  }

  static getWrittenProblems() {
    return new Promise((resolve, reject) => {
      fetch("/api/writtenProblems", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then(
        (resp) => {
          if (resp.status === 200) {
            resp.text().then((site) => {
              resolve(site);
            });
          } else {
            resp.json().then((resp) => {
              ToastsStore.error(resp.message, 10000);
              resolve("<p> Failed </p>");
            });
          }
        },
        (err) => {
          console.log(err);
        }
      );
    });
  }

  static submit(file, language, problem) {
    return new Promise((resolve, reject) => {
      let form = new FormData();
      form.append("submission", file);
      form.append("language", language);
      form.append("problem", problem);
      fetch("/api/submit", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      }).then(
        (resp) => {
          if (resp.status === 200) {
            ToastsStore.success(
              "Successfully submitted your solution for " + problem + "."
            );
            resp.json().then((resp) => {
              this.status = resp.status;
              this.results = resp.results;
              this.total = resp.total;
              this.lastProblem = problem;
              resolve(true);
            });
            // resolve(true);
          } else {
            resolve(false);
            resp.json().then((resp) => {
              ToastsStore.error(resp.message, 10000);
            });
          }
        },
        (err) => {
          console.log(err);
        }
      );
    });
  }

  static getTeamResults() {
    return new Promise((resolve, reject) => {
      fetch("/api/teamScores", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then((resp) => {
        if (resp.status === 200) {
          resp.json().then((resp) => {
            resolve(resp.scores);
            waitingComponents.forEach((component) => {
              component.forceUpdate();
            });
          });
        } else {
          resp.json().then((resp) => {
            ToastsStore.error(resp.message, 10000);
            resolve(false);
          });
        }
      });
    });
  }

  static getLeaderboard() {
    return new Promise((resolve, reject) => {
      fetch("/api/leaderboard", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then((resp) => {
        if (resp.status === 200) {
          resp.json().then((resp) => {
            resolve(resp);
            waitingComponents.forEach((component) => {
              component.forceUpdate();
            });
          });
        } else {
          resp.json().then((resp) => {
            ToastsStore.error(resp.message, 10000);
            resolve(false);
          });
        }
      });
    });
  }

  static checkPassword(password) {
    return new Promise((resolve, reject) => {
      fetch("/api/check", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: password,
        }),
      }).then(
        (resp) => {
          if (resp.status === 200) {
            resp.json().then((resp) => {
              resolve(resp.valid);
            });
          } else {
            resp.json().then((resp) => {
              ToastsStore.error(resp.message, 10000);
              resolve(false);
            });
          }
        },
        (err) => {
          console.log(err);
        }
      );
    });
  }

  static login(identifier, password, remember, tm) {
    fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        identifier: identifier,
        password: password,
      }),
    }).then(
      (resp) => {
        if (resp.status === 200) {
          resp.json().then((resp) => {
            ToastsStore.success("Welcome, " + resp.username + "!");
            token = resp.token;
            if (remember) {
              localStorage.setItem("token", token);
            }
            this.retrieveInfo();
            tm.current.load("/submit");
          });
        } else {
          resp.json().then((resp) => {
            ToastsStore.error(resp.message, 10000);
          });
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  static register(email, username, password, remember, tm) {
    fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        username: username,
        password: password,
        time: Math.floor(Date.now() / 1000),
      }),
    }).then(
      (resp) => {
        if (resp.status === 200) {
          ToastsStore.success(
            "Your account, " +
              username +
              ", has been created! Please login now!",
            10000
          );
          tm.current.load("/login");
        } else {
          resp.json().then((resp) => {
            ToastsStore.error(resp.message, 10000);
          });
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  static logout(all, tm) {
    localStorage.removeItem("token");
    this.info = {};
    fetch("/api/logout?logoutall=" + (all ? "true" : "false"), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(
      (resp) => {
        if (resp.status === 200) {
          ToastsStore.success("Successfully logged out");
          token = "";
          tm.current.load("/login");
        } else {
          resp.json().then((resp) => {
            ToastsStore.error(resp.message, 10000);
          });
        }
      },
      (err) => {
        console.log(err);
      }
    );
    token = "";
  }

  static startTimer(code) {
    return new Promise((resolve, reject) => {
      fetch("/api/starttime", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          teamcode: code,
          starttime: Math.floor(Date.now() / 1000),
        }),
      }).then(
        (resp) => {
          if (resp.status === 200) {
            // success
          } else {
            resp.json().then((resp) => {
              ToastsStore.error(resp.message, 10000);
              reject();
            });
          }
        },
        (err) => {
          console.log(err);
        }
      );
    });
  }

  static genTeamCode(teamname) {
    return new Promise((resolve, reject) => {
      fetch("/api/genTeamCode", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teamname: teamname
        })
      }).then(
        (resp) => {
          if (resp.status === 200) {
            // success
            resp.json().then((resp) => {
              ToastsStore.success("Created Team: " + resp.team);
              resolve(true)
            })
          } else {
            resp.json().then((resp) => {
              ToastsStore.error(resp.message, 10000);
              resolve(false);
            });
          }
        },
        (err) => {
          console.log(err);
        }
      );
    });
  }
}

export default API;
