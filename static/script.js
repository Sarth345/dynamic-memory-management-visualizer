let memoryChart;
let fragChart;

// Color system for processes
let colorMap = {};
let colors = [
    "#ff6b6b", "#6bcB77", "#4d96ff", "#ffd93d",
    "#845ec2", "#ff9671", "#00c9a7", "#c34a36"
];

function getColor(pid) {
    if (!colorMap[pid]) {
        let index = Object.keys(colorMap).length % colors.length;
        colorMap[pid] = colors[index];
    }
    return colorMap[pid];
}

// Small delay for animation
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Initialize memory usage chart
function initCharts() {
    const ctx1 = document.getElementById("memoryChart").getContext("2d");
    const ctx2 = document.getElementById("fragChart").getContext("2d");

    // Memory chart
    memoryChart = new Chart(ctx1, {
        type: "doughnut",
        data: {
            labels: ["Used", "Free"],
            datasets: [{
                data: [0, 0]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    // Fragmentation chart (holes)
    fragChart = new Chart(ctx2, {
        type: "doughnut",
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: []
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// MAIN RENDER FUNCTION (ONLY ONE)
async function render(memory, stats, history) {
    let memDiv = document.getElementById("memory");
    memDiv.innerHTML = "";

    for (let cell of memory) {
        let div = document.createElement("div");
        div.className = "block";

        if (cell) {
            div.style.backgroundColor = getColor(cell);
            div.innerText = cell;
        } else {
            div.classList.add("free");
        }

        memDiv.appendChild(div);
        await sleep(10); // animation speed
    }

    // Update stats
    document.getElementById("stats").innerHTML =
        `Total: ${stats.total} | Used: ${stats.used} | Free: ${stats.free}`;

    // Update chart
    if (memoryChart) {
        memoryChart.data.datasets[0].data = [stats.used, stats.free];
        memoryChart.update();
    }

    // Fragmentation (holes)
    if (fragChart) {
    let holes = getHoles(memory);

    fragChart.data.labels = holes.map((_, i) => "Hole " + (i + 1));
    fragChart.data.datasets[0].data = holes;

    // generate colors for holes
    fragChart.data.datasets[0].backgroundColor = holes.map((_, i) => 
        `hsl(${i * 60}, 70%, 60%)`
    );

    fragChart.update();
}

    // Update history
    let hist = document.getElementById("history");
    hist.innerHTML = "";
    history.slice().reverse().forEach(h => {
        let li = document.createElement("li");
        li.innerText = h;
        hist.appendChild(li);
    });
}

// Allocate
function allocate() {
    fetch("/allocate", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            size: document.getElementById("size").value,
            strategy: document.getElementById("strategy").value
        })
    })
    .then(res => res.json())
    .then(data => render(data.memory, data.stats, data.history));
}

// Deallocate
function deallocate() {
    fetch("/deallocate", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            pid: document.getElementById("pid").value
        })
    })
    .then(res => res.json())
    .then(data => render(data.memory, data.stats, data.history));
}

// Reset memory
function reset() {
    fetch("/reset", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            size: document.getElementById("memSize").value
        })
    })
    .then(res => res.json())
    .then(data => {
        colorMap = {}; // reset colors
        render(data.memory, data.stats, data.history);
    });
}

function getHoles(memory) {
    let holes = [];
    let i = 0;

    while (i < memory.length) {
        if (memory[i] === null) {
            let j = i;
            while (j < memory.length && memory[j] === null) j++;
            holes.push(j - i);
            i = j;
        } else {
            i++;
        }
    }

    return holes;
}

// Initialize on load
window.onload = initCharts;