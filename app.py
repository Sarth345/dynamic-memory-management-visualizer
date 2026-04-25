from flask import Flask, render_template, request, jsonify
from memory.allocator import MemoryAllocator
from memory.paging import Paging
from memory.segmentation import Segmentation
from memory.virtual_memory import VirtualMemory

app = Flask(__name__)

allocator = MemoryAllocator(20)
paging = Paging()
segmentation = Segmentation()
vm = VirtualMemory()
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

    return jsonify({"memory": allocator.memory, "stats": allocator.stats(), "history": history})

@app.route("/deallocate", methods=["POST"])
def deallocate():
    pid = request.json["pid"]
    allocator.deallocate(pid)
    history.append(f"DEALLOCATED → {pid}")

    return jsonify({"memory": allocator.memory, "stats": allocator.stats(), "history": history})

@app.route("/reset", methods=["POST"])
def reset():
    global allocator, history
    size = int(request.json["size"])
    allocator = MemoryAllocator(size)
    history = []
    return jsonify({"memory": allocator.memory, "stats": allocator.stats(), "history": history})

@app.route("/paging", methods=["POST"])
def paging_route():
    data = request.json
    pages = list(map(int, data["pages"].split()))
    frames = int(data["frames"])
    algo = data["algo"]

    if algo == "fifo":
        history, faults = paging.fifo(pages, frames)
    else:
        history, faults = paging.lru(pages, frames)

    return jsonify({
        "history": history,
        "faults": faults,
        "pages": pages,
        "frames": frames
    })

@app.route("/segmentation", methods=["POST"])
def segmentation_route():
    data = request.json
    table = data["table"]
    segment = int(data["segment"])
    offset = int(data["offset"])

    result = segmentation.translate(table, segment, offset)
    return jsonify({"result": result})

@app.route("/virtual", methods=["POST"])
def virtual_memory():
    data = request.json

    logical = int(data["logical"])
    page_size = int(data["page_size"])
    table = data["table"]

    result = vm.translate(logical, page_size, table)

    return jsonify(result)

if __name__ == "__main__":
    app.run()