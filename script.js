'use strict';

const cardObjectDefinitions = [
  { id: 1, imagePath: 'Images/r2d2andc3p0.jpeg' },
  { id: 2, imagePath: 'Images/gonk.jpeg' },
  { id: 3, imagePath: 'Images/grievous.jpg' },
  { id: 4, imagePath: 'Images/ig88.jpg' },
];

const cardBackImgPath = 'Images/obiwan.jpeg';
const cardContainerElem = document.querySelector('.card-container');

let cards = [];

const correctCardId = 1;

const currentGameStatusElem = document.querySelector('.current-status');
const scoreContainerElem = document.querySelector('.header-score-container');
const scoreElem = document.querySelector('.score');
const roundContainerElem = document.querySelector('.header-round-container');
const roundElem = document.querySelector('.round');

const winColor = 'green';
const loseColor = 'red';
const primaryColor = 'black';

const headerImgElem = document.querySelector('.header-img');
const winImgPath = 'Images/happytrooper.jpeg';
const loseImgPath = 'Images/sadtrooper.jpg';
const headerImgPath = 'Images/empirelogo.png';

const playGameButtonElem = document.getElementById('playGame');

const collapsedGridAreaTemplate = '"a a" "a a"';
const cardCollectionCellClass = '.card-pos-a';

const numCards = cardObjectDefinitions.length;

let cardPositions = [];

let gameInProgress = false;
let shufflingInProgress = false;
let cardsRevealed = false;

let roundNum = 0;
const maxRounds = 4;
let score = 0;

let gameObj = {};

const localStorageGameKey = 'ftd'; //Find the Droid

//Base HTML code
/* <div class="card">
        <div class="card-inner">
          <div class="card-front">
            <img src="Images/r2d2.jpg" alt="" class="card-img">
          </div>
          <div class="card-back">
            <img src="Images/obiwan.jpeg" alt="" class="card-img">
          </div>
        </div>
      </div> */
loadGame();

//Game functions

//Creates cards, assign cards to array, listen for click to start game
function loadGame() {
  setHeaderImg('normal');
  createCards();
  cards = document.querySelectorAll('.card');

  cardFlyInEffect();

  playGameButtonElem.addEventListener('click', () => startGame());
  updateStatusElement(scoreContainerElem, 'none');
  updateStatusElement(roundContainerElem, 'none');
}

//Card fly in effect
function cardFlyInEffect() {
  const id = setInterval(flyIn, 5);
  let cardCount = 0;

  let count = 0;

  function flyIn() {
    count++;
    if (cardCount == numCards) {
      clearInterval(id);
      playGameButtonElem.style.display = 'inline-block';
    }
    if (count == 1 || count == 250 || count == 500 || count == 750) {
      cardCount++;
      let card = document.getElementById(cardCount);
      card.classList.remove('fly-in');
    }
  }
}

//Updates the header image
function setHeaderImg(status) {
  if (status === 'normal') {
    addSrcToImageElem(headerImgElem, headerImgPath);
  } else if (status === 'win') {
    addSrcToImageElem(headerImgElem, winImgPath);
  } else if (status === 'lose') {
    addSrcToImageElem(headerImgElem, loseImgPath);
  }
}

//Check for incomplete game
function checkForIncompleteGame() {
  const serializedGameObj = getLocalStorageItemValue(localStorageGameKey);

  if (serializedGameObj) {
    gameObj = getObjectFromJSON(serializedGameObj);

    if (gameObj.round >= maxRounds) {
      removeLocalStorageItem(localStorageGameKey);
    } else {
      if (confirm('Would you like to continue your last game?')) {
        score = gameObj.score;
        roundNum = gameObj.round;
      } //If no, function exits and continue initializeNewGame
    }
  }
}

//Starts new game, starts new round
function startGame() {
  initializeNewGame();
  startRound();
}

