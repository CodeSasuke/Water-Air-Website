document.addEventListener('DOMContentLoaded', () => {
    initializeCharts();
    setupModelControls();
    startRealTimePredictions();
});

// Add ThingSpeak configuration
const THINGSPEAK_CHANNEL_ID = '2897933';
const THINGSPEAK_READ_API_KEY = 'J5L7FPORSTYKAIR1'; // Replace with your API key

async function fetchSensorData() {
    try {
        const response = await fetch(`https://api.thingspeak.com/channels/${THINGSPEAK_CHANNEL_ID}/feeds.json?api_key=${THINGSPEAK_READ_API_KEY}&results=1`);
        const data = await response.json();
        const latestFeed = data.feeds[0];
        
        return {
            temperature: parseFloat(latestFeed.field1),
            humidity: parseFloat(latestFeed.field2),
            tds: parseFloat(latestFeed.field4),
            airQuality: parseInt(latestFeed.field6),
            lpg: parseFloat(latestFeed.field5)
        };
    } catch (error) {
        console.error('Error fetching sensor data:', error);
        return null;
    }
}

function initializeCharts() {
    // Feature Importance Chart
    const featureCtx = document.getElementById('featureChart').getContext('2d');
    new Chart(featureCtx, {
        type: 'bar',
        data: {
            labels: ['Temperature', 'Humidity', 'TDS', 'LPG', 'Air Quality'],
            datasets: [{
                label: 'Feature Importance',
                data: [0.8, 0.6, 0.9, 0.4, 0.7],
                backgroundColor: '#3498db'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            }
        }
    });

    // Model Performance Chart
    setupPerformanceChart();
    setupTrendsChart();
}

function setupModelControls() {
    const trainBtn = document.getElementById('trainModel');
    trainBtn.addEventListener('click', async () => {
        trainBtn.disabled = true;
        trainBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Training...';
        
        try {
            await trainModel();
            trainBtn.innerHTML = '<i class="fas fa-check"></i> Trained';
        } catch (error) {
            trainBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Error';
        } finally {
            setTimeout(() => {
                trainBtn.disabled = false;
                trainBtn.innerHTML = '<i class="fas fa-sync"></i> Train Model';
            }, 2000);
        }
    });
}

function startRealTimePredictions() {
    updatePredictions();
    setInterval(updatePredictions, 5000); // Update every 5 seconds
}

// Modify updatePredictions function
async function updatePredictions() {
    const prediction = await predictAirQuality();
    
    if (prediction) {
        const airQualityText = {
            1: 'Excellent',
            2: 'Moderate',
            3: 'Bad'
        };

        document.getElementById('airQuality').textContent = 
            `Predicted: ${airQualityText[prediction.predictedValue]}`;
        document.getElementById('airConfidence').textContent = 
            prediction.confidence;
        
        // Update prediction chart
        updatePredictionChart(prediction.historicalPattern);
    }
}

function updatePredictionChart(historicalPattern) {
    const ctx = document.getElementById('trendsChart').getContext('2d');
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array.from({length: 24}, (_, i) => `${i}:00`),
            datasets: [{
                label: 'Historical Air Quality Pattern',
                data: Object.values(historicalPattern).map(values => 
                    values.reduce((a, b) => a + b, 0) / values.length
                ),
                borderColor: '#3498db',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 3,
                    ticks: {
                        stepSize: 1,
                        callback: function(value) {
                            return ['', 'Excellent', 'Moderate', 'Bad'][value];
                        }
                    }
                }
            }
        }
    });
}

function checkAnomalies(predictions) {
    const anomalyContainer = document.getElementById('anomalyContainer');
    anomalyContainer.innerHTML = '';

    if (predictions.anomalyScore > 0.7) {
        addAnomaly('High anomaly score detected', 'critical');
    }
}

function addAnomaly(message, severity) {
    const anomalyElement = document.createElement('div');
    anomalyElement.className = `anomaly-card ${severity}`;
    anomalyElement.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${message}</span>
    `;
    document.getElementById('anomalyContainer').appendChild(anomalyElement);
}

document.addEventListener('DOMContentLoaded', () => {
    initializeData();
    setupTrendsChart();
    setInterval(updateReadings, 5000); // Update every 5 seconds
});

function initializeData() {
    // Simulate initial sensor readings
    updateReadings();
}

// Modify updateReadings to use real data
async function updateReadings() {
    const readings = await fetchSensorData();
    
    if (readings) {
        updateDisplay(readings);
        checkAlerts(readings);
    } else {
        // Fallback to simulated data if API call fails
        const simulatedReadings = {
            airQuality: Math.floor(Math.random() * 3) + 1,
            tds: Math.floor(Math.random() * 1000),
            humidity: Math.floor(Math.random() * 100),
            temperature: 20 + Math.random() * 15,
            lpg: Math.floor(Math.random() * 1000)
        };
        updateDisplay(simulatedReadings);
        checkAlerts(simulatedReadings);
    }
}

function updateDisplay(readings) {
    // Update Air Quality
    const airQualityText = {
        1: 'Excellent',
        2: 'Moderate',
        3: 'Bad'
    };
    const airQualityClass = {
        1: 'excellent',
        2: 'moderate',
        3: 'bad'
    };
    
    document.getElementById('airQuality').textContent = airQualityText[readings.airQuality];
    document.getElementById('airQualityStatus').className = `status ${airQualityClass[readings.airQuality]}`;
    
    // Update other readings
    document.getElementById('tdsValue').textContent = `${readings.tds} ppm`;
    document.getElementById('humidity').textContent = `${readings.humidity}%`;
    document.getElementById('temperature').textContent = `${readings.temperature.toFixed(1)}°C`;
    document.getElementById('lpgLevel').textContent = `${readings.lpg} ppm`;
}

function checkAlerts(readings) {
    const anomalyContainer = document.getElementById('anomalyContainer');
    anomalyContainer.innerHTML = ''; // Clear previous alerts

    // Check for anomalies
    if (readings.airQuality === 3) {
        addAlert('Poor Air Quality Detected', 'high');
    }
    if (readings.tds > 800) {
        addAlert('High TDS Levels', 'medium');
    }
    if (readings.lpg > 800) {
        addAlert('High LPG Concentration', 'high');
    }
}

function addAlert(message, severity) {
    const alertElement = document.createElement('div');
    alertElement.className = `alert-card ${severity}`;
    alertElement.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${message}</span>
    `;
    document.getElementById('anomalyContainer').appendChild(alertElement);
}

