import json

with open("words.txt", "r", encoding="utf-8") as f:
    words = f.read().split()

with open("wordle_words.json", "w", encoding="utf-8") as f:
    json.dump(words, f, indent=4)