//Initializes new game
function initializeNewGame() {
  setHeaderImg('normal');

  score = 0;
  roundNum = 0;

  checkForIncompleteGame();

  shufflingInProgress = false;

  updateStatusElement(scoreContainerElem, 'flex');
  updateStatusElement(roundContainerElem, 'flex');
  updateStatusElement(
    scoreElem,
    'block',
    primaryColor,
    `Score <span class="badge">${score}</span>`
  );
  updateStatusElement(
    roundElem,
    'block',
    primaryColor,
    `Round <span class="badge">${roundNum}</span>`
  );
}

//Starts new round and collects cards into one stack
function startRound() {
  initializeNewRound();
  collectCards();
  flipCards(true);
  shuffleCards();
}

//Initializes new round
function initializeNewRound() {
  setHeaderImg('normal');
  roundNum++;
  playGameButtonElem.disabled = true;

  gameInProgress = true;
  shufflingInProgress = true;
  cardsRevealed = false;

  updateStatusElement(
    currentGameStatusElem,
    'block',
    primaryColor,
    'Shuffling...'
  );

  updateStatusElement(
    roundElem,
    'block',
    primaryColor,
    `Round <span class="badge">${roundNum}</span>`
  );
}

//Collects cards into one stack
function collectCards() {
  transformGridArea(collapsedGridAreaTemplate);
  addCardsToGridAreaCell(cardCollectionCellClass);
}

//Transform grid areas to one area
function transformGridArea(areas) {
  cardContainerElem.style.gridTemplateAreas = areas;
}

//Add cards to single stack
function addCardsToGridAreaCell(cellPositionClassName) {
  const cellPositionElem = document.querySelector(cellPositionClassName);

  cards.forEach((card, index) => {
    addChildElement(cellPositionElem, card);
  });
}

//Creates all cards
function createCards() {
  cardObjectDefinitions.forEach((cardItem) => {
    createCard(cardItem);
  });
}

//Create each card
function createCard(cardItem) {
  //create div elements that make up a card
  const cardElem = createElement('div');
  const cardInnerElem = createElement('div');
  const cardFrontElem = createElement('div');
  const cardBackElem = createElement('div');

  //create front and back image elements for a card
  const cardFrontImg = createElement('img');
  const cardBackImg = createElement('img');

  //add class and id to card element
  addClassToElement(cardElem, 'card');
  addClassToElement(cardElem, 'fly-in');
  addIdToElement(cardElem, cardItem.id);

  //add class to inner card element
  addClassToElement(cardInnerElem, 'card-inner');

  //add class to card front element
  addClassToElement(cardFrontElem, 'card-front');

  //add class to card back element
  addClassToElement(cardBackElem, 'card-back');

  //add src attribute and appropriate value to img element - back of card
  addSrcToImageElem(cardBackImg, cardBackImgPath);

  //add src attribute and appropriate value to img element - front of card
  addSrcToImageElem(cardFrontImg, cardItem.imagePath);

  //assign class to image element of back of card
  addClassToElement(cardBackImg, 'card-img');

  //assign class to image element of front of card
  addClassToElement(cardFrontImg, 'card-img');

  //add front image element as child of front card element
  addChildElement(cardFrontElem, cardFrontImg);

  //add back image element as child of back card element
  addChildElement(cardBackElem, cardBackImg);

  //add front and back card element as child of inner element
  addChildElement(cardInnerElem, cardFrontElem);
  addChildElement(cardInnerElem, cardBackElem);

  //add inner card element as child of card element
  addChildElement(cardElem, cardInnerElem);

  //add card element as child element to appropriate grid cell
  addCardToGridCell(cardElem);
  initializeCardPositions(cardElem);

  //add onClick function to card element
  attachClickEventHandlerToCard(cardElem);
}

//Listen for click on card
function attachClickEventHandlerToCard(card) {
  card.addEventListener('click', () => chooseCard(card));
}

//Flip card to back
function flipCard(card, flipToBack) {
  const innerCardElem = card.firstChild;

  if (flipToBack && !innerCardElem.classList.contains('flip-it')) {
    innerCardElem.classList.add('flip-it');
  } else if (innerCardElem.classList.contains('flip-it')) {
    innerCardElem.classList.remove('flip-it');
  }
}

