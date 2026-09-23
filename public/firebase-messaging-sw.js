importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');
// // Initialize the Firebase app in the service worker by passing the generated config

const firebaseConfig = {
  apiKey: "AIzaSyAOKwxjMQxIm6iETNaKlaa6uYEeG5UrjY0",
  authDomain: "eclassify-3800d.firebaseapp.com",
  projectId: "eclassify-3800d",
  storageBucket: "eclassify-3800d.firebasestorage.app",
  messagingSenderId: "845338884833",
  appId: "1:845338884833:web:8bc665eebd7cf2f1c0d5a0",
  measurementId: "G-886SKFP34T"
};

firebase?.initializeApp(firebaseConfig)

// Retrieve firebase messaging
const messaging = firebase.messaging();

self.addEventListener('install', function (event) {
    console.log('Hello world from the Service Worker :call_me_hand:');
});