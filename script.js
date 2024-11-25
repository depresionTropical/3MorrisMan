const cells = document.querySelectorAll('.cell');
const turnInfo = document.getElementById('turn-info');
const resetBtn = document.getElementById('reset-btn');

let gameState = Array(9).fill(null); // Estado inicial del tablero
let currentPlayer = 'red'; // Jugador inicial
let remainingPieces = { red: 3, blue: 3 }; // Piezas restantes por jugador
let selectedPieceIndex = null; // Índice de la pieza seleccionada para mover

// Configuración del juego
cells.forEach((cell, index) => {
  cell.addEventListener('click', () => handleCellClick(cell, index));
});

// Manejar clics en celdas
function handleCellClick(cell, index) {
  // Fase 1: Colocar piezas
  if (remainingPieces[currentPlayer] > 0) {
    if (gameState[index] !== null) {
      alert('Esta posición ya está ocupada.');
      return;
    }
    placePiece(cell, index);
  } 
  // Fase 2: Mover piezas
  else {
    movePiece(cell, index);
  }

  // Verificar si alguien ganó
  if (checkWin(currentPlayer)) {
    alert(`${currentPlayer.toUpperCase()} gana el juego!`);
    resetGame();
    return;
  }

  // Cambiar turno
  currentPlayer = currentPlayer === 'red' ? 'blue' : 'red';
  turnInfo.textContent = `Turno: ${currentPlayer === 'red' ? 'Rojo' : 'Azul'}`;
}

function placePiece(cell, index) {
  cell.style.backgroundColor = currentPlayer;
  gameState[index] = currentPlayer;
  cell.classList.add('taken');
  remainingPieces[currentPlayer]--;
}

function movePiece(cell, index) {
  if (selectedPieceIndex === null) {
    // Seleccionar pieza propia
    if (gameState[index] === currentPlayer) {
      selectedPieceIndex = index;
      cell.classList.add('selected');
    } else {
      alert('Debes seleccionar una de tus piezas.');
    }
  } else {
    // Mover pieza seleccionada
    if (gameState[index] !== null) {
      alert('La posición está ocupada.');
      return;
    }
    if (!isAdjacent(selectedPieceIndex, index)) {
      alert('Solo puedes mover a una posición adyacente.');
      return;
    }

    // Actualizar estado
    cells[selectedPieceIndex].classList.remove('selected');
    cells[selectedPieceIndex].style.backgroundColor = '';
    gameState[selectedPieceIndex] = null;

    cell.style.backgroundColor = currentPlayer;
    gameState[index] = currentPlayer;
    selectedPieceIndex = null;
  }
}

// Verificar si una celda es adyacente
function isAdjacent(fromIndex, toIndex) {
  const adjacentPositions = {
    0: [1, 3],
    1: [0, 2, 4],
    2: [1, 5],
    3: [0, 4, 6],
    4: [1, 3, 5, 7],
    5: [2, 4, 8],
    6: [3, 7],
    7: [4, 6, 8],
    8: [5, 7]
  };
  return adjacentPositions[fromIndex].includes(toIndex);
}

function checkWin(player) {
  const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Horizontales
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Verticales
    // [0, 4, 8], [2, 4, 6],           // Diagonales
  ];

  return winningCombinations.some(combo =>
    combo.every(index => gameState[index] === player)
  );
}

// Reiniciar el juego
resetBtn.addEventListener('click', resetGame);

function resetGame() {
  gameState.fill(null);
  cells.forEach(cell => {
    cell.style.backgroundColor = '';
    cell.classList.remove('taken', 'selected');
  });
  currentPlayer = 'red';
  remainingPieces = { red: 3, blue: 3 };
  selectedPieceIndex = null;
  turnInfo.textContent = 'Turno: Rojo';
}
