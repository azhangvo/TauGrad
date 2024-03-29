import React, { Component } from "react";

import styles from "./css/Home.module.scss";
import API from "./API.js";

class Home extends Component {
  constructor(props) {
    super(props);
    this.text = "Yay";
  }
  startTimer() {
    return;
  }
  // helper, calculate time left
  calculateTimeLeft() {
    const difference = +new Date("2020-01-01") - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }

    return timeLeft;
  }
  render() {
    if (true) {
      // logged in, show page with start button
      // API.getLoginStatus() && this.props.tm replace later
      return (
        <div className={styles.container}>
          <div className={styles.formContainer}>
            <h1>Noctem Virtual</h1>
            <p>
              {" "}
              Welcome! This website has been developed by Arthur Zhang, and Charlotte Wang, and is
              currently being used for <b>Noctem Virtual II.</b>
            </p>
            <p>
              Please take a moment to familarize yourself with the site. You'll
              need to register an account by clicking on login then need an
              account. After that, you can check out the submit page where you
              can try out submitting a problem!
            </p>
            <p>
              The test problem is a USACO none level problem, called sum. You
              will need to read in two integers from a file called "sum.in" and
              output the sum of the two numbers in "sum.out". If everything goes
              well, then you will be directed to a results page showing the
              results of running your code.
            </p>
            <p>
              If you find a bug or have questions, feel free to email{" "}
              <a href="mailto:noctemdevelopment@gmail.com">
                noctemdevelopment@gmail.com
              </a>
              , message me on Discord at Tau#0001, or join our Discord at{" "}
              <a href="https://discord.gg/JU7JCd6">discord.gg/JU7JCd6</a>.
            </p>
            <p style={{ textAlign: "right" }}>- Arthur Zhang</p>
            <button
              className={styles.interact}
              style={{ display: API.getLoginStatus() ? "none" : "block" }}
              type="submit"
              onClick={() => this.props.tm.current.load("/login")}
            >
              Login
            </button>
            <button
              className={styles.interact}
              style={{ display: API.getLoginStatus() ? "block" : "none" }}
              type="submit"
              onClick={() => this.props.tm.current.load("/submit")}
            >
              Submit
            </button>
          </div>
        </div>
      );
    }
    return (
      // not logged in, shows normal things instead
      <div className={styles.container}>
        {this.text.split("\n").map((i, key) => {
          return <div key={key}>{i}</div>;
        })}
      </div>
    );
  }
}

export default Home;
