const WEATHER_API_KEY = 'ae1f179b2dfa0ba6cd0c24f53304576a';
const CITY = 'Chennai';

async function getWeatherData() {
    try {
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${CITY}&appid=${WEATHER_API_KEY}&units=metric`);
        const aqi_response = await axios.get(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${response.data.coord.lat}&lon=${response.data.coord.lon}&appid=${WEATHER_API_KEY}`);
        
        document.getElementById('outdoor-temp').textContent = `${Math.round(response.data.main.temp)}°C`;
        document.getElementById('weather-desc').textContent = response.data.weather[0].description;
        document.getElementById('weather-icon').src = `http://openweathermap.org/img/wn/${response.data.weather[0].icon}@2x.png`;
        
        const aqi = aqi_response.data.list[0].main.aqi;
        const aqiText = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'][aqi - 1];
        document.getElementById('outdoor-aqi').textContent = aqiText;
    } catch (error) {
        console.error('Error fetching weather data:', error);
    }
}

async function fetchData() {
    try {
        const response = await fetch('https://api.thingspeak.com/channels/2897933/feeds.json?api_key=J5L7FPORSTYKAIR1&results=1');
        const data = await response.json();
        const latestData = data.feeds[0];

        updateMetrics(latestData);
        updateChart(data.feeds);
        checkThresholds(latestData);
        analyzeTrends(data.feeds);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function updateMetrics(data) {
    document.getElementById('temp').textContent = `${data.field1}°C`;
    document.getElementById('humidity').textContent = `${data.field2}%`;
    document.getElementById('turbidity').textContent = `${data.field3} NTU`;
    document.getElementById('tds').textContent = `${data.field4} ppm`;
    document.getElementById('gasLevel').textContent = `${data.field5} ppm`;
    
    // Convert air quality numeric value to text with color
    const airQualityDiv = document.getElementById('airQuality');
    let airQualityText;
    let className;
    
    switch (parseInt(data.field6)) {
        case 1:
            airQualityText = 'Good';
            className = 'good';
            break;
        case 2:
            airQualityText = 'Moderate';
            className = 'moderate';
            break;
        case 3:
            airQualityText = 'Critical';
            className = 'critical';
            break;
        default:
            airQualityText = 'Unknown';
            className = '';
    }
    
    airQualityDiv.textContent = airQualityText;
    airQualityDiv.className = `value ${className}`;
}

function updateChart(feeds) {
    const ctx = document.getElementById('dataChart').getContext('2d');
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: feeds.map(feed => new Date(feed.created_at).toLocaleTimeString()),
            datasets: [{
                label: 'Temperature',
                data: feeds.map(feed => feed.field1),
                borderColor: '#e74c3c',
                fill: false
            }, {
                label: 'Humidity',
                data: feeds.map(feed => feed.field2),
                borderColor: '#3498db',
                fill: false
            }]
        },
        options: {
            responsive: true,
            plugins: {
                tooltip: {
                    mode: 'index',
                    intersect: false
                },
                zoom: {
                    zoom: {
                        wheel: {
                            enabled: true
                        },
                        pinch: {
                            enabled: true
                        },
                        mode: 'xy'
                    }
                }
            },
            interaction: {
                intersect: false
            }
        }
    });
}

const THRESHOLDS = {
    temperature: { min: 18, max: 26, unit: '°C' },
    humidity: { min: 30, max: 60, unit: '%' },
    turbidity: { min: 0, max: 5, unit: 'NTU' },
    tds: { min: 0, max: 500, unit: 'ppm' },
    gasLevel: { min: 0, max: 100, unit: 'ppm' },
};

function checkThresholds(data) {
    const alerts = [];
    
    if (data.field1 < THRESHOLDS.temperature.min || data.field1 > THRESHOLDS.temperature.max) {
        alerts.push({
            type: 'temperature',
            value: data.field1,
            message: `Temperature outside safe range (${THRESHOLDS.temperature.min}-${THRESHOLDS.temperature.max}${THRESHOLDS.temperature.unit})`
        });
    }
    
    // Add similar checks for other metrics
    
    if (alerts.length > 0) {
        showAlerts(alerts);
        sendNotification(alerts);
    }
}

function showAlerts(alerts) {
    const alertContainer = document.getElementById('alertContainer');
    alerts.forEach(alert => {
        const alertElement = document.createElement('div');
        alertElement.className = `alert alert-danger fade-in`;
        alertElement.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <strong>${alert.type.toUpperCase()}:</strong> ${alert.message}
        `;
        alertContainer.appendChild(alertElement);
        
        // Auto-remove alert after 5 seconds
        setTimeout(() => alertElement.remove(), 5000);
    });
}

function analyzeTrends(feeds) {
    const temperatures = feeds.map(feed => parseFloat(feed.field1));
    const humidity = feeds.map(feed => parseFloat(feed.field2));
    
    // Calculate rate of change
    const tempRateOfChange = calculateRateOfChange(temperatures);
    const humidityRateOfChange = calculateRateOfChange(humidity);
    
    // Predict next values
    const predictedTemp = predictNextValue(temperatures);
    const predictedHumidity = predictNextValue(humidity);
    
    updatePredictions({
        temperature: predictedTemp,
        humidity: predictedHumidity
    });
}

function calculateRateOfChange(values) {
    if (values.length < 2) return 0;
    const recent = values.slice(-2);
    return recent[1] - recent[0];
}

function predictNextValue(values) {
    // Simple linear regression
    const n = values.length;
    if (n < 2) return values[0];
    
    const slope = (values[n-1] - values[n-2]);
    return values[n-1] + slope;
}

function checkSystemHealth() {
    const metrics = {
        lastUpdateTime: null,
        sensorStatus: {},
        connectionStatus: 'online',
        batteryLevel: 100
    };
    
    // Check last update time
    const currentTime = new Date();
    const lastUpdate = new Date(document.lastModified);
    const timeDiff = currentTime - lastUpdate;
    
    if (timeDiff > 300000) { // 5 minutes
        metrics.connectionStatus = 'offline';
        showSystemAlert('Connection lost with sensors');
    }
    
    // Check sensor health
    checkSensorHealth(metrics);
    
    updateSystemStatus(metrics);
}

function checkSensorHealth(metrics) {
    const sensors = ['temperature', 'humidity', 'turbidity', 'tds', 'gas'];
    sensors.forEach(sensor => {
        const value = document.getElementById(sensor)?.textContent;
        metrics.sensorStatus[sensor] = value !== 'Loading...' && value !== undefined;
    });
}

function createVisualization(type, data) {
    const ctx = document.getElementById('dataChart').getContext('2d');
    
    const config = {
        line: createLineChartConfig(data),
        bar: createBarChartConfig(data),
        radar: createRadarChartConfig(data)
    };

    return new Chart(ctx, config[type]);
}

function generateLocationQR() {
    const locationData = {
        block: document.getElementById('blockSelect').value,
        floor: document.getElementById('floorSelect').value,
        device: document.getElementById('deviceSelect').value
    };
    
    const qrContent = JSON.stringify(locationData);
    const qrContainer = document.getElementById('qrContainer');
    
    new QRCode(qrContainer, {
        text: qrContent,
        width: 128,
        height: 128
    });
}

// Fetch data every 15 seconds
setInterval(fetchData, 15000);
fetchData(); // Initial fetch

document.addEventListener('DOMContentLoaded', () => {
    getWeatherData();
    setInterval(getWeatherData, 300000); // Update every 5 minutes
    // Initialize dashboard components
    initializeDashboard();
    
    const themeToggle = document.getElementById('themeToggle');
    // Check localStorage for saved theme
    const currentTheme = localStorage.getItem('theme') || 'dark';
    if (currentTheme === 'light') {
        document.body.classList.add('light-theme');
    }
    
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        const newTheme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
        localStorage.setItem('theme', newTheme);
    });
    
    // Optionally, update theme based on live environmental data
    // For example, if outdoor brightness is high, switch to light theme:
    // axios.get('your/light/sensor/API').then(res => {
    //    if (res.data.brightness > threshold) {
    //       document.body.classList.add('light-theme');
    //       localStorage.setItem('theme', 'light');
    //       }
    // });
});

function initializeDashboard() {
    // Add dashboard initialization logic here
    console.log('Dashboard initialized');
}

class WaterFlowVisualizer {
    constructor(containerId) {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer();
        this.container = document.getElementById(containerId);
    }

    createWaterFlow(quality) {
        // Create 3D visualization of water flow with color indicating quality
        const waterMaterial = new THREE.MeshPhongMaterial({
            color: this.getQualityColor(quality),
            transparent: true,
            opacity: 0.6
        });
        // Add particle system for water flow
    }
}

class WaterQualityPredictor {
    constructor() {
        this.historicalData = [];
        this.threshold = {
            tds: 500,
            turbidity: 5
        };
    }

    predictMaintenance(currentData) {
        const tdsRate = this.calculateRateOfChange(this.historicalData.map(d => d.tds));
        const turbidityRate = this.calculateRateOfChange(this.historicalData.map(d => d.turbidity));
        
        const daysToMaintenance = this.estimateDaysToThreshold(currentData, tdsRate, turbidityRate);
        return daysToMaintenance;
    }
}

class VoiceControl {
    constructor() {
        this.recognition = new webkitSpeechRecognition();
        this.commands = {
            'show temperature': () => this.focusMetric('temperature'),
            'export data': () => exportData('csv'),
            'change location': () => this.activateLocationSelector()
        };
    }

    initialize() {
        this.recognition.continuous = true;
        this.recognition.onresult = this.handleVoiceCommand.bind(this);
    }
}

class WaterConservationGame {
    constructor() {
        this.score = localStorage.getItem('conservationScore') || 0;
        this.badges = {
            waterSaver: { name: "Water Saver", threshold: 1000 },
            qualityGuardian: { name: "Quality Guardian", threshold: 2000 },
            ecoWarrior: { name: "Eco Warrior", threshold: 5000 }
        };
    }

    updateScore(metrics) {
        // Calculate score based on water quality maintenance
        const qualityScore = this.calculateQualityScore(metrics);
        this.score += qualityScore;
        this.checkBadges();
        this.updateUI();
    }
}

class AutomatedResponse {
    constructor() {
        this.responses = {
            highTDS: {
                action: 'activate_filter_flush',
                notification: 'Initiating filter flush sequence'
            },
            lowPressure: {
                action: 'check_pump',
                notification: 'Checking water pump status'
            }
        };
    }

    async handleIssue(issue, severity) {
        const response = this.responses[issue];
        if (response) {
            await this.executeAction(response.action);
            this.notifyUser(response.notification, severity);
        }
    }
}