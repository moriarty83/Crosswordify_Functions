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


describe("Unit tests", () => {
  after(() => {
    test.cleanup();
  });
  it("tests hello firebase", ()=>{
    response = myFunctions.helloWorld()
    assert.equal(response, "hello world")
  })

  it("tests a simple HTTP function", async () => {
    // A fake request object, with req.query.text set to 'input'
    const req = { query: { text: "input" } };

    const sendPromise = new Promise((resolve) => {
      // A fake response object, with a stubbed send() function which asserts that it is called
      // with the right result
      const res = {
        send: (text) => {
          resolve(text);
        }
      };

      // Invoke function with our fake request and response objects.
      myFunctions.simpleHttp(req, res)
    });

    // Wait for the promise to be resolved and then check the sent text
    const text = await sendPromise;
    assert.equal(text, `text: input`);
  });

  it("tests an add message function that interacts with Firestore", async () => {
    // Make a fake request to pass to the function
    const req = {"query": {"text": 'Test Message'}};

    // Create a response object with a `json` method to capture the result
    const res = {
        json: (data) => {
            console.log(data); // Print the result to the console
        }
    };

    // Call the function
    const addedMessageId = await myFunctions.addmessage(req, res);
    const messageRef = admin.firestore().collection("messages").doc(addedMessageId);
    const messageSnapshot = await messageRef.get();
    const messageData = messageSnapshot.data()

    assert.strictEqual(messageData.original, 'Test Message');
    assert.strictEqual(typeof messageData.original, 'string');
}).timeout(5000);

it("tests an add a score function that interacts with Firestore", async () => {
  // Make a fake request to pass to the function
  const req = {"query": {"date": "2023-08-01", "score": "234"}};

  // Create a response object with a `json` method to capture the result
  const res = {
      json: (data) => {
          console.log(data); // Print the result to the console
      }
  };

  // Call the function
  const addedScoreID = await myFunctions.addscore(req, res);
  const scoreRef = admin.firestore().collection("scores").doc(addedScoreID);
  const scoreSnapshot = await scoreRef.get();
  const scoreData = scoreSnapshot.data()
  console.log(scoreData)
  assert.strictEqual(scoreData.score, 234);
  assert.strictEqual(typeof scoreData.score, 'number');
  assert.strictEqual(scoreData.date, "2023-08-01");
  assert.strictEqual(typeof scoreData.date, 'string');
}).timeout(5000);

it("checks for a word that already exists", async ()=>{
  const wordExists = myFunctions.checkdailyword("2023-08-01", "hello")
  assert.strictEqual(wordExists, true);

})

it("tests an add message function that interacts with Firestore", async () => {
  // Make a fake request to pass to the function
  const req = {"query": {"text": 'Test Message'}};
  // Create a response object with a `json` method to capture the result
  const res = {
      json: (data) => {
          console.log(data); // Print the result to the console
      }
  };
  // Call the function
  const addedMessageId = await myFunctions.addmessage(req, res);
  const messageRef = admin.firestore().collection("messages").doc(addedMessageId);
  const messageSnapshot = await messageRef.get();
  const messageData = messageSnapshot.data()

  assert.strictEqual(messageData.original, 'Test Message');
  assert.strictEqual(typeof messageData.original, 'string');
}).timeout(5000);
});
  