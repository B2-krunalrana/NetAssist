from flask import Flask, request, jsonify
from flask_cors import CORS
from lambda_function import handler

app = Flask(__name__)
# allow cross‑origin requests from the frontend development server
CORS(app)

@app.route("/api/ticket", methods=["POST"])
def ticket():
    """Receive ticket data from the frontend and forward to the lambda handler."""
    data = request.get_json(force=True)
    result = handler(data)
    return jsonify(result)


if __name__ == "__main__":
    # listen on localhost port 5000 by default
    app.run(host="127.0.0.1", port=5000, debug=True)
