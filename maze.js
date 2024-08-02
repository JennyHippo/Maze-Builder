const canvas = document.getElementById("mazeCanvas");
canvas.width = window.innerWidth - window.innerWidth / 16;
canvas.height = window.innerHeight - window.innerWidth / 16;
const ctx = canvas.getContext("2d");
const rdC = Math.PI / 180;
let delay = 0;
let seed = [0, 0];
let matrix = [[]];
let mazePath = [];
let solutionPath = [];
let form = document.getElementById("mazeInfo");
const slider = document.getElementById("delay");
const solution = document.getElementById("solutionToggle");
let animDelay = 0.05;

createMatrix(10, 10);

function changeRange(value) {
    animDelay = value;
}

form.addEventListener("submit", (e) => {
    e.preventDefault();
    let r = document.getElementById("rowN").value;
    let c = document.getElementById("colN").value;
    if (r == "") {
        r = 10;
    }
    if (c == "") {
        c = 10;
    }
    animDelay = slider.value / 200;
    createMatrix(r, c);
});

ctx.fillStyle = "white";
ctx.fillRect(0, 0, canvas.width, canvas.height);


function drawHex(x, y, r, fill) {
    ctx.fillStyle = fill;
    ctx.strokeStyle = '#fca9b7';
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        ctx.lineTo(x + r * Math.cos(i * 60 * rdC), y + r * Math.sin(i * 60 * rdC));
    }
    ctx.closePath();
    ctx.lineWidth = 5;
    ctx.fill();

    ctx.stroke();
}

function drawHexS(x, y, r, fill) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        ctx.lineTo(x + r * Math.cos(i * 60 * rdC), y + r * Math.sin(i * 60 * rdC));
    }
    ctx.closePath();
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = '#a0ecff';
    ctx.lineWidth = 5;
    ctx.fill();
    ctx.globalAlpha = 1;
}

function drawHexRow(x, y, r, n, rN, fill) {
    for (let cR = 0; cR < n; cR++) {
        drawHex(x + cR * r * (1 + Math.cos(60 * rdC)), y + (cR % 2) * r * (Math.sin(60 * rdC)), r, fill);
        // connectEmpty(x + cR * r * (1 + Math.cos(60 * rdC)), y + (cR % 2) * r * (Math.sin(60 * rdC)), r, new Set(matrix[rN][cR].getNoWall()));
    }
}

function drawHexGrid(x, y, r, rN, cN, fill) {
    for (let i = 0; i < rN; i++) {
        drawHexRow(x, y + i * 2 * r * Math.sin(60 * rdC), r, cN, i, fill);
        // drawHexRow(x, y + i * 2 * r * Math.sin(60 * rdC), r, cN);
    }
    drawHexGridE(x, y, r, rN, cN);
}

function connectEmpty(x, y, r, skip = new Set([])) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        if (skip.has(i)) {
            ctx.lineTo(x + r * Math.cos(i * 60 * rdC), y + r * Math.sin(i * 60 * rdC));
        } else {
            ctx.moveTo(x + r * Math.cos(i * 60 * rdC), y + r * Math.sin(i * 60 * rdC));
        }
    }
    ctx.closePath();
    ctx.strokeStyle = '#feeaf1';
    ctx.stroke();
}

function drawHexRowE(x, y, r, n, rN) {
    for (let cR = 0; cR < n; cR++) {
        connectEmpty(x + cR * r * (1 + Math.cos(60 * rdC)), y + (cR % 2) * r * (Math.sin(60 * rdC)), r, new Set(matrix[rN][cR].getNoWall()));
    }
}

function drawHexGridE(x, y, r, rN, cN) {
    for (let i = 0; i < rN; i++) {
        drawHexRowE(x, y + i * 2 * r * Math.sin(60 * rdC), r, cN, i);
    }
}


function createMatrix(r, c) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // drawMidLines();
    initializeGraph(r, c);
    matrix[0][0].walls[5] = false;
    doMaze(matrix[0][0]);
}

function drawSolution(x, y, radius, fill) {
    for (let i = 0; i < solutionPath.length; i++) {
        r = solutionPath[i].r;
        c = solutionPath[i].c;
        drawHexS(x + c * radius * (1 + Math.cos(60 * rdC)), y + r * 2 * radius * Math.sin(60 * rdC) + (c % 2) * radius * (Math.sin(60 * rdC)), radius, fill);
    }
}

function getStartX(r, c, radius) {
    if (c % 2 == 0) {
        return canvas.width / 2 - ((c / 2) * (radius + radius / 2) + radius / 4) + radius;
    } else {
        if (c % 3 == 0) {
            return canvas.width / 2 - (1 * (Math.floor(c / 2) + 1) + 2 * (Math.floor(c / 2))) / 2 * radius + radius / 2;
        } else {
            return canvas.width / 2 - (1 * (Math.floor(c / 2)) + 2 * (Math.floor(c / 2) + 1)) / 2 * radius + radius;
        }
    }
}

