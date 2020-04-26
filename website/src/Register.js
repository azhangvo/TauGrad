import React, { Component } from "react";
import { ToastsStore } from "react-toasts";

import API from "./API.js";

import styles from "./css/Login.module.scss"; // Leaving as the same since login should look similar to register

class Register extends Component {
  constructor(props) {
    super(props);
    this.state = { remember: true };
    this.startRegister = this.startRegister.bind(this);
  }
  startRegister(e) {
    let email = document.getElementsByName("email")[0];
    let username = document.getElementsByName("username")[0];
    let password = document.getElementsByName("password")[0];
    if (!email.validity.valid || email.value.length <= 3) {
      ToastsStore.error("The entered email is invalid", 5000);
      return;
    }
    if (username.value.length === 0) {
      ToastsStore.error("Please enter a username", 5000);
      return;
    } else if (username.value.length < 3) {
      ToastsStore.error("Usernames must be at least 3 characters long", 5000);
      return;
    }
    if (password.value.length === 0) {
      ToastsStore.error("Please enter a password", 5000);
      return;
    } else if (password.value.length < 8) {
      ToastsStore.error("Passwordss must be at least 8 characters long", 5000);
      return;
    }
    API.register(
      email.value,
      username.value,
      password.value,
      this.state.remember,
      this.props.tm
    );
  }
  render() {
    return (
      <div className={styles.container}>
        <h1 styles={styles.title}>Register</h1>
        <div className={styles.formContainer}>
          <label>
            <b>Email address</b>
          </label>
          <input
            type="text"
            pattern={
              "[a-zA-Z0-9!#$%&amp;'*+/=?^_`{|}~.-]+@[a-zA-Z0-9-]+(.[a-zA-Z0-9-]+)*"
            }
            placeholder="Enter email address"
            name="email"
            required
            tabIndex={1}
          />
          <label>
            <b>Username</b>
          </label>
          <input
            type="text"
            placeholder="Create username"
            name="username"
            required
            tabIndex={2}
          />
          <label>
            <b>Password</b>
          </label>
          <input
            type="password"
            placeholder="Create password"
            name="password"
            required
            tabIndex={3}
          />
          <button type="submit" onClick={this.startRegister} tabIndex={4}>
            Register
          </button>
          <label>
            <input
              type="checkbox"
              checked={this.state.remember}
              onChange={() => this.setState({ remember: !this.state.remember })}
              name="remember"
              tabIndex={5}
            />
            Remember me
          </label>
          <button
            className={styles.interact}
            onClick={() => this.props.tm.current.load("/login")}
            tabIndex={6}
          >
            Already have an account?
          </button>
        </div>
      </div>
    );
  }
}

export default Register;
