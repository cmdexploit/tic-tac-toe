document.addEventListener("DOMContentLoaded", () => {
    const cells = document.querySelectorAll('.cell');
    const messageElement = document.getElementById('message');
    const flagElement = document.getElementById('flag');
    const restartButton = document.getElementById('reset'); 

    const clickSound = new Audio('click.mp3');
    const winSound = new Audio('win.mp3');
    const drawSound = new Audio('draw.mp3');

    let currentPlayer = 'x';
    let gameActive = true;

    const winningConditions = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    function getGameState() {
        return [...cells].map(cell => cell.textContent);
    }

    function requestFlag() {
        fetch('/validate-win', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ gameState: getGameState() }) 
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                flagElement.textContent = `Congratulations! Here is your flag: ${data.flag}`;
                flagElement.style.display = 'block';
            } else {
                messageElement.textContent = 'Validation failed!';
            }
        });
    }

    function handleCellClick(event) {
        const cell = event.target;
        const index = cell.dataset.index;

        if (cell.textContent !== '' || !gameActive) {
            return;
        }

        handleCellPlayed(cell, index);

        if (checkWin(currentPlayer)) {
            gameActive = false;
            if (currentPlayer === 'x') {
                messageElement.textContent = 'You win!';
                winSound.play();
                requestFlag();
            } else {
                messageElement.textContent = 'AI Won 😎!';
            }
        } else if (isBoardFull()) {
            messageElement.textContent = 'Draw! You Never Win 😏';
            drawSound.play();
            gameActive = false;
        } else {
            currentPlayer = currentPlayer === 'x' ? 'o' : 'x';
            if (currentPlayer === 'o') {
                setTimeout(() => aiMove(), 500);
            } else {
                messageElement.textContent = `It's ${currentPlayer}'s turn`;
            }
        }
    }

    function handleCellPlayed(cell, index) {
        cell.textContent = currentPlayer;
        cell.classList.add(currentPlayer);
        cell.classList.add("animated");
        clickSound.play();
    }

    function checkWin(player, board = getGameState()) {
        return winningConditions.some(condition => {
            return condition.every(index => {
                return board[index] === player;
            });
        });
    }

    function isBoardFull() {
        return [...cells].every(cell => cell.textContent !== '');
    }

    function aiMove() {
        const bestMove = minimax(getGameState(), 'o', -Infinity, Infinity);
        if (bestMove.index !== null) {
            handleCellPlayed(cells[bestMove.index], bestMove.index);

            if (checkWin('o')) {
                messageElement.textContent = 'AI wins!';
                gameActive = false;
                winSound.play();
            } else if (isBoardFull()) {
                messageElement.textContent = 'Draw!';
                drawSound.play();
                gameActive = false;
            } else {
                currentPlayer = 'x';
                messageElement.textContent = `It's ${currentPlayer}'s turn`;
            }
        } else {
            console.error("AI could not find a valid move");
        }
    }

    function minimax(board, player, alpha, beta) {
        const availableMoves = board
            .map((cell, index) => (cell === '' ? index : null))
            .filter(index => index !== null);

        if (checkWin('o', board)) return { score: 10 };
        if (checkWin('x', board)) return { score: -10 };
        if (availableMoves.length === 0) return { score: 0 };

        let bestMove = { score: player === 'o' ? -Infinity : Infinity };

        availableMoves.forEach(move => {
            const newBoard = board.slice();
            newBoard[move] = player;
            const result = minimax(newBoard, player === 'o' ? 'x' : 'o', alpha, beta);
            if (player === 'o') {
                if (result.score > bestMove.score) {
                    bestMove = { index: move, score: result.score };
                    alpha = Math.max(alpha, result.score);
                }
            } else {
                if (result.score < bestMove.score) {
                    bestMove = { index: move, score: result.score };
                    beta = Math.min(beta, result.score);
                }
            }
            if (beta <= alpha) {
                return;
            }
        });

        return bestMove;
    }

    function restartGame() {
        currentPlayer = 'x';
        gameActive = true;
        cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('x', 'o');
        });
        messageElement.textContent = `It's ${currentPlayer}'s turn`;
        flagElement.style.display = 'none';
        flagElement.textContent = '';
    }

    cells.forEach(cell => cell.addEventListener('click', handleCellClick));
    restartButton.addEventListener('click', restartGame);

    restartGame(); 
});