//Flips each card one at a time (in ms) * its index
function flipCards(flipToBack) {
  cards.forEach((card, index) => {
    setTimeout(() => {
      flipCard(card, flipToBack);
    }, index * 100);
  });
}

//Animate shuffle
function animateShuffle(shuffleCount) {
  const random1 = Math.floor(Math.random() * numCards) + 1;
  const random2 = Math.floor(Math.random() * numCards) + 1;

  let card1 = document.getElementById(random1);
  let card2 = document.getElementById(random2);

  if (shuffleCount % 4 == 0) {
    card1.classList.toggle('shuffle-left');
    card1.style.zIndex = 100;
  }
  if (shuffleCount % 10 == 0) {
    card2.classList.toggle('shuffle-right');
    card2.style.zIndex = 200;
  }
}

//Shuffle cards every 12 ms and deal after 500ms
function shuffleCards() {
  let shuffleCount = 0;

  const id = setInterval(shuffle, 12);

  function shuffle() {
    randomizeCardPositions();
    animateShuffle(shuffleCount);
    if (shuffleCount == 500) {
      clearInterval(id);
      shufflingInProgress = false;
      removeShuffleClasses();
      dealCards();
      updateStatusElement(
        currentGameStatusElem,
        'block',
        primaryColor,
        'Find those droids! Click a card'
      );
    } else {
      shuffleCount++;
    }
  }
}

//Remove shuffle class
function removeShuffleClasses() {
  cards.forEach((card) => {
    card.classList.remove('shuffle-left');
    card.classList.remove('shuffle-right');
  });
}

//Randomize Card Positions
function randomizeCardPositions() {
  const random1 = Math.floor(Math.random() * numCards) + 1;
  const random2 = Math.floor(Math.random() * numCards) + 1;
  const temp = cardPositions[random1 - 1];

  cardPositions[random1 - 1] = cardPositions[random2 - 1];
  cardPositions[random2 - 1] = temp;
}

//Initialize card positions (see create card)
function initializeCardPositions(card) {
  cardPositions.push(card.id);
}

//Deal cards into a new grid based on randomize card positions
function dealCards() {
  addCardsToAppropriateCell();
  const areasTemplate = returnGridAreasMappedToCardPos();

  transformGridArea(areasTemplate);
}

//Creates new randomized grid mapped to card positions
function returnGridAreasMappedToCardPos() {
  let firstPart = '';
  let secondPart = '';
  let areas = '';

  cards.forEach((card, index) => {
    if (cardPositions[index] == 1) {
      areas = areas + 'a ';
    } else if (cardPositions[index] == 2) {
      areas = areas + 'b ';
    } else if (cardPositions[index] == 3) {
      areas = areas + 'c ';
    } else if (cardPositions[index] == 4) {
      areas = areas + 'd ';
    }
    if (index == 1) {
      firstPart = areas.substring(0, areas.length - 1);
      areas = '';
    } else if (index == 3) {
      secondPart = areas.substring(0, areas.length - 1);
    }
  });
  return `"${firstPart}" "${secondPart}"`;
}

//Iterate each card for dealing
function addCardsToAppropriateCell() {
  cards.forEach((card) => {
    addCardToGridCell(card);
  });
}

//Add card to appropriate grid area
function addCardToGridCell(card) {
  const cardPositionClassName = mapCardIdToGridCell(card);
  const cardPosElem = document.querySelector(cardPositionClassName);

  addChildElement(cardPosElem, card);
}

//Note: typeof = object passed as argument. Cannot use strict equality to equal a number
//Cannot use switch statement, as switch uses strict equality
function mapCardIdToGridCell(card) {
  if (card.id == 1) {
    return '.card-pos-a';
  } else if (card.id == 2) {
    return '.card-pos-b';
  } else if (card.id == 3) {
    return '.card-pos-c';
  } else if (card.id == 4) {
    return '.card-pos-d';
  }
}

