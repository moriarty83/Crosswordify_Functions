const postScoreData = async (data)=>{
    console.log("PostScoreData: ", data)
    const fetchModule = await import("node-fetch");
    const fetch = fetchModule.default;
    // Default options are marked with *
    const response = await fetch("http://127.0.0.1:5001/crosswordify-d1be7/us-central1/addscoreAPI", {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data), // body data type must match "Content-Type" header
    });
    console.log("response: ", response)
    return response.json(); // parses JSON response into native JavaScript objects
}

const scoresToAdd = [
{date: "8/2/2023", score: 205},
{date: "8/2/2023", score: 187},
{date: "8/2/2023", score: 235},
{date: "8/2/2023", score: 208},
{date: "8/2/2023", score: 205},
{date: "8/2/2023", score: 205},
{date: "8/2/2023", score: 208},
{date: "8/2/2023", score: 208},
{date: "8/2/2023", score: 187},
{date: "8/2/2023", score: 187},
{date: "8/2/2023", score: 187},
{date: "8/2/2023", score: 235},
{date: "8/2/2023", score: 160},
{date: "8/2/2023", score: 233},
{date: "8/2/2023", score: 61},
{date: "8/2/2023", score: 270}
]
const populateScores = async()=>{

  for(let i = 0; i < scoresToAdd.length; i++){
    
    const newScoreId = await postScoreData(scoresToAdd[i])
    console.log("newScoreId: ", newScoreId)
  }
}

populateScores()