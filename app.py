from flask import Flask, render_template, request, jsonify
import random
from datetime import datetime

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/simulate', methods=['POST'])
def simulate():
    data = request.json
    
    # Generate random tasks
    tasks = []
    for i in range(data['taskCount']):
        task_type = random.choice(['CPU-bound', 'I/O-bound', 'Memory-bound'])
        tasks.append({
            'id': i + 1,
            'type': task_type,
            'burst_time': random.randint(1, 10),
            'deadline': random.randint(5, 20) if random.random() > 0.7 else None
        })
    
    # Simulate scheduling
    results = {
        'algorithm': data['algorithm'],
        'power_mode': data['powerMode'],
        'tasks': tasks,
        'energy_used': random.uniform(50, 200),
        'avg_latency': random.uniform(5, 25),
        'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    
    return jsonify(results)

if __name__ == '__main__':
    app.run(debug=True)
