
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/database';

// IMPORTANT: Replace this with your own Firebase configuration
// You can find this in your Firebase project settings
const firebaseConfig = {
  apiKey: "AIzaSyCuxzXxtNBrXy2lZL35bQ7XZJQ22Fcsy40",
  authDomain: "cashpk-8f975.firebaseapp.com",
  databaseURL: "https://cashpk-8f975-default-rtdb.firebaseio.com",
  projectId: "cashpk-8f975",
  storageBucket: "cashpk-8f975.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // Please add your Messaging Sender ID
  appId: "YOUR_APP_ID" // Please add your App ID
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.database();

export { app, auth, db };
