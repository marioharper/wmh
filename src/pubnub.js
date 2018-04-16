import PubNub from 'pubnub';
import { Constants } from 'expo';

const pubnubConfig = {
  uuid: Constants.deviceId,
  subscribeKey: 'sub-c-7e0dc9bc-255c-11e8-a8f3-22fca5d72012',
  publishKey: 'pub-c-93f9401b-d20d-4650-9e9d-6edff597cb61',
};

const configurePubNub = () => {
  const pubnub = new PubNub(pubnubConfig);

  // do not listen to own messages (PubNub Stream Controller enabled for this feature)
  pubnub.setFilterExpression(`uuid!=${pubnub.getUUID()}`);

  return pubnub;
};

export default configurePubNub;
