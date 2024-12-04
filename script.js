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
        "1-2": "orange",
        "1-3": "black",
        
        "3-1": "orange",
        "3-2": "black",
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

    // Cambiar turno
    turn = turn === "black" ? "orange" : "black";
    updateTurnText();

    // Verificar victoria después de un pequeño retraso
    const winner = checkWin();
    if (winner) {
        setTimeout(() => {
            alert(`¡Ganador: ${winner === "black" ? "Negras" : "Naranjas"}!`);
            resetGame();
        }, 500); // Retraso de medio segundo para asegurar que el movimiento se vea claramente
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

function evaluateMove(cell, move) {
    let score = 0;

    // 1. Simular el movimiento y evaluar si el jugador puede ganar
    boardState[move] = "orange"; // Mover la pieza de la IA
    delete boardState[cell]; // Eliminar la pieza de la celda original

    // Comprobar si este movimiento gana el juego
    if (checkWin() === "orange") {
        score += 100; // Alta puntuación si el movimiento lleva a la victoria
    }

    // 2. Evaluar si bloquea al oponente (impide que el oponente gane)
    const opponentCells = Object.entries(boardState)
        .filter(([_, color]) => color === "black") // Encontrar las piezas del oponente
        .map(([cellId]) => cellId);

    for (const opponentCell of opponentCells) {
        const opponentMoves = getPossibleMoves(opponentCell);
        for (const opponentMove of opponentMoves) {
            boardState[opponentMove] = "black"; // Simula el movimiento del oponente
            delete boardState[opponentCell];
            // Si este movimiento del oponente gana, bloqueamos esa celda
            if (checkWin() === "black") {
                score += 50; // Valoramos positivamente bloquear al oponente
            }
            // Restaurar el tablero a su estado original después de simular el movimiento
            boardState[opponentCell] = "black";
            delete boardState[opponentMove];
        }
    }

    // 3. Posición estratégica del movimiento (por ejemplo, centro y esquinas)
    const centralPositions = ["2-2", "1-2", "2-1", "2-3", "3-2"];
    if (centralPositions.includes(move)) {
        score += 10; // Premiar ocupar posiciones centrales
    }

    // 4. Control de las líneas y posiciones clave 
    const importantLines = [
        ["1-1", "1-2", "1-3"], // Fila superior
        ["2-1", "2-2", "2-3"], // Fila central
        ["3-1", "3-2", "3-3"], // Fila inferior
        ["1-1", "2-1", "3-1"], // Columna izquierda
        ["1-2", "2-2", "3-2"], // Columna central
        ["1-3", "2-3", "3-3"], // Columna derecha
    ];

    importantLines.forEach((line) => {
        const occupied = line.filter(cellId => boardState[cellId] === "orange");
        if (occupied.length === 2) {
            score += 20; // Fomentar completar una línea importante
        }
    });

    // 5. Evaluar la movilidad de la pieza (flexibilidad de movimiento)
    const possibleMoves = getPossibleMoves(move);
    if (possibleMoves.length > 1) {
        score += 5; // Valorar los movimientos que ofrecen más flexibilidad
    }

    // Restaurar el estado del tablero después de la evaluación
    boardState[cell] = "orange";
    delete boardState[move];

    return score;
}


// function evaluateMove(cell, move) {
//     let score = 0;

//     // Simular el movimiento
//     boardState[move] = "orange";
//     delete boardState[cell];

//     // Evaluar si este movimiento gana el juego
//     if (checkWin() === "orange") {
//         score += 100; // Alta prioridad para ganar
//     }

//     // Evaluar si bloquea al oponente
//     const opponentCells = Object.entries(boardState)
//         .filter(([_, color]) => color === "black")
//         .map(([cellId]) => cellId);

//     for (const opponentCell of opponentCells) {
//         const opponentMoves = getPossibleMoves(opponentCell);
//         for (const opponentMove of opponentMoves) {
//             boardState[opponentMove] = "black";
//             delete boardState[opponentCell];
//             if (checkWin() === "black") {
//                 score += 50; // Prioridad para bloquear al oponente
//             }
//             boardState[opponentCell] = "black";
//             delete boardState[opponentMove];
//         }
//     }

//     // Evaluar control del tablero (ejemplo: moverse al centro)
//     const centralPositions = ["2-2", "1-2", "2-1", "2-3", "3-2"];
//     if (centralPositions.includes(move)) {
//         score += 10; // Beneficio adicional por ocupar una posición estratégica
//     }

//     // Restaurar estado
//     boardState[cell] = "orange";
//     delete boardState[move];

//     return score;
// }
// estrategia de la IA
function playAI() {
    const orangeCells = Object.entries(boardState)
        .filter(([cellId, color]) => color === "orange")
        .map(([cellId]) => cellId);

    let bestMove = null;
    let bestScore = -Infinity;

    // Evaluar todos los movimientos posibles
    for (const cell of orangeCells) {
        const possibleMoves = getPossibleMoves(cell);
        for (const move of possibleMoves) {
            const moveScore = evaluateMove(cell, move);
            console.log("Movimiento:", { from: cell, to: move }, "Puntaje:", moveScore);
            if (moveScore > bestScore) {
                bestScore = moveScore;
                bestMove = { from: cell, to: move };
            }
        }
    }

    // Realizar el mejor movimiento encontrado
    if (bestMove) {
        console.log("Movimiento de la IA:", bestMove);
        console.log("Puntaje:", bestScore);

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
