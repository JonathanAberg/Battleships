///////////////////// Global Variables //////////////////////////

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
let targetChoosen = false; // Global flag for tracking tile selection

// DOM elements to manipulate
const display = document.querySelector("section.display");
const playerDisplay = document.querySelector(".display-player");
const tiles = Array.from(document.querySelectorAll(".tile"));
const announcer = document.querySelector(".announcer");
const button = document.querySelector("button");

///////////////////// Helper functions //////////////////////////

// determine if val is primitive value (true/false)
function isPrimitive(val) {
  return ["number", "boolean", "string", "undefined"].includes(typeof val);
}

// determine if val is object value (true/false)
function isObject(val) {
  return val !== null && typeof val === "object";
}

// Helper method added to Object prototype to determine equality
Object.prototype.equals = function (otherObj) {
  if (!isObject(otherObj)) return false;

  const thisKeys = Object.keys(this);
  const otherKeys = Object.keys(otherObj);
  if (thisKeys.length !== otherKeys.length) return false;

  for (let key of thisKeys) {
    const thisVal = this[key];
    const otherVal = otherObj[key];

    if (isObject(thisVal) && isObject(otherVal)) {
      if (!thisVal.equals(otherVal)) return false;
    } else if (thisVal !== otherVal) {
      return false;
    }
  }
  return true;
};

// Helper method added to Array prototype to determine if value exists in array
Array.prototype.contains = function (value) {
  if (isObject(value)) {
    return this.some((item) => item.equals(value));
  }
  return this.includes(value);
};

///////////////////// DOM functions /////////////////////////////

// displays in DOM node announcer a text message and removes .hide class
function announce(message) {
  announcer.textContent = message;
  announcer.classList.remove("hide");
}

// clears DOM node announcer (removes innerHTML) and hides it
function clearAnnounce() {
  announcer.textContent = "";
  announcer.classList.add("hide");
}

// displays the current player's turn in DOM node playerDisplay
function displayTurn(player) {
  playerDisplay.textContent = `Player ${player.mark}'s turn`;
}

// displays the winner and loser in the DOM
function displayGameOver(winner, loser) {
  display.innerHTML = `Player <span class="display-player player${winner.mark}">${winner.mark}</span> wins over player <span class="display-player player${loser.mark}">${loser.mark}</span>`;
  announce("Game Over");
}

// returns the coordinates of a tile element
function getCoordinates(tile) {
  const row = parseInt(tile.dataset.row);
  const col = parseInt(tile.dataset.col);
  return { row, col };
}

// clears the contents and classes of a tile element
function clearTile(tile) {
  if (tile) {
    tile.innerHTML = "";
    tile.classList.remove("player1", "player2", "bom", "glow");
  }
}

// clears the entire grid of all tiles
function clearGrid() {
  tiles.forEach((tile) => clearTile(tile));
}

// clears all coordinates of a ship from the grid
function removeShip(ship) {
  ship.forEach((coord) => {
    const tile = tiles.find((tile) => {
      const tileCoord = getCoordinates(tile);
      return tileCoord.row === coord.row && tileCoord.col === coord.col;
    });
    if (tile) clearTile(tile);
  });
}

// given a tile and a mark, adds the mark to the tile
function addMark(tile, mark) {
  tile.innerHTML = mark;
  if (mark === player1.mark || mark === player2.mark) {
    tile.classList.add(`player${mark}`);
  } else if (mark === "X") {
    tile.classList.add("bom");
  }
}

// displays markers on the grid based on coordinates and their markers
function displayMarkersOnGrid(markers) {
  tiles.forEach((tile) => {
    const { row, col } = getCoordinates(tile);
    const marker = markers.find((m) => m.row === row && m.col === col);

    if (marker) {
      addMark(tile, marker.mark);
    }
  });
}

