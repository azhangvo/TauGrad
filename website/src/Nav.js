import React, { Component } from "react";

import styles from "./css/Nav.module.scss";

import API from "./API.js";

class Nav extends Component {
  constructor(props) {
    super(props);
    this.state = { flip: false, tm: props.tm };
    this.selectorChange = this.selectorChange.bind(this);
    this.sticky = false;
    API.waitUpdate(this);
  }
  selectorChange(e) {
    this.props.tm.current.load(e.target.value);
  }
  render() {
    if (this.props.tm.current) {
      // if (this.props.tm.current.getLocation() === "/profile") {
      //   this.sticky = true;
      // } else {
      //   this.sticky = false;
      // }
      return (
        <div
          className={styles.body}
          style={{
            position: this.sticky ? "sticky" : "relative",
            borderBottom: this.sticky ? "1px solid black" : "",
          }}
        >
          <div className={styles.desktop}>
            {/* <div className={styles.banner} /> */}
            {/*<div className={styles.title}>
              <button
                onClick={() => {
                  this.props.tm.current.load("/");
                }}
              >
                <p></p>
              </button>
            </div>*/}
            <div className={styles.pages}>
              <button
                onClick={() => {
                  if (API.info["user"]) {
                    this.props.tm.current.load("/profile");
                  } else {
                    this.props.tm.current.load("/login");
                  }
                }}
                className={
                  API.info["user"]
                    ? this.props.tm.current.getLocation() === "/profile"
                      ? styles.active
                      : ""
                    : this.props.tm.current.getLocation() === "/login" ||
                      this.props.tm.current.getLocation() === "/register"
                    ? styles.active
                    : ""
                }
              >
                {/*style={{display:(API.getLoginStatus() ? "none" : "block")}}*/}
                <p>
                  {API.getLoginStatus()
                    ? API.info["user"]
                      ? API.getInfo()["user"]["username"]
                      : "…"
                    : "Login"}
                </p>
              </button>
              {/*<button
                onClick={() => {
                  this.props.tm.current.load("/about");
                }}
                className={
                  this.props.tm.current.getLocation() === "/about"
                    ? styles.active
                    : ""
                }
              >
                <p>About</p>
              </button>*/}

              <button
                  onClick={() => {
                    this.props.tm.current.load("/leaderboard");
                  }}
                  className={
                    this.props.tm.current.getLocation() === "/leaderboard"
                        ? styles.active
                        : ""
                  }
              >
                <p>Leaderboard</p>
              </button>

              <button
                  onClick={() => {
                    this.props.tm.current.load("/teamresults");
                  }}
                  className={
                    this.props.tm.current.getLocation() === "/teamresults"
                        ? styles.active
                        : ""
                  }
              >
                <p>Team Results</p>
              </button>

              <button
                onClick={() => {
                  this.props.tm.current.load("/problems");
                }}
                className={
                  this.props.tm.current.getLocation() === "/problems"
                    ? styles.active
                    : ""
                }
              >
                <p>Problems</p>
              </button>

              <button
                onClick={() => {
                  this.props.tm.current.load("/submit");
                }}
                className={
                  this.props.tm.current.getLocation() === "/submit"
                    ? styles.active
                    : ""
                }
              >
                <p>Submit</p>
              </button>
              <button
                onClick={() => {
                  this.props.tm.current.load("/");
                }}
                className={
                  this.props.tm.current.getLocation() === "/"
                    ? styles.active
                    : ""
                }
              >
                <p>Home</p>
              </button>
            </div>

            <div className={styles.account}>
              <button
                onClick={() => {
                  this.props.tm.current.load("/profile");
                }}
                className={styles.profile}
              ></button>
            </div>
          </div>
          <div className={styles.mobile}>
            <div className={styles.title}>
              <button
                onClick={() => {
                  this.props.tm.current.load("/");
                }}
              >
                <p></p>
              </button>
            </div>
            <select onChange={this.selectorChange}>
              <option value="/">Home</option>
              <option value="/submit">Submit</option>
              <option value="/problems">Problems</option>
              <option value={API.info["user"] ? "/profile" : "/login"}>
                {API.getLoginStatus()
                  ? API.info["user"]
                    ? API.getInfo()["user"]["username"]
                    : "…"
                  : "Login"}
              </option>
            </select>
            <div className={styles.account}>
              <button
                onClick={() => {
                  this.props.tm.current.load("/profile");
                }}
                className={styles.profile}
              ></button>
            </div>
          </div>
        </div>
      );
    } else {
      return null;
    }
  }
}

export default Nav;
