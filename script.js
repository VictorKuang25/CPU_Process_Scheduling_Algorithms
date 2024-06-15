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
    chartContainer.innerHTML = '';
    ganttData.forEach(item => {
        const div = document.createElement('div');
        div.classList.add('chart-bar');
        div.style.width = `${item.end - item.start}0px`;
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
    processes.forEach(process => {
        if (currentTime < process.arrivalTime) {
            currentTime = process.arrivalTime;
        }
        process.startTime = currentTime;
        currentTime += process.cpuTime;
        process.endTime = currentTime;
        ganttData.push({ processId: `P${processes.indexOf(process) + 1}`, start: process.startTime, end: process.endTime });
    });
    return ganttData;
}

function srt(processes) {

    return ganttData;
}

function priority(processes) {

    return ganttData;
}

function rr(processes, quantum) {

    return ganttData;
}

function mergeGanttData(ganttData) {

}
