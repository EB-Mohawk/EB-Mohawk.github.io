const svg = "http://www.w3.org/2000/svg";
let turn = "black";
let disks = [];

window.addEventListener("load", (event) =>{
    let board = document.getElementById("board");
    console.log("Started");
    drawGrid(board);
});

function reset(){
    let board = document.getElementById("board");
    let turnDisplay = document.getElementById("turn");
    turn = "black";
    disks = [];
    drawGrid(board);
    turnDisplay.textContent = turn;
}

function drawGrid(board){
    let width = board.getAttribute("width")/8;
    let height = board.getAttribute("height")/8;

    for(let x = 0; x < 8; x++){
        let column = [];
        for(let y = 0; y < 8; y++){
            let tile = drawTile(width, height, x*width, y*height);
            board.appendChild(tile.tile);
            board.appendChild(tile.disk);
            tile.disk.setAttribute("id", `{"x" : ${x}, "y" : ${y}}`);
            column.push(tile.disk);
        }
        disks.push(column);
    }
}

function drawTile(width, height, x, y){
    let tile = document.createElementNS(svg, "rect");
    tile.setAttribute("width", width);
    tile.setAttribute("height", height);
    tile.setAttribute("x", x);
    tile.setAttribute("y", y);
    tile.setAttribute("style", 'fill:darkgreen; stroke:black;');

    let disk = document.createElementNS(svg, "circle");
    disk.setAttribute("cx", x + width/2);
    disk.setAttribute("cy", y + height/2);
    disk.setAttribute("r", Math.floor(width/2));
    disk.setAttribute("value", "darkgreen");
    disk.setAttribute("style", "fill:darkgreen;");

    disk.addEventListener("click", (event) => {playMove(disk)});
    disk.addEventListener("mouseover", (event) => {showPlacements(disk)});

    return {"tile": tile, "disk" : disk};
}

function playMove(disk){
    let turnDisplay = document.getElementById("turn");

    if(disk.getAttribute("value") == "darkgreen"){
        disk.setAttribute("value", turn);
        convert(disk);

        if(checkWin() != null){
            turnDisplay.textContent = `${checkWin()} wins`
        }
        else{
            switchTurn();
            turnDisplay.textContent = turn;
        }
    }

    colorDisks();
    
}

function switchTurn(){
    if(turn == "black")
        turn = "white";
    else
        turn = "black";
}

function showPlacements(disk){
    let candidates = [];
    
    for(let x = 0; x < 8; x++){
        for(let y = 0; y < 8; y++){
            disks[x][y].setAttribute("style",  "fill:darkgreen;");

            if(eligible(disk, disks[x][y]) )
                candidates.push(disks[x][y]);
        }
    }

    candidates.forEach(disk =>{
        disk.setAttribute("style", "fill:darkolivegreen;");
        colorDisks();
    });
}

function eligible(placedDisk, disk){
    let thisPosition = JSON.parse(placedDisk.id);
    let position = JSON.parse(disk.id);

    let vertical = position.y == thisPosition.y;
    let horizontal = position.x == thisPosition.x;
    let diff = thisPosition.x - position.x;
    let leftDiagonal = position.x + diff == thisPosition.x && position.y + diff == thisPosition.y;
    let rightDiagonal = thisPosition.x - diff == position.x && thisPosition.y + diff == position.y;
    
    return vertical || horizontal || leftDiagonal || rightDiagonal;
}

function colorDisks(){
    for(let x = 0; x < 8; x++){
        for(let y = 0; y < 8; y++){
            switch(disks[x][y].getAttribute("value")){
                case "black":
                    disks[x][y].setAttribute("style",  "fill:black;");
                    break;
                case "white":
                    disks[x][y].setAttribute("style",  "fill:white;");
                    break;
            }
        }
    }
}

function convert(disk){
    let candidates = []
    let directions = [{"x" : 1,"y" : 1}, {"x" : 1,"y" : 0}, {"x" : 1,"y" : -1}, {"x" : 0,"y" : 1}, {"x" : 0,"y" : -1}, {"x" : -1,"y" : 1}, {"x" : -1,"y" : 0}, {"x" : -1,"y" : -1}];

    directions.forEach(direction =>{
        let local = [];
        let position = JSON.parse(disk.id);

        for(let i = 0; 
            position.x + (direction.x * i) < 8 &&
            position.x + (direction.x * i) >= 0 && 
            position.y + (direction.y * i) < 8 &&
            position.y + (direction.y * i) >= 0;
            i++){

            let nextPos = {"x": position.x + (direction.x * i), "y" : position.y + (direction.y * i)};
            let currentDisk = disks[nextPos.x][nextPos.y];

            if(currentDisk.getAttribute("value") == "darkgreen"){
                break;
            }
            else if(currentDisk.getAttribute("value") != turn){
                local.push(currentDisk);
            }
            else if(currentDisk != disk){
                local.forEach(cand =>{
                    candidates.push(cand);
                })
                break;
            }
        }
    });

    candidates.forEach(disk =>{
        disk.setAttribute("value", turn);
    });
}

function checkWin(){
    let black = 0;
    let white = 0;

    for(let x = 0; x < 8; x++){
        for(let y = 0; y < 8; y++){
            black += disks[x][y].getAttribute("value") == "black" ? 1 : 0;
            white += disks[x][y].getAttribute("value") == "white" ? 1 : 0;
        }
    }

    if(white + black == 64)
        return white > black ? "White" : "Black";
    else
        return null;
}