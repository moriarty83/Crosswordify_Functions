// The Cloud Functions for Firebase SDK to create Cloud Functions and triggers.
const logger = require("firebase-functions/logger");
const {onRequest} = require("firebase-functions/v2/https");
const {onDocumentCreated} = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
// The Firebase Admin SDK to access Firestore.
const {initializeApp} = require("firebase-admin/app");
const {getFirestore} = require("firebase-admin/firestore");
const score = require("./helpers/scoring_functions")
const helper = require("./helpers/helpers")
const cors = require('cors')({ origin: true });
const app = require('express')()


initializeApp({
    projectId: 'crosswordify-d1be7',
  });


// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

const helloCrosswordify = (req, res)=>{
    res.send("Hello Crosswordify Fan!")
}

const submitGame = async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    // Grab the text parameter.
    const state = req.body
    const processedScore = await score.processScore(state)
    let wordAdded = null
    if(processedScore.success == false){
        res.json(processedScore)
    }
    const wordExists = await helper.checkWordExists(state.today, state.startWord)
    if(!wordExists){
        wordAdded = await helper.addword(await helper.getCorrectWord(state.today))
    }
    const scoreId = await helper.addscore(processedScore.date, processedScore.score)
    // Send back a message that we've successfully written the message
    res.json({...processedScore, wordAdded: wordAdded, scoreId: scoreId});
  };

const statsByDateRange = async (req, res) => {
        res.set('Access-Control-Allow-Origin', '*');
    // Grab the text parameter.
    logger.warn("req: ", req)
    if(!req.query.startdate){
        return res.status(400).send('No Start Date Supplied');
    }
    const startDate = req.query.startdate
    logger.warn("startDate: ", startDate)

    const endDate = req.query.enddate ? req.query.enddate : req.query.startdate;
    const data = await helper.getStatsByDates(startDate, endDate)
    console.log("data: ", data)
    res.json(Object.fromEntries(data))
  };


const addscoreAPI = async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    console.log("date: ", req.body.date)
    console.log("score: ", req.body.score)

    // Push the new message into Firestore using the Firebase Admin SDK.
    const writeResult = await getFirestore()
        .collection("scores")
        .add({date: req.body.date, score: req.body.score});
    // Send back a message that we've successfully written the message
    res.json(writeResult.id)
    return writeResult.id
  }


  app.get('/', helloCrosswordify)
  app.post('/submitGame', submitGame)
  app.get('/stats', statsByDateRange)

  exports.api = onRequest(app)
  
  
  
  
  


  
