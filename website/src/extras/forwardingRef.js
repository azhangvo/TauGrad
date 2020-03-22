import React from "react";
import { withRouter } from "react-router-dom";

const withRouterInnerRef = WrappedComponent => {
  class InnerComponentWithRef extends React.Component {
    render() {
      const { forwardRef, ...rest } = this.props;
      return <WrappedComponent {...rest} ref={forwardRef} />;
    }
  }

  const IInnerComponentWithRef = withRouter(InnerComponentWithRef, {
    withRef: true
  });

  function withRef(props, ref) {
    return <IInnerComponentWithRef {...props} forwardRef={ref} />;
  }

  return React.forwardRef(withRef);
};

export default withRouterInnerRef;
