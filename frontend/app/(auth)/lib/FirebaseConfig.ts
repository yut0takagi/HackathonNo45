import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";

// Firebase 設定
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_APIKEY,
  authDomain: process.env.NEXT_PUBLIC_AUTHDOMAIN,
  projectId: process.env.NEXT_PUBLIC_PROJECTID,
  storageBucket: process.env.NEXT_PUBLIC_STORAGEBUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_MESSAGINGSENDERID,
  appId: process.env.NEXT_PUBLIC_APPID,
};

// Firebase アプリの初期化（SSR でも適用）
const firebaseApp: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth: Auth = getAuth(firebaseApp);
const firestore: Firestore = getFirestore(firebaseApp);

// エクスポート
export { firebaseApp, auth, firestore };
