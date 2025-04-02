class AnomalyDetector {
    constructor(threshold = 3) {
        this.threshold = threshold;
        this.baselineStats = {
            mean: {},
            std: {}
        };
    }

    calculateBaseline(historicalData) {
        const parameters = ['tds', 'turbidity', 'temperature'];
        
        parameters.forEach(param => {
            const values = historicalData.map(d => parseFloat(d[param]));
            this.baselineStats.mean[param] = this.calculateMean(values);
            this.baselineStats.std[param] = this.calculateStandardDeviation(values);
        });
    }

    detectAnomalies(currentData) {
        const anomalies = {};
        
        Object.keys(this.baselineStats.mean).forEach(param => {
            const zScore = Math.abs(
                (currentData[param] - this.baselineStats.mean[param]) / 
                this.baselineStats.std[param]
            );
            
            if (zScore > this.threshold) {
                anomalies[param] = {
                    value: currentData[param],
                    zScore: zScore,
                    severity: this.calculateSeverity(zScore)
                };
            }
        });
        
        return anomalies;
    }
}