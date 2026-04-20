const winPatterns = [
  [0,1,2],
  [3,4,5],
  [6,7,8],
  [0,3,6],
  [1,4,7],
  [2,5,8],
  [0,4,8],
  [2,4,6]
];

let boxes = document.querySelectorAll(".box");
let resetBtn = document.getElementById("reset");
let msg = document.getElementById("msg");
let playerx = document.getElementById("playerX");
let playery = document.getElementById("player0");
let isX = false;
let gameOver = false;
let playerO = 0;
let playerX = 0 ;

boxes.forEach(box => {
    box.addEventListener("click",() => {
        if (gameOver || box.textContent !== "") return;
        
            box.textContent = isX? "X": "O";
            isX = !isX;
            checkWin();
            draw();
        
    });
    
});
  


// Check function for win
const checkWin = () => {
    for (let pattern of winPatterns){

        let val1 = boxes[pattern[0]].innerText;
        let val2 = boxes[pattern[1]].innerText;
        let val3 = boxes[pattern[2]].innerText;

        if (val1 !== "" && val1 === val2 && val2 === val3){

            msgbox(`Winner is ${val1}`);
            gameOver = true;

            //  score update ONLY here
            if (val1 === "X"){
                playerX++;
                playerx.innerText = `Player X: ${playerX}`;
            } else {
                playerO++;
                playery.innerText = `Player O: ${playerO}`;
            }

            break; // stop further checking
        }
    }
};


//Message function for Winner or Draw
let msgbox = (text) =>{
    msg.innerText  = text;
}


// Draw function
let draw = () => {
    let filled = true;

    boxes.forEach(box => {
        if (box.innerText === "") {
            filled = false;
        }
    });

    if (filled && !gameOver) {
        msgbox("Match Draw!");
        gameOver = true;
    }
};


//Resetting Game Function
const resetfunc = () => {

    isX = true;
    gameOver = false;

    boxes.forEach(box => {
        box.innerText = "";
    });

};

resetBtn.addEventListener("click", resetfunc);
