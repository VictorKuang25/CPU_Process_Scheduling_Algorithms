function calculate() {
    const processes = document.getElementById('processes').value.trim().split('\n').map(line => {
        const [cpuTime, arrivalTime, priority] = line.split(',').map(Number);
        return { cpuTime, arrivalTime, priority, remainingTime: cpuTime, startTime: null, endTime: null };
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
    avgResponseTime = processes.reduce((sum, p) => sum + (p.startTime - p.arrivalTime), 0) / n;
    avgWaitingTime = processes.reduce((sum, p) => sum + (p.endTime - p.arrivalTime - p.cpuTime), 0) / n;

    // Update the Gantt Chart
    const chartContainer = document.getElementById('chart');
    const timelineContainer = document.getElementById('timeline');
    chartContainer.innerHTML = '';
    timelineContainer.innerHTML = '';
    ganttData.forEach(item => {
        const div = document.createElement('div');
        div.classList.add('chart-bar');
        div.style.width = `${item.end - item.start}0px`;
        div.textContent = item.process;
        chartContainer.appendChild(div);
        
        const timeDiv = document.createElement('div');
        timeDiv.classList.add('timeline-marker');
        timeDiv.style.left = `${item.start}0px`;
        timeDiv.textContent = item.start;
        timelineContainer.appendChild(timeDiv);
    });
    // 最後的時間節點
    const endTimeDiv = document.createElement('div');
    endTimeDiv.classList.add('timeline-marker');
    endTimeDiv.style.left = `${ganttData[ganttData.length - 1].end}0px`;
    endTimeDiv.textContent = ganttData[ganttData.length - 1].end;
    timelineContainer.appendChild(endTimeDiv);

    // Update the times
    document.getElementById('avgResponseTime').textContent = avgResponseTime.toFixed(2);
    document.getElementById('avgWaitingTime').textContent = avgWaitingTime.toFixed(2);
}

function fcfs(processes) {
    let currentTime = 0;
    let ganttData = [];
    processes.sort((a, b) => a.arrivalTime - b.arrivalTime);
    processes.forEach(process => {
        if (currentTime < process.arrivalTime) {
            currentTime = process.arrivalTime;
        }
        process.startTime = currentTime;
        currentTime += process.cpuTime;
        process.endTime = currentTime;
        ganttData.push({ process: `P${processes.indexOf(process) + 1}`, start: process.startTime, end: process.endTime });
    });
    return ganttData;
}

function srt(processes) {
    let currentTime = 0;
    let completed = 0;
    let ganttData = [];
    while (completed !== processes.length) {
        let minRemainingTime = Infinity;
        let currentProcess = null;
        processes.forEach(process => {
            if (process.arrivalTime <= currentTime && process.remainingTime > 0 && process.remainingTime < minRemainingTime) {
                minRemainingTime = process.remainingTime;
                currentProcess = process;
            }
        });
        if (currentProcess === null) {
            currentTime++;
            continue;
        }
        if (currentProcess.startTime === null) {
            currentProcess.startTime = currentTime;
        }
        ganttData.push({ process: `P${processes.indexOf(currentProcess) + 1}`, start: currentTime, end: currentTime + 1 });
        currentProcess.remainingTime--;
        currentTime++;
        if (currentProcess.remainingTime === 0) {
            currentProcess.endTime = currentTime;
            completed++;
        }
    }
    return mergeGanttData(ganttData);
}

function priority(processes) {
    let currentTime = 0;
    let ganttData = [];
    processes.sort((a, b) => a.priority - b.priority || a.arrivalTime - b.arrivalTime);
    processes.forEach(process => {
        if (currentTime < process.arrivalTime) {
            currentTime = process.arrivalTime;
        }
        process.startTime = currentTime;
        currentTime += process.cpuTime;
        process.endTime = currentTime;
        ganttData.push({ process: `P${processes.indexOf(process) + 1}`, start: process.startTime, end: process.endTime });
    });
    return ganttData;
}

function rr(processes, quantum) {
    let currentTime = 0;
    let ganttData = [];
    let queue = [];
    processes.forEach((process, index) => queue.push(index));

    while (queue.length > 0) {
        let index = queue.shift();
        let process = processes[index];
        if (currentTime < process.arrivalTime) {
            currentTime = process.arrivalTime;
        }
        if (process.startTime === null) {
            process.startTime = currentTime;
        }
        if (process.remainingTime <= quantum) {
            currentTime += process.remainingTime;
            ganttData.push({ process: `P${index + 1}`, start: currentTime - process.remainingTime, end: currentTime });
            process.remainingTime = 0;
            process.endTime = currentTime;
        } else {
            currentTime += quantum;
            ganttData.push({ process: `P${index + 1}`, start: currentTime - quantum, end: currentTime });
            process.remainingTime -= quantum;
            queue.push(index);
        }
    }
    return ganttData;
}

function mergeGanttData(ganttData) {
    let mergedData = [];
    ganttData.forEach(item => {
        if (mergedData.length === 0 || mergedData[mergedData.length - 1].process !== item.process) {
            mergedData.push({ ...item });
        } else {
            mergedData[mergedData.length - 1].end = item.end;
        }
    });
    return mergedData;
}
