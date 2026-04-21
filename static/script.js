let memoryChart;
let holeChart;
let colorMap = {};
let colors = ["#ff6b6b","#6bcB77","#4d96ff","#ffd93d"];

function getColor(pid){
 if(!colorMap[pid]){
  colorMap[pid]=colors[Object.keys(colorMap).length%colors.length];
 }
 return colorMap[pid];
}

function showTab(id){
 document.querySelectorAll(".tab").forEach(t=>t.style.display="none");
 document.getElementById(id).style.display="block";
 document.querySelectorAll(".tabs button").forEach(b=>b.classList.remove("active"));
 document.querySelector(`button[onclick="showTab('${id}')"]`).classList.add("active");
}

function initChart(){
    const ctx1 = document.getElementById("memoryChart").getContext("2d");
    const ctx2 = document.getElementById("holeChart").getContext("2d");

    // Memory chart
    memoryChart = new Chart(ctx1, {
        type: "doughnut",
        data: {
            labels: ["Used", "Free"],
            datasets: [{ data: [0, 0] }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    // Hole chart
    holeChart = new Chart(ctx2, {
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

function render(memory,stats,history){
 let mem=document.getElementById("memory");
 mem.innerHTML="";
 memory.forEach(c=>{
  let d=document.createElement("div");
  d.className="block";
  if(c){d.style.backgroundColor=getColor(c); d.innerText=c;}
  else d.classList.add("free");
  mem.appendChild(d);
  // Hole graph update
if(holeChart){
    let holes = getHoles(memory);

    holeChart.data.labels = holes.map((_, i) => "Hole " + (i+1));
    holeChart.data.datasets[0].data = holes;

    holeChart.data.datasets[0].backgroundColor =
        holes.map((_, i) => `hsl(${i*70}, 70%, 60%)`);

    holeChart.update();
}
 });

 document.getElementById("stats").innerText=
 `Total:${stats.total} Used:${stats.used} Free:${stats.free}`;

 memoryChart.data.datasets[0].data=[stats.used,stats.free];
 memoryChart.update();

 let h=document.getElementById("history");
 h.innerHTML="";
 history.slice().reverse().forEach(x=>{
  let li=document.createElement("li"); li.innerText=x; h.appendChild(li);
 });
}

function allocate(){
 fetch("/allocate",{method:"POST",headers:{"Content-Type":"application/json"},
 body:JSON.stringify({size:document.getElementById("size").value,
 strategy:document.getElementById("strategy").value})})
 .then(r=>r.json()).then(d=>render(d.memory,d.stats,d.history));
}

function deallocate(){
 fetch("/deallocate",{method:"POST",headers:{"Content-Type":"application/json"},
 body:JSON.stringify({pid:document.getElementById("pid").value})})
 .then(r=>r.json()).then(d=>render(d.memory,d.stats,d.history));
}

function reset(){
 fetch("/reset",{method:"POST",headers:{"Content-Type":"application/json"},
 body:JSON.stringify({size:document.getElementById("memSize").value})})
 .then(r=>r.json()).then(d=>{colorMap={}; render(d.memory,d.stats,d.history);});
}

function runPaging(){
    fetch("/paging", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
            pages:document.getElementById("pages").value,
            frames:document.getElementById("frames").value,
            algo:document.getElementById("algo").value
        })
    })
    .then(r=>r.json())
    .then(d=>{
        let pages = d.pages;
        let frames = d.frames;
        let history = d.history;

        let table = `<table border="1" style="margin:auto; border-collapse:collapse;">`;

        // Header
        table += `<tr>
                    <th>Step</th>
                    <th>Page</th>`;

        for(let i=0;i<frames;i++){
            table += `<th>Frame ${i+1}</th>`;
        }

        table += `<th>Status</th></tr>`;

        let prev = [];

        history.forEach((frame, i)=>{
            let filled = frame.concat(Array(frames - frame.length).fill("-"));

            let status = prev.includes(pages[i]) ? "Hit" : "Fault";

            table += `<tr>
                        <td>${i+1}</td>
                        <td>${pages[i]}</td>`;

            filled.forEach(f=>{
                table += `<td>${f}</td>`;
            });

            table += `<td style="color:${status==="Fault"?"red":"lime"}">${status}</td></tr>`;

            prev = [...frame];
        });

        table += `</table>`;
        table += `<br><b>Total Page Faults: ${d.faults}</b>`;

        document.getElementById("pagingResult").innerHTML = table;
    });
}

function runSegmentation(){
    let lines = document.getElementById("segTable").value.split("\n");
    let table = lines.map(line => line.split(" ").map(Number));

    let segment = parseInt(document.getElementById("segment").value);
    let offset = parseInt(document.getElementById("offset").value);

    fetch("/segmentation", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
            table:table,
            segment:segment,
            offset:offset
        })
    })
    .then(r=>r.json())
    .then(d=>{
        let output = "<h3>Segment Table</h3>";
        output += "<table border='1' style='margin:auto;'>";

        output += "<tr><th>Segment</th><th>Base</th><th>Limit</th></tr>";

        table.forEach((row, i)=>{
            output += `<tr><td>${i}</td><td>${row[0]}</td><td>${row[1]}</td></tr>`;
        });

        output += "</table><br>";

        output += `<b>Logical Address:</b> (${segment}, ${offset})<br><br>`;

        if(typeof d.result === "number"){
            let base = table[segment][0];
            let limit = table[segment][1];

            output += `Base = ${base}<br>`;
            output += `Limit = ${limit}<br><br>`;

            output += `Offset < Limit → Valid<br><br>`;

            output += `<b>Physical Address = ${d.result}</b>`;
        } else {
            output += `<b style="color:red">${d.result}</b>`;
        }

        document.getElementById("segResult").innerHTML = output;
    });
}

function getHoles(memory){
    let holes = [];
    let i = 0;

    while(i < memory.length){
        if(memory[i] === null){
            let j = i;
            while(j < memory.length && memory[j] === null) j++;
            holes.push(j - i);
            i = j;
        } else {
            i++;
        }
    }
    return holes;
}

function runVM(){
    let table = document.getElementById("pageTable").value
        .split("\n")
        .map(x => parseInt(x));

    fetch("/virtual", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            logical: document.getElementById("logical").value,
            page_size: document.getElementById("pageSize").value,
            table: table
        })
    })
    .then(r => r.json())
    .then(d => {
        let out = "";

        if(d.error){
            out = `<b style="color:red">${d.error}</b>`;
        } else {
            out += `<b>Page Number:</b> ${d.page}<br>`;
            out += `<b>Offset:</b> ${d.offset}<br>`;
            out += `<b>Frame:</b> ${d.frame}<br><br>`;

            out += `<b>Physical Address = ${d.physical_address}</b>`;
        }

        document.getElementById("vmResult").innerHTML = out;
    });
}

window.onload=initChart;