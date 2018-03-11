import React, { Component } from "react";
import { Platform, Text, View, StyleSheet } from "react-native";
import { Constants, Location, Permissions, MapView } from "expo";
import { computeDestinationPoint } from "geolib";

function randomColor() {
  return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
}

export default class App extends Component {
  state = {
    location: null,
    heading: null,
    heart: null,
    errorMessage: null
  };

  componentWillMount() {
    this.getLocation();
    this.getHeading();
  }

  getLocation = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== "granted") {
      this.setState({
        errorMessage: "Permission to access location was denied"
      });
    }

    Location.watchPositionAsync(
      {
        enableHighAccuracy: true
      },
      location => {
        this.setState({
          location,
          region: {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.1,
            longitudeDelta: 0.05
          }
        });
      }
    );
  };

  getHeading = () => {
    Location.watchHeadingAsync(heading => {
      this.setState({
        heading
      });
    });
  };

  onMapPress = e => {
    this.setState({
      heart: {
        coordinate: e.nativeEvent.coordinate,
        color: randomColor()
      }
    });
  };

  renderDirectionLine = () => {
    if (!this.state.location || !this.state.heading) return null;

    const { latitude, longitude } = this.state.location.coords;

    let headingPoint = computeDestinationPoint(
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
    if (!this.state.location || !this.state.heart) return null;

    return (
      <MapView.Polyline
        coordinates={[
          {
            latitude: this.state.location.coords.latitude,
            longitude: this.state.location.coords.longitude
          },
          {
            latitude: this.state.heart.coordinate.latitude,
            longitude: this.state.heart.coordinate.longitude
          }
        ]}
      />
    );
  };

  render() {
    return (
      <MapView
        style={{ flex: 1 }}
        showsUserLocation={true}
        showCompass={true}
        initialRegion={this.state.region}
        onPress={this.onMapPress}
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
