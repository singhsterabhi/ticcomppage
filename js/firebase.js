// Initialize Firebase
var config = {
  apiKey: "AIzaSyBk0Q_D8Pv8GIORHSv7WkZ_5vJdXY0Sya4",
  authDomain: "dashboard-8df80.firebaseapp.com",
  databaseURL: "https://dashboard-8df80.firebaseio.com",
  projectId: "dashboard-8df80",
  storageBucket: "dashboard-8df80.appspot.com",
  messagingSenderId: "996615708415"
};
firebase.initializeApp(config);

let auth = firebase.auth();

let database = firebase.database();
let imagesRef = firebase.storage().ref().child('images');
let placesNotApproved = database.ref('placessubmitted');
let users = database.ref('users');
// let uid = '';

function logout() {
  firebase.auth().signOut().then(function () {
    // Sign-out successful.
    // console.log('signed out');
    window.location = "/";
  }).catch(function (error) {
    // An error happened.
    console.log('error');
  });
}

