function calculate() {
    const processes = document.getElementById('processes').value.trim().split('\n').map((line, index) => {
        const [cpuTime, arrivalTime, priority] = line.split(',').map(Number);    // JS結構賦值
        return {processId: index + 1, cpuTime, arrivalTime, priority, remainingTime: cpuTime, startTime: null, endTime: null };
    });
    const rrQuantum = parseInt(document.getElementById('rrQuantum').value, 10);
    const algorithm = document.getElementById('algorithm').value;

    let ganttData = [];
    let avgResponseTime = 0;
    let avgWaitingTime = 0;

    if (algorithm === 'fcfs') {
        ganttData = fcfs(processes);
    } else if (algorithm === 'srt') {
        ganttData = srt(processes);
    } else if (algorithm === 'priority') {
        ganttData = priority(processes);
    } else if (algorithm === 'rr') {
        ganttData = rr(processes, rrQuantum);
    }

    // Calculate average times
    const n = processes.length;
    avgResponseTime = processes.reduce((sum, p) => sum + (p.endTime - p.arrivalTime), 0) / n;
    avgWaitingTime = processes.reduce((sum, p) => sum + (p.endTime - p.arrivalTime - p.cpuTime), 0) / n;

    // Calculate Gantt Chart display weight
    const screenWidth = window.innerWidth;
    const totalTime = ganttData[ganttData.length - 1].end;
    const displayWeight = screenWidth / totalTime * 0.8;

    // Update the Gantt Chart
    const chartContainer = document.getElementById('chart');
    chartContainer.innerHTML = '';
    ganttData.forEach(item => {
        const div = document.createElement('div');
        div.classList.add('chart-bar');
        div.style.width = `${(item.end - item.start)*displayWeight}px`;
        div.textContent = item.processId;

        const startTimeLabel = document.createElement('div');
        startTimeLabel.classList.add('time-label');
        startTimeLabel.textContent = item.start;

        chartContainer.appendChild(startTimeLabel);
        chartContainer.appendChild(div);
    });
    // Add last time lable
    const endTimeLabel = document.createElement('div');
    endTimeLabel.classList.add('time-label');
    endTimeLabel.textContent =  ganttData[ganttData.length - 1].end;
    chartContainer.appendChild(endTimeLabel);

    // Update times
    document.getElementById('avgResponseTime').textContent = avgResponseTime.toFixed(2);
    document.getElementById('avgWaitingTime').textContent = avgWaitingTime.toFixed(2);
}

function fcfs(processes) {
    let currentTime = 0;
    let ganttData = [];
    processes.sort((a, b) => a.arrivalTime - b.arrivalTime);
    currentTime = processes[0].arrivalTime;
    processes.forEach(process => {
        if (process.arrivalTime > currentTime) {
            ganttData.push({ processId: 'null', start: currentTime, end: process.arrivalTime });
            currentTime = process.arrivalTime;
        }
        process.startTime = currentTime;
        currentTime += process.cpuTime;
        process.endTime = currentTime;
        ganttData.push({ processId: `P${process.processId}`, start: process.startTime, end: process.endTime });
    });
    return ganttData;
}

function srt(processes) {
    let currentTime = 0;
    let ganttData = [];
    let listing = [...processes]
    let processing = [];
    listing.sort((a, b) => a.arrivalTime - b.arrivalTime);
    currentTime = listing[0].arrivalTime;
    while (listing.length > 0 || processing.length > 0) {
        // add arrival process to processing queue
        while (listing.length > 0 && listing[0].arrivalTime <= currentTime) {
            processing.push(listing.shift())
        }
        // processing queue sort by remaining time
        processing.sort((a, b) => a.remainingTime - b.remainingTime);
        
        if (processing.length > 0) {
            // handle the process with the shortest remaining time
            let process = processing[0];
            // determine process time by next arrival process
            pt = listing.length > 0 ? Math.min(process.remainingTime, listing[0].arrivalTime - currentTime) : process.remainingTime;
            process.startTime = currentTime;
            currentTime += pt;
            process.remainingTime -= pt;
            process.endTime = currentTime;
            ganttData.push({ processId: `P${process.processId}`, start: process.startTime, end: process.endTime });
            // remove completed processes from processing queue
            processing = processing.filter(p => p.remainingTime > 0);
        } else {
            ganttData.push({ processId: 'null', start: currentTime, end: listing[0].arrivalTime });
            currentTime = listing[0].arrivalTime;
        }
    }
        
    return mergeGanttData(ganttData);
}

function priority(processes) {
    let currentTime = 0;
    let ganttData = [];
    let listing = [...processes]
    let processing = [];
    listing.sort((a, b) => a.arrivalTime - b.arrivalTime);
    currentTime = listing[0].arrivalTime;
    while (listing.length > 0 || processing.length > 0) {
        // add arrival process to processing queue
        while (listing.length > 0 && listing[0].arrivalTime <= currentTime) {
            processing.push(listing.shift());
        }
        // processing queue sort by each priority
        processing.sort((a, b) => a.priority - b.priority);
        
        if (processing.length > 0) {
            // handle the process with the highest priority
            let process = processing[0];
            pt = process.remainingTime;
            process.startTime = currentTime;
            currentTime += pt;
            process.remainingTime -= pt;
            process.endTime = currentTime;
            ganttData.push({ processId: `P${process.processId}`, start: process.startTime, end: process.endTime });
            // remove completed processes from processing queue
            processing = processing.filter(p => p.remainingTime > 0);  
        } else {
            ganttData.push({ processId: 'null', start: currentTime, end: listing[0].arrivalTime });
            currentTime = listing[0].arrivalTime;
        }
        
    }
    return ganttData;
}

function rr(processes, quantum) {
    let currentTime = 0;
    let ganttData = [];
    let listing = [...processes]
    let processingQueue = [];
    listing.sort((a, b) => a.arrivalTime - b.arrivalTime);
    currentTime = listing[0].arrivalTime;
    while (listing.length > 0 || processingQueue.length > 0) {
        // alert('current time : ' + currentTime + '\n' + JSON.stringify(processingQueue))
        let process = null;
        if (processingQueue.length > 0) {
            // Queue FIFO(FCFS)
            process = processingQueue.shift();
            // determine process time by next rrQuantum
            pt = Math.min(process.remainingTime, quantum)
            process.startTime = currentTime;
            currentTime += pt;
            process.remainingTime -= pt;
            process.endTime = currentTime;
            ganttData.push({ processId: `P${process.processId}`, start: process.startTime, end: process.endTime });
        } else if (processes.length !== listing.length) {
            ganttData.push({ processId: 'null', start: currentTime, end: listing[0].arrivalTime });
            currentTime = listing[0].arrivalTime;
        }
        // add arrival process to processingQueue
        while (listing.length > 0 && listing[0].arrivalTime <= currentTime) {
            processingQueue.push(listing.shift());
        }
        // if current process not complite, push it to the end of the processingQueue
        if (process != null && process.remainingTime > 0) {    // in js, undefined > 0 == false
            processingQueue.push(process)
        } 
    }
    return ganttData;
}

function mergeGanttData(ganttData) {
    let mergedData = [];
    alert('Gantt Data Merge : \n' + JSON.stringify(ganttData))

    ganttData.forEach(item => {
        if (mergedData.length <= 0 || mergedData[mergedData.length - 1].processId !== item.processId) {
            mergedData.push({ ...item });
        } else {
            mergedData[mergedData.length - 1].end = item.end;
        }
    })
    return mergedData;
}
