import React, { Component } from 'react';
import PropTypes from 'prop-types';

// Listens to pubnub events that contain heart info and passes the values to its children via a render callback
export default class HeartWatcher extends Component {
  propTypes = {
    children: PropTypes.func.isRequired,
    pubnub: PropTypes.object.isRequired,
  };

  state = {
    heart: null,
  };

  constructor() {
    super();

    this.watchHeart();
  }

  componentDidMount() {
    // uncomment to create fake heart location
    // this.setState({
    //   heart: {
    //     location: {
    //       coords: {
    //         latitude: 40.0379,
    //         longitude: -76.3055,
    //       },
    //     },
    //   },
    // });
  }

  watchHeart = async () => {
    this.props.pubnub.addListener({
      message: message => {
        console.log('New Message!!', message);
        if (!message.heart) return;

        this.setState({
          heart: message.message,
        });
      },
    });
  };

  render() {
    return this.props.children(this.state);
  }
}
