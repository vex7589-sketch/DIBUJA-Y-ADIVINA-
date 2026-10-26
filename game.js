/* =========================================
   DIBUJA Y ADIVINA
   LÓGICA DEL JUEGO
========================================= */

const homeScreen = document.getElementById("homeScreen");
const waitingScreen = document.getElementById("waitingScreen");
const gameScreen = document.getElementById("gameScreen");

const drawerMode = document.getElementById("drawerMode");
const guesserMode = document.getElementById("guesserMode");

const createGameBtn = document.getElementById("createGameBtn");
const joinGameBtn = document.getElementById("joinGameBtn");

const roomCodeInput = document.getElementById("roomCodeInput");
const displayRoomCode = document.getElementById("displayRoomCode");
const homeMessage = document.getElementById("homeMessage");

const backHomeBtn = document.getElementById("backHomeBtn");

const timerElement = document.getElementById("timer");
const scoreElement = document.getElementById("score");

const secretWordElement = document.getElementById("secretWord");
const hintElement = document.getElementById("hint");

const drawingCanvas = document.getElementById("drawingCanvas");
const guessCanvas = document.getElementById("guessCanvas");

const brushSize = document.getElementById("brushSize");

const eraseBtn = document.getElementById("eraseBtn");
const clearBtn = document.getElementById("clearBtn");

const answerButtons = document.querySelectorAll(".answer-button");

const resultMessage = document.getElementById("resultMessage");
const resultIcon = document.getElementById("resultIcon");
const resultTitle = document.getElementById("resultTitle");
const resultText = document.getElementById("resultText");


/* =========================================
   VARIABLES DEL JUEGO
========================================= */

let roomCode = "";
let playerRole = "";

let score = 0;

let currentWord = "";
let currentHint = "";

let currentColor = "#111111";
let isErasing = false;

let isDrawing = false;

let timer = 60;
let timerInterval = null;


/* =========================================
   PALABRAS DEL JUEGO
========================================= */

const words = [
    {
        word: "AVIÓN",
        hint: "Puede volar por el cielo."
    },

    {
        word: "PERRO",
        hint: "Es un animal que suele ser mascota."
    },

    {
        word: "CASA",
        hint: "Es un lugar donde viven las personas."
    },

    {
        word: "AUTO",
        hint: "Tiene cuatro ruedas y sirve para transportarse."
    },

    {
        word: "ÁRBOL",
        hint: "Tiene hojas, tronco y raíces."
    },

    {
        word: "SOL",
        hint: "Lo vemos en el cielo durante el día."
    },

    {
        word: "PELOTA",
        hint: "Se utiliza en muchos deportes."
    },

    {
        word: "GUITARRA",
        hint: "Es un instrumento musical."
    }
];


/* =========================================
   CREAR PARTIDA
========================================= */

createGameBtn.addEventListener("click", createGame);

function createGame() {

    roomCode = generateRoomCode();

    playerRole = "drawer";

    displayRoomCode.textContent = roomCode;

    homeScreen.classList.remove("active");

    waitingScreen.classList.add("active");

    /*
       POR AHORA:
       La sala funciona visualmente.

       Después conectaremos Supabase
       para que otro dispositivo pueda
       entrar realmente a esta misma sala.
    */
}


/* =========================================
   UNIRSE A PARTIDA
========================================= */

joinGameBtn.addEventListener("click", joinGame);

function joinGame() {

    const code = roomCodeInput.value
        .trim()
        .toUpperCase();

    if (code.length !== 6) {

        homeMessage.textContent =
            "El código debe tener 6 caracteres.";

        return;
    }

    roomCode = code;

    playerRole = "guesser";

    startGame();

}


/* =========================================
   GENERAR CÓDIGO
========================================= */

function generateRoomCode() {

    const characters =
        "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    let code = "";

    for (let i = 0; i < 6; i++) {

        const randomIndex =
            Math.floor(
                Math.random() *
                characters.length
            );

        code += characters[randomIndex];
    }

    return code;
}


