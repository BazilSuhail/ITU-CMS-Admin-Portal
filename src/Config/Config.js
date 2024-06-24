import firebase from 'firebase/compat/app';
import { useEffect, useState } from "react";
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAZl78ABlOT-p29czm7pc79AiUcYssqKYI",
  authDomain: "itu-cms.firebaseapp.com",
  projectId: "itu-cms",
  storageBucket: "itu-cms.appspot.com",
  messagingSenderId: "442793159184",
  appId: "1:442793159184:web:e121dacdbf26e5805bf895",
  measurementId: "G-X66E0GNGH4"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const fs = firebase.firestore();
const st = firebase.storage();
const FieldValue = firebase.firestore.FieldValue;

const useFirebaseAuth = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const unsubscribe = auth.onAuthStateChanged(user => {
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { currentUser: auth.currentUser, loading };
};

export { auth, fs, st, FieldValue, useFirebaseAuth }