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
    const colors = [];
    let i = 0;

    while (i < inputs.length && inputs[i].value !== "") {
        let word = [];
        let color_row = [];

        for (let j = 0; j < 5; j++) {
            const input = inputs[i + j];
            const letter = input.value.toUpperCase();

            if (letter === "") {
                showPopup('Enter a 5 letter word');
                break;
            }

            const colorBar = input.nextElementSibling;
            if (colorBar.classList.contains("green")) {
                color_row.push("green");
            } else if (colorBar.classList.contains("yellow")) {
                color_row.push("yellow");
            } else {
                color_row.push("gray");
            }
            word.push(letter);
        }

        const word_str = word.join("");

        if (!valid_words.has(word_str.toLowerCase())) {
            showPopup('Word not in Wordle dictionary');
            break;
        }

        i += 5;
        words.push(word_str);
        colors.push(color_row);
    }

    console.log("words:", words);
    console.log("colors:", colors);

    const suggestions = get_wordle_suggestions(words, colors);
    console.log("suggestions:", suggestions);
}

// Generate suggestions
function get_wordle_suggestions(user_words, user_colors) {
    // Update dictionary for remaining words
    const current_valid_words = update_dictionary(valid_words, user_words, user_colors)
    // Calculate letter weights for remaining words
    // Rank updated diciontary by weights
    // Return top 5 suggestions
    return current_valid_words;
}

// Update dictionary for remaining words
function update_dictionary(valid_words, user_words, user_colors) {
    if (user_words.length == 0) {
        return valid_words;
    }
    
    var constraints = {};
    for (let i = "A".charCodeAt(0); i <= "Z".charCodeAt(0); i++) {
        const letter = String.fromCharCode(i);
        constraints[letter] = {
            min: 0,
            max: Infinity,
            required: new Set(),
            forbidden: new Set()
        };
    }

    for (let i = 0; i < user_words.length; i++) {
        update_constraints(user_words[i], user_colors[i], constraints);
    }
    console.log("constraints:", constraints);

    const current_valid_words = valid_words;

    return Array.from(current_valid_words.values()).slice(0, 5);
}

// Update constraints for filtering dictionary words
function update_constraints(guess, feedback, constraints) {
    const accounted = {};

    for (let i = 0; i < guess.length; i++) {
        const letter = guess[i].toUpperCase();
        const fb = feedback[i];

        if (fb === "green") {
            constraints[letter].min += 1;
            constraints[letter].required.add(i);
            accounted[letter] = (accounted[letter] || 0) + 1;
        }

        if (fb === "yellow") {
            constraints[letter].min += 1;
            constraints[letter].forbidden.add(i);
            accounted[letter] = (accounted[letter] || 0) + 1;
        }
    }

    for (let i = 0; i < guess.length; i++) {
        const letter = guess[i].toUpperCase();
        const fb = feedback[i];
        
        if (fb === "gray") {
            const minSoFar = constraints[letter].min;
            const used = accounted[letter] || 0;

            if (used === 0) {
                constraints[letter].max = 0;
            } else {
                constraints[letter].max = minSoFar;
            }
        }
    }
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