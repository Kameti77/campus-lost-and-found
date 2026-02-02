const admin = require('firebase-admin');
const serviceAccount = require('../../serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'lostandfound-937c4.firebasestorage.app' 
});

// Get Firestore and Storage instances
const db = admin.firestore();
const bucket = admin.storage().bucket();

module.exports = { admin, db, bucket };