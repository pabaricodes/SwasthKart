import os
import random

from flask import Flask, jsonify

app = Flask(__name__)

ERROR_RATE = float(os.getenv("ERROR_RATE", "0.25"))
RANDOM_SEED = os.getenv("RANDOM_SEED")

if RANDOM_SEED is not None:
    random.seed(RANDOM_SEED)


@app.get("/health")
def health():
    return jsonify({"status": "ok"}), 200


@app.get("/")
def hello_world():
    if random.random() < ERROR_RATE:
        return jsonify({"error": "Random error generated"}), 500
    return jsonify({"message": "Hello, World!"}), 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