function getStartY(r, c, radius) {
    if (r % 2 == 0) {
        return canvas.height / 2 - (radius * Math.sin(60 * rdC) * r);
    } else {
        return canvas.height / 2 - (2 * radius * Math.sin(60 * rdC) * (Math.floor(r / 2)) + radius * Math.sin(60 * rdC));
    }
}

async function draw() {
    const r = matrix.length;
    const c = matrix[0].length;
    let radius = Math.min((canvas.width - 200) / (c * (3 / 2) + 1 / 2), (canvas.height - 50) / 2 / r);
    drawHexGrid(getStartX(r, c, radius), getStartY(r, c, radius) + radius / 2, radius, r, c, '#feeaf1');
}

function initializeGraph(r, c) {
    matrix = Array(parseInt(r, 10)).fill().map(() => Array(parseInt(c, 10)).fill().map(() => new Hex()));
    for (let i = 0; i < r; i++) {
        for (let j = 0; j < c; j++) {
            matrix[i][j].setCoords(i, j);
            initializeHex(i, j);
        }
    }
    mazePath = [];
}

function initializeHex(r, c) {
    // even columns
    if (c % 2 == 0) {
        if (isValid(r - 1, c)) {
            matrix[r][c].setN(5, matrix[r - 1][c]);
        }
        if (isValid(r - 1, c + 1)) {
            matrix[r][c].setN(0, matrix[r - 1][c + 1]);
        }
        if (isValid(r, c + 1)) {
            matrix[r][c].setN(1, matrix[r][c + 1]);
        }
        if (isValid(r + 1, c)) {
            matrix[r][c].setN(2, matrix[r + 1][c]);
        }
        if (isValid(r, c - 1)) {
            matrix[r][c].setN(3, matrix[r][c - 1]);
        }
        if (isValid(r - 1, c - 1)) {
            matrix[r][c].setN(4, matrix[r - 1][c - 1]);
        }
    } else {
        // odd columns
        if (isValid(r - 1, c)) {
            matrix[r][c].setN(5, matrix[r - 1][c]);
        }
        if (isValid(r, c + 1)) {
            matrix[r][c].setN(0, matrix[r][c + 1]);
        }
        if (isValid(r + 1, c + 1)) {
            matrix[r][c].setN(1, matrix[r + 1][c + 1]);
        }
        if (isValid(r + 1, c)) {
            matrix[r][c].setN(2, matrix[r + 1][c]);
        }
        if (isValid(r + 1, c - 1)) {
            matrix[r][c].setN(3, matrix[r + 1][c - 1]);
        }
        if (isValid(r, c - 1)) {
            matrix[r][c].setN(4, matrix[r][c - 1]);
        }
    }

}

function isValid(r, c) {
    return r >= 0 && r < matrix.length && c >= 0 && c < matrix[0].length;
}

function drawMidLines() {
    ctx.beginPath();
    ctx.lineTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.closePath();
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#000000';
    ctx.stroke();

    ctx.beginPath();
    ctx.lineTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.closePath();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#000000';
    ctx.stroke();
}

async function wait(timeInSeconds) {
    return new Promise(resolve => {
        setTimeout(() => resolve(), timeInSeconds * 1000)
    });
}

async function doMaze(h) {
    await backTrackMaze(h);
    await draw();
    drawS();
}

function drawS() {
    const r = matrix.length;
    const c = matrix[0].length;
    let radius = Math.min((canvas.width - 200) / (c * (3 / 2) + 1 / 2), (canvas.height - 50) / 2 / r);
    if (solution.checked) {
        drawSolution(getStartX(r, c, radius), getStartY(r, c, radius) + radius / 2, radius, r, c, '#aeedf2');
    }
}

async function backTrackMaze(h) {
    await wait(animDelay);
    draw();
    console.log(mazePath);
    mazePath.push(h);
    h.visited = true;
    if (h.r == matrix.length - 1 && h.c == matrix[0].length - 1) {
        solutionPath = [...mazePath];
        h.rmWall(2);
        console.log(solutionPath);
    } else {
        let a = h.getAvailN();
        if (a.length == 0) {
            mazePath.pop();
        }
        while (a.length > 0) {
            let rand = Math.floor(Math.random() * a.length);
            h2 = a[rand];
            h.findRmWall(h2);
            h2.findRmWall(h);
            await backTrackMaze(h2);
            a = h.getAvailN();
        }
        mazePath.pop();
    }
}