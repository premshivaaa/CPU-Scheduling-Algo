document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('simulationForm');
    const taskCountValue = document.getElementById('taskCountValue');
    const taskCountInput = document.getElementById('taskCount');
    const resultsDiv = document.getElementById('results');
    const loadingDiv = document.getElementById('loading');
    
    let energyChart = null;
    
    // Update task count display
    taskCountInput.addEventListener('input', function() {
        taskCountValue.textContent = this.value;
    });
    
    // Handle form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            algorithm: form.algorithm.value,
            taskCount: parseInt(form.taskCount.value),
            powerMode: form.querySelector('input[name="powerMode"]:checked').value
        };
        
        // Show loading, hide results
        loadingDiv.style.display = 'block';
        resultsDiv.classList.add('hidden');
        
        // Send request to server
        fetch('/simulate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            displayResults(data);
            loadingDiv.style.display = 'none';
            resultsDiv.classList.remove('hidden');
        })
        .catch(error => {
            console.error('Error:', error);
            loadingDiv.textContent = 'Error running simulation';
        });
    });
    
    function displayResults(data) {
        // Update metrics
        document.getElementById('energyValue').textContent = data.energy_used.toFixed(2);
        document.getElementById('latencyValue').textContent = data.avg_latency.toFixed(2);
        document.getElementById('algorithmValue').textContent = 
            data.algorithm === 'energy' ? 'Energy-Efficient' : 
            data.algorithm === 'roundRobin' ? 'Round Robin' : 'FIFO';
        
        // Update chart
        updateChart(data);
        
        // Update timeline
        const timeline = document.getElementById('timeline');
        timeline.innerHTML = '';
        
        data.tasks.forEach(task => {
            const item = document.createElement('div');
            item.className = 'timeline-item';
            item.innerHTML = `
                <strong>Task ${task.id}</strong>: ${task.type} 
                (${task.burst_time}ms) 
                ${task.deadline ? '| Deadline: ' + task.deadline + 'ms' : ''}
            `;
            timeline.appendChild(item);
        });
    }
    
    function updateChart(data) {
        const ctx = document.getElementById('energyChart').getContext('2d');
        
        // Destroy previous chart if exists
        if (energyChart) {
            energyChart.destroy();
        }
        
        energyChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Energy Used (mWh)', 'Average Latency (ms)'],
                datasets: [{
                    label: data.algorithm === 'energy' ? 'Energy-Efficient' : 
                          data.algorithm === 'roundRobin' ? 'Round Robin' : 'FIFO',
                    data: [data.energy_used, data.avg_latency],
                    backgroundColor: [
                        'rgba(75, 192, 192, 0.6)',
                        'rgba(54, 162, 235, 0.6)'
                    ],
                    borderColor: [
                        'rgba(75, 192, 192, 1)',
                        'rgba(54, 162, 235, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
});
