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
const helper = require("../helpers/helpers")
const scoring = require("../helpers/scoring_functions")
const testStates = require("../test_states")



describe("Unit tests", () => {
  after(() => {
    test.cleanup();
  });



it("tests an add a score function that interacts with Firestore", async () => {
  const addedScoreID = await helper.addscore("8/1/2023", 235);

  assert.strictEqual(addedScoreID.score, 235);
  assert.strictEqual(typeof addedScoreID.score, 'number');
  assert.strictEqual(addedScoreID.date, "8/1/2023");
  assert.strictEqual(typeof addedScoreID.date, 'string');
}).timeout(5000);



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


it("checks get correct word, of ILLTH for 8/7/2023", async ()=>{
  assert.strictEqual(await helper.getCorrectWord("8/7/2023"), "ILLTH")
})

it("checks get correct word, of State1 and 8/1/2023", async ()=>{
  assert.strictEqual(await helper.getCorrectWord("8/1/2023")==testStates.State1.startWord, true)
})

it("checks should identify incorrect word of State3 and 8/7/2023 date", async ()=>{
  assert.strictEqual(await helper.getCorrectWord("8/7/2023") == testStates.State3.startWord, false)
})

it("checks State 1 start word", async ()=>{
  let correctStartWord = await helper.checkStartWord(await helper.getCorrectWord(testStates.State1.today), testStates.State1.startWord)
  assert.strictEqual(correctStartWord, true)

  correctStartWord = await helper.checkStartWord(helper.getCorrectWord("8/1/2023"), testStates.State2.startWord)
  assert.strictEqual(correctStartWord, false)

})

it("checks 8/2/2023 start word", async ()=>{
  let correctWord = await helper.getCorrectWord(testStates.State2.today)
  let correctStartWord = helper.checkStartWord(correctWord, testStates.State2.startWord)

  assert.strictEqual(correctStartWord, true)
})

it("checks processScore for State1", async()=>{
  const processedGame = await scoring.processScore(testStates.State1)
  assert.strictEqual(processedGame.score, 91)
})

it("checks retriveal of score docs for specific date", async()=>{
  const docs = await helper.getStats("8/1/2023")
  assert.strictEqual(Object.keys(docs).length > 0, true)
})

it("checks retriveal of score docs for specific date is a reduced Object", async()=>{
  const docs = await helper.getStats("8/1/2023")
  assert.strictEqual(typeof docs, 'object')
})

it("checks retriveal of score docs for test scores1 date", async()=>{
  const docs = await helper.getStats(testStates.State1.today)
  assert.strictEqual(typeof docs, 'object')
})


it("checks to see if we get 5 days of stats for 7/27 through 7/31", async ()=>{
  const data = await helper.getStatsByDates("7/27/2023", "7/31/2023")
  assert.strictEqual(data.size, 5)
})


it("checks to see if we get a word with length of 5 for addword on 7/1/2023", async ()=>{
  const newWord = await helper.getCorrectWord('7/2/2023')
  const data = await helper.addword('7/2/2023', newWord)

  assert.strictEqual(data.length, 5)
})

it("checks checks to see if a word doesn't exist and adds it.", async ()=>{
  const newWord = await helper.getWordByDate("9/3/2023")
  console.log("newWord: ", newWord)
  assert.strictEqual(newWord.length, 5)
})

});
  