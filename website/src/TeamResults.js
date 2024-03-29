import React, { Component } from "react";

import styles from "./css/TeamResults.module.scss";

import API from "./API.js";

class Results extends Component {
  constructor(props) {
    super(props);
    // this.ProblemHandler = this.ProblemHandler.bind(this);
    this.CompileHandler = this.CompileHandler.bind(this);
    this.ResultsTable = this.ResultsTable.bind(this);
    this.state = { problems: [], scores: [] };
    API.getProblems().then((problems) => {
      this.setState({ problems });
    });
    API.getTeamResults().then((scores) => {
      this.setState({ scores });
    });
    API.waitUpdate(this);
  }
  render() {
    if (!this.state.scores.length) {
      return <></>;
    }
    return (
      <div className={styles.container}>
      <h1>{API.info.team}</h1>
        <div className={styles.flexCenter}>
          <div className={styles.problem}></div>
          {this.state.problems.map((problem, i) => {
            return (
              <div className={styles.problem}>
                <h4>{problem}</h4>
              </div>
            );
          })}
          <div className={styles.problem}></div>
        </div>
        {this.state.scores.map((scores, i) => {
          return (
            <div key={i}>
              <this.CompileHandler scores={scores} />
            </div>
          );
        })}
      </div>
    );
  }

  // ProblemHandler(props) {
  //   return (
  //     <div>
  //       <this.CompileHandler />
  //     </div>
  //   );
  // }

  CompileHandler(props) {
    let scores = props.scores;
    let problemCols = [];
    problemCols.push(
      <div className={styles.problem}>
        <h5 style={{ textAlign: "right" }}>{scores.username}</h5>
      </div>
    );
    for (let problem in scores) {
      if (problem === "username") continue;
      if(!scores.hasOwnProperty(problem)) {
        console.log(`Missing property ${problem}`)
        continue;
      }
      console.log(`${scores.username} | ${problem} | ${scores[problem] === "Missing"} | ${scores[problem]["status"] && scores[problem]["status"]}`)
      if (scores[problem] === "Missing") {
        problemCols.push(<div className={styles.problem}>x</div>);
      } else if (scores[problem]["status"] && scores[problem]["status"][0] === 4) {
        problemCols.push(
          <div className={styles.problem}>
            <h3 style={{ margin: 0 }}> Compilation Error </h3>
          </div>
        );
      } else {
        problemCols.push(
          <div className={styles.problem}>
            <this.ResultsTable scores={scores[problem]} />
          </div>
        );
      }
    }
    problemCols.push(<div className={styles.problem}></div>);
    return <div className={styles.flexCenter}>{problemCols}</div>;
  }

  addStatus(row, scores, i) {
      if (scores.status[i + 1] === 5) {
          row.push(
              <div className={styles.statusContainer}>
                  <div className={[styles.statusBox, styles.red, "hint--error", "hint--top"].join(" ")} aria-label={"Runtime error"} />
              </div>
          );
      } else if (scores.status[i + 1] === 3) {
          row.push(
              <div className={styles.statusContainer}>
                  <div className={[styles.statusBox, styles.orange, "hint--warning", "hint--top"].join(" ")} aria-label={"Timeout"} />
              </div>
          );
      } else if (scores.status[i + 1] === 2) {
          if (scores.results[i]) {
              row.push(
                  <div className={styles.statusContainer}>
                      <div className={[styles.statusBox, styles.green, "hint--success", "hint--top"].join(" ")} aria-label={"Correct answer"} />
                  </div>
              );
          } else {
              row.push(
                  <div className={styles.statusContainer}>
                      <div className={[styles.statusBox, styles.red, "hint--error", "hint--top"].join(" ")} aria-label={"Wrong answer"} />
                  </div>
              );
          }
      }
  }

  ResultsTable(props) {
    let i;
    let scores = props.scores;
    console.log(scores);
    let rows1 = [];
    let rows2 = [];
    for (i = 0; i < 5; i++) {
        this.addStatus(rows1, scores, i)
    }
    for (i = 5; i < 10; i++) {
        this.addStatus(rows2, scores, i)
    }
    return (
      <>
        <div className={styles.statusStatusContainer}>{rows1}</div>
        <div className={styles.statusStatusContainer}>{rows2}</div>
      </>
    );
  }
}

export default Results;
