import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Location } from 'expo';

// Watches device location and heading and passes the values to its children via a render callback
export default class LocationWatcher extends Component {
  propTypes = {
    children: PropTypes.func.isRequired,
  };

  state = {
    location: null,
    heading: null,
    errorMessage: null,
  };

  constructor() {
    super();

    this.checkPermissions();
    this.watchLocation();
    this.watchHeading();
  }

  checkPermissions = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      this.setState({
        errorMessage: 'Permission to access location was denied',
      });
    }
  };

  watchLocation = async () => {
    Location.watchPositionAsync({ enableHighAccuracy: true }, location => {
      this.setState({
        location,
      });
    });
  };

  watchHeading = () => {
    Location.watchHeadingAsync(heading => {
      this.setState({ heading });
    });
  };

  render() {
    return this.props.children(this.state);
  }
}
