import React, { Component } from "react";

import API from "./API.js";

class Problems extends Component {
  constructor(props) {
    super(props);
    this.state = { site: "<p>Loading</p>" };
  }
  componentWillMount() {
    API.getWrittenProblems().then((site) => {
      this.setState({ site: site });
    });
  }
  render() {
    return <div dangerouslySetInnerHTML={{__html: this.state.site}}></div>;
  }
}

export default Problems;
