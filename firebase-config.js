// Replace the placeholder values below with your Firebase project credentials.
//
// Setup steps:
// 1. Go to https://console.firebase.google.com and create a new project
// 2. In the project, go to Authentication → Sign-in method → Enable Google
// 3. Go to Firestore Database → Create database → Start in production mode
//    Then paste these security rules and click Publish:
//
//      rules_version = '2';
//      service cloud.firestore {
//        match /databases/{database}/documents {
//          match /users/{userId}/{document=**} {
//            allow read, write: if request.auth != null && request.auth.uid == userId;
//          }
//        }
//      }
//
// 4. Go to Project Settings (gear icon) → Your apps → Add web app (</>)
//    Copy the firebaseConfig object values into the fields below.
// 5. In Authentication → Settings → Authorized domains, add your Netlify domain
//    e.g. your-site.netlify.app
//
// Note: Firebase API keys are safe to expose in client-side code.
// Security is enforced by the Firestore rules above.

var firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