/* =========================================
   COMENZAR PARTIDA
========================================= */

function startGame() {

    waitingScreen.classList.remove("active");

    homeScreen.classList.remove("active");

    gameScreen.classList.add("active");

    score = 0;

    scoreElement.textContent = score;

    prepareRound();

}


/* =========================================
   PREPARAR RONDA
========================================= */

function prepareRound() {

    hideResult();

    resetTimer();

    chooseNewWord();

    if (playerRole === "drawer") {

        drawerMode.classList.remove("hidden");

        guesserMode.classList.add("hidden");

    } else {

        drawerMode.classList.add("hidden");

        guesserMode.classList.remove("hidden");

        copyDrawingCanvas();

    }

}


/* =========================================
   ELEGIR PALABRA
========================================= */

function chooseNewWord() {

    const randomIndex =
        Math.floor(
            Math.random() *
            words.length
        );

    currentWord =
        words[randomIndex].word;

    currentHint =
        words[randomIndex].hint;

    secretWordElement.textContent =
        currentWord;

    hintElement.textContent =
        currentHint;

    /*
       Las respuestas incorrectas
       se generan posteriormente
       alrededor de la palabra correcta.
    */

    generateAnswerOptions();

}


/* =========================================
   GENERAR RESPUESTAS
========================================= */

function generateAnswerOptions() {

    let possibleWords =
        words
        .map(item => item.word)
        .filter(word => word !== currentWord);

    possibleWords =
        shuffle(possibleWords);

    let options = [
        currentWord,
        possibleWords[0],
        possibleWords[1],
        possibleWords[2]
    ];

    options = shuffle(options);

    answerButtons.forEach(
        (button, index) => {

            button.textContent =
                options[index];

            button.dataset.answer =
                options[index];

        }
    );

}


/* =========================================
   MEZCLAR ARRAY
========================================= */

function shuffle(array) {

    return array.sort(
        () => Math.random() - 0.5
    );

}


/* =========================================
   RESPUESTAS
========================================= */

answerButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            const answer =
                button.dataset.answer;

            checkAnswer(answer);

        }
    );

});


/* =========================================
   COMPROBAR RESPUESTA
========================================= */

function checkAnswer(answer) {

    if (answer === currentWord) {

        score += 100;

        scoreElement.textContent =
            score;

        showResult(
            "🎉",
            "¡CORRECTO!",
            "+100 PUNTOS"
        );

        /*
           Después de acertar,
           esperamos unos segundos
           y cambiamos los puestos.
        */

        setTimeout(() => {

            switchRoles();

        }, 2000);

    } else {

        showResult(
            "❌",
            "INCORRECTO",
            "¡SIGUE INTENTANDO!"
        );

        setTimeout(() => {

            hideResult();

        }, 1200);

    }

}


/* =========================================
   INTERCAMBIAR PUESTOS
========================================= */

function switchRoles() {

    hideResult();

    if (playerRole === "drawer") {

        playerRole = "guesser";

    } else {

        playerRole = "drawer";

    }

    clearCanvas();

    prepareRound();

}


/* =========================================
   TEMPORIZADOR
========================================= */

function resetTimer() {

    clearInterval(timerInterval);

    timer = 60;

    timerElement.textContent =
        timer;

    timerInterval =
        setInterval(() => {

            timer--;

            timerElement.textContent =
                timer;

            if (timer <= 0) {

                clearInterval(
                    timerInterval
                );

                showResult(
                    "⏰",
                    "¡TIEMPO!",
                    "La ronda terminó."
                );

                setTimeout(() => {

                    switchRoles();

                }, 2000);

            }

        }, 1000);

}


/* =========================================
   CANVAS
========================================= */

