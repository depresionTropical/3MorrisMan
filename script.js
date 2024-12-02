// script.js

let turn = "black"; // Empieza el jugador negro
let selectedCell = null; // Celda seleccionada para mover
const boardState = {}; // Estado del tablero

const winningCombinations = [
    ["1-1", "1-2", "1-3"],
    ["2-1", "2-2", "2-3"],
    ["3-1", "3-2", "3-3"],
    ["1-1", "2-1", "3-1"],
    ["1-2", "2-2", "3-2"],
    ["1-3", "2-3", "3-3"],
];

// Inicializar el tablero
function initializeBoard() {
    const initialPositions = {
        "1-1": "black",
        "1-3": "black",
        "3-2": "black",
        "1-2": "orange",
        "3-1": "orange",
        "3-3": "orange",
    };

    // Colocar las fichas iniciales
    Object.entries(initialPositions).forEach(([cellId, color]) => {
        const cell = document.getElementById(cellId);
        const piece = document.createElement("div");
        piece.className = `piece ${color}`;
        cell.appendChild(piece);
        boardState[cellId] = color;
    });

    updateTurnText();
}

// Actualizar el texto del turno
function updateTurnText() {
    document.getElementById("turnText").textContent = `Turno: ${turn === "black" ? "Negras" : "Naranjas"}`;
}

// Verificar si hay un ganador
function checkWin() {
    for (const combination of winningCombinations) {
        const [a, b, c] = combination;
        if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
            return boardState[a];
        }
    }
    return null;
}

// Modificar la función handleCellClick 
function handleCellClick(event) {
  const clickedCell = event.currentTarget.id;

  if (selectedCell) {
      // Si hay una celda seleccionada, intenta mover la ficha
      if (isValidMove(selectedCell, clickedCell)) {
          movePiece(selectedCell, clickedCell);
          selectedCell = null; // Deselecciona

          // Turno de la IA
          if (turn === "orange") {
              setTimeout(playAI, 1000); // Agregar un pequeño retraso para simular pensamiento
          }
      } else {
          alert("Movimiento no válido");
      }
  } else if (boardState[clickedCell] === turn) {
      // Selecciona la celda si pertenece al jugador en turno
      selectedCell = clickedCell;
      document.getElementById(clickedCell).classList.add("selected");
  }
}

// Mover una ficha
function movePiece(fromCell, toCell) {
    const fromElement = document.getElementById(fromCell);
    const toElement = document.getElementById(toCell);

    const piece = fromElement.querySelector(".piece");
    fromElement.removeChild(piece);
    fromElement.classList.remove("selected");

    toElement.appendChild(piece);

    // Actualizar el estado
    boardState[toCell] = boardState[fromCell];
    delete boardState[fromCell];

    // Cambiar turno y verificar victoria
    const winner = checkWin();
    if (winner) {
        alert(`¡Ganador: ${winner === "black" ? "Negras" : "Naranjas"}!`);
        resetGame();
    } else {
        turn = turn === "black" ? "orange" : "black";
        updateTurnText();
    }
}

// Validar un movimiento
function isValidMove(fromCell, toCell) {
    if (!document.getElementById(toCell)) return false; // Celda de destino no existe
    if (boardState[toCell]) return false; // Celda de destino está ocupada

    const [fromRow, fromCol] = fromCell.split("-").map(Number);
    const [toRow, toCol] = toCell.split("-").map(Number);

    const rowDiff = Math.abs(fromRow - toRow);
    const colDiff = Math.abs(fromCol - toCol);

    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1); // Movimiento válido
}


// Reiniciar el juego
function resetGame() {
    location.reload();
}

// Configurar eventos
function setupCellEvents() {
    document.querySelectorAll(".cell").forEach((cell) => {
        cell.addEventListener("click", handleCellClick);
    });
}

// Determinar posibles movimientos de una ficha específica
function getPossibleMoves(cellId) {
    const [row, col] = cellId.split("-").map(Number);
    const directions = [
        [-1, 0], // Arriba
        [1, 0],  // Abajo
        [0, -1], // Izquierda
        [0, 1],  // Derecha
    ];

    const moves = [];
    directions.forEach(([dRow, dCol]) => {
        const newRow = row + dRow;
        const newCol = col + dCol;
        const newCellId = `${newRow}-${newCol}`;

        if (document.getElementById(newCellId) && !boardState[newCellId]) {
            moves.push(newCellId); // Agregar si la celda existe y está vacía
        }
    });

    return moves;
}


// Jugar como IA (fichas naranjas)
function playAI() {
    const orangeCells = Object.entries(boardState)
        .filter(([cellId, color]) => color === "orange")
        .map(([cellId]) => cellId);

    let bestMove = null;

    // Priorizar movimientos estratégicos
    for (const cell of orangeCells) {
        const possibleMoves = getPossibleMoves(cell);
        for (const move of possibleMoves) {
            // Simular el movimiento
            boardState[move] = "orange";
            delete boardState[cell];

            // Verificar si bloquea o gana
            const winner = checkWin();
            if (winner === "orange") {
                bestMove = { from: cell, to: move };
            }

            // Restaurar estado
            boardState[cell] = "orange";
            delete boardState[move];

            if (bestMove) break;
        }
        if (bestMove) break;
    }

    // Si no se encontró un movimiento estratégico, elegir aleatoriamente
    if (!bestMove) {
        for (const cell of orangeCells) {
            const possibleMoves = getPossibleMoves(cell);
            if (possibleMoves.length > 0) {
                const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
                bestMove = { from: cell, to: randomMove };
                break;
            }
        }
    }

    // Realizar el movimiento
    if (bestMove) {
        movePiece(bestMove.from, bestMove.to);
        turn = "black";
        updateTurnText();
    } else {
        console.warn("La IA no encontró movimientos válidos.");
    }
}

// Iniciar el juego
window.onload = () => {
    initializeBoard();
    setupCellEvents();
};
