import firebase from 'firebase/app'
// import firestore from 'firebase/firestore'
import 'firebase/auth'
import 'firebase/firestore'
import 'firebase/storage'

var config = {
  apiKey: process.env.VUE_APP_API_KEY,
  authDomain: process.env.VUE_APP_AUTH_DOMAIN,
  databaseURL: process.env.VUE_APP_DATABASE_URL,
  projectId: process.env.VUE_APP_PROJECT_ID,
  storageBucket: process.env.VUE_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.VUE_APP_MESSAGING_SENDER_ID
};

const firebaseApp = firebase.initializeApp(config);
const firestore = firebaseApp.firestore()
const auth = firebaseApp.auth
const storage = firebaseApp.storage
// export default firebaseApp
export {
  auth,
  firestore,
  storage,
}