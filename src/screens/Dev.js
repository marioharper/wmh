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

const renderHeartLine = ({ location, heart }) => {
  if (!location || !heart || !heart.location) return null;

  return (
    <MapView.Polyline
      coordinates={[
        {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        {
          latitude: heart.location.coords.latitude,
          longitude: heart.location.coords.longitude,
        },
      ]}
    />
  );
};

const DevScreen = ({ location, heading, heart }) => {
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
        {renderHeartLine({ location, heart })}
      </MapView>

      <View style={{ flex: 1 }}>
        <Text>{`heartLocation: ${Boolean(heart && heart.location)}`}</Text>
      </View>
    </View>
  );
};

export default DevScreen;
