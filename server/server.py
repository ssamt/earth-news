from flask import Flask, send_file, send_from_directory

app = Flask(__name__, static_folder='../app/build/static')

@app.route("/")
def index():
    return send_file('../app/build/index.html')

@app.route("/dynamic/<path:path>")
def send_dynamic_files(path):
    return send_from_directory('../dynamic', path)
@app.route("/<path:path>")
def send_static_files(path):
    return send_from_directory('../app/build', path)

if __name__ == "__main__":
    app.run(debug=True, port=5000)