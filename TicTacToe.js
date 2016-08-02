var Page = {};
// canvas variables
Page.$canvas = null;
Page.context = null;
Page.$bgCanvas = null;
Page.bgContext = null;
Page.$highlightCanvas = null;
Page.hightlightContext = null;
Page.canvasWidth = 600;
Page.canvasHeight = 600;
Page.boardLength = 15;
Page.blockSize = 40; // 600 / 15 = 40
Page.isGameOver = false;
Page.highlightColor = 'gold';
Page.triangleLength = 8;
// player
Page.playerTurn = -1;
Page.moveHistory = [];
Page.playingField = null;
Page.symbols = ['X', 'O'];

Page.initialize = function () {
    Page.$canvas = $('#tic-tac-toe-canvas');
    Page.context = Page.$canvas[0].getContext('2d');

    Page.$bgCanvas = $('#bg-canvas');
    Page.bgContext = Page.$bgCanvas[0].getContext('2d');

    Page.$highlightCanvas = $('#highlight-canvas');
    Page.hightlightContext = Page.$highlightCanvas[0].getContext('2d');

    Page.playingField = Page.create2DArray(Page.boardLength, Page.boardLength);
    Page.playerTurn = 0;

    Page.attachCanvasListener();
    Page.attachButtonListeners();
    Page.initializeGameOverModal();
    Page.drawBoard();
};

//#region Event Listeners

Page.attachCanvasListener = function () {
    Page.$canvas.on('mousemove', function (e) {
        var col = Math.floor(e.offsetX / Page.blockSize);
        var row = Math.floor(e.offsetY / Page.blockSize);

        Page.drawHighlight(col, row);
    });

    Page.$canvas.on('mousedown', function (e) {
        if (Page.isGameOver) return;

        var col = Math.floor(e.offsetX / Page.blockSize);
        var row = Math.floor(e.offsetY / Page.blockSize);

        if (Page.playingField[col][row] === -1) {
            Page.setPlayingField(col, row);
            Page.drawText();
            Page.getWinner();
            Page.playerTurn = (Page.playerTurn + 1) % 2;
        }
    });
};

Page.attachButtonListeners = function () {
    $('#undo-button').on('click', function (e) {
        if (Page.isGameOver) return;

        var length = Page.moveHistory.length;
        if (length > 0) {
            var lastMove = Page.moveHistory.pop();
            Page.playingField[lastMove.col][lastMove.row] = -1;
            Page.playerTurn = (Page.playerTurn + 1) % 2;
            Page.drawText();
        }
    });

    $('#restart-button').on('click', function (e) {
        Page.gameOver();
        this.isGameOver = false;
    });
};

Page.initializeGameOverModal = function () {
    $('#game-over-modal').on('show.bs.modal', function (e) {
        $(this).find('#confirm-replay-game').on('click', function () {
            Page.resetGame();
            $('#game-over-modal').modal('hide');
        });
    });
};

//#endregion Event Listeners

//#region Canvas Drawing

Page.drawBoard = function () {
    Page.bgContext.clearRect(0, 0, Page.canvasWidth, Page.canvasHeight);
    Page.bgContext.strokeStyle = 'rgba(165, 192, 179, 1)';
    //Page.bgContext.strokeStyle = 'rgba(219, 221, 181, 1)';

    for (var i = 0; i < Page.boardLength; i++) {
        for (var j = 0; j < Page.boardLength; j++) {
            Page.bgContext.rect(Page.blockSize * i, Page.blockSize * j, Page.blockSize, Page.blockSize);
        }
    }
    Page.bgContext.stroke();
};

