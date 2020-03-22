import React, { Component } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { ToastsContainer, ToastsStore } from "react-toasts";

import API from "./API.js";

import TransitionController from "./TransitionController.js";
import Home from "./Home.js";
import Submit from "./Submit.js";
import Profile from "./Profile.js";
import Login from "./Login.js";
import Register from "./Register.js";
import Nav from "./Nav.js";

import styles from "./css/App.module.scss";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { firstLoad: true, location: document.location.href };
    this.tm = React.createRef();
    this.render = this.render.bind(this);
    this.Switcher = this.Switcher.bind(this);
    this.changePage = this.changePage.bind(this);
    API.checkRemember();
  }
  changePage(page) {
    if (page !== this.state.location) this.setState({ location: page });
  }
  componentDidMount() {
    this.setState({ firstLoad: false });
  }
  render() {
    return (
      <div className={styles.container}>
        <ToastsContainer store={ToastsStore} />
        <Router>
          <this.Switcher />
          <TransitionController
            ref={this.tm}
            changePageHandler={this.changePage}
          />
        </Router>
      </div>
    );
  }
  Switcher() {
    if (this.tm.current) {
      return (
        <div>
          <Nav tm={this.tm} location={document.location.href} />
          <Switch>
            <Route path="/" exact component={() => <Home tm={this.tm} />} />
            <Route path="/submit" component={() => <Submit tm={this.tm} />} />
            <Route path="/profile" component={() => <Profile tm={this.tm} />} />
            <Route path="/login" component={() => <Login tm={this.tm} />} />
            <Route
              path="/register"
              component={() => <Register tm={this.tm} />}
            />
          </Switch>
        </div>
      );
    } else {
      return null;
    }
  }
}

export default App;
