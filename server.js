const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Middleware to parse JSON
app.use(bodyParser.json());

// Serve static files from 'public' directory
app.use(express.static('public'));

// Winning conditions for Tic Tac Toe
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

// Validation endpoint
app.post('/validate-win', (req, res) => {
    const { gameState } = req.body;
    if (isPlayerWin(gameState, 'x')) {
        res.json({ success: true, flag: 'CTF{INSANE-FLAG-Tic-Tac-Toe}' });
    } else {
        res.json({ success: false });
    }
});

// Function to check for player win
function isPlayerWin(gameState, player) {
    return winningConditions.some(condition => {
        return condition.every(index => {
            return gameState[index] === player;
        });
    });
}

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
