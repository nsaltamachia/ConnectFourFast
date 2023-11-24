/*----- constants -----*/
const COLORS = {
    '1': 'blue',
    '-1': 'red',
    '0': 'rgb(234, 234, 234)'
};

/*----- state variables -----*/
let board;  //will be an array of 7 column arrays
let turn;  // will be 1 or -1
let winner;  // null = no winner, 1 or -1 = winner, "T" = tie
let timerInterval;
let countdown = 15; // Initial countdown value
let gameStarted = false;

/*----- cached elements  -----*/
const messageEl = document.querySelector('h1');
const playAgainBtn = document.querySelector('button');
const markerEls = [...document.querySelectorAll('#markers > div')];

/*----- event listeners -----*/

document.getElementById('markers').addEventListener('click', handleDrop)
playAgainBtn.addEventListener("click", init);




/*----- functions -----*/
init();
//initiailize all state variables, then render
function init() {
    // to visualize the baord's mapping to the DOM, 
    // rotate the board array 90 degrees clockwise
    board = [
        [0, 0, 0, 0, 0, 0],  //column 0
        [0, 0, 0, 0, 0, 0],  //column 1
        [0, 0, 0, 0, 0, 0],  //column 2
        [0, 0, 0, 0, 0, 0],  //column 3
        [0, 0, 0, 0, 0, 0],  //column 4
        [0, 0, 0, 0, 0, 0],  //column 5
        [0, 0, 0, 0, 0, 0],  //column 6
    ];
    turn = 1; //1 = purple, -1 = orange
    winner = null //null = no winner, 1 or -1 = winner, "T" = tie
    render();
}

// In response to user interaction, update all impacted state, then call render()
function handleDrop(evt) {
    const colIdx = markerEls.indexOf(evt.target)
    // Guards...
    if (colIdx === -1) return; // clicked outside of a marker
    // shortcut to the column array that was clicked
    const colArr = board[colIdx];
    // find the index of the first 0 in the column array(colArr)
    const rowIdx = colArr.indexOf(0);
    // update the board state with the current player value(turn)
    colArr[rowIdx] = turn
    // switch player turn (by multiplying whatever turn value is by -1, which inverts the negativity each time)
    turn *= -1;
    // check for a winner
    winner = getWinner(colIdx, rowIdx);
    render();

    startTimer();
}

    // Check for winner in board state and 
    //return null if no winner, 1/-1 if a player has won, "t" if a tie
function getWinner(colIdx, rowIdx) {
    return checkVerticalWin(colIdx, rowIdx) ||
        checkHorizontalWin(colIdx, rowIdx) ||
        checkDiagonalWinNESW(colIdx, rowIdx) ||
        checkDiagonalWinNWSE(colIdx, rowIdx);
}

function checkDiagonalWinNWSE(colIdx, rowIdx) {
    const adjCountNW = countAdjacent(colIdx, rowIdx, -1, 1);
    const adjCountSE = countAdjacent(colIdx, rowIdx, 1, -1);
    return (adjCountNW + adjCountSE) >=3 ? board[colIdx][rowIdx] : null;
}

function checkDiagonalWinNESW(colIdx, rowIdx) {
    const adjCountNE = countAdjacent(colIdx, rowIdx, 1, 1);
    const adjCountSW = countAdjacent(colIdx, rowIdx, -1, -1);
    return (adjCountNE + adjCountSW) >=3 ? board[colIdx][rowIdx] : null;
}

function checkVerticalWin(colIdx, rowIdx) {
    return countAdjacent(colIdx, rowIdx, 0, -1) === 3 ? board[colIdx][rowIdx] : null;
}

function checkHorizontalWin(colIdx, rowIdx) {
    const adjCountLeft = countAdjacent(colIdx, rowIdx, -1, 0);
    const adjCountRight = countAdjacent(colIdx, rowIdx, 1, 0);
    return (adjCountLeft + adjCountRight) >=3 ? board[colIdx][rowIdx] : null;
}

function countAdjacent(colIdx, rowIdx, colOffset, rowOffset) {
    // shortcut variable for the player value
    const player = board[colIdx][rowIdx]
    // track count of adjacent cells with the same player value
    let count = 0;
    // initialize new coordinates to check
    colIdx += colOffset;
    rowIdx += rowOffset;
    while (
        // ensure that the colIdx is within bounds of the board array
        board[colIdx] !== undefined &&
        board[colIdx][rowIdx] !== undefined &&
        board[colIdx][rowIdx] === player
    ) {
        count++;
        colIdx += colOffset;
        rowIdx += rowOffset;
    }
    return count;

}

// render wwill visualize all state variables ni the DOM
function render() {
    renderBoard();
    renderMessage();
    // renderControls will hide/show UI elements
    renderControls();
}

function renderBoard() {
    board.forEach(function (colArr, colIdx) {
        // iterate over the cells in the current column (colArr)
        colArr.forEach(function (cellVal, rowIdx) {
            const cellId = `c${colIdx}r${rowIdx}`;
            const cellEl = document.getElementById(cellId);
            // console.log(cellEl);
            cellEl.style.backgroundColor = COLORS[cellVal]
        });
    });
}

function renderMessage() {
    if (winner === "T") {
        messageEl.innerText = "It's a tie!!!"
    } else if (winner) {
        messageEl.innerHTML = `<span style="color: ${COLORS[winner]}">${COLORS[winner].toUpperCase()}</span> Wins!`
    } else {
        messageEl.innerHTML = `<span style="color: ${COLORS[turn]}">${COLORS[turn].toUpperCase()}</span>'s Turn`
    }
}

function renderControls() {
    // ternary express is the go-to when you want one of two values returned
    //<conditional expression> ? <truthy value> : <falsey value>
    playAgainBtn.style.visibility = winner ? 'visible' : 'hidden';

    // iterate over each marker element to hide:show based on whether its column has any zeros left
    markerEls.forEach(function (markerEl, colIdx) {
        const hideMarker = !board[colIdx].includes(0) || winner;
        markerEl.style.visibility = hideMarker ? 'hidden' : 'visible';
    });
}

function startTimer() {
  if (!gameStarted) {
    timerInterval = setInterval(updateTimer, 1000); // Update timer every second
        gameStarted = true;
        document.getElementById('gameMessage').style.display = 'none'; // Hide game message
        document.getElementById('timer').style.display = 'block'; // Show timer
  }
}

function updateTimer() {
  countdown--;
  if (countdown <= 0) {
    clearInterval(timerInterval);
    // Perform disc shifting/removal here
    shiftAndRemoveDiscs();
    countdown = 15; // Reset countdown after shifting
    timerInterval = setInterval(updateTimer, 1000); // Restart the timer
  }
  document.getElementById('countdown').textContent = countdown;
}

function shiftAndRemoveDiscs() {
  // Implement disc shifting and removal logic here
  // Remove discs from the bottom row (row 0)
  board.forEach((colArr) => {
    colArr[0] = 0;
  });

  // Shift discs downwards
  for (let colIdx = 0; colIdx < board.length; colIdx++) {
    for (let rowIdx = 0; rowIdx < board[colIdx].length - 1; rowIdx++) {
      board[colIdx][rowIdx] = board[colIdx][rowIdx + 1];
    }
    board[colIdx][board[colIdx].length - 1] = 0; // Clear bottom row after shifting
  }

  render(); // Render the updated board
}

