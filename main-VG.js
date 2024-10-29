/* TODO */

/* 1.
Helper functions:
isPrimitive(val): Check if a value is a primitive type (number, boolean, string, or undefined).
isObject(val): Check if a value is an object type.
Object.prototype.equals(otherObj): Compare two objects for equality.
Array.prototype.contains(value): Check if an array contains a specific value.
2.
DOM functions:
announce(message): Display a message in the announcer element.
clearAnnounce(): Clear the announcer element.
displayTurn(player): Display the current player's turn.
displayGameOver(winner, loser): Display the game over message with the winner and loser.
getCoordinates(tile): Get the coordinates of a tile element.
clearTile(tile): Clear a tile element.
clearGrid(): Clear the entire grid.
removeShip(ship): Remove a ship from the grid.
addMark(tile, mark): Add a mark (1, 2, or X) to a tile element.
displayMarkersOnGrid(markers): Display markers on the grid.
glowShip(ship, ms): Glow a ship on the grid for a specified duration.
3.
Initialize ships:
isValidShip(ship): Check if a ship is valid based on length and coordinates.
initializeShips(player, callback): Initialize a player's ships and call the callback function when done.
4.
Game loop:
markCoord(coord, mark): Add a mark (1, 2, or X) to a coordinate object.
hasLost(player): Check if a player has lost.
registerHitOrBom(guess, player): Register a guess as a hit or a bomb for a player.
switchPlayers(players): Switch the current and enemy players.
handleNextPlayerClick(): Handle the "Next player" button click event.
stopGame(): Stop the game and display the game over message.
handleTileClick(evt): Handle a tile click event by registering the guess and checking for a winner.
gameLoop(): Run the game loop, displaying the current player's turn, hits, and boms, and adding event listeners to the tiles.
5.
Game start:
runGame(): Start the game by initializing the players' ships and running the game loop.
*/

///////////////////// Helper functions //////////////////////////

// determine if val is primitive value (true/false)
function isPrimitive(val) {
  return ["number", "boolean", "string", "undefined"].includes(typeof val);
}

// determine if val is object value (true/false)
function isObject(val) {
  return typeof val === "object";
}

// Helper method added to Object prototype to determine equality
// Example usage:
//
// const obj = { name: "Pelle" age: 17 }
// obj.equals({ name: "Pelle", age: 17 }) => true
// obj.equals({ name: "Patrik", age: 18 }) => false
Object.prototype.equals = function (otherObj) {
  const thisKeys = Object.keys(this);
  const otherKeys = Object.keys(otherObj);
  if (thisKeys.length !== otherKeys.length) {
    return false;
  }
  for (let key of thisKeys) {
    const thisVal = this[key];
    const otherVal = otherObj[key];
    if (typeof thisVal !== "object") {
      if (thisVal !== otherVal) {
        return false;
      }
    } else {
      if (!thisVal.equals(otherVal)) {
        return false;
      }
    }
  }
  return true;
};

// Helper method added to Array prototype to determine if value exist in array
// Example usage:
//
// const arr = [{ age: 1 }, { age: 2 }]
// arr.contains({ age: 2 }) => true
// arr.contains({ age: 3 }) => false
Array.prototype.contains = function (value) {
  if (isObject(value) && value.length === undefined) {
    for (let i = 0; i < this.length; i++) {
      if (value.equals(this[i])) {
        // we found an equal element
        return true;
      }
    }
  }
  if (isPrimitive(value)) {
    return this.includes(value); // see if array has primitive value inside
  }
  return false;
};

/*
Det här dokumentet tjänar som en guide för att implementera spelet 
battleship i inlämningsuppgiften för "Grundläggande JS" på VG nivå. 
Några funktioner är redan implementerade åt er, andra är delvis 
implementerade och resterande saknar implementation helt. Er uppgift är 
att fylla i det som saknas i detta dokument.

Om ni kikar i index.html kan ni se att ett skrip test.js laddas in i 
dokumentet. Detta skript kör bl.a tester för några av funktioner som ni
ska implementera i denna uppgift. Ni kan se resultatet av testerna om ni 
öppnar index.html i webbläsaren och tittar i konsollen. Ni kan se att 
många tester just nu är röda (passerar inte). Jag rekommenderar att ni 
inte kommenterar bort test.js från index.html förrän alla tester är 
gröna (passerar). Börja med att implementera de nödvändiga funktionerna 
för att få testerna att passera:

* isValidShip
* markCoord
* hasLost
* registerHitOrBom
* switchPlayer

Ni skall alltså inte modifiera test.js filen utan modifiera bara i
main-VG.js. Ni får naturligtvis skapa hjälp funktioner och annat som ni 
kan tänkas behöva, men ändra helst inte för mycket i de redan 
färdigimplementerade funktionerna, annars kan det bli ganska stökigt för 
er, såvida ni inte vill ha en riktig utmaning :-D. 

När testerna passerar så kan ni kommentera bort test.js i index.html, 
gå längst ned i main-VG.js (detta dokument) och ta bort kommentaren 
framför "runGame()" så att huvudfunktionen kör. Därefter börja
implementera följande variabler (ni ska hämta rätt DOM element med 
docuement.querySelector):

* display
* playerDisplay
* tiles (använd querySelectorAll tillsammans med Array.from metoden)
* announcer
* button

och följande funktioner:

* announce
* clearAnnounce
* displayTurn
* getCoordinates
* clearTile
* clearGrid
* removeShip

*/

