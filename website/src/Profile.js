import React, { Component } from "react";
import { ToastsStore } from "react-toasts";

import API from "./API.js";

import styles from "./css/Profile.module.scss";

class Profile extends Component {
  constructor(props) {
    super(props);
    API.waitUpdate(this);
    this.state = { logoutAll: false, dataset: null, changed: false, confirm: false };
    this.datasetOptions = [];
    this.checkChanged = this.checkChanged.bind(this);
    this.save = this.save.bind(this);
    this.genTeamCode = this.genTeamCode.bind(this);
  }
  componentDidMount() {
    this.resizeProfileIcon();
  }
  componentDidUpdate() {
    this.resizeProfileIcon();
  }
  checkChanged() {
    var changed =
      document.getElementsByName("username")[0].value.length !== 0 &&
      document.getElementsByName("username")[0].value !==
        API.info.user.username;
    changed =
      changed || document.getElementsByName("team")[0].value.length !== 0;
    if (this.state.changed !== changed) this.setState({ changed });
  }
  resizeProfileIcon() {
    if (API.getLoginStatus() && API.info.user) {
      var element = document.getElementById("profilePicture");
      var title = document.getElementById("title");
      var elmHeight, elmMargin;
      if (document.all) {
        elmHeight = title.currentStyle.height;
        elmMargin =
          parseInt(title.currentStyle.marginTop, 10) +
          parseInt(title.currentStyle.marginBottom, 10) +
          "px";
      } else {
        elmHeight = document.defaultView
          .getComputedStyle(title, "")
          .getPropertyValue("height");
        elmMargin =
          parseInt(
            document.defaultView
              .getComputedStyle(title, "")
              .getPropertyValue("margin-top")
          ) + "px";
      }
      element.style.height = elmHeight;
      element.style.width = elmHeight;
      element.style["margin-top"] = elmMargin;
    }
  }
  save() {
    if (this.state.changed) {
      var password = document.getElementsByName("currentPassword")[0].value;
      if (!password || password.length === 0) {
        ToastsStore.error("Please enter your password in order to save!");
        return;
      }

      if (
        document.getElementsByName("username")[0].value.length !== 0 &&
        document.getElementsByName("username")[0].value !==
          API.info.user.username
      ) {
        ToastsStore.error(
          "Sorry, but changing your username is not currently supported!"
        );
        return;
      }

      API.checkPassword(
        document.getElementsByName("currentPassword")[0].value
      ).then((success) => {
        document.getElementsByName("currentPassword")[0].value = "";
        if (!success) {
          ToastsStore.error("Invalid password");
          return;
        }

        var changes = {};
        // if (
        //   document.getElementsByName("username")[0].value.length !== 0 &&
        //   document.getElementsByName("username")[0].value !==
        //     API.info.user.username
        // )
        //   changes["username"] = document.getElementsByName("username")[0].value;

        if (document.getElementsByName("team")[0].value.length !== 0)
          changes["team"] = document.getElementsByName("team")[0].value;

        API.updateInfo(changes).then(() => {
          ToastsStore.success("Successfully updated settings");
          // this.props.tm.current.load("/label")
          API.retrieveInfo().then(() => {
            document.getElementsByName("username")[0].value = "";
            document.getElementsByName("currentPassword")[0].value = "";
            document.getElementsByName("team")[0].value = "";
            this.checkChanged();
            this.forceUpdate();
          });
        });
      });
    } else {
      ToastsStore.error("You have made no changes");
    }
  }
  genTeamCode(){
      let teamname = document.getElementsByName("teamname")[0].value;

      API.genTeamCode(teamname).then((success) => {
        if(success) {
          ToastsStore.success("Successfully generated a new team code!");
          API.retrieveInfo().then(() => {
            document.getElementsByName("teamname")[0].value = "";
            this.forceUpdate();
          });
        }
      });
  }
  render() {
    if (API.getLoginStatus() && API.info.user) {
      return (
        <div className={styles.container}>
          <div className={styles.infoContainer}>
            <img
              id="profilePicture"
              src={API.info["profile"]}
              alt="Profile"
            />
            <h1 id="title">Profile</h1>
            <label id="username">Username</label>
            <input
              type="text"
              placeholder={API.info["user"]["username"]}
              name="username"
              onChange={this.checkChanged}
            />
            <label id="currentPassword">Current Password</label>
            <input
              type="password"
              placeholder="Type in your password to save changes"
              name="currentPassword"
              required={this.state.changed ? true : false}
            />
            <label id="team">
              Team - <b>{API.info.team ? API.info.team : "None"}</b>{" "}
              {API.info.team ? "-" : ""}{" "}
              <b>{API.info.team ? API.info.teamcode : ""}</b>
            </label>
            <input
              type="text"
              placeholder="Enter Code (Ask your team lead)"
              name="team"
              onChange={this.checkChanged}
            />
            <hr/>
            <br/>
            <label><b>Create a New Team</b></label>
            <div className={styles.teamcontainer}>
                <input
                  type="text"
                  placeholder="Team Name"
                  name={"teamname"}
                />
                <button type="submit" onClick={() => this.setState({confirm: true})}>
                    Create Team
                </button>
            </div>
            <hr/>
            <button type="submit" onClick={this.save}>
              Save
            </button>
            <p
              className={styles.unsavedChanges}
              style={{ visibility: this.state.changed ? "visible" : "hidden" }}
            >
              <b>Careful! You have unsaved changes!</b>
            </p>
          </div>
          <div id={styles.logout}>
            <label>
              <input
                type="checkbox"
                checked={this.state.logoutAll}
                onChange={() =>
                  this.setState({ logoutAll: !this.state.logoutAll })
                }
                name="remember"
              />
              Logout all devices
            </label>
            <button
              type="submit"
              onClick={() => API.logout(this.state.logoutAll, this.props.tm)}
            >
              Logout
            </button>
          </div>
          <div className={styles.confirm} style={{display: this.state.confirm ? "flex" : "none"}} onClick={() => this.setState({confirm: false})}>
            <div>
              <label>
                Are you sure you want to create a new team?
              </label>
              <div style={{display: "flex"}}>
                <button type={"submit"} onClick={this.genTeamCode}>Yes</button>
                <button type={"submit"} onClick={() => this.setState({confirm: false})}>No</button>
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className={styles.container}>
          <div>
            <h1>You are not logged in</h1>
            <button
              type="submit"
              onClick={() => this.props.tm.current.load("/login")}
            >
              Login
            </button>
          </div>
        </div>
      );
    }
  }
}

export default Profile;
