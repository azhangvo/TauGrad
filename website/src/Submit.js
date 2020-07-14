import React, { Component } from "react";
import { ToastsStore } from "react-toasts";
import Select from "react-select";

import StartTimer from "./StartTimer.js";
import CompetitionNotStarted from "./CompetitionNotStarted.js";
import CompetitionEnded from "./CompetitionEnded.js";
import API from "./API.js";

import styles from "./css/Submit.module.scss";

class Submit extends Component {
  constructor(props) {
    super(props);
    this.state = { language: null, problem: null, problemOptions: [] };
    this.languageOptions = [
      { value: "python27", label: "Python 2.7" },
      { value: "python36", label: "Python 3.6" },
      { value: "python37", label: "Python 3.7" },
      { value: "python38", label: "Python 3.8" },
      { value: "java8", label: "Java 8" },
      { value: "java11", label: "Java 11" },
      { value: "c++11", label: "C++ 11" },
      { value: "c++14", label: "C++ 14" },
    ];
    this.submit = this.submit.bind(this);
    this.CheckTimer = this.CheckTimer.bind(this);
    API.waitUpdate(this);
  }
  componentDidMount() {
    API.getProblems().then((problems) => {
      this.setState({ problemOptions: this.duplicateForSelect(problems) });
    });
  }
  duplicateForSelect(arr) {
    let newArr = [];
    arr.forEach((problem) => {
      newArr.push({ label: problem, value: problem });
    });
    return newArr;
  }

  clickFile() {
    document.getElementById("input").click();
  }
  fileChange(e) {
    if (e.target.value) {
      document.getElementById("fileInfo").innerHTML = e.target.value.match(
        /[/\\]([\w\d\s.\-()]+)$/
      )[1];
    } else {
      document.getElementById("fileInfo").innerHTML = "No file selected yet.";
    }
  }

  submit() {
    let fileButton = document.getElementById("input");
    let errorArray = [];
    if (!fileButton.files || fileButton.files.length !== 1) {
      errorArray.push("file");
    }
    if (!this.state.language) {
      errorArray.push("language");
    }
    if (!this.state.problem) {
      errorArray.push("problem");
    }
    let error = "";
    if (errorArray.length === 0) {
      API.submit(
        fileButton.files[0],
        this.state.language.value,
        this.state.problem.value
      ).then((success) => {
        if (success) {
          this.setState({ language: null, problem: null });
          document.getElementById("input").value = "";
          this.fileChange({ target: document.getElementById("input") });
          this.props.tm.current.load("/results");
        }
      });
      return;
    } else if (errorArray.length === 1) {
      error = errorArray[0];
    } else if (errorArray.length === 2) {
      error = errorArray[0] + " or " + errorArray[1];
    } else {
      error = errorArray[0] + ", " + errorArray[1] + " or " + errorArray[2];
    }
    ToastsStore.error("No " + error + " selected");
  }

  render() {
    return <this.CheckTimer />;
  }

  CheckTimer() {
    if (!API.getLoginStatus() && !API.startCompetition) {
      return <CompetitionNotStarted />
    } else if (API.started && !API.ended || API.getLoginStatus() && !API.startCompetition) {
      return (
        <div className={styles.container}>
          <div
            className={styles.subContainer}
            style={{
              display: API.getLoginStatus() && API.info.user ? "block" : "none",
            }}
          >
            <h1 style={{ fontSize: "36px" }}>Submission</h1>
            <p style={{ fontSize: "24px" }}>
              Submit your code here. Click the button to choose a file, then
              select your language, and also select the problem you are
              submitting to.
            </p>
            <p style={{ fontSize: "18px" }}>
              If you try to break the system, or similar, your problem will not
              be graded and you will receive a 0. Make sure your file ends in
              either .py, .java, or .cpp in order for it to be graded.
            </p>
            <br />
            <input
              type="file"
              id="input"
              hidden="hidden"
              onChange={this.fileChange}
            />
            <div className={styles.fileSub}>
              <Select
                className={styles.options}
                value={this.state.language}
                options={this.languageOptions}
                isSearchable
                placeholder="Select language and version"
                onChange={(selection) => {
                  this.setState({ language: selection });
                }}
              />
              <Select
                className={styles.options}
                value={this.state.problem}
                options={this.state.problemOptions}
                isSearchable
                placeholder="Select problem"
                onChange={(selection) => {
                  this.setState({ problem: selection });
                }}
              />
              <button type="button" onClick={this.clickFile}>
                Choose Submission File
              </button>
              <span id="fileInfo">No file selected yet.</span>
            </div>
            <br />
            <br />
            <div className={styles.subButtonContainer}>
              <button type="submit" onClick={this.submit}>
                Submit
              </button>
            </div>
          </div>
          <div
            className={styles.login}
            style={{
              display: API.getLoginStatus() && API.info.user ? "none" : "flex",
            }}
          >
            <div>
              {" "}
              <h1>You are not logged in</h1>
              <button
                type="submit"
                onClick={() => this.props.tm.current.load("/login")}
              >
                Login
              </button>
            </div>
          </div>
        </div>
      );
    } else if (!API.started) {
      return <StartTimer />;
    } else if (API.ended) {
      return <CompetitionEnded />
    }
  }
}

export default Submit;
