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

        const colorBar = document.createElement("div");
        colorBar.classList.add("color-bar", "gray");

        cellDiv.appendChild(input);
        cellDiv.appendChild(colorBar);

        rowDiv.appendChild(cellDiv);
    }

    wordle_board.appendChild(rowDiv);
}

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