function setupCanvas(canvas) {

    const context =
        canvas.getContext("2d");

    const rect =
        canvas.getBoundingClientRect();

    const pixelRatio =
        window.devicePixelRatio || 1;

    canvas.width =
        rect.width * pixelRatio;

    canvas.height =
        rect.height * pixelRatio;

    context.scale(
        pixelRatio,
        pixelRatio
    );

    context.lineCap =
        "round";

    context.lineJoin =
        "round";


    canvas.addEventListener(
        "pointerdown",
        event => {

            if (playerRole !== "drawer") {
                return;
            }

            isDrawing = true;

            canvas.setPointerCapture(
                event.pointerId
            );

            const point =
                getCanvasPosition(
                    event,
                    canvas
                );

            context.beginPath();

            context.moveTo(
                point.x,
                point.y
            );

        }
    );


    canvas.addEventListener(
        "pointermove",
        event => {

            if (!isDrawing) {
                return;
            }

            if (playerRole !== "drawer") {
                return;
            }

            const point =
                getCanvasPosition(
                    event,
                    canvas
                );

            context.strokeStyle =
                isErasing
                    ? "#ffffff"
                    : currentColor;

            context.lineWidth =
                Number(
                    brushSize.value
                );

            context.lineTo(
                point.x,
                point.y
            );

            context.stroke();

        }
    );


    canvas.addEventListener(
        "pointerup",
        () => {

            isDrawing = false;

        }
    );


    canvas.addEventListener(
        "pointercancel",
        () => {

            isDrawing = false;

        }
    );

}


function getCanvasPosition(
    event,
    canvas
) {

    const rect =
        canvas.getBoundingClientRect();

    return {

        x:
            event.clientX -
            rect.left,

        y:
            event.clientY -
            rect.top

    };

}


/* =========================================
   COLORES
========================================= */

const colorButtons =
    document.querySelectorAll(
        ".color-button"
    );

colorButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            currentColor =
                button.dataset.color;

            isErasing = false;

            colorButtons.forEach(
                item =>
                    item.classList.remove(
                        "selected"
                    )
            );

            button.classList.add(
                "selected"
            );

        }
    );

});


/* =========================================
   BORRAR
========================================= */

eraseBtn.addEventListener(
    "click",
    () => {

        isErasing = true;

    }
);


/* =========================================
   LIMPIAR
========================================= */

clearBtn.addEventListener(
    "click",
    clearCanvas
);


function clearCanvas() {

    const context =
        drawingCanvas.getContext(
            "2d"
        );

    context.clearRect(
        0,
        0,
        drawingCanvas.width,
        drawingCanvas.height
    );

}


/* =========================================
   COPIAR DIBUJO
========================================= */

function copyDrawingCanvas() {

    /*
       Esta función es provisional.

       Cuando conectemos Supabase,
       aquí recibiremos los trazos
       realizados por el otro dispositivo.
    */

    const context =
        guessCanvas.getContext(
            "2d"
        );

    context.clearRect(
        0,
        0,
        guessCanvas.width,
        guessCanvas.height
    );

}


/* =========================================
   RESULTADO
========================================= */

function showResult(
    icon,
    title,
    text
) {

    resultIcon.textContent =
        icon;

    resultTitle.textContent =
        title;

    resultText.textContent =
        text;

    resultMessage.classList.remove(
        "hidden"
    );

}


function hideResult() {

    resultMessage.classList.add(
        "hidden"
    );

}


/* =========================================
   VOLVER AL INICIO
========================================= */

backHomeBtn.addEventListener(
    "click",
    () => {

        clearInterval(
            timerInterval
        );

        waitingScreen.classList.remove(
            "active"
        );

        gameScreen.classList.remove(
            "active"
        );

        homeScreen.classList.add(
            "active"
        );

    }
);


/* =========================================
   INICIALIZAR CANVAS
========================================= */

window.addEventListener(
    "load",
    () => {

        setupCanvas(
            drawingCanvas
        );

        setupCanvas(
            guessCanvas
        );

    }
);


/* =========================================
   AJUSTAR CANVAS
========================================= */

window.addEventListener(
    "resize",
    () => {

        /*
           Evitamos reconstruir el dibujo
           mientras el usuario está jugando.
        */

    }
);
