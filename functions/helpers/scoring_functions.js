const dictionary = require("./dictionary")
const dict = dictionary.dictionary;
const startWordsFile = require("./startWords")
const startingWords = startWordsFile.startingWords

letter_values = {
    E: 1,
    A: 1,
    S: 1,
    O: 1,
    T: 1,
  
    I: 2,
    R: 2,
    N: 2,
    L: 2,
    D: 2,
  
    U: 3,
    P: 3,
    M: 3,
    C: 3,
    G: 3,
  
    Y: 4,
    B: 4,
    H: 4,
    K: 4,
    W: 4,
  
    F: 5,
    V: 5,
    Z: 5,
    X: 5,
    Q: 5,
    J: 5,
  };

exports.checkWords = (state, chars)=>{
    // TODO: If down ins selected, and space 23 (second to last), is filled to complete across word, it doesn't color.
  
    // Populate words with chars
    for (let i = 0; i < 5; i++) {
      let validAcross = false;
      let validDown = false;
      let across = {word: "", index: new Array(5)};
      let down = {word: "", index: new Array(5)};
      for (let j = 0; j < 5; j++){
        across.word = across.word + state.chars[(i * 5 + j)].char;
        across.index[j] = i * 5 + j
        down.word = down.word + state.chars[(j * 5 + i)].char;
        down.index[j] = j * 5 + i
      }
      validAcross = across.length < 5 || !dict[across.word.toLowerCase()] ? false : true;
      validDown = down.length < 5 || !dict[down.word.toLowerCase()] ? false : true;
      
      state.acrossWords[i] = validAcross
      state.downWords[i] = validDown
      if(validAcross == true){
        for(let index of across.index){
            state.chars[index].across = true
        }
      }
      else{
        for(let index of across.index){
            state.chars[index].across = false
        }
      }
  
      if(validDown == true){
        for(let index of down.index){
            state.chars[index].down = true
        }
      }
      else{
        for(let index of down.index){
            state.chars[index].down = false
        }
      }
      
    }
  
    return state;
  }


  exports.scoreGame =(state)=>{
    let totalScore = 0;
    let bonus = 100;
    let scoredChars = state.scoredChars;
    for (let i = 0; i < 5; i++ ){
      if(state.acrossWords[i] == true){
        if(state.fixedAcross == true && i == state.fixedIndex){
          totalScore += 15
        }
        else{
          totalScore += 25
        }
      }
    }
    for (let i = 0; i < 5; i++ ){
      if(state.downWords[i] == true){
  
        if(state.fixedAcross == false && i == state.fixedIndex){
          totalScore += 15
        }
        else{
          totalScore += 25
        }
      }
    }
    
    for (let i = 0; i < 25; i++) {
      let letterScore = 0;
      if (!state.chars[i].down == true || !state.chars[i].across == true) {
        bonus = 0;
      }
      if(state.chars[i].down == true || state.chars[i].across){
        letterScore = letter_values[state.chars[i].char]
      }
      
      scoredChars[i] = letterScore;
      totalScore += letterScore;
    }
    totalScore += bonus;
    return totalScore
  }


exports.checkStartWord = async (date, userWord)=>{
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
    
    correctWord = correctWord.toUpperCase()
    return correctWord == userWord
  }

  exports.processScore = async (state) => {
    if (!(await exports.checkStartWord(state.today, state.startWord))) {
      return {success: false, score: null, date: state.today};
    }
  
    const updatedState = exports.checkWords(state); // Use `exports` to access the exported function
    const gameScore = exports.scoreGame(updatedState); // Use `exports` to access the exported function
    console.log("gameScore: ", gameScore)
    // Do something with gameScore
    return {success: true, score: gameScore, date: state.today}
  };
