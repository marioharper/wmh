import React, { Component } from 'react';
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import geolib from 'geolib';
import Heart from '../components/HeartLogo';
import isFacing from '../utils/isFacing';

export default class SearchScreen extends Component {
  static defaultProps = {
    heart: null,
    heading: null,
    location: null,
  };

  static propTypes = {
    heart: PropTypes.object,
    heading: PropTypes.object,
    location: PropTypes.object,
    publishMessage: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      devView: false,
      searching: false,
    };
  }

  componentWillUnmount() {
    clearInterval(this.searchTimer);
  }

  checkIfFacingHeart = () => {
    const { heart, location, heading } = this.props;

    if (!heading || !location || !heart) return false;

    const isFacingHeart = isFacing({
      heading: heading.trueHeading,
      origin: location.coords,
      destination: heart.location.coords,
      precision: 20,
    });

    this.setState({
      isFacingHeart,
    });
  };

  startSearch = () => {
    this.setState({
      searching: true,
    });

    // send search info every 1 second
    this.searchTimer = setInterval(() => {
      this.checkIfFacingHeart();

      this.props.publishMessage({
        searching: true,
        isFacing: this.state.isFacingHeart,
        location: this.props.location,
      });
    }, 1000);
  };

  stopSearch = e => {
    clearInterval(this.searchTimer);

    this.setState({
      searching: false,
    });

    this.props.publishMessage({
      searching: false,
    });
  };

  render() {
    return (
      <TouchableOpacity
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        onPressIn={this.startSearch}
        onPressOut={this.stopSearch}
      >
        <Heart isSearching={this.state.searching} />
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
