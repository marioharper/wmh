import React from 'react';
import { Text, View } from 'react-native';
import { MapView } from 'expo';
import geolib from 'geolib';

const renderDirectionLine = ({ location, heading }) => {
  if (!location || !heading) return null;

  const { latitude, longitude } = location.coords;

  const headingPoint = geolib.computeDestinationPoint(
    {
      lat: latitude,
      lon: longitude,
    },
    500,
    heading.trueHeading,
  );

  return (
    <MapView.Polyline
      coordinates={[
        {
          latitude,
          longitude,
        },
        headingPoint,
      ]}
    />
  );
};

const renderHeartLine = ({ location, heartLocation }) => {
  if (!location || !heartLocation) return null;

  return (
    <MapView.Polyline
      coordinates={[
        {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        {
          latitude: heartLocation.coords.latitude,
          longitude: heartLocation.coords.longitude,
        },
      ]}
    />
  );
};

const DevView = ({
  location,
  searching,
  heading,
  heart = {},
  isFacingHeart,
  isHeartFacing,
  onMapPress,
}) => {
  const mapInitialRegion = location && {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    latitudeDelta: 0.1,
    longitudeDelta: 0.05,
  };

  return (
    <View style={{ flex: 1 }}>
      <MapView style={{ flex: 1 }} showsUserLocation showCompass initialRegion={mapInitialRegion}>
        {renderDirectionLine({ location, heading })}
        {renderHeartLine({ location, heartLocation: heart.location })}
      </MapView>

      <View style={{ flex: 1 }}>
        <Text>{`searching: ${searching}`}</Text>
        <Text>{`heartLocation: ${Boolean(heart.location)}`}</Text>
        <Text>{`isFacingHeart: ${isFacingHeart}`}</Text>
        <Text>{`isHeartFacing: ${isHeartFacing}`}</Text>
      </View>
    </View>
  );
};

export default DevView;
