import React from "react";
import withRouterInnerRef from "./extras/forwardingRef.js";

// import styles from "./css/TransitionController.module.scss";

var keys = { 37: 1, 38: 1, 39: 1, 40: 1 };

const images = { "/": [], "/label": ["/content/placeholder.png"] };

class TransitionController extends React.Component {
  constructor(props) {
    super(props);
    var { history } = props;
    this.history = history;
    this.state = {
      progress: false,
      didUpdate: false,
      speed: 0,
      scroll: 0
    };
    this.selfRef = React.createRef();
    this.preventDefault = this.preventDefault.bind(this);
    this.preventDefaultForScrollKeys = this.preventDefaultForScrollKeys.bind(
      this
    );
    window.requestAnimationFrame =
      window.requestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.msRequestAnimationFrame;
  }
  componentDidMount() {
    window.scrollTo(0, 0);
    if (window.addEventListener)
      window.addEventListener("DOMMouseScroll", this.preventDefault, false);
    // older FF
    document.addEventListener("wheel", this.preventDefault, { passive: false }); // Disable scrolling in Chrome
    window.onwheel = this.preventDefault; // modern standard
    window.onmousewheel = document.onmousewheel = this.preventDefault; // older browsers, IE
    window.ontouchmove = this.preventDefault; // mobile
    document.onkeydown = this.preventDefaultForScrollKeys;
    this.props.changePageHandler(this.getLocation())
  }
  componentDidUpdate(prevProps, prevState) {
    if (!prevState.progress && this.state.progress) {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          this.setState({ didUpdate: true });
        });
      });
    }
  }
  render() {
    return <div></div>;
  }
  start(speed) {
    if (this.state.progress) return;
    this.setState({ scroll: window.scrollY });
    if (speed) {
      this.setState({ progress: true, speed: speed });
    } else {
      this.setState({ progress: true, speed: 500 });
    }
  }
  changePage(page) {
    if (!this.state.progress) return;
    this.history.push(page);
    this.props.changePageHandler(page)
  }
  stop(speed) {
    if (!this.state.progress) return;
    if (speed) {
      this.setState({ didUpdate: false, speed: speed });
      setTimeout(() => {
        this.setState({ progress: false });
      }, speed);
    } else {
      this.setState({ didUpdate: false, speed: 500 });
      setTimeout(() => {
        this.setState({ progress: false });
      }, 500);
    }
  }
  auto(start, delay, stop, page) {
    if (this.state.progress) return;
    if (this.props.location.pathname === page) return;
    this.start(start);
    setTimeout(() => {
      this.changePage(page);
      setTimeout(() => {
        this.stop(stop);
      }, delay);
    }, start);
  }
  load(page) {
    if (this.state.progress) return;
    if (this.props.location.pathname === page) return;
    this.setState({ scroll: window.scrollY });
    this.setState({ progress: true, speed: 1 });

    this.preloadimages(images[page]).then(() => {
      this.changePage(page);
      this.setState({ didUpdate: false, speed: 1 });
      this.setState({ progress: false });
    });
  }
  /*
  load(start, page) {
    if (this.state.progress) return;
    if (this.props.location.pathname === page) return;
    this.start(start);

    setTimeout(() => {
      this.changePage(page);
    }, start);
  }
  */
  back(start) {
    this.start(start);
    setTimeout(() => {
      this.history.goBack();
    }, start);
  }

  preventDefault(e) {
    e = e || window.event;
    if (this.state.progress) {
      if (e.preventDefault) e.preventDefault();
      e.returnValue = false;
    }
  }

  preventDefaultForScrollKeys(e) {
    if (this.state.progress && keys[e.keyCode]) {
      this.preventDefault(e);
      return false;
    }
  }
  getLocation() {
    return this.history.location.pathname;
    // return this.props.location.pathname;
  }
  preloadimages(arr) {
    return new Promise((function(resolve, reject) {
      if(!this.arr || this.arr.length === 0) {
        resolve(true);
        return;
      }
      var newimages = [],
      loadedimages = 0;
      var arr = typeof this.arr != "object" ? [this.arr] : this.arr;
      function imageloadpost() {
        loadedimages++;
        if (loadedimages === arr.length) {
          resolve(true);
          return;
        }
      }
      for (var i = 0; i < arr.length; i++) {
        newimages[i] = new Image();
        newimages[i].src = arr[i];
        newimages[i].onload = function() {
          imageloadpost();
        };
        newimages[i].onerror = function() {
          imageloadpost();
        };
      }
    }).bind({arr}));
  }
}


export default withRouterInnerRef(TransitionController);
