import React, { Component } from 'react';
import { Constants } from 'expo';
import PubNub from 'pubnub';
import LocationWatcher from './src/components/LocationWatcher';
import HeartWatcher from './src/components/HeartWatcher';
import SearchScreen from './src/screens/Search';

const PUB_NUB_CHANNEL = 'our-heart-channel';

export default class App extends Component {
  constructor() {
    super();

    this.pubnub = new PubNub({
      uuid: Constants.deviceId,
      subscribeKey: 'sub-c-7e0dc9bc-255c-11e8-a8f3-22fca5d72012',
      publishKey: 'pub-c-93f9401b-d20d-4650-9e9d-6edff597cb61',
    });

    // do not listen to own messages (PubNub Stream Controller enabled for this feature)
    this.pubnub.setFilterExpression(`uuid!=${this.pubnub.getUUID()}`);

    this.pubnub.subscribe({
      channels: [PUB_NUB_CHANNEL],
    });
  }

  publishMessage = message => {
    this.pubnub.publish({
      channel: PUB_NUB_CHANNEL,
      message,
    });
  };

  render() {
    return (
      <HeartWatcher pubnub={this.pubnub}>
        {({ heart }) => (
          <LocationWatcher>
            {({ location, heading }) => (
              <SearchScreen
                location={location}
                heading={heading}
                heart={heart}
                publishMessage={this.publishMessage}
              />
            )}
          </LocationWatcher>
        )}
      </HeartWatcher>
    );
  }
}
