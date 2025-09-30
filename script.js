// Load word dictionary
fetch("wordle_words.json")
    .then(response => response.json())
    .then(data => {
        valid_words = new Set(data.map(word => word.toLowerCase()));
    });

// Create the wordle board
const wordle_board = document.getElementById('wordle-board');

for (let row = 0; row < 6; row++) {
    const rowDiv = document.createElement("div");
    rowDiv.classList.add("row");

    for (let col = 0; col < 5; col++) {
        const cellDiv = document.createElement("div");
        cellDiv.classList.add("cell");

        const input = document.createElement("input");
        input.type = "text";
        input.maxLength = 1;
        input.classList.add("letter-input");

        if (row > 0) {
            input.disabled = true;
        }

        input.addEventListener("input", () => {
            if (input.value.length === input.maxLength) {
                const nextCell = input.parentElement.nextElementSibling;

                if (nextCell) {
                    const nextInput = nextCell.querySelector("input");

                    if (nextInput) {
                        nextInput.focus();
                    }
                }
            }
        });

        input.addEventListener("keydown", (e) => {
            if (e.key === "Backspace" && input.value === "") {
                const prevCell = input.parentElement.previousElementSibling;

                if (prevCell) {
                    const prevInput = prevCell.querySelector("input");

                    if (prevInput) {
                        prevInput.focus();
                    }
                }
            }
        });

        const colorBar = document.createElement("div");
        colorBar.classList.add("color-bar", "gray");

        cellDiv.appendChild(input);
        cellDiv.appendChild(colorBar);

        rowDiv.appendChild(cellDiv);
    }

    wordle_board.appendChild(rowDiv);
}

// Color handling for the color bars
document.querySelectorAll(".color-bar").forEach(bar => {
    bar.addEventListener("click", () => {

        // cycle classes
        if (bar.classList.contains("gray")) {
            bar.classList.remove("gray");
            bar.classList.add("yellow");
        } else if (bar.classList.contains("yellow")) {
            bar.classList.remove("yellow");
            bar.classList.add("green");
        } else {
            bar.classList.remove("green");
            bar.classList.add("gray");
        }

        // find the input above this bar
        const input = bar.previousElementSibling;

        // mirror the color onto the input
        input.classList.remove("gray", "yellow", "green");

        if (bar.classList.contains("yellow")) {
            input.classList.add("yellow");
        } else if (bar.classList.contains("green")) {
            input.classList.add("green");
        } else {
            input.classList.add("gray");
        }
    });
});

// Handling and processing
function checkWords() {
    const inputs = document.querySelectorAll(".letter-input");
    const words = [];
    let i = 0;

    while (inputs[i].value !== "") {
        let word = [];

        for (let j = 0; j < 5; j++) {
            if (inputs[i + j].value === "") {
                showPopup('Enter a 5 letter word');
                break;
            }
            word.push(inputs[i + j].value);
        }

        let word_str = word.join("");

        if (!valid_words.has(word_str)) {
            showPopup('Word not in Wordle dictionary');
            break;
        }

        i += 5;
        words.push(word_str);
    }
    console.log(words);
}

// Popup display and closing
function showPopup(message) {
    const popup = document.getElementById('popup');
    const popupMessage = document.getElementById('popup-message');
    popupMessage.textContent = message;
    popup.style.display = 'block';
}

document.getElementById('popup-close').addEventListener('click', () => {
    const popup = document.getElementById('popup');
    popup.style.display = 'none';
});