///////////////////// Globala variabler //////////////////////////

const rows = 10;
const cols = 10;
const nrOfShips = 5;

const player1 = {
  mark: 1,
  boms: [], // coordinates [{ row: nr, col: nr }, ...] for missed shots
  hits: [], // coordinates [{ row: nr, col: nr }, ...] for hit shots
  ships: [], // coordinates [{ row: nr, col: nr }, ...] for all ships
};

const player2 = {
  mark: 2,
  boms: [],
  hits: [],
  ships: [],
};

// object to easily switch players
let players = { current: player1, enemy: player2 };

// DOM elements to manipulate
const display = document.querySelector("section.display");
const playerDisplay = document.querySelector(".display-player");
const tiles = Array.from(document.querySelectorAll(".tile"));
const announcer = document.querySelector(".announcer");
const button = document.querySelector("button");

///////////////////// DOM functions /////////////////////////////

// displays in DOM node announcer a text message and removes .hide
// class
function announce(message) {
  announcer.textContent = message;
  announcer.classList.remove("hide");
}

// clears DOM node announcer (removes innerHTML) and removes it
// by adding .hide class
function clearAnnounce() {
  announcer.textContent = "";
  announcer.classList.add("hide");
}

// displays in DOM node playerDisplay the current players turn
// tip use player.mark (1 or 2) and display that in the <span>
function displayTurn(player) {
  playerDisplay.textContent = `Player ${player.mark}'s turn`;
}

// displays in DOM node playerDisplay the winner and loser of the game
function displayGameOver(winner, loser) {
  const winnerStr = `Player <span class="display-player player${winner.mark}">${winner.mark}</span>`;
  const loserStr = ` wins over player <span class="display-player player${loser.mark}">${loser.mark}</span>`;
  display.innerHTML = winnerStr + loserStr;
  announce("Game Over");
}

// given a tile (DOM node) returns that tiles row and col position in grid
// ex: <div class="tile" data-row="1" data-col="2"></div> => { row: 1, col: 2 }
function getCoordinates(tile) {
  const row = parseInt(tile.dataset.row);
  const col = parseInt(tile.dataset.col);
  return { row, col };
}

// given a tile (DOM node) clears that tile in grid
// gets rid of .player1 and .player2 classes as well as clears innerHTML
function clearTile(tile) {
  DataTransferItemList.classList.remove("player1");
  DataTransferItemList.classList.remove("player2");
  tile.innerHTML = "";
}

// clears the whole grid of with help of clearTile
function clearGrid() {
  tiles.forEach((tile) => {
    clearTile(tile);
  });
}

// clears all coordinates of ship in grid
// (tip: use getCoordinates, contains and clearTile)
function removeShip(ship) {
  ship.forEach((coord) => {
    const tile = tiles.find((tile) => {
      const tileCoord = getCoordinates(tile);
      return tileCoord.row === coord.row && tileCoord.col === coord.col;
    });
    clearTile(tile);
  });
}

// given a tile an mark (1, 2 or X) adds the mark on the tile
function addMark(tile, mark) {
  tile.innerHTML = mark;
  if (mark === player1.mark || mark === player2.mark) {
    tile.classList.add(`player${mark}`);
  } else if (mark === "X") {
    tile.classList.add(`bom`);
  }
}

// displays an array of markers on the grid. The markers coorinates
// tells where to mark and the marker what to display on the grid
//
// Example input markers
// [{ row: 1, col: 2, marker: 1 }, { row: 1, col: 3, marker: "X" }]
//
// displays 1 on position (1, 2) and X on position (1, 3) in grid
// (tip: use addMark)
function displayMarkersOnGrid(markers) {
  tiles.forEach((tile) => {
    const { row, col } = getCoordinates(tile);
    const marker = markers.find((m) => m.row === row && m.col === col);

    if (marker) {
      addMark(tile, marker.mark);
    }
  });
}

