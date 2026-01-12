class Game2048 {
    constructor() {
        this.grid = [];
        this.size = 4;
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem('bestScore') || '0');
        this.won = false;
        this.over = false;
        this.autoPlayInterval = null;
        this.isAutoPlaying = false;
        
        this.init();
        this.setupEventListeners();
    }
    
    init() {
        this.stopAutoPlay();
        this.grid = Array(this.size).fill(null).map(() => Array(this.size).fill(0));
        this.score = 0;
        this.won = false;
        this.over = false;
        this.addRandomTile();
        this.addRandomTile();
        this.updateDisplay();
        this.updateBestScore();
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (this.over) return;
            
            let moved = false;
            switch(e.key) {
                case 'ArrowUp':
                    e.preventDefault();
                    moved = this.move('up');
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    moved = this.move('down');
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    moved = this.move('left');
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    moved = this.move('right');
                    break;
            }
            
            if (moved) {
                this.addRandomTile();
                this.updateDisplay();
                this.checkGameState();
            }
        });
        
        document.getElementById('new-game').addEventListener('click', () => {
            this.init();
            this.hideMessage();
        });
        
        document.getElementById('keep-playing').addEventListener('click', () => {
            this.hideMessage();
        });
        
        document.getElementById('auto-play').addEventListener('click', () => {
            this.toggleAutoPlay();
        });
        
        // Touch support
        let touchStartX, touchStartY;
        document.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });
        
        document.addEventListener('touchend', (e) => {
            if (!touchStartX || !touchStartY) return;
            
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            const diffX = touchStartX - touchEndX;
            const diffY = touchStartY - touchEndY;
            
            if (Math.abs(diffX) > Math.abs(diffY)) {
                // Horizontal swipe
                if (diffX > 0) {
                    // Swipe left
                    if (this.move('left')) {
                        this.addRandomTile();
                        this.updateDisplay();
                        this.checkGameState();
                    }
                } else {
                    // Swipe right
                    if (this.move('right')) {
                        this.addRandomTile();
                        this.updateDisplay();
                        this.checkGameState();
                    }
                }
            } else {
                // Vertical swipe
                if (diffY > 0) {
                    // Swipe up
                    if (this.move('up')) {
                        this.addRandomTile();
                        this.updateDisplay();
                        this.checkGameState();
                    }
                } else {
                    // Swipe down
                    if (this.move('down')) {
                        this.addRandomTile();
                        this.updateDisplay();
                        this.checkGameState();
                    }
                }
            }
            
            touchStartX = null;
            touchStartY = null;
        });
    }
    
    move(direction) {
        const previousGrid = this.grid.map(row => [...row]);
        
        switch(direction) {
            case 'left':
                this.moveLeft();
                break;
            case 'right':
                this.moveRight();
                break;
            case 'up':
                this.moveUp();
                break;
            case 'down':
                this.moveDown();
                break;
        }
        
        // Check if grid changed
        const changed = !this.gridsEqual(previousGrid, this.grid);
        return changed;
    }
    
    moveLeft() {
        for (let i = 0; i < this.size; i++) {
            const row = this.grid[i].filter(val => val !== 0);
            const merged = [];
            let j = 0;
            
            while (j < row.length) {
                if (j < row.length - 1 && row[j] === row[j + 1]) {
                    merged.push(row[j] * 2);
                    this.score += row[j] * 2;
                    j += 2;
                } else {
                    merged.push(row[j]);
                    j++;
                }
            }
            
            while (merged.length < this.size) {
                merged.push(0);
            }
            
            this.grid[i] = merged;
        }
    }
    
    moveRight() {
        for (let i = 0; i < this.size; i++) {
            const row = this.grid[i].filter(val => val !== 0);
            const merged = [];
            let j = row.length - 1;
            
            while (j >= 0) {
                if (j > 0 && row[j] === row[j - 1]) {
                    merged.unshift(row[j] * 2);
                    this.score += row[j] * 2;
                    j -= 2;
                } else {
                    merged.unshift(row[j]);
                    j--;
                }
            }
            
            while (merged.length < this.size) {
                merged.unshift(0);
            }
            
            this.grid[i] = merged;
        }
    }
    
    moveUp() {
        for (let j = 0; j < this.size; j++) {
            const column = [];
            for (let i = 0; i < this.size; i++) {
                if (this.grid[i][j] !== 0) {
                    column.push(this.grid[i][j]);
                }
            }
            
            const merged = [];
            let i = 0;
            
            while (i < column.length) {
                if (i < column.length - 1 && column[i] === column[i + 1]) {
                    merged.push(column[i] * 2);
                    this.score += column[i] * 2;
                    i += 2;
                } else {
                    merged.push(column[i]);
                    i++;
                }
            }
            
            while (merged.length < this.size) {
                merged.push(0);
            }
            
            for (let i = 0; i < this.size; i++) {
                this.grid[i][j] = merged[i];
            }
        }
    }
    
    moveDown() {
        for (let j = 0; j < this.size; j++) {
            const column = [];
            for (let i = 0; i < this.size; i++) {
                if (this.grid[i][j] !== 0) {
                    column.push(this.grid[i][j]);
                }
            }
            
            const merged = [];
            let i = column.length - 1;
            
            while (i >= 0) {
                if (i > 0 && column[i] === column[i - 1]) {
                    merged.unshift(column[i] * 2);
                    this.score += column[i] * 2;
                    i -= 2;
                } else {
                    merged.unshift(column[i]);
                    i--;
                }
            }
            
            while (merged.length < this.size) {
                merged.unshift(0);
            }
            
            for (let i = 0; i < this.size; i++) {
                this.grid[i][j] = merged[i];
            }
        }
    }
    
    addRandomTile() {
        const emptyCells = [];
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 0) {
                    emptyCells.push({row: i, col: j});
                }
            }
        }
        
        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.grid[randomCell.row][randomCell.col] = Math.random() < 0.9 ? 2 : 4;
        }
    }
    
    gridsEqual(grid1, grid2) {
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (grid1[i][j] !== grid2[i][j]) {
                    return false;
                }
            }
        }
        return true;
    }
    
    checkGameState() {
        // Check for win
        if (!this.won) {
            for (let i = 0; i < this.size; i++) {
                for (let j = 0; j < this.size; j++) {
                    if (this.grid[i][j] === 2048) {
                        this.won = true;
                        this.showMessage('You win!', true);
                        return;
                    }
                }
            }
        }
        
        // Check for game over
        if (this.isGameOver()) {
            this.over = true;
            this.stopAutoPlay();
            this.showMessage('Game over!', false);
        }
    }
    
    isGameOver() {
        // Check for empty cells
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 0) {
                    return false;
                }
            }
        }
        
        // Check for possible merges
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const current = this.grid[i][j];
                if (
                    (i < this.size - 1 && this.grid[i + 1][j] === current) ||
                    (j < this.size - 1 && this.grid[i][j + 1] === current)
                ) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    updateDisplay() {
        const container = document.getElementById('tile-container');
        container.innerHTML = '';
        
        // Get actual cell size from CSS (works for both desktop and mobile)
        const firstCell = document.querySelector('.grid-cell');
        const cellSize = firstCell ? firstCell.offsetWidth : 107.5;
        const gap = 10;
        
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] !== 0) {
                    const tile = document.createElement('div');
                    tile.className = `tile tile-${this.grid[i][j]}`;
                    tile.textContent = this.grid[i][j];
                    
                    tile.style.left = `${j * (cellSize + gap)}px`;
                    tile.style.top = `${i * (cellSize + gap)}px`;
                    
                    container.appendChild(tile);
                    
                    // Trigger animation
                    setTimeout(() => {
                        tile.classList.add('tile-new');
                    }, 10);
                }
            }
        }
        
        document.getElementById('score').textContent = this.score;
        
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('bestScore', this.bestScore.toString());
            this.updateBestScore();
        }
    }
    
    updateBestScore() {
        document.getElementById('best-score').textContent = this.bestScore;
    }
    
    showMessage(text, won) {
        const message = document.getElementById('game-message');
        message.querySelector('p').textContent = text;
        message.className = `game-message ${won ? 'game-won' : 'game-over'}`;
        message.style.display = 'block';
    }
    
    hideMessage() {
        const message = document.getElementById('game-message');
        message.style.display = 'none';
    }
    
    toggleAutoPlay() {
        if (this.isAutoPlaying) {
            this.stopAutoPlay();
        } else {
            this.startAutoPlay();
        }
    }
    
    startAutoPlay() {
        if (this.isAutoPlaying || this.over) return;
        
        this.isAutoPlaying = true;
        const button = document.getElementById('auto-play');
        button.textContent = 'Stop Auto-Play';
        button.classList.add('auto-playing');
        
        // Make a move immediately, then set up interval
        this.makeStrategicMove();
        
        this.autoPlayInterval = setInterval(() => {
            if (this.over) {
                this.stopAutoPlay();
                return;
            }
            this.makeStrategicMove();
        }, 50); // 50ms interval for fast gameplay
    }
    
    stopAutoPlay() {
        if (!this.isAutoPlaying) return;
        
        this.isAutoPlaying = false;
        const button = document.getElementById('auto-play');
        button.textContent = 'Auto-Play';
        button.classList.remove('auto-playing');
        
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }
    
    makeStrategicMove() {
        if (this.over) {
            this.stopAutoPlay();
            return;
        }
        
        const bestMove = this.getBestMove();
        if (bestMove) {
            const moved = this.move(bestMove);
            if (moved) {
                this.addRandomTile();
                this.updateDisplay();
                this.checkGameState();
            }
        }
    }
    
    getBestMove() {
        const directions = ['up', 'down', 'left', 'right'];
        let bestDirection = null;
        let bestScore = -Infinity;
        
        for (const direction of directions) {
            // Save current state
            const savedGrid = this.grid.map(row => [...row]);
            const savedScore = this.score;
            
            // Try the move
            const moved = this.move(direction);
            
            if (moved) {
                // Evaluate the move
                const score = this.evaluatePosition();
                
                if (score > bestScore) {
                    bestScore = score;
                    bestDirection = direction;
                }
            }
            
            // Restore state
            this.grid = savedGrid;
            this.score = savedScore;
        }
        
        // If no move improves position, pick a random valid move
        if (bestDirection === null) {
            const validMoves = [];
            for (const dir of directions) {
                const savedGrid = this.grid.map(row => [...row]);
                const savedScore = this.score;
                const moved = this.move(dir);
                this.grid = savedGrid;
                this.score = savedScore;
                if (moved) {
                    validMoves.push(dir);
                }
            }
            return validMoves.length > 0 ? validMoves[Math.floor(Math.random() * validMoves.length)] : null;
        }
        
        return bestDirection;
    }
    
    evaluatePosition() {
        let score = 0;
        
        // Prefer keeping large tiles in bottom-right corner (common strategy)
        // Higher weights for bottom-right positions
        const cornerWeight = [
            [1, 2, 3, 4],
            [2, 3, 4, 5],
            [3, 4, 5, 6],
            [4, 5, 6, 7]
        ];
        
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const value = this.grid[i][j];
                if (value > 0) {
                    // Weight tiles by position (prefer bottom-right)
                    score += value * cornerWeight[i][j];
                }
            }
        }
        
        // Prefer monotonic rows (all increasing or decreasing)
        // This helps keep tiles organized
        for (let i = 0; i < this.size; i++) {
            const row = this.grid[i];
            let increasing = true;
            let decreasing = true;
            let nonZeroCount = 0;
            
            for (let j = 0; j < this.size - 1; j++) {
                if (row[j] > 0) nonZeroCount++;
                if (row[j] > 0 && row[j + 1] > 0) {
                    if (row[j] > row[j + 1]) increasing = false;
                    if (row[j] < row[j + 1]) decreasing = false;
                }
            }
            if (row[this.size - 1] > 0) nonZeroCount++;
            
            // Prefer rows that are monotonic and have tiles ordered toward the right
            if (increasing && nonZeroCount > 1) {
                score += 150; // Strong preference for increasing rows
            } else if (decreasing && nonZeroCount > 1) {
                score += 100;
            }
        }
        
        // Count empty cells (more is better - gives more options)
        let emptyCount = 0;
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 0) {
                    emptyCount++;
                }
            }
        }
        score += emptyCount * 100; // Increased weight for empty cells
        
        // Prefer having the highest tile in bottom-right corner
        let maxTile = 0;
        let maxTilePos = {row: -1, col: -1};
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] > maxTile) {
                    maxTile = this.grid[i][j];
                    maxTilePos = {row: i, col: j};
                }
            }
        }
        
        // Bottom-right corner is position [3][3]
        if (maxTilePos.row === 3 && maxTilePos.col === 3) {
            score += maxTile * 2; // Strong bonus for corner position
        } else if (maxTilePos.row >= 2 && maxTilePos.col >= 2) {
            score += maxTile; // Moderate bonus for near corner
        }
        
        // Prefer positions where adjacent tiles can merge (immediate scoring opportunity)
        let mergePotential = 0;
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const current = this.grid[i][j];
                if (current > 0) {
                    // Check right neighbor
                    if (j < this.size - 1 && this.grid[i][j + 1] === current) {
                        mergePotential += current * 10; // High value for merges
                    }
                    // Check bottom neighbor
                    if (i < this.size - 1 && this.grid[i + 1][j] === current) {
                        mergePotential += current * 10;
                    }
                }
            }
        }
        score += mergePotential;
        
        // Prefer keeping tiles in a snake pattern (bottom-right strategy)
        // This helps maintain order
        let snakeBonus = 0;
        for (let i = this.size - 1; i >= 0; i--) {
            if (i % 2 === (this.size - 1) % 2) {
                // Right to left on even rows from bottom
                for (let j = this.size - 1; j >= 0; j--) {
                    if (this.grid[i][j] > 0) {
                        snakeBonus += this.grid[i][j] * (j + 1);
                    }
                }
            } else {
                // Left to right on odd rows
                for (let j = 0; j < this.size; j++) {
                    if (this.grid[i][j] > 0) {
                        snakeBonus += this.grid[i][j] * (this.size - j);
                    }
                }
            }
        }
        score += snakeBonus * 0.5;
        
        return score;
    }
}

// Initialize game when page loads
window.addEventListener('DOMContentLoaded', () => {
    new Game2048();
});
