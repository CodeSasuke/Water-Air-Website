const config = {
    api: {
        thingspeak: process.env.THINGSPEAK_API_KEY || '',
        weather: process.env.WEATHER_API_KEY || '',
        channelId: process.env.CHANNEL_ID || '',
    },
    location: {
        city: process.env.CITY_NAME || 'Chennai',
    },
    updateInterval: 15000, // 15 seconds
    chartRefreshRate: 10000, // 10 seconds
};

export default config;