// displays the hits and misses for the player
function displayHitsAndBoms(player) {
  clearGrid();
  const markedHits = player.hits.map((coord) => ({
    ...coord,
    mark: player.mark,
  }));
  const markedBoms = player.boms.map((coord) => ({ ...coord, mark: "X" }));
  displayMarkersOnGrid([...markedHits, ...markedBoms]);
}

// makes a ship glow on the grid for a specified duration
function glowShip(ship, ms) {
  tiles
    .filter((tile) => {
      const tileCoord = getCoordinates(tile);
      return ship.contains(tileCoord);
    })
    .forEach((tile) => {
      tile.classList.add("glow");
      setTimeout(() => {
        tile.classList.remove("glow");
      }, ms);
    });
}

///////////////////// Initialize ships //////////////////////////

// determines if a ship is valid or not based on length and coordinates
function isValidShip(ship) {
  if (ship.length < 2 || ship.length > 5) return false;

  let sameRow = true;
  let sameCol = true;

  for (let i = 1; i < ship.length; i++) {
    if (ship[i].row !== ship[0].row) sameRow = false;
    if (ship[i].col !== ship[0].col) sameCol = false;
  }

  return sameRow || sameCol; // Return true if in the same row or column
}

// Initializes player ships and calls callback when done
function initializeShips(player, callback) {
  let shipCount = 0;
  let currentShip = [];
  displayTurn(player);
  announce(`Choose your remaining ${nrOfShips} ships!`);

  // event listener function
  function handleTileClick(evt) {
    const tile = evt.target;
    const coords = getCoordinates(tile);
    currentShip.push(coords);
    addMark(tile, player.mark);
  }

  // event listener function
  function handleAddShipClick() {
    if (isValidShip(currentShip)) {
      glowShip(currentShip, 1200);
      player.ships.push(...currentShip);
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
      alert(
        "Invalid ship! Ships must be straight lines, between 2 and 5 coordinates long."
      );
      removeShip(currentShip);
      currentShip = [];
    }
  }

  // add event listeners
  button.addEventListener("click", handleAddShipClick);
  tiles.forEach((tile) => tile.addEventListener("click", handleTileClick));
}

//////////////////////// Game loop ////////////////////////////////

// marks a coordinate with the given mark
function markCoord(coord, mark) {
  return { ...coord, mark };
}

// checks if a player has lost the game
function hasLost(player) {
  return player.ships.every((ship) =>
    player.hits.some((hit) => hit.row === ship.row && hit.col === ship.col)
  );
}

// registers a guess as either a hit or a miss for the player
function registerHitOrBom(guess, player) {
  const hitIndex = player.ships.findIndex(
    (ship) => ship.row === guess.row && ship.col === guess.col
  );
  if (hitIndex !== -1) {
    player.hits.push(guess);
  } else {
    player.boms.push(guess);
  }
}

// switches the current and enemy players
function switchPlayers(players) {
  return { current: players.enemy, enemy: players.current };
}

// handles the "Next player" button click event
function handleNextPlayerClick() {
  if (targetChoosen) {
    targetChoosen = false;
    gameLoop();
  } else {
    alert("You must choose a tile to shoot first");
  }
}

// stops the game and announces the winner
function stopGame() {
  displayGameOver(players.current, players.enemy);
  button.innerHTML = "Restart";
  button.removeEventListener("click", handleNextPlayerClick);
  button.addEventListener("click", () => location.reload());
}

// handles a tile click event and registers the guess
function handleTileClick(evt) {
  const guess = getCoordinates(evt.target);
  registerHitOrBom(guess, players.enemy);
  displayHitsAndBoms(players.enemy);
  tiles.forEach((tile) => tile.removeEventListener("click", handleTileClick));
  if (hasLost(players.enemy)) {
    stopGame();
  } else {
    players = switchPlayers(players);
    targetChoosen = true;
  }
}

// runs the game loop for each turn
function gameLoop() {
  displayTurn(players.current);
  displayHitsAndBoms(players.enemy);
  tiles.forEach((tile) => tile.addEventListener("click", handleTileClick));
}

///////////////////// Game start //////////////////////////

function runGame() {
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
