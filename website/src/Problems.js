import React, { Component } from "react";

import StartTimer from "./StartTimer.js";
import CompetitionNotStarted from "./CompetitionNotStarted.js";
import CompetitionEnded from "./CompetitionEnded.js";

import API from "./API.js";

class Problems extends Component {
  constructor(props) {
    super(props);
    this.state = { site: "<p>Loading</p>", started: false };
    this.lastUpdate = 0;
    if (API.info.competitionStart) {
      this.state.started = true;
      API.getWrittenProblems().then((site) => {
        this.setState({ site: site });
      });
    }
    API.waitUpdate(this)
  }
  componentDidUpdate() {
    if (API.info.competitionStart && !this.state.started) {
      this.setState({started : true});
      API.getWrittenProblems().then((site) => {
        this.setState({ site: site });
      });
    }
  }
  render() {
    if (!API.info.competitionStart) {
      return <CompetitionNotStarted />;
    } else if (API.started && !API.ended) {
      return <div dangerouslySetInnerHTML={{ __html: this.state.site }}></div>;
    } else if (!API.started) {
      return <StartTimer tm={this.props.tm}/>;
    } else if (API.ended) {
      return <CompetitionEnded />;
    }
    return <></>;
  }
}

export default Problems;
