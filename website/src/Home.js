import React, { Component } from "react";

import styles from "./css/Home.module.scss";
import API from "./API.js";

class Home extends Component {
  constructor(props) {
    super(props);
    this.text = "Yay"
    console.log("Reached")
  }
  startTimer(){
    return ;
  }
  // helper, calculate time left
  calculateTimeLeft() {
    const difference = +new Date("2020-01-01") - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
  }

  return timeLeft;
};
  render() {

    if (true) {
      // logged in, show page with start button
      // API.getLoginStatus() && this.props.tm replace later
      return (
        <div className={styles.container}>
          <h1 className={styles.title}>Welcome</h1>
          <div className={styles.formContainer}>
            <label>
              <b>Team Code</b>
            </label>
            <input
              type="text"
              placeholder="Enter Team Code"
              name="teamcode"
              required
              tabIndex={1}
            />
            <button
              className={styles.interact}
              button type="submit"
              onClick={this.startTimer}
            >
            Start
          </button>
          </div>
        </div>
      );
    }
    return (
      // not logged in, shows normal things instead
      <div className={styles.container}>
        <h1 className={styles.title}>Welcome</h1>

      </div>
    );
  }
}

export default Home;
