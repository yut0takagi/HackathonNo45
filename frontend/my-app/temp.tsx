// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDXam5T4prswEcaUB6oFQcCGBggO3V8DcQ",
  authDomain: "sampleapps-1a42d.firebaseapp.com",
  projectId: "sampleapps-1a42d",
  storageBucket: "sampleapps-1a42d.firebasestorage.app",
  messagingSenderId: "788555815023",
  appId: "1:788555815023:web:0402baf0fd2f73d620959a",
  measurementId: "G-CWXK4EBSGJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);