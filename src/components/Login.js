import React from 'react';
import { View, Button } from 'react-native';
import Expo from 'expo';
import * as firebase from 'firebase';
import { GOOGLE_ANDROID_CLIENT_ID, GOOGLE_IOS_CLIENT_ID } from 'react-native-dotenv';

async function signInWithGoogleAsync() {
  try {
    const result = await Expo.Google.logInAsync({
      androidClientId: GOOGLE_ANDROID_CLIENT_ID,
      iosClientId: GOOGLE_IOS_CLIENT_ID,
      scopes: ['profile', 'email'],
    });

    if (result.type === 'success') {
      const credential = firebase.auth.GoogleAuthProvider.credential(result.idToken);

      return firebase.auth().signInWithCredential(credential);
    }
    return { cancelled: true };
  } catch (e) {
    return { error: true };
  }
}

const Login = () => (
  <View style={{ alignContent: 'center', justifyContent: 'center' }}>
    <Button onPress={signInWithGoogleAsync} title="Sign In" />
  </View>
);

export default Login;
