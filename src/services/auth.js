import { auth } from "../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  updateProfile
} from "firebase/auth";

const provider = new GoogleAuthProvider();

export const signup = async (email, password, name = "") => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const displayName = name.trim();

  if (displayName) {
    await updateProfile(userCredential.user, { displayName });
  }

  return userCredential;
};

export const login = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const signInWithGoogle = () => {
  return signInWithPopup(auth, provider);
};

export const logout = () => {
  return signOut(auth);
};
