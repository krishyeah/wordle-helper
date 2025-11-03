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
    displaySuggestions(suggestions);

    unlockNextRow(words.length);
}

function displaySuggestions(suggestions) {
    const list = document.getElementById("suggestions-list");
    list.innerHTML = ""; // clear old ones

    for (const word of suggestions) {
        const li = document.createElement("li");
        li.textContent = word.toUpperCase();

        // ✅ Add click handler to auto-fill next available row
        li.addEventListener("click", () => {
            const rows = document.querySelectorAll(".row");

            // Find the first enabled row
            for (const row of rows) {
                const inputs = row.querySelectorAll("input");
                if (!inputs[0].disabled) {
                    // Fill the row with letters from the clicked suggestion
                    for (let i = 0; i < 5; i++) {
                        inputs[i].value = word[i].toUpperCase();
                    }
                    // Focus on the first box of the row
                    inputs[0].focus();
                    break;
                }
            }
        });

        list.appendChild(li);
    }
}

function unlockNextRow(currentRowCount) {
    const rows = document.querySelectorAll(".row");
    const nextRowIndex = currentRowCount;

    if (nextRowIndex >= rows.length) {
        console.warn("No more rows to unlock.");
        return;
    }

    // Disable previous row
    if (nextRowIndex > 0) {
        const prevInputs = rows[nextRowIndex - 1].querySelectorAll("input");
        prevInputs.forEach(input => input.disabled = true);
    }

    const nextRow = rows[nextRowIndex];
    if (!nextRow) return;

    const nextInputs = nextRow.querySelectorAll("input");
    if (nextInputs.length === 0) return;

    nextInputs.forEach(input => input.disabled = false);
    nextInputs[0].focus();
}

// Generate suggestions
function get_wordle_suggestions(user_words, user_colors) {
    // Update dictionary for remaining words
    const current_valid_words = update_dictionary(valid_words, user_words, user_colors)
    
    // Calculate letter weights for remaining words
    const letterCounts = {};
    let totalCount = 0;

    for (const word of current_valid_words) {
        for (const letter of word) {
            letterCounts[letter] = (letterCounts[letter] || 0) + 1;
            totalCount++;
        }
    }

    for (let letter of Object.keys(letterCounts)) {
        letterCounts[letter] = letterCounts[letter] / totalCount;
    }

    console.log("letterCounts:", letterCounts);
    console.log("totalCount:", totalCount);

    // Rank updated diciontary by weights
    const word_scores = {};
    for (const word of current_valid_words) {
        let score = 0;
        let letter_dict = {};

        for (const letter of word) {
            letter_dict[letter] = (letter_dict[letter] || 0) + 1;
        }

        for (const letter of Object.keys(letter_dict)) {
            score = score + (1.25 ** letter_dict[letter] * letterCounts[letter]);
        }

        word_scores[word] = score;
    }

    console.log(word_scores);
    
    // Return top 5 suggestions
    // Create items array
    var items = Object.keys(word_scores).map(function(key) {
        return [key, word_scores[key]];
    });

    // Sort the array based on the second element
    items.sort(function(first, second) {
        return second[1] - first[1];
    });

    // Create a new array with only the first 5 items
    const suggestions = items.map(row => row[0]).slice(0, 5);
    console.log("suggestions:", suggestions);

    return suggestions;
}

// Update dictionary for remaining words
function update_dictionary(valid_words, user_words, user_colors) {
    if (user_words.length === 0) return valid_words;

    const constraints = update_constraints(user_words, user_colors);
    const filtered = new Set();

    for (const word of valid_words) {
        const lower = word.toLowerCase();
        let valid = true;

        // Positional checks
        for (let j = 0; j < 5; j++) {
            const letter = lower[j];
            if (constraints.required_positions[j] && letter !== constraints.required_positions[j]) {
                valid = false;
                break;
            }
            if (constraints.forbidden_positions[j].has(letter)) {
                valid = false;
                break;
            }
        }

        if (!valid) continue;

        // Count occurrences
        const counts = {};
        for (const ch of lower) counts[ch] = (counts[ch] || 0) + 1;

        // Check letter count limits
        for (const [ch, range] of Object.entries(constraints.letterCounts)) {
            const n = counts[ch] || 0;
            if (n < range.min || n > range.max) {
                valid = false;
                break;
            }
        }

        // Check required letters exist
        for (const l of constraints.required_letters) {
            if (!lower.includes(l)) {
                valid = false;
                break;
            }
        }

        // Fully forbidden letters (never appear at all)
        for (const l of constraints.forbidden_letters) {
            if (lower.includes(l)) {
                valid = false;
                break;
            }
        }

        if (valid) filtered.add(word);
    }

    console.log("Filtered words:", filtered.size);
    return filtered;
}

// Build and update constraints for filtering dictionary words based on user guesses
function update_constraints(user_words, user_colors) {
    const constraints = {
        required_positions: Array(5).fill(null),
        forbidden_positions: Array.from({ length: 5 }, () => new Set()),
        required_letters: new Set(),
        forbidden_letters: new Set(),
        letterCounts: {} // e.g. { 'p': { min: 1, max: 2 } }
    };

    for (let i = 0; i < user_words.length; i++) {
        const guess = user_words[i].toLowerCase();
        const feedback = user_colors[i];
        const counted = {}; // track per-guess letter occurrences

        // First pass: handle greens
        for (let j = 0; j < 5; j++) {
            const letter = guess[j];
            const color = feedback[j];

            if (color === "green") {
                constraints.required_positions[j] = letter;
                constraints.required_letters.add(letter);
                counted[letter] = (counted[letter] || 0) + 1;

                constraints.letterCounts[letter] = constraints.letterCounts[letter] || { min: 0, max: 5 };
                constraints.letterCounts[letter].min = Math.max(constraints.letterCounts[letter].min, counted[letter]);
            }
        }

        // Second pass: handle yellows
        for (let j = 0; j < 5; j++) {
            const letter = guess[j];
            const color = feedback[j];

            if (color === "yellow") {
                constraints.forbidden_positions[j].add(letter);
                constraints.required_letters.add(letter);
                counted[letter] = (counted[letter] || 0) + 1;

                constraints.letterCounts[letter] = constraints.letterCounts[letter] || { min: 0, max: 5 };
                constraints.letterCounts[letter].min = Math.max(constraints.letterCounts[letter].min, counted[letter]);
            }
        }

        // Third pass: handle grays (after greens/yellows are counted)
        for (let j = 0; j < 5; j++) {
            const letter = guess[j];
            const color = feedback[j];

            if (color === "gray") {
                const used = counted[letter] || 0;

                // If we've already confirmed this letter appears, cap it at that count
                if (constraints.letterCounts[letter]) {
                    constraints.letterCounts[letter].max = constraints.letterCounts[letter].min;
                } else {
                    constraints.letterCounts[letter] = { min: 0, max: 0 };
                    constraints.forbidden_letters.add(letter);
                }
            }
        }
    }

    return constraints;
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