import React, { Component } from "react";

import API from "./API.js";

import styles from "./css/CompetitionEnded.module.scss";

class CompetitionEnded extends Component {
  render() {
    return (
      <div className={styles.container}>
        <div className={styles.dataContainer}>
          <h1>Start Competition</h1>
          <p>
            Your team's timer has not started yet, and you will not have access
            to the problems or the submission page until you start.
          </p>
          <p>
            By clicking the button below, you are starting your team's 3 hour
            window to complete the competition. Cheating is strictly forbidden,
            along with trying to circumvent any rules or systems. A full set of
            rules can be found here:
          </p>
          <p>
            Once you start, you cannot go back, so ensure that your entire team
            is ready before starting
          </p>
          <button
            type="submit"
            onClick={() => this.setState({ confirm: true })}
          >
            Start
          </button>
        </div>
        <div
          className={styles.confirmWindow}
          style={{ display: this.state.confirm ? "flex" : "none" }}
        >
          <div>
            <h3>Are you sure you want to start?</h3>
            <button type="submit" onClick={() => API.startTime()}>
              Start
            </button>
            <button
              type="submit"
              onClick={() => this.setState({ confirm: false })}
            >
              No
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default CompetitionEnded;
