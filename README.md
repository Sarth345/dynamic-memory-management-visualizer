# Dynamic Memory Management Visualizer

🔗 **Live Demo:** [Click Here to View](YOUR_LINK_HERE)

## Overview

This project is a web-based Dynamic Memory Management Visualizer developed using Python (Flask), HTML, CSS, and JavaScript. It demonstrates how memory is allocated and deallocated at runtime using different contiguous memory allocation strategies.

The application provides an interactive interface to visualize memory usage, allocation behavior, and fragmentation in real time.

---

## Features

* Dynamic memory allocation and deallocation
* Support for multiple allocation strategies:

  * First Fit
  * Best Fit
  * Worst Fit
  * Next Fit
* Visual representation of memory blocks
* Unique color mapping for each process
* Memory usage graph (Used vs Free)
* Fragmentation visualization (free memory holes)
* Allocation history tracking
* Adjustable memory size
* Smooth animation for allocation

---

## Technologies Used

* Backend: Python (Flask)
* Frontend: HTML, CSS, JavaScript
* Visualization: Chart.js

---

## Project Structure

```
memory-visualizer/
│
├── app.py
│
├── memory/
│   └── allocator.py
│
├── templates/
│   └── index.html
│
├── static/
│   ├── style.css
│   └── script.js
```

---

## Installation and Setup

### 1. Clone the repository

```
git clone https://github.com/your-username/memory-visualizer.git
cd memory-visualizer
```

### 2. Install dependencies

```
pip install flask
```

### 3. Run the application

```
python app.py
```

### 4. Open in browser

```
http://127.0.0.1:5000
```

---

## How It Works

The system simulates contiguous memory allocation where memory is divided into blocks. When a process requests memory, the selected allocation algorithm determines the most suitable location.

* First Fit: Allocates the first available block
* Best Fit: Allocates the smallest sufficient block
* Worst Fit: Allocates the largest available block
* Next Fit: Continues allocation from the last allocated position

The visualizer updates dynamically to reflect memory allocation, deallocation, and fragmentation.

---

## Key Concepts Demonstrated

* Dynamic Memory Allocation
* Contiguous Memory Allocation
* External Fragmentation
* Allocation Strategy Comparison

---

## Limitations

* Only contiguous allocation is implemented
* Does not include paging or segmentation
* Internal fragmentation is not explicitly visualized

---

## Future Enhancements

* Paging and segmentation visualization
* Buddy system implementation
* Memory compaction simulation
* Time-based memory usage graphs
* Advanced animation for allocation algorithms

---

## Conclusion

This project provides a practical and interactive way to understand dynamic memory management concepts in operating systems. It helps visualize how different allocation strategies impact memory utilization and fragmentation.

---

## Author

1-Sarthak.....
2-Aman Pandey
