import React, { Component } from "react";

import styles from "./css/Results.module.scss";

import API from "./API.js";

class Results extends Component {
  constructor(props) {
    super(props);
    this.ProblemHandler = this.ProblemHandler.bind(this);
    this.CompileHandler = this.CompileHandler.bind(this);
    this.ResultsTable = this.ResultsTable.bind(this);
  }
  render() {
    return <this.ProblemHandler />;
  }

  ProblemHandler() {
    console.log(API.lastProblem);
    if (!API.lastProblem) {
      this.props.tm.current.load("/submit");
    }
    return (
      <div className={styles.container}>
        <h1 className={styles.problemName}>
          {" "}
          {"Problem: " + API.lastProblem}{" "}
        </h1>
        <this.CompileHandler />
      </div>
    );
  }

  CompileHandler() {
    if (API.status[0] === 4) {
      return (
        <div className={styles.flexCenter}>
          <div className={styles.statusBox + " " + styles.red} />
          <h3> Compile Time Error </h3>
        </div>
      );
    } else {
      return <this.ResultsTable />;
    }
  }

  ResultsTable() {
    var rows = [];
    for (var i = 0; i < 10; i++) {
      if (API.status[i + 1] === 5) {
        rows.push(
          <tr>
            <td>
              <div className={styles.statusContainer}>
                <div className={styles.statusBox + " " + styles.red} />
                {i + 1}
              </div>
            </td>
            <td>
              <div className={styles.flexCenter}>{"Runtime Error"}</div>
            </td>
          </tr>
        );
      } else if (API.status[i + 1] === 3) {
        rows.push(
          <tr>
            <td>
              <div className={styles.statusContainer}>
                <div className={styles.statusBox + " " + styles.orange} />
                {i + 1}
              </div>
            </td>
            <td>
              <div className={styles.flexCenter}>{"Code Timed Out"}</div>
            </td>
          </tr>
        );
      } else if (API.status[i + 1] === 2) {
        if (API.results[i]) {
          rows.push(
            <tr>
              <td>
                <div className={styles.statusContainer}>
                  <div className={styles.statusBox + " " + styles.green} />
                  {i + 1}
                </div>
              </td>
              <td>
                <div className={styles.flexCenter}>{"Correct"}</div>
              </td>
            </tr>
          );
        } else {
          rows.push(
            <tr>
              <td>
                <div className={styles.statusContainer}>
                  <div className={styles.statusBox + " " + styles.red} />
                  {i + 1}
                </div>
              </td>
              <td>
                <div className={styles.flexCenter}>{"Incorrect"}</div>
              </td>
            </tr>
          );
        }
      }
    }
    return (
      <>
        <h3 className={styles.totalNum}> {"Total: " + API.total + "/10"} </h3>
        <table>
          <tr className={styles.tableTitle}>
            <td>
              <div className={styles.flexCenter}>Case</div>
            </td>
            <td>
              <div className={styles.flexCenter}>Status</div>
            </td>
          </tr>
          {rows}
        </table>
      </>
    );
  }
}

export default Results;
