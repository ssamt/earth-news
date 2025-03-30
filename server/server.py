from flask import Flask, render_template

app = Flask(__name__, static_folder='../app', template_folder='../app')

@app.route("/")
def index():
    return render_template('index.html')
