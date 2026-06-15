from flask import Flask, render_template, jsonify, make_response
import json
import os

app = Flask(__name__)

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

@app.route("/matches")
def matches():
    """Страница с сеткой кандидатов"""
    return render_template("matches.html", characters=CHARACTERS)

@app.route("/chat/<int:character_id>")
def chat(character_id):
    character = next((c for c in CHARACTERS if int(c["id"]) == character_id), None)
    dialog = DIALOGS.get(str(character_id))
    if not character or not dialog:
        return "Персонаж не найден", 404
    return render_template("chat.html", character=character, dialog=dialog)

@app.route("/result/<int:character_id>/<ending_key>")
def result(character_id, ending_key):
    dialog = DIALOGS.get(str(character_id))
    ending = dialog["endings"].get(ending_key) if dialog else None
    if not ending:
        return "Концовка не найдена", 404
    return render_template("result.html", ending=ending)

@app.route("/reset")
def reset():
    """Сброс прогресса и переход на главную"""
    resp = make_response(render_template("index.html"))
    # Очищаем куки сессии
    resp.set_cookie('likedCharacters', '', expires=0)
    resp.set_cookie('dates', '', expires=0)
    return resp

@app.route("/api/characters")
def api_characters():
    return jsonify(CHARACTERS)

@app.route("/api/dialogues/<int:character_id>")
def api_dialogues(character_id):
    return jsonify(DIALOGS.get(str(character_id), {}))

if __name__ == "__main__":
    app.run(debug=True, port=5000)