// given a player, display that players hits and boms array with help of
// displayMarkersOnGrid
function displayHitsAndBoms(player) {
  clearGrid();
  const markedHits = player.hits.map((coord) => ({
    ...coord,
    mark: player.mark,
  }));
  const markedBoms = player.boms.map((coord) => ({
    ...coord,
    mark: "X",
  }));
  displayMarkersOnGrid([...markedHits, ...markedBoms]);
}

function glowShip(ship, ms) {
  tiles
    .filter((tile) => {
      const tileCoord = getCoordinates(tile);
      return ship.contains(tileCoord);
    })
    .forEach((tile) => {
      tile.classList.add("glow");
      setTimeout(() => {
        tile.classList.add("glow");
      }, 1200);
      tile.classList.remove("glow");
    });
}

///////////////////// Initialize ships //////////////////////////

// determines if a ship is a valid or not considering length and coordinates
// Check test.js for specification of how it should work
function isValidShip(ship) {
  if (ship.length < 2 || ship.length > 5) {
    return false;
  }

  for (let i = 0; i < ship.length - 1; i++) {
    const currentCoord = ship[i];
    const nextCoord = ship[i + 1];

    if (
      currentCoord.row === nextCoord.row &&
      currentCoord.col === nextCoord.col
    ) {
      return false;
    } else if (
      Math.abs(currentCoord.row - nextCoord.row) === 1 &&
      Math.abs(currentCoord.col - nextCoord.col) === 1
    ) {
      return false;
    }
  }
  return true;
}
function isValidVerticalShip(ship) {
  if (ship.length < 2 || ship.length > 5) {
    return false;
  }
  for (let i = 0; i < ship.length - 1; i++) {
    const currentCoord = ship[i];
    const nextCoord = ship[i + 1];

    if (
      currentCoord.row === nextCoord.row &&
      currentCoord.col == nextCoord.col
    ) {
      return false;
    } else if (
      Math.abs(currentCoord.row - nextCoord.row) === 1 &&
      Math.abse(currentCoord.col - nextCoord.col) === 1
    ) {
      return false;
    } else if (
      Math.abs(currentCoord.row - nextCoord.row) === 1 &&
      currentCoord.col === nextCoord.col
    ) {
      continue;
    } else if (
      Math.abs(cuurentCoord.col - nextCoord.row) === 1 &&
      currentCoord.row === nextCoord.row
    ) {
      continue;
    } else {
      return false;
    }
  }
  return true;
}

// Ask both users for all their ships positions
//    player: one of the players
//    callback: function to be called when all ships have been placed by player
function initializeShips(player, callback) {
  let shipCount = 0;
  let currentShip = [];
  let isVertical = false;
  displayTurn(player);
  announce(`Choose your remaining ${nrOfShips} ships!`);

  // event listener function
  function handleTileClick(evt) {
    const tile = evt.target;
    const coords = getCoordinates(tile);
    currentShip.push(coords);
    addMark(tile, player.mark);
    player.ships = [];
  }

  // event listener function
  function handleAddShipClick() {
    if (isVertical && isValidVerticalShip(currentShip)) {
      // let the ship glow for 1 sec in grid to mark that it is added
      glowShip(currentShip, 1200);

      // register ship coordinates in players ships array
      player.ships = [...currentShip, ...player.ships];
      currentShip = []; // reset currentShip
      shipCount++; // increase count of ships
      announce(`Choose your remaining ${nrOfShips - shipCount} ships!`);

      // if all 5 ships have been registered
      if (shipCount === nrOfShips) {
        // recover grid and remove all added event listeners
        clearGrid();
        button.removeEventListener("click", handleAddShipClick);
        tiles.forEach((tile) =>
          tile.removeEventListener("click", handleTileClick)
        );
        callback(); // now we can execute the callback when button has been clicked for the last time
      }
    } else if (!isVertical && isValidShip(currentShip)) {
      glowShip(currentShip, 1200);

      player.ships = [...currentShip, ...player.ships];
      currentShip = [];
      shipCount++;
      announce(`Choose your remaining ${nrOfShips - shipCount} ships!`);

      if (shipCount === nrOfShips) {
        clearGrid();
        button.removeEventListener("click", handleAddShipClick);
        tiles.forEach((tile) =>
          tile.removeEventListener("click", handleTileClick)
        );
        callback();
      }
    } else {
      alert(`
      * Ships must be straigh lines
      * Each ship must be larger than 2 coordinates
      * Each ship must not be longer than 5 coordinates
      `);
      removeShip(currentShip); // remove the last ship since it was not valid
      currentShip = []; // reset ship
    }
  }

  // add event listeners
  button.addEventListener("click", handleAddShipClick);
  tiles.forEach((tile) => tile.addEventListener("click", handleTileClick));
}