Page.drawHighlight = function (col, row) {
    // draw four small triangles in the corner of the given square
    var x = col * Page.blockSize;
    var y = row * Page.blockSize;
    Page.hightlightContext.clearRect(0, 0, Page.canvasWidth, Page.canvasHeight);
    Page.hightlightContext.fillStyle = 'gold';

    // top left
    Page.hightlightContext.beginPath();
    Page.hightlightContext.moveTo(x, y);
    Page.hightlightContext.lineTo(x, y + Page.triangleLength);
    Page.hightlightContext.lineTo(x + Page.triangleLength, y);

    // top right
    Page.hightlightContext.moveTo(x + Page.blockSize, y);
    Page.hightlightContext.lineTo(x + Page.blockSize, y + Page.triangleLength);
    Page.hightlightContext.lineTo(x + Page.blockSize - Page.triangleLength, y);

    // bottom left
    Page.hightlightContext.moveTo(x, y + Page.blockSize);
    Page.hightlightContext.lineTo(x, y + Page.blockSize - Page.triangleLength);
    Page.hightlightContext.lineTo(x + Page.triangleLength, y + Page.blockSize);

    // bottom right
    Page.hightlightContext.moveTo(x + Page.blockSize, y + Page.blockSize);
    Page.hightlightContext.lineTo(x + Page.blockSize, y + Page.blockSize - Page.triangleLength);
    Page.hightlightContext.lineTo(x + Page.blockSize - Page.triangleLength, y + Page.blockSize);
    Page.hightlightContext.fill();
    Page.hightlightContext.closePath();
};

Page.drawText = function () {
    var offSetX = Page.blockSize / 2;
    var offSetY = Page.blockSize / 2 + 10;
    var symbol = '';

    Page.context.clearRect(0, 0, Page.canvasWidth, Page.canvasHeight);
    Page.context.font = '40px Indie Flower'
    Page.context.textAlign = 'center';
    Page.context.fillStyle = 'white';

    for (var col = 0; col < Page.boardLength; col++) {
        for (var row = 0; row < Page.boardLength; row++) {
            symbol = Page.symbols[Page.playingField[col][row]] || '';
            Page.context.fillText(symbol, Page.blockSize * col + offSetX, Page.blockSize * row + offSetY);
        }
    }
};

Page.drawWinnerHightlight = function (winningSpaces) {
    var startX = winningSpaces[0].col * Page.blockSize;
    var startY = winningSpaces[0].row * Page.blockSize;
    var endX = winningSpaces[winningSpaces.length - 1].col * Page.blockSize;
    var endY = winningSpaces[winningSpaces.length - 1].row * Page.blockSize;

    if (startX === endX) {
        startX += Page.blockSize / 2;
        endX += Page.blockSize / 2;
        endY += Page.blockSize;
    } else if (startY === endY) {
        startY += Page.blockSize / 2;
        endX += Page.blockSize;
        endY += Page.blockSize / 2;
    } else if (startX < endX) {
        endX += Page.blockSize;
        endY += Page.blockSize;
    } else {
        startX += Page.blockSize;
        endY += Page.blockSize;
    }

    Page.context.save();

    Page.context.lineWidth = 2;
    Page.context.strokeStyle = 'gold';

    Page.context.beginPath();
    Page.context.moveTo(startX, startY);
    Page.context.lineTo(endX, endY);
    Page.context.stroke();

    Page.context.restore();
};

//#endregion Canvas Drawing

//#region Helpers

Page.create2DArray = function (cols, rows) {
    var array = [];
    for (var i = 0; i < cols; i++) {
        array[i] = [];
        for (var j = 0; j < rows; j++) {
            array[i][j] = -1;
        }
    }
    return array;
};

Page.setPlayingField = function (col, row) {
    Page.playingField[col][row] = Page.playerTurn;
    Page.moveHistory.push({ col: col, row: row });
};

//#endregion Helpers

//#region Find Winner

