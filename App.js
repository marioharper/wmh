import React, { Component } from "react";
import { Platform, Text, View, StyleSheet, Alert } from "react-native";
import { Constants, Location, Permissions, MapView } from "expo";
import PubNub from "pubnub";
import geolib from "geolib";

const PUB_NUB_CHANNEL = "our-heart-channel";

const isFacingEachother = state => state.isFacing && state.heartIsFacing;

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      location: null,
      heading: null,
      isFacing: false,
      heartLocation: null,
      heartIsFacing: null,
      errorMessage: null
    };

    this.pubnub = new PubNub({
      uuid: Constants.deviceId,
      subscribeKey: "sub-c-7e0dc9bc-255c-11e8-a8f3-22fca5d72012",
      publishKey: "pub-c-93f9401b-d20d-4650-9e9d-6edff597cb61"
    });

    // do not listen to own messages (PubNub Stream Controller enabled for this feature)
    this.pubnub.setFilterExpression(`uuid!=${this.pubnub.getUUID()}`);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (isFacingEachother(this.state) && !isFacingEachother(prevState))
      Alert.alert("Stop looking at me, bitch.");
  }

  componentWillMount() {
    this.configurePubNub();
    this.watchLocation();
    this.watchHeading();
  }

  configurePubNub = () => {
    this.pubnub.addListener({
      status: statusEvent => {
        if (statusEvent.category === "PNConnectedCategory") {
          console.log("subscribe connected");
        }
      },
      message: message => {
        console.log("New Message!!", message);

        if (message.message.location) {
          Alert.alert("Your heart has sent their location!");

          this.setState({
            heartLocation: message.message.location
          });
        }

        if (message.message.isFacing) {
          this.setState({
            heartIsFacing: true
          });
        }
      },
      presence: function(presenceEvent) {
        // handle presence
      }
    });

    this.pubnub.subscribe({
      channels: [PUB_NUB_CHANNEL]
    });
  };

  watchLocation = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== "granted") {
      this.setState({
        errorMessage: "Permission to access location was denied"
      });
    }

    Location.watchPositionAsync({ enableHighAccuracy: true }, location => {
      this.setState({
        location,
        region: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.1,
          longitudeDelta: 0.05
        }
      });
    });
  };

  watchHeading = () => {
    Location.watchHeadingAsync(heading => {
      this.setState(
        {
          heading
        },
        () => {
          // publish if facing
          if (
            !this.state.heading ||
            !this.state.location ||
            !this.state.heartLocation
          )
            return null;

          const heading = this.state.heading.trueHeading;
          const origin = this.state.location.coords;
          const destination = this.state.heartLocation.coords;

          const isFacing = this.isFacing({
            heading,
            origin,
            destination,
            precision: 2
          });

          if (!isFacing) return false;

          this.setState(
            {
              isFacing
            },
            () => {
              var publishConfig = {
                channel: PUB_NUB_CHANNEL,
                message: {
                  isFacing
                }
              };

              this.pubnub.publish(publishConfig, function(status, response) {
                console.log(status, response);
              });
            }
          );
        }
      );
    });
  };

  onPress = e => {
    var publishConfig = {
      channel: PUB_NUB_CHANNEL,
      message: {
        location: this.state.location
      }
    };

    this.pubnub.publish(publishConfig, function(status, response) {
      console.log(status, response);
    });
  };

  renderDirectionLine = () => {
    if (!this.state.location || !this.state.heading) return null;

    const { latitude, longitude } = this.state.location.coords;

    let headingPoint = geolib.computeDestinationPoint(
      {
        lat: latitude,
        lon: longitude
      },
      500,
      this.state.heading.trueHeading
    );

    return (
      <MapView.Polyline
        coordinates={[
          {
            latitude,
            longitude
          },
          headingPoint
        ]}
      />
    );
  };

  renderHeartLine = () => {
    if (!this.state.location || !this.state.heartLocation) return null;

    return (
      <MapView.Polyline
        coordinates={[
          {
            latitude: this.state.location.coords.latitude,
            longitude: this.state.location.coords.longitude
          },
          {
            latitude: this.state.heartLocation.coords.latitude,
            longitude: this.state.heartLocation.coords.longitude
          }
        ]}
      />
    );
  };

  isFacing = ({ heading, origin, destination, precision = 0 }) => {
    const bearing = geolib.getBearing(origin, destination);

    return heading >= bearing - precision && heading <= bearing + precision;
  };

  render() {
    return (
      <MapView
        style={{ flex: 1 }}
        showsUserLocation={true}
        showCompass={true}
        initialRegion={this.state.region}
        onPress={this.onPress}
      >
        {this.renderDirectionLine()}
        {this.renderHeartLine()}
      </MapView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  }
});
