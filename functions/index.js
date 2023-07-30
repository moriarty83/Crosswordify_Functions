// The Cloud Functions for Firebase SDK to create Cloud Functions and triggers.
const logger = require("firebase-functions/logger");
const {onRequest} = require("firebase-functions/v2/https");
const {onDocumentCreated} = require("firebase-functions/v2/firestore");

// The Firebase Admin SDK to access Firestore.
const {initializeApp} = require("firebase-admin/app");
const {getFirestore} = require("firebase-admin/firestore");

initializeApp();


// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

exports.addword = onRequest(async (req, res) => {
    // Grab the text parameter.
    const date = req.query.word
    const word = parseInt(req.query.date);
    logger.info(date)
    logger.info(word)
    // Push the new message into Firestore using the Firebase Admin SDK.
    const writeResult = await getFirestore()
        .collection("daily_words")
        .add({date: date, word: word});
    // Send back a message that we've successfully written the message
    res.json({result: `Word with ID: ${writeResult.id} added.`});
  });




exports.helloWorld = onRequest((request, response) => {
  logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});

////////////////// TUTORIAL FUNCTIONS ///////////////////
exports.addmessage = onRequest(async (req, res) => {
    // Grab the text parameter.
    const original = req.query.text;
    // Push the new message into Firestore using the Firebase Admin SDK.
    const writeResult = await getFirestore()
        .collection("messages")
        .add({original: original});
    // Send back a message that we've successfully written the message
    res.json({result: `Message with ID: ${writeResult.id} added.`});
  });


  exports.makeuppercase = onDocumentCreated("/messages/{documentId}", (event) => {
    // Grab the current value of what was written to Firestore.
    const original = event.data.data().original;
  
    // Access the parameter `{documentId}` with `event.params`
    logger.log("Uppercasing", event.params.documentId, original);
  
    const uppercase = original.toUpperCase();
  
    // You must return a Promise when performing
    // asynchronous tasks inside a function
    // such as writing to Firestore.
    // Setting an 'uppercase' field in Firestore document returns a Promise.
    return event.data.ref.set({uppercase}, {merge: true});
  });
