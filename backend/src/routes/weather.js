const express = require('express');
const axios = require('axios');
const router = express.Router();

const API_KEY = process.env.OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// GET /api/weather/current?city=London
router.get('/current', async (req, res) => {
  try {
    const { city } = req.query;
    if (!city || typeof city !== 'string' || city.trim() === '') {
      return res.status(400).json({ error: 'City parameter is required' });
    }
    const response = await axios.get(`${BASE_URL}/weather`, {
      params: { q: city.trim(), appid: API_KEY, units: 'metric' }
    });
    const data = response.data;
    res.json({
      city: data.name,
      country: data.sys.country,
      temperature: Math.round(data.main.temp),
      feels_like: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      wind_speed: data.wind.speed,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      visibility: data.visibility,
      pressure: data.main.pressure,
    });
  } catch (err) {
    if (err.response?.status === 404) {
      return res.status(404).json({ error: 'City not found' });
    }
    if (err.response?.status === 401) {
      return res.status(401).json({ error: 'Invalid API key' });
    }
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

// GET /api/weather/forecast?city=London
router.get('/forecast', async (req, res) => {
  try {
    const { city } = req.query;
    if (!city || typeof city !== 'string' || city.trim() === '') {
      return res.status(400).json({ error: 'City parameter is required' });
    }
    const response = await axios.get(`${BASE_URL}/forecast`, {
      params: { q: city.trim(), appid: API_KEY, units: 'metric', cnt: 40 }
    });
    const list = response.data.list;
    // Group by day, pick midday reading
    const dailyMap = {};
    list.forEach(item => {
      const date = item.dt_txt.split(' ')[0];
      const hour = item.dt_txt.split(' ')[1];
      if (!dailyMap[date] || hour === '12:00:00') {
        dailyMap[date] = {
          date,
          temp_max: Math.round(item.main.temp_max),
          temp_min: Math.round(item.main.temp_min),
          description: item.weather[0].description,
          icon: item.weather[0].icon,
          humidity: item.main.humidity,
          wind_speed: item.wind.speed,
        };
      }
    });
    const forecast = Object.values(dailyMap).slice(0, 5);
    res.json({ city: response.data.city.name, forecast });
  } catch (err) {
    if (err.response?.status === 404) {
      return res.status(404).json({ error: 'City not found' });
    }
    res.status(500).json({ error: 'Failed to fetch forecast data' });
  }
});

module.exports = router;