//Check if card can be chosen, evaluate choice, save game, then reveal all cards
function chooseCard(card) {
  if (canChooseCard()) {
    evaluateCardChoice(card);

    saveGameObjectToLocalStorage(score, roundNum);

    flipCard(card, false);

    setTimeout(() => {
      flipCards(false);
      updateStatusElement(
        currentGameStatusElem,
        'block',
        primaryColor,
        'Card positions revealed'
      );

      setHeaderImg('normal');
      endRound();
    }, 3000);
    cardsRevealed = true;
  }
}

//Checks if card can be selected at this time
function canChooseCard() {
  return gameInProgress === true && !shufflingInProgress && !cardsRevealed;
}

//Evaluates card choice
function evaluateCardChoice(card) {
  if (card.id == correctCardId) {
    updateScore();
    outputChoiceFeedback(true);
  } else {
    outputChoiceFeedback(false);
  }
}

//Sends feedback to user on card selection
function outputChoiceFeedback(hit) {
  if (hit) {
    setHeaderImg('win');

    updateStatusElement(
      currentGameStatusElem,
      'block',
      winColor,
      'These are the droids you are looking for!'
    );
  } else {
    setHeaderImg('lose');

    updateStatusElement(
      currentGameStatusElem,
      'block',
      loseColor,
      'These are not the droids you are looking for!'
    );
  }
}

//Ends the round and either game over or starts new round
function endRound() {
  setTimeout(() => {
    if (roundNum == maxRounds) {
      gameOver();
      return;
    } else {
      startRound();
    }
  }, 3000);
}

//Ends the game
function gameOver() {
  updateStatusElement(scoreContainerElem, 'none');
  updateStatusElement(roundContainerElem, 'none');

  const gameOverMessage = `Game Over!<br>Final Score - <span class = 'badge'>${score}</span><br>Click 'Play Game' button to play again`;

  updateStatusElement(
    currentGameStatusElem,
    'block',
    primaryColor,
    gameOverMessage
  );

  gameInProgress = false;
  playGameButtonElem.disabled = false;
}

//Update status element and hide/show element
function updateStatusElement(elem, display, color, innerHTML) {
  elem.style.display = display;

  if (arguments.length > 2) {
    elem.style.color = color;
    elem.innerHTML = innerHTML;
  }
}

//Updates the score in status element
function updateScore() {
  calculateScore();
  updateStatusElement(
    scoreElem,
    'block',
    primaryColor,
    `<span class='badge'>${score}</span>`
  );
}

//Calculate score for all rounds
function calculateScore() {
  const scoreToAdd = calculateScoreToAdd(roundNum);
  score += scoreToAdd;
}

//Calculate score for current round
function calculateScoreToAdd(roundNum) {
  if (roundNum == 1) {
    return 100;
  } else if (roundNum == 2) {
    return 50;
  } else if (roundNum == 3) {
    return 25;
  } else {
    return 10;
  }
}
//Utility functions

function createElement(elemType) {
  return document.createElement(elemType);
}

function addClassToElement(elem, className) {
  elem.classList.add(className);
}

function addIdToElement(elem, idname) {
  elem.id = idname;
}

function addSrcToImageElem(imgElem, src) {
  imgElem.src = src;
}

function addChildElement(parentElem, childElem) {
  parentElem.appendChild(childElem);
}

//Local Storage functions

//convert object to JSON string
function getSerializedObjectAsJSON(obj) {
  return JSON.stringify(obj);
}

//convert JSON string to object
function getObjectFromJSON(json) {
  return JSON.parse(json);
}

//Updates unique key and JSON value in storage
function updateLocalStorageItem(key, value) {
  localStorage.setItem(key, value);
}

//Remove item (denoted by key) from local storage
function removeLocalStorageItem(key) {
  localStorage.removeItem(key);
}

function getLocalStorageItemValue(key) {
  return localStorage.getItem(key);
}

//The game object to be stored
function updateGameObject(score, round) {
  gameObj.score = score;
  gameObj.round = round;
}

//Update game object and save to local storage
function saveGameObjectToLocalStorage(score, round) {
  updateGameObject(score, round);
  updateLocalStorageItem(
    localStorageGameKey,
    getSerializedObjectAsJSON(gameObj)
  );
}
