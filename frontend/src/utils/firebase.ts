import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  setPersistence,
  browserSessionPersistence
} from "firebase/auth";


const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  // add your firebase config data
};


const app = initializeApp(firebaseConfig);

const auth = getAuth(app);


// IndexedDB use nahi karega
setPersistence(
  auth,
  browserSessionPersistence
);


const provider = new GoogleAuthProvider();


export {
  auth,
  provider
};