// The Cloud Functions for Firebase SDK to create Cloud Functions and triggers.
const logger = require("firebase-functions/logger");
const {onRequest} = require("firebase-functions/v2/https");
const {onDocumentCreated} = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
// The Firebase Admin SDK to access Firestore.
const {initializeApp} = require("firebase-admin/app");
const {getFirestore} = require("firebase-admin/firestore");
const score = require("./scoring_functions")

initializeApp({
    projectId: 'crosswordify-d1be7',
  });


// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

exports.submitGame = onRequest(async (req, res) => {
    // Grab the text parameter.
    const state = req.body
    const processedScore = await score.processScore(state)
    let wordAdded = null
    if(processedScore.success == false){
        res.json(processedScore)
    }
    const wordExists = await exports.checkWordExists(state.today, state.startWord)
    if(!wordExists){
        wordAdded = await exports.addword(state.today, state.startWord)
    }
    const scoreId = await exports.addscore(processedScore.date, processedScore.score)
    // Send back a message that we've successfully written the message
    res.json({...processedScore, wordAdded: wordAdded, scoreId: scoreId});
  });

  exports.getStatsByRangeAPI = onRequest(async (req, res) => {
    // Grab the text parameter.
    console.log("reqBody: ", req.body)
    const startDate = req.body.startDate
    const endDate = req.body.endDate ? req.body.endDate : req.body.startDate;
    const data = await exports.getStatsByDates(startDate, endDate)
    console.log("data: ", data)
    res.json(Object.fromEntries(data))
  });

  exports.getStats = async (date) => {
    // Grab the text parameter.
    const scoreSnap = await admin.firestore().collection("scores").where("date", "==", date).get();
    let scoreData = []
    if (scoreSnap){
        for(let doc of scoreSnap.docs){
            scoreData.push(doc.data())
        }
    }
    const scoresMap = scoreData.reduce((acc, item) => {
        const score = item.score;

        // Check if the score already exists in the accumulator
        if (acc[score]) {
          acc[score]++;
        } else {
          acc[score] = 1;
        }
      
        return acc;
      }, {});
      console.log("scoresMap: ", typeof scoresMap)
    return scoresMap
  };

  exports.getStatsByDates = async (startDate, endDate) => {
    // Grab the text parameter.
    let statsMap = new Map()
    const dates = exports.getDatesInRange(startDate, endDate)
    for (let date of dates){
        statsMap.set(date, await exports.getStats(date))
    }
    console.log("statsMap: ", statsMap)
    return statsMap
  };

exports.checkWordExists = async (date, word) => {
    // Grab the text parameter.
    const wordSnap = await admin.firestore().collection("daily_words").where("date", "==", date).get();
    const snapData = wordSnap.docs.length ? wordSnap.docs[0].data() : null; // Assuming there's only one document in the collection
    if (snapData){
        return snapData.word == word
    }
    else{
        console.log("no word")
        return false
    }
  };

exports.addword = async (date, word) => {
    // Grab the text parameter.
    logger.info(date)
    logger.info(word)
    // Push the new message into Firestore using the Firebase Admin SDK.
    const writeResult = await getFirestore()
        .collection("daily_words")
        .add({date: date, word: word});
    // Send back a message that we've successfully written the message
    return `Word with ID: ${writeResult.id} added.`
  };

  exports.addscore = async (date, score) => {
    console.log("date: ", date)
    console.log("score: ", score)

    // Push the new message into Firestore using the Firebase Admin SDK.
    const writeResult = await getFirestore()
        .collection("scores")
        .add({date: date, score: score});
    // Send back a message that we've successfully written the message

    return writeResult.id
  };

  exports.addscore = async (date, score) => {
    console.log("date: ", date)
    console.log("score: ", score)

    // Push the new message into Firestore using the Firebase Admin SDK.
    const writeResult = await getFirestore()
        .collection("scores")
        .add({date: date, score: score});
    // Send back a message that we've successfully written the message

    return writeResult.id
  };

  exports.addscoreAPI = onRequest(async (req, res) => {
    console.log("date: ", req.body.date)
    console.log("score: ", req.body.score)

    // Push the new message into Firestore using the Firebase Admin SDK.
    const writeResult = await getFirestore()
        .collection("scores")
        .add({date: req.body.date, score: req.body.score});
    // Send back a message that we've successfully written the message
    res.json(writeResult.id)
    return writeResult.id
  });


  exports.getDatesInRange = (startDateStr, endDateStr)=>{
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    const dates = [];
  
    // Helper function to format the date as "M/D/YYYY"
    function formatDate(date) {
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const year = date.getFullYear();
      return `${month}/${day}/${year}`;
    }
  
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      dates.push(formatDate(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
  
    return dates;
  }
  
  
  
  
  
  
  


  
