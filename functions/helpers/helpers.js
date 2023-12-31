const admin = require("firebase-admin");
const {getFirestore} = require("firebase-admin/firestore");
const logger = require("firebase-functions/logger");
const { scoreGame } = require("./scoring_functions");
const startWordsFile = require("./startWords")
const startingWords = startWordsFile.startingWords

exports.getStats = async (date) => {
    // Grab the text parameter.
    const scoreSnap = await admin.firestore().collection("scores").where("date", "==", date).get();
    let scoreData = []
    if (scoreSnap){
        for(let doc of scoreSnap.docs){
            scoreData.push(doc.data())
        }
    }
    const scoreObject = scoreData.reduce((acc, item) => {
        const score = item.score;

        // Check if the score already exists in the accumulator
        if (acc[score]) {
          acc[score]++;
        } else {
          acc[score] = 1;
        }
      
        return acc;
      }, {});

        scoreObject["word"] = await this.getWordByDate(date)

    return scoreObject
  };

  exports.getWordByDate = async(date)=>{
    const wordSnap = await admin.firestore().collection("daily_words").where("date", "==", date).get();
    const snapData = wordSnap.docs.length ? wordSnap.docs[0].data() : null; // Assuming there's only one document in the collection
    if (snapData){
        return snapData.word
    }
    else{
        const addedWord = await this.addword(date, await this.getCorrectWord(date))
        return addedWord
    }
  }

  exports.getStatsByDates = async (startDate, endDate) => {
    // Grab the text parameter.
    let statsMap = new Map()
    const dates = exports.getDatesInRange(startDate, endDate)
    for (let date of dates){
        statsMap.set(date, await exports.getStats(date))
        
    }
    return statsMap
  };



exports.getCorrectWord = async (date)=>{
    const randomSeedable = await import("random-seedable");
    // Destructure the XORShift class from the imported module
    
    const { XORShift } = randomSeedable;
    const rando = new XORShift(date.split("/").join(""));
    const wordsLength = Object.keys(startingWords).length
    const keys = Object.keys(startingWords);

    let correctWord = ''
    let length = correctWord.length
    
    while (length != 5) {
      correctWord = keys[rando.randRange(0, wordsLength)]
      length = correctWord.length
  
    }
    return correctWord.toUpperCase() 
}

exports.checkStartWord = (correctWord, testWord)=>{
    return correctWord == testWord
}

exports.addword = async (date, word) => {
    const writeResult = await getFirestore()
        .collection("daily_words")
        .add({date: date, word: word});
    // Send back a message that we've successfully written the message
    const newWordRef = getFirestore().collection('daily_words').doc(writeResult.id);

    // Fetch the document
    const newWordSnapshot = await newWordRef.get();

    // Check if the document exists
    if (newWordSnapshot.exists) {
    // Access the document data using the data() method
    const newWordData = newWordSnapshot.data();

    // Access individual fields in the document
    return newWordData.word;

    } else {
    // Document does not exist
    return ('An error adding word');
    }
  };

  exports.addscore = async (date, score) => {

    // Push the new message into Firestore using the Firebase Admin SDK.
    const writeResult = await getFirestore()
        .collection("scores")
        .add({date: date, score: score});
    // Send back a message that we've successfully written the message
    const scoreRef = admin.firestore().collection("scores").doc(writeResult.id);
    const scoreSnapshot = await scoreRef.get();
    const scoreData = scoreSnapshot.data()

    return scoreData
  };

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