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

// Manejar el clic en una celda
function handleCellClick(event) {
    const clickedCell = event.currentTarget.id;

    if (selectedCell) {
        // Si hay una celda seleccionada, intenta mover la ficha
        if (isValidMove(selectedCell, clickedCell)) {
            movePiece(selectedCell, clickedCell);
            selectedCell = null; // Deselecciona
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
    if (boardState[toCell]) return false; // Celda destino ocupada

    const [fromRow, fromCol] = fromCell.split("-").map(Number);
    const [toRow, toCol] = toCell.split("-").map(Number);

    const rowDiff = Math.abs(fromRow - toRow);
    const colDiff = Math.abs(fromCol - toCol);

    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
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

// Iniciar el juego
window.onload = () => {
    initializeBoard();
    setupCellEvents();
};
