import { ToastsStore } from "react-toasts";

var token = "";
var imageName = "";

var waitingComponents = [];

class API {
  static info = {};
  static image = "/content/placeholder.png";
  static datasets = [];
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
          Authorization: `Bearer ${token}`
        }
      }).then(
        resp => {
          if (resp.status === 200) {
            resp.json().then(resp => {
              this.info = resp;
              this.image = "/images/" + resp.image;
              imageName = resp.image;
              waitingComponents.forEach(component => {
                component.forceUpdate();
              });
              resolve();
            });
          } else {
            resp.json().then(resp => {
              ToastsStore.error(resp.message, 10000);
              if (resp.message === "Login is invalid") {
                token = "";
                localStorage.removeItem("token");
                waitingComponents.forEach(component => {
                  component.forceUpdate();
                });
              }
              resolve();
            });
          }
        },
        err => {
          console.log(err);
        }
      );
    });
  }
  static waitUpdate(component) {
    waitingComponents.push(component);
  }
  static getInfo() {
    return this.info;
  }
  static getProblems() {
    return new Promise((resolve, reject) => {
      fetch("/api/problems", {
        method: "GET"
      }).then(
        resp => {
          if (resp.status === 200) {
            resp.json().then(resp => {
              resolve(resp.problems);
            });
          } else {
            resp.json().then(resp => {
              ToastsStore.error(resp.message, 10000);
              resolve(false);
            });
          }
        },
        err => {
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
          Authorization: `Bearer ${token}`
        },
        body: form
      }).then(
        resp => {
          if (resp.status === 200) {
            ToastsStore.success(
              "Successfully submitted your solution for " + problem + "."
            );
            resolve(true);
          } else {
            resolve(false);
            resp.json().then(resp => {
              ToastsStore.error(resp.message, 10000);
            });
          }
        },
        err => {
          console.log(err);
        }
      );
    });
  }
  static checkPassword(password) {
    return new Promise((resolve, reject) => {
      fetch("/api/check", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          password: password
        })
      }).then(
        resp => {
          if (resp.status === 200) {
            resp.json().then(resp => {
              resolve(resp.valid);
            });
          } else {
            resp.json().then(resp => {
              ToastsStore.error(resp.message, 10000);
              resolve(false);
            });
          }
        },
        err => {
          console.log(err);
        }
      );
    });
  }

  static login(identifier, password, remember, tm) {
    fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        identifier: identifier,
        password: password
      })
    }).then(
      resp => {
        if (resp.status === 200) {
          resp.json().then(resp => {
            ToastsStore.success("Welcome, " + resp.username + "!");
            token = resp.token;
            if (remember) {
              localStorage.setItem("token", token);
            }
            this.retrieveInfo();
            tm.current.load("/submit");
          });
        } else {
          resp.json().then(resp => {
            ToastsStore.error(resp.message, 10000);
          });
        }
      },
      err => {
        console.log(err);
      }
    );
  }
  static register(email, username, password, remember, tm) {
    fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: email,
        username: username,
        password: password,
        time: Math.floor(Date.now() / 1000)
      })
    }).then(
      resp => {
        if (resp.status === 200) {
          ToastsStore.success(
            "Your account, " +
              username +
              ", has been created! Please login now!",
            10000
          );
          tm.current.load("/login");
        } else {
          resp.json().then(resp => {
            ToastsStore.error(resp.message, 10000);
          });
        }
      },
      err => {
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
        Authorization: `Bearer ${token}`
      }
    }).then(
      resp => {
        if (resp.status === 200) {
          ToastsStore.success("Successfully logged out");
          token = "";
          tm.current.load("/login");
        } else {
          resp.json().then(resp => {
            ToastsStore.error(resp.message, 10000);
          });
        }
      },
      err => {
        console.log(err);
      }
    );
    token = "";
  }
  static getDatasets() {
    return new Promise((resolve, reject) => {
      fetch("/api/datasets", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`
        }
      }).then(
        resp => {
          if (resp.status === 200) {
            resp.json().then(resp => {
              this.datasets = resp.datasets;
              resolve(resp.datasets);
            });
          } else {
            resp.json().then(resp => {
              ToastsStore.error(resp.message, 10000);
              reject();
            });
          }
        },
        err => {
          console.log(err);
        }
      );
    });
  }
}

export default API;