import React, { Component } from 'react';
import { Button, View } from 'react-native';
import LocationWatcher from './src/components/LocationWatcher';
import HeartWatcher from './src/components/HeartWatcher';
import SearchScreen from './src/screens/Search';
import DevScreen from './src/screens/Dev';
import HeartLogo from './src/components/HeartLogo';
import Login from './src/components/Login';
import configureFirebase from './src/firebase';
import configurePubNub from './src/pubnub';

const firebase = configureFirebase();
const pubnub = configurePubNub();

const PUB_NUB_CHANNEL = 'our-heart-channel';

export default class App extends Component {
  state = {
    loading: true,
    devMode: false,
    animationComplete: false,
  };

  constructor() {
    super();

    pubnub.subscribe({
      channels: [PUB_NUB_CHANNEL],
    });
  }

  componentDidMount() {
    this.authSubscription = firebase.auth().onAuthStateChanged(user => {
      this.setState({
        loading: false,
        user,
      });
    });
  }

  componentWillUnmount() {
    this.authSubscription();
  }

  publishMessage = message => {
    pubnub.publish({
      channel: PUB_NUB_CHANNEL,
      message,
    });
  };

  render() {
    if (this.state.loading || !this.state.user) {
      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <HeartLogo after={() => this.setState({ animationComplete: true })} />

          <View style={{ position: 'absolute', bottom: 30 }}>
            {!this.state.user && this.state.animationComplete && <Login />}
          </View>
        </View>
      );
    }

    return (
      <HeartWatcher pubnub={pubnub}>
        {({ heart }) => (
          <LocationWatcher>
            {({ location, heading }) => (
              <View style={{ flex: 1, paddingTop: 25 }}>
                <Button onPress={() => firebase.auth().signOut()} title="Sign Out" />
                <Button
                  onPress={() => this.setState({ devMode: !this.state.devMode })}
                  title="Toggle Dev View"
                />

                {this.state.devMode ? (
                  <DevScreen location={location} heading={heading} heart={heart} />
                ) : (
                  <SearchScreen
                    location={location}
                    heading={heading}
                    heart={heart}
                    publishMessage={this.publishMessage}
                  />
                )}
              </View>
            )}
          </LocationWatcher>
        )}
      </HeartWatcher>
    );
  }
}