//////////////////////// Game loop ////////////////////////////////

// adds mark (1, 2 or X) to coordinate object { row, col } => { row, col, mark }
// Check test.js for specification of how it should work
function markCoord(coord, mark) {
  return { ...coord, mark };
}

// determines if player has lost (true/false)
// tip: check out player.ships and player.hits ;-)
// Check test.js for specification of how it should work
function hasLost(player) {
  return player.ships.length === player.hits.length;
}

// adds guess coordinates { row, col } to either players hits or boms array
// depending on whether it hit or missed any of the players ships coordinates
// Check test.js for specification of how it should work
function registerHitOrBom(guess, player) {
  const shipIndex = player.ships.findIndex(
    (ship) => ship.row === guess.row && ship.col === guess.col
  );
  if (shipIndex !== -1) {
    player.ships.splice(shipIndex, 1);
    player.hits.push(guess);
  } else {
    player.boms.push(guess);
  }
}

// switch players object around so that
// { current: p1, enemy: p2 } => { current: p2, enemy: p1 }
// Check test.js for specification of how it should work

function switchPlayers(players) {
  return { current: players.enemy, enemy: players.current };
}

let targetChoosen = false; // flag to determine if user has clicked at a tile

// event listener function for "Next player" button
function handleNextPlayerClick() {
  // if user has clicked tile allow to run next loop
  if (targetChoosen) {
    targetChoosen = false; // reset flag
    gameLoop(); // runs another turn of game loop
  } else {
    alert("You must choose a tile to shoot first");
  }
}

// stops game
function stopGame() {
  displayGameOver(players.current, players.enemy);
  button.innerHTML = "Restart";
  button.removeEventListener("click", handleNextPlayerClick);
  button.addEventListener("click", () => location.reload());
}

// event listener function for when tile is clicked by user
function handleTileClick(evt) {
  const guess = getCoordinates(evt.target); // what tile was clicked?
  registerHitOrBom(guess, players.enemy); // add guess to either enemy hits or boms array
  displayHitsAndBoms(players.enemy); // display all enemys hits and boms array
  // remove event listener from all tiles, so player cannot click any more tiles
  tiles.forEach((tile) => tile.removeEventListener("click", handleTileClick));
  if (hasLost(players.enemy)) {
    stopGame(); // current is winner, stop running game loop
  } else {
    players = switchPlayers(players);
    targetChoosen = true; // mark flag so that we know user has clicked on tile
  }
}

// game loop, main parts are
// * displays turn of current player
// * displays in grid enemys hits and boms,
// * adds evenlistener handleTileClick to each tile so that user kan guess
function gameLoop() {
  displayTurn(players.current);
  displayHitsAndBoms(players.enemy);
  // add event listeners
  tiles.forEach((tile) => tile.addEventListener("click", handleTileClick));
}

///////////////////// Game start //////////////////////////

function runGame() {
  // initializeShips uses a player object to set up all ships, and when done calls the callback
  // function given as second argument. We have to do this since the JavaScript engine is an
  // asynchrounous (i.e does not wait for a function to finish). To learn more check out this
  // video on youtube: "What the heck is the eventloop anyway?"
  initializeShips(player1, () => {
    initializeShips(player2, () => {
      button.innerHTML = "Next player";
      button.addEventListener("click", handleNextPlayerClick);
      clearAnnounce();
      gameLoop();
    });
  });
}

runGame();

//// given a tile (DOM node) clears that tile in grid
function clearTile(tile) {
  if (tile) {
    tile.innerHTML = "";
    tile.classList.remove("player1");
    tile.classList.remove("player2");
    tile.classList.remove("bom");
    tile.classList.remove("glow");
  }
}

/*TODO*/

// clears all coordinates of ship in grid
/* (tip: use getCoordinates, contains and clearTile)*/
function removeShip(ship) {
  ship.forEach((coord) => {
    const tile = tiles.find((tile) => {
      const tileCoord = getCoordinates(tile);
      return tileCoord.row === coord.row && tileCoord.col === coord.col;
    });
    clearTile(tile);
  });
}
