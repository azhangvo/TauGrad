import React, { Component } from "react";

import { ToastsStore } from "react-toasts";

import API from "./API.js";

import styles from "./css/Login.module.scss";

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = { remember: true };
    this.startLogin = this.startLogin.bind(this);
    this.checkSubmit = this.checkSubmit.bind(this);
  }
  startLogin() {
    let username = document.getElementsByName("username")[0];
    let password = document.getElementsByName("password")[0];
    if (username.value.length === 0) {
      ToastsStore.error("Please enter a username or email", 5000);
      return;
    }
    if (password.value.length === 0) {
      ToastsStore.error("Please enter a password", 5000);
      return;
    }
    API.login(
      username.value,
      password.value,
      this.state.remember,
      this.props.tm
    );
  }
  checkSubmit(e) {
    var code = e.keyCode ? e.keyCode : e.which;
    if (code === 13) {
      this.startLogin();
    }
  }
  render() {
    if (API.getLoginStatus() && this.props.tm) {
      this.props.tm.current.load("/profile");
    }
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Login</h1>
        <div className={styles.formContainer}>
          <label>
            <b>Username or Email</b>
          </label>
          <input
            type="text"
            placeholder="Enter username or email"
            name="username"
            required
            tabIndex={1}
          />
          <label>
            <b>Password</b>
            <button className={styles.interact} id={styles.forgot}>
              Forgot password?
            </button>
          </label>
          <input
            type="password"
            placeholder="Enter password"
            name="password"
            onKeyDown={this.checkSubmit}
            required
            tabIndex={2}
          />
          <button type="submit" onClick={this.startLogin} tabIndex={3}>
            Login
          </button>
          <label>
            <input
              type="checkbox"
              checked={this.state.remember}
              onChange={() => this.setState({ remember: !this.state.remember })}
              name="remember"
              tabIndex={4}
            />
            Remember me
          </label>
          <button
            className={styles.interact}
            onClick={() => this.props.tm.current.load("/register")}
            tabIndex={5}
          >
            Need an account?
          </button>
        </div>
      </div>
    );
  }
}

export default Login;
