from flask import Flask, render_template, jsonify
from data.characters import CHARACTERS
from data.dialogs import DIALOGS

app = Flask(__name__)

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
    dialog = DIALOGS.get(character_id)
    
    if not character or not dialog:
        return "Персонаж не найден", 404
    
    return render_template("chat.html", 
                         character=character, 
                         dialog=dialog)

@app.route("/result/<int:character_id>/<ending_key>")
def result(character_id, ending_key):
    """Страница с результатом"""
    dialog = DIALOGS.get(character_id)
    ending = dialog["endings"].get(ending_key) if dialog else None
    
    if not ending:
        return "Концовка не найдена", 404
    
    return render_template("result.html", ending=ending)

if __name__ == "__main__":
    app.run(debug=True, port=8000)