Page.getWinner = function () {
    // returns 0 if player 1 won
    // 		   1 if player 2 won
    // 		   2 if tie
    // 		   3 if no winner yet
    var rowStreak = 0;
    var colStreak = 0;
    var diagStreak = 0;
    var revDiagStreak = 0;
    var rowStreakArr = [];
    var colStreakArr = [];
    var diagStreakArr = [];
    var revDiagStreakArr = [];

    for (var i = 0; i < Page.boardLength; i++) {
        colStreak = 0;
        rowStreak = 0;
        diagStreak = 0;
        revDiagStreak = 0;
        rowStreakArr = [];
        colStreakArr = [];
        diagStreakArr = [];
        revDiagStreakArr = [];

        for (var j = 0; j < Page.boardLength; j++) {
            // horizontal
            if (Page.playingField[j][i] === Page.playerTurn) {
                rowStreak++;
                rowStreakArr.push({ col: j, row: i });
                if (rowStreak === 5) {
                    i = j = Number.MAX_VALUE; // break all loops
                    break;
                }
            } else {
                rowStreak = 0;
                rowStreakArr = [];
            }

            // vertical
            if (Page.playingField[i][j] === Page.playerTurn) {
                colStreak++;
                colStreakArr.push({ col: i, row: j });
                if (colStreak === 5) {
                    i = j = Number.MAX_VALUE; // break all loops
                    break;
                }

                for (var k = 0; k < 5; k++) {
                    // check diagonal
                    if ((i + k) < Page.boardLength && (j + k) < Page.boardLength
						&& Page.playingField[i + k][j + k] === Page.playerTurn) {
                        diagStreak++;
                        diagStreakArr.push({ col: i + k, row: j + k });

                        if (diagStreak === 5) {
                            i = j = k = Number.MAX_VALUE; // break all loops
                            break;
                        }
                    } else {
                        diagStreak = 0;
                        diagStreakArr = [];
                    }

                    // check reverse diagonal
                    if ((i - k) >= 0 && (j + k) < Page.boardLength
						&& Page.playingField[i - k][j + k] === Page.playerTurn) {
                        revDiagStreak++;
                        revDiagStreakArr.push({ col: i - k, row: j + k });

                        if (revDiagStreak === 5) {
                            i = j = k = Number.MAX_VALUE; // break all loops
                            break;
                        }
                    } else {
                        revDiagStreak = 0;
                        revDiagStreakArr = [];
                    }
                }
            } else {
                colStreak = 0;
                diagStreak = 0;
                revDiagStreak = 0;
                colStreakArr = [];
                diagStreakArr = [];
                revDiagStreakArr = [];
            }
        }
    }

    if (colStreak === 5 || rowStreak === 5 || diagStreak === 5 || revDiagStreak === 5) {
        if (colStreak === 5) {
            Page.drawWinnerHightlight(colStreakArr);
        } else if (rowStreak === 5) {
            Page.drawWinnerHightlight(rowStreakArr);
        } else if (diagStreak === 5) {
            Page.drawWinnerHightlight(diagStreakArr);
        } else if (revDiagStreak === 5) {
            Page.drawWinnerHightlight(revDiagStreakArr);
        }

        Page.isGameOver = true;
        return Page.playerTurn;
    }

    return 3;
};

//#endregion Find Winner

//#region Options

Page.toggleBackground = function () {
    if (Page.$bgCanvas.hasClass('bg-canvas-black')) {
        Page.$bgCanvas.removeClass('bg-canvas-black');
        Page.$bgCanvas.addClass('bg-canvas-green');
    } else {
        Page.$bgCanvas.removeClass('bg-canvas-green');
        Page.$bgCanvas.addClass('bg-canvas-black');
    }
};

Page.restartOption = function () {
    Page.gameOver();
    this.isGameOver = false;
};

Page.openOptions = function () {
    $('#options-side-menu').css('width', '250px');
};

Page.closeOptions = function () {
    $('#options-side-menu').css('width', '0');
};

//#endregion Options

//#region Reset / Replay

Page.gameOver = function (title, body) {
    Page.isGameOver = true;
    $('#game-over-modal').find('.modal-title').text(title || 'New Game?');
    $('#game-over-modal').find('.modal-body p').text((body || '') + 'Would you like to start a new game?');
    $('#game-over-modal').modal('show');
};

Page.resetGame = function () {
    Page.context.clearRect(0, 0, Page.canvasWidth, Page.canvasHeight);
    Page.bgContext.clearRect(0, 0, Page.canvasWidth, Page.canvasHeight);
    Page.hightlightContext.clearRect(0, 0, Page.canvasWidth, Page.canvasHeight);
    Page.drawBoard();

    Page.playingField = Page.create2DArray(Page.boardLength, Page.boardLength);
    Page.moveHistory = [];
    Page.playerTurn = 0;
    Page.isGameOver = false;
};

//#endregion Reset / Replay

$(document).on('ready', function () {
    Page.initialize();
});
