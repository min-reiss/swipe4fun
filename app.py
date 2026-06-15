from flask import Flask, render_template, jsonify
import json
import os

app = Flask(__name__)


# Загрузка данных из JSON файлов
def load_characters():
    with open('data/characters.json', 'r', encoding='utf-8') as f:
        return json.load(f)

def load_dialogues():
    with open('data/dialogues.json', 'r', encoding='utf-8') as f:
        return json.load(f)

CHARACTERS = load_characters()
DIALOGS = load_dialogues()

@app.route("/")
def index():
    """Стартовая страница"""
    return render_template("index.html")

@app.route("/swipe")
def swipe():
    """Страница со свайпами"""
    return render_template("swipe.html", characters=CHARACTERS)

@app.route("/chat/<int:character_id>")
def chat(character_id):
    """Страница чата с выбранным персонажем"""
    character = next((c for c in CHARACTERS if c["id"] == character_id), None)
    dialog = DIALOGS.get(str(character_id))
    
    if not character or not dialog:
        return "Персонаж не найден", 404
    
    return render_template("chat.html", 
                         character=character, 
                         dialog=dialog)

@app.route("/result/<int:character_id>/<ending_key>")
def result(character_id, ending_key):
    """Страница с результатом"""
    dialog = DIALOGS.get(str(character_id))
    ending = dialog["endings"].get(ending_key) if dialog else None
    
    if not ending:
        return "Концовка не найдена", 404
    
    return render_template("result.html", ending=ending)

# API для получения данных (опционально)
@app.route("/api/characters")
def api_characters():
    return jsonify(CHARACTERS)

@app.route("/api/dialogues/<int:character_id>")
def api_dialogues(character_id):
    return jsonify(DIALOGS.get(str(character_id), {}))

if __name__ == "__main__":
    app.run(debug=True, port=5000)