from flask import Flask, send_file, send_from_directory

app = Flask(__name__, static_folder='../app/build/static')

@app.route("/")
def index():
    return send_file('../app/build/index.html')

@app.route("/<path:path>")
def send_dynamic_files(path):
    return send_from_directory('../dynamic', path)
