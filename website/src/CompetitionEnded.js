import React, { Component } from "react";

import styles from "./css/CompetitionEnded.module.scss";

class CompetitionEnded extends Component {
  constructor(props) {
    super(props);
    this.state = { confirm: false };
  }
  render() {
    return (
      <div className={styles.container}>
        <div className={styles.dataContainer}>
          <h1>Competition Over</h1>
          <p>Your team's timer is now over! You can finally relax!</p>
          <p>
            Congrats on completeting <b>Noctem Virtual!</b> Give yourself a pat
            on the back. You did well!
          </p>
          <p>
            If you have any questions, email us at{" "}
            <a href="mailto:noctemdevelopment@gmail.com">
              noctemdevelopment@gmail.com
            </a>
            . Also, don't forget to come join your fellow competitors at our
            Discord at{" "}
            <a href="https://discord.gg/JU7JCd6">discord.gg/JU7JCd6</a>! You get
            to meet us, as well as talk (and have fun with) many unique people!
          </p>
        </div>
      </div>
    );
  }
}

export default CompetitionEnded;
