import React, { Component } from "react";

import styles from "./css/Home.module.scss";

class Home extends Component {
  constructor(props) {
    super(props);
    this.text = "Yay"
  }
  render() {
    return (
      <div className={styles.container}>
      </div>
    );
  }
}

export default Home;
