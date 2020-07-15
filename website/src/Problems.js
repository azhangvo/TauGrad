import React, { Component } from "react";

import StartTimer from "./StartTimer.js";
import CompetitionNotStarted from "./CompetitionNotStarted.js";
import CompetitionEnded from "./CompetitionEnded.js";

import API from "./API.js";

class Problems extends Component {
  constructor(props) {
    super(props);
    this.state = { site: "<p>Loading</p>" };
    this.lastUpdate = 0;
    if (API.startCompetition) {
      API.getWrittenProblems().then((site) => {
        this.setState({ site: site });
      });
    }
  }
  render() {
    if (!API.startCompetition) {
      return <CompetitionNotStarted />;
    } else if (API.started && !API.ended) {
      return <div dangerouslySetInnerHTML={{ __html: this.state.site }}></div>;
    } else if (!API.started) {
      return <StartTimer />;
    } else if (API.ended) {
      return <CompetitionEnded />;
    }
  }
}

export default Problems;
