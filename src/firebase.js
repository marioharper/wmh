import * as firebase from 'firebase';
import 'firebase/firestore';
import { FIREBASE_API_KEY } from 'react-native-dotenv';

const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: 'wheres-my-heart.firebaseapp.com',
  databaseURL: 'https://wheres-my-heart.firebaseio.com',
  projectId: 'wheres-my-heart',
  storageBucket: 'wheres-my-heart.appspot.com',
  messagingSenderId: '998525500153',
};

const configureFirebase = () => firebase.initializeApp(firebaseConfig);

export default configureFirebase;
