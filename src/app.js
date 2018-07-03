import React, { Component } from 'react';
import { Button, View } from 'react-native';
import LocationWatcher from './components/LocationWatcher';
import HeartWatcher from './components/HeartWatcher';
import SearchScreen from './screens/Search';
import DevScreen from './screens/Dev';
import Login from './components/Login';
import configureFirebase from './firebase';
import configurePubNub from './pubnub';

const firebase = configureFirebase();
const pubnub = configurePubNub();

const PUB_NUB_CHANNEL = 'our-heart-channel';

export default class App extends Component {
  state = {
    loading: true,
    devMode: false,
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
          <View>{!this.state.user && <Login />}</View>
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
