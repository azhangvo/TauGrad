import React, { Component } from "react";

import styles from "./css/CompetitionNotStarted.module.scss";

class CompetitionNotStarted extends Component {
  constructor(props) {
    super(props);
    this.state = { confirm: false };
  }
  render() {
    return (
      <div className={styles.container}>
        <div className={styles.dataContainer}>
          <h1>Wow! You're early!</h1>
          <p>
            {" "}
            We admire your will and your enthusiasm for getting started.
            However, Noctem Virtual <b>has not started yet!</b> Check out our
            main website at <a href="https://noctem.dev">noctem.dev</a> for more
            details.
          </p>
          <p>
            Otherwise, just take a moment to sign up and do some testing. We
            look forward to seeing you on <b>July 19th at 8:00AM EST (GMT-4)!</b>
          </p>
        </div>
      </div>
    );
  }
}

export default CompetitionNotStarted;
