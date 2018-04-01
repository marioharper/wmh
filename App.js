import React, { Component } from "react";
import { Platform, Text, View, StyleSheet, Alert } from "react-native";
import { Constants, Location, Permissions, MapView } from "expo";
import PubNub from "pubnub";
import geolib from "geolib";

const PUB_NUB_CHANNEL = "our-heart-channel";

const isFacing = ({ heading, origin, destination, precision = 0 }) => {
  const bearing = geolib.getBearing(origin, destination);

  return angleDiff(heading, bearing) <= precision;
};

const angleDiff = (angle1, angle2) =>
  Math.abs((angle1 - angle2 + 180 + 360) % 360 - 180);

const isFacingEachother = state => state.isFacingHeart && state.isHeartFacing;

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mapInitialRegion: null,
      location: null,
      heading: null,
      isFacingHeart: false,
      heartLocation: null,
      isHeartFacing: false,
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
          this.setState({
            heartLocation: message.message.location
          });
        }

        if (message.message.isFacing) {
          this.setState({
            isHeartFacing: true
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
        mapInitialRegion: {
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

          const isFacingHeart = isFacing({
            heading,
            origin,
            destination,
            precision: 2
          });

          console.log("isfacingheart", isFacingHeart);

          // facing status has changed
          if (isFacingHeart !== this.state.isFacingHeart) {
            var publishConfig = {
              channel: PUB_NUB_CHANNEL,
              message: {
                isFacing: isFacingHeart
              }
            };

            this.pubnub.publish(publishConfig, function(status, response) {
              console.log(status, response);
            });
          }

          this.setState({
            isFacingHeart
          });
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

  render() {
    return (
      <View style={{ flex: 1 }}>
        <MapView
          style={{ flex: 1 }}
          showsUserLocation={true}
          showCompass={true}
          initialRegion={this.state.mapInitialRegion}
          onPress={this.onPress}
        >
          {this.renderDirectionLine()}
          {this.renderHeartLine()}
        </MapView>

        <View style={{ flex: 1 }}>
          <Text>{`Heart sent their location: ${Boolean(
            this.state.heartLocation
          )}`}</Text>
          <Text>{`You are facing your heart: ${
            this.state.isFacingHeart
          }`}</Text>
          <Text>{`Heart is facing you: ${this.state.isHeartFacing}`}</Text>
        </View>
      </View>
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
