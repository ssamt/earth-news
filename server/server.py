from flask import Flask, render_template, send_from_directory

app = Flask(__name__, static_folder='../app/build/static', template_folder='../app/build')

@app.route("/")
def index():
    return render_template('index.html')

@app.route("/<path:path>")
def send_dynamic_files(path):
    # Using request args for path will expose you to directory traversal attacks
    return send_from_directory('../dynamic', path)
