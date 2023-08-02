const admin = require("firebase-admin");
let assert = require('assert');

// Initialize the firebase-functions-test SDK using environment variables.
// These variables are automatically set by firebase emulators:exec
//
// This configuration will be used to initialize the Firebase Admin SDK, so
// when we use the Admin SDK in the tests below we can be confident it will
// communicate with the emulators, not production.
const test = require("firebase-functions-test")({
  projectId: 'crosswordify-d1be7',
});

const myFunctions = require("../index");
const scoring = require("../scoring_functions")
const testStates = require("../test_states")


describe("Unit tests", () => {
  after(() => {
    test.cleanup();
  });



it("tests an add a score function that interacts with Firestore", async () => {
  // Make a fake request to pass to the function
  date = "8/1/2023" 
  score = 234

  // Create a response object with a `json` method to capture the result
  const res = {
      json: (data) => {
          console.log(data); // Print the result to the console
      }
  };

  // Call the function
  const addedScoreID = await myFunctions.addscore(date, score);
  const scoreRef = admin.firestore().collection("scores").doc(addedScoreID);
  const scoreSnapshot = await scoreRef.get();
  const scoreData = scoreSnapshot.data()
  console.log(scoreData)
  assert.strictEqual(scoreData.score, 234);
  assert.strictEqual(typeof scoreData.score, 'number');
  assert.strictEqual(scoreData.date, "8/1/2023");
  assert.strictEqual(typeof scoreData.date, 'string');
}).timeout(5000);

it("checks for a word that already exists", async ()=>{
  const wordExists = await myFunctions.checkWordExists("2023-08-01", "hello")
  assert.strictEqual(wordExists, true);
})
it("checks for a word on a date that exists but the word doesn't match", async ()=>{
  const wordExists = await myFunctions.checkWordExists("2023-08-01", "goodbye")
  assert.strictEqual(wordExists, false);
})
it("checks for a word on a date that exists but the word doesn't match", async ()=>{
  const wordExists = await myFunctions.checkWordExists("2023-08-06", "Test3")
  assert.strictEqual(wordExists, false);
})

it("checks State1 for correct number of accross and down words", ()=>{
  const returnState = scoring.checkWords(testStates.State1)
  assert.strictEqual(returnState.acrossWords[0], true);
  assert.strictEqual(returnState.acrossWords[1], false);
  assert.strictEqual(returnState.acrossWords[2], false);
  assert.strictEqual(returnState.acrossWords[3], false);
  assert.strictEqual(returnState.acrossWords[4], false);

  assert.strictEqual(returnState.downWords[0], true);
  assert.strictEqual(returnState.downWords[1], true);
  assert.strictEqual(returnState.downWords[2], false);
  assert.strictEqual(returnState.downWords[3], false);
  assert.strictEqual(returnState.downWords[4], false);
})

it("checks State1 for score", ()=>{
  const returnState = scoring.checkWords(testStates.State1)
  assert.strictEqual(scoring.scoreGame(returnState), 91)
})

it("checks State2 for score", ()=>{
  const returnState = scoring.checkWords(testStates.State2)
  assert.strictEqual(scoring.scoreGame(returnState), 212)
})

it("checks 8/1/2023 start word", async ()=>{
  let correctStartWord = await scoring.checkStartWord(testStates.State1.today, testStates.State1.startWord)
  assert.strictEqual(correctStartWord, true)
  correctStartWord = await scoring.checkStartWord(testStates.State1.today, testStates.State2.startWord)
  assert.strictEqual(correctStartWord, false)

})

it("checks 8/2/2023 start word", async ()=>{
  let correctStartWord = await scoring.checkStartWord(testStates.State2.today, testStates.State2.startWord)
  assert.strictEqual(correctStartWord, true)
  correctStartWord = await scoring.checkStartWord(testStates.State2.today, testStates.State1.startWord)
  assert.strictEqual(correctStartWord, false)
})

it("checks processScore for State1", async()=>{
  const processedGame = await scoring.processScore(testStates.State1)
  console.log(processedGame)
  assert.strictEqual(processedGame.score, 91)
})

it("checks retriveal of score docs for specific date", async()=>{
  const docs = await myFunctions.getStats("8/1/2023")
  console.log(docs)
  assert.strictEqual(docs.length > 0, true)
})

});
  