// Add historical data fetching for trends
async function fetchHistoricalData() {
    try {
        const response = await fetch(`https://api.thingspeak.com/channels/${THINGSPEAK_CHANNEL_ID}/feeds.json?api_key=${THINGSPEAK_READ_API_KEY}&results=24`);
        const data = await response.json();
        
        return data.feeds.map(feed => ({
            timestamp: new Date(feed.created_at),
            temperature: parseFloat(feed.field1),
            humidity: parseFloat(feed.field2),
            tds: parseFloat(feed.field3),
            airQuality: parseInt(feed.field4),
            lpg: parseFloat(feed.field5)
        }));
    } catch (error) {
        console.error('Error fetching historical data:', error);
        return null;
    }
}

// Modify setupTrendsChart to use historical data
async function setupTrendsChart() {
    const historicalData = await fetchHistoricalData();
    if (!historicalData) return;

    const ctx = document.getElementById('trendsChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: historicalData.map(d => d.timestamp.toLocaleTimeString()),
            datasets: [{
                label: 'Air Quality Index',
                data: historicalData.map(d => d.airQuality),
                borderColor: '#3498db',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 3,
                    ticks: {
                        stepSize: 1,
                        callback: function(value) {
                            return ['', 'Excellent', 'Moderate', 'Bad'][value];
                        }
                    }
                }
            }
        }
    });
}

// Add these prediction-specific functions
async function predictAirQuality() {
    try {
        // Fetch last 7 days of data
        const historicalData = await fetchHistoricalDataForPrediction();
        if (!historicalData) throw new Error('No historical data available');

        // Group data by hour to find patterns
        const hourlyPatterns = analyzeHourlyPatterns(historicalData);
        
        // Get current hour
        const currentHour = new Date().getHours();
        
        // Predict next day's value for current hour
        const prediction = predictNextDayValue(hourlyPatterns[currentHour]);
        
        return {
            predictedValue: prediction.value,
            confidence: prediction.confidence,
            historicalPattern: hourlyPatterns[currentHour]
        };
    } catch (error) {
        console.error('Prediction failed:', error);
        return null;
    }
}

async function fetchHistoricalDataForPrediction() {
    try {
        // Fetch 7 days of data (7 * 24 = 168 data points)
        const response = await fetch(
            `https://api.thingspeak.com/channels/${THINGSPEAK_CHANNEL_ID}/fields/6.json?api_key=${THINGSPEAK_READ_API_KEY}&results=168`
        );
        const data = await response.json();
        
        return data.feeds.map(feed => ({
            timestamp: new Date(feed.created_at),
            airQuality: parseInt(feed.field6)
        }));
    } catch (error) {
        console.error('Error fetching historical data:', error);
        return null;
    }
}

function analyzeHourlyPatterns(historicalData) {
    const hourlyPatterns = {};

    // Initialize hourly patterns
    for (let hour = 0; hour < 24; hour++) {
        hourlyPatterns[hour] = [];
    }

    // Group data by hour
    historicalData.forEach(data => {
        const hour = data.timestamp.getHours();
        hourlyPatterns[hour].push(data.airQuality);
    });

    return hourlyPatterns;
}

function predictNextDayValue(hourlyData) {
    if (!hourlyData || hourlyData.length === 0) {
        return { value: null, confidence: 0 };
    }

    // Calculate frequency of each value
    const frequencies = hourlyData.reduce((acc, val) => {
        acc[val] = (acc[val] || 0) + 1;
        return acc;
    }, {});

    // Find most common value
    let mostCommonValue = 1;
    let maxFrequency = 0;

    for (const [value, frequency] of Object.entries(frequencies)) {
        if (frequency > maxFrequency) {
            maxFrequency = frequency;
            mostCommonValue = parseInt(value);
        }
    }

    // Calculate confidence based on frequency
    const confidence = (maxFrequency / hourlyData.length) * 100;

    return {
        value: mostCommonValue,
        confidence: Math.round(confidence)
    };
}