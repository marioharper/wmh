import React, { Component } from 'react';
import { Button, Platform, Text, View, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Constants, Location, Permissions, MapView } from 'expo';
import PubNub from 'pubnub';
import geolib from 'geolib';
import DevView from './DevView';

const PUB_NUB_CHANNEL = 'our-heart-channel';

const isFacing = ({ heading, origin, destination, precision = 0 }) => {
  const bearing = geolib.getBearing(origin, destination);

  return angleDiff(heading, bearing) <= precision;
};

const angleDiff = (angle1, angle2) => Math.abs((angle1 - angle2 + 180 + 360) % 360 - 180);

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      devView: false,
      searching: false,
      location: null,
      heading: null,
      heart: {}, // store heart state
      isFacingHeart: false,
      errorMessage: null,
    };

    this.pubnub = new PubNub({
      uuid: Constants.deviceId,
      subscribeKey: 'sub-c-7e0dc9bc-255c-11e8-a8f3-22fca5d72012',
      publishKey: 'pub-c-93f9401b-d20d-4650-9e9d-6edff597cb61',
    });

    // do not listen to own messages (PubNub Stream Controller enabled for this feature)
    this.pubnub.setFilterExpression(`uuid!=${this.pubnub.getUUID()}`);
  }

  componentWillMount() {
    this.configurePubNub();
    this.watchLocation();
    this.watchHeading();
  }

  componentWillUnmount() {
    clearInterval(this.searchTimer);
  }

  configurePubNub = () => {
    this.pubnub.addListener({
      status: statusEvent => {
        if (statusEvent.category === 'PNConnectedCategory') {
          console.log('subscribe connected');
        }
      },
      message: message => {
        console.log('New Message!!', message);

        this.setState({
          heart: message.message,
        });
      },
      presence: function(presenceEvent) {
        // handle presence
      },
    });

    this.pubnub.subscribe({
      channels: [PUB_NUB_CHANNEL],
    });
  };

  watchLocation = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      this.setState({
        errorMessage: 'Permission to access location was denied',
      });
    }

    Location.watchPositionAsync({ enableHighAccuracy: true }, location => {
      this.setState({
        location,
      });
    });
  };

  watchHeading = () => {
    Location.watchHeadingAsync(heading => {
      this.setState({ heading }, this.checkIfFacingHeart);
    });
  };

  checkIfFacingHeart = () => {
    if (
      !this.state.searching ||
      !this.state.heading ||
      !this.state.location ||
      !this.state.heart.location
    )
      return this.setState({
        isFacingHeart: false,
      });

    const heading = this.state.heading.trueHeading;
    const origin = this.state.location.coords;
    const destination = this.state.heart.location.coords;

    const isFacingHeart = isFacing({
      heading,
      origin,
      destination,
      precision: 2,
    });

    this.setState({
      isFacingHeart,
    });
  };

  startSearch = e => {
    this.setState({
      searching: true,
    });

    // send search info every 1 second
    this.searchTimer = setInterval(() => {
      var publishConfig = {
        channel: PUB_NUB_CHANNEL,
        message: {
          searching: true,
          isFacing: this.state.isFacingHeart,
          location: this.state.location,
        },
      };

      this.pubnub.publish(publishConfig, function(status, response) {
        console.log(status, response);
      });
    }, 1000);
  };

  stopSearch = e => {
    clearInterval(this.searchTimer);

    this.setState({
      searching: false,
    });

    var publishConfig = {
      channel: PUB_NUB_CHANNEL,
      message: {
        searching: false,
      },
    };

    this.pubnub.publish(publishConfig, function(status, response) {
      console.log(status, response);
    });
  };

  render() {
    return (
      <View style={{ flex: 1, paddingTop: 25 }}>
        <Button
          onPress={() => this.setState({ devView: !this.state.devView })}
          title="Toggle Dev View"
        />

        <TouchableOpacity
          style={{ flex: 1, justifyContent: 'center' }}
          onPressIn={this.startSearch}
          onPressOut={this.stopSearch}
        >
          {this.state.devView ? (
            <DevView {...this.state} />
          ) : (
            <Text style={{ textAlign: 'center' }}>
              {this.state.searching ? 'Searching...' : 'Tap and hold to find heart...'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
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
