import React, { Component } from 'react';
import { Platform, Text, View, StyleSheet, Alert } from 'react-native';
import { Constants, Location, Permissions, MapView } from 'expo';
import PubNub from 'pubnub';
import geolib from 'geolib';

const USER = 'JOHN';

function randomColor() {
    return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
}

const PUB_NUB_CHANNEL = 'our-heart-channel';

export default class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            location: null,
            heading: null,
            heart: null,
            errorMessage: null
        };

        this.pubnub = new PubNub({
            subscribeKey: 'sub-c-7e0dc9bc-255c-11e8-a8f3-22fca5d72012',
            publishKey: 'pub-c-93f9401b-d20d-4650-9e9d-6edff597cb61'
        });
    }

    componentWillMount() {
        this.configurePubNub();
        this.watchLocation();
        this.watchHeading();
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
                // ignore messages from self
                if (message.message.user === USER) {
                    return;
                }

                this.setState({
                    heart: message.message.location
                });
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
        if (status !== 'granted') {
            this.setState({
                errorMessage: 'Permission to access location was denied'
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
            this.setState({
                heading
            });
        });
    };

    onMapPress = e => {
        var publishConfig = {
            channel: PUB_NUB_CHANNEL,
            message: {
                user: USER,
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
        if (!this.state.location || !this.state.heart) return null;

        return (
            <MapView.Polyline
                coordinates={[
                    {
                        latitude: this.state.location.coords.latitude,
                        longitude: this.state.location.coords.longitude
                    },
                    {
                        latitude: this.state.heart.coords.latitude,
                        longitude: this.state.heart.coords.longitude
                    }
                ]}
            />
        );
    };

    isFacing = ({ heading, origin, destination, precision = 0 }) => {
        const bearing = geolib.getBearing(origin, destination);

        return heading >= bearing - precision && heading <= bearing + precision;
    };

    alertIfFacingHeart = () => {
        if (!this.state.heading || !this.state.location || !this.state.heart)
            return null;

        const heading = this.state.heading.trueHeading;
        const origin = this.state.location.coords;
        const destination = this.state.heart.coords;

        if (this.isFacing({ heading, origin, destination, precision: 2 }))
            Alert.alert('Facing your heart!');
    };

    render() {
        this.alertIfFacingHeart();

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
        alignItems: 'center',
        justifyContent: 'center'
    }
});
