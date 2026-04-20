from flask import Flask, render_template, request, jsonify
from memory.allocator import MemoryAllocator

app = Flask(__name__)

allocator = MemoryAllocator(20)
history = []

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/allocate", methods=["POST"])
def allocate():
    data = request.json
    size = int(data["size"])
    strategy = data["strategy"]

    success, result = allocator.allocate(size, strategy)

    history.append(f"{strategy.upper()} → {result}")

    return jsonify({
        "memory": allocator.memory,
        "stats": allocator.stats(),
        "history": history
    })

@app.route("/deallocate", methods=["POST"])
def deallocate():
    pid = request.json["pid"]
    allocator.deallocate(pid)

    history.append(f"DEALLOCATED → {pid}")

    return jsonify({
        "memory": allocator.memory,
        "stats": allocator.stats(),
        "history": history
    })

@app.route("/reset", methods=["POST"])
def reset():
    global allocator, history
    size = int(request.json["size"])
    allocator = MemoryAllocator(size)
    history = []

    return jsonify({
        "memory": allocator.memory,
        "stats": allocator.stats(),
        "history": history
    })

if __name__ == "__main__":
    app.run(debug=True)