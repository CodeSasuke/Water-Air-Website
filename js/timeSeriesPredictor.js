class TimeSeriesPredictor {
    constructor(windowSize = 24) { // 24 hours window
        this.windowSize = windowSize;
    }

    forecast(historicalData, hoursAhead = 24) {
        const predictions = {};
        const parameters = ['tds', 'turbidity', 'temperature'];
        
        parameters.forEach(param => {
            const values = historicalData.map(d => parseFloat(d[param]));
            const movingAverage = this.calculateMovingAverage(values);
            const trend = this.calculateTrend(movingAverage);
            
            predictions[param] = this.extrapolate(
                movingAverage[movingAverage.length - 1],
                trend,
                hoursAhead
            );
        });
        
        return predictions;
    }

    calculateMovingAverage(values) {
        const movingAvg = [];
        for (let i = this.windowSize; i <= values.length; i++) {
            const window = values.slice(i - this.windowSize, i);
            movingAvg.push(
                window.reduce((sum, val) => sum + val, 0) / this.windowSize
            );
        }
        return movingAvg;
    }
}