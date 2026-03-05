const request = require('supertest');
const app = require('../src/server');
const axios = require('axios');

jest.mock('axios');

const mockCurrentData = {
  data: {
    name: 'London',
    sys: { country: 'GB' },
    main: { temp: 15.6, feels_like: 13.2, humidity: 72, pressure: 1013 },
    wind: { speed: 5.1 },
    weather: [{ description: 'light rain', icon: '10d' }],
    visibility: 8000,
  }
};

const mockForecastData = {
  data: {
    city: { name: 'London' },
    list: [
      { dt_txt: '2024-01-01 12:00:00', main: { temp_max: 16, temp_min: 10, humidity: 70 }, weather: [{ description: 'clear sky', icon: '01d' }], wind: { speed: 3 } },
      { dt_txt: '2024-01-02 12:00:00', main: { temp_max: 14, temp_min: 9, humidity: 75 }, weather: [{ description: 'cloudy', icon: '03d' }], wind: { speed: 4 } },
      { dt_txt: '2024-01-03 12:00:00', main: { temp_max: 12, temp_min: 7, humidity: 80 }, weather: [{ description: 'rain', icon: '10d' }], wind: { speed: 6 } },
      { dt_txt: '2024-01-04 12:00:00', main: { temp_max: 11, temp_min: 6, humidity: 85 }, weather: [{ description: 'heavy rain', icon: '09d' }], wind: { speed: 8 } },
      { dt_txt: '2024-01-05 12:00:00', main: { temp_max: 13, temp_min: 8, humidity: 65 }, weather: [{ description: 'partly cloudy', icon: '02d' }], wind: { speed: 3 } },
    ]
  }
};

describe('Health Check', () => {
  test('GET /health returns 200', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
  });
});

describe('GET /api/weather/current', () => {
  test('returns weather data for valid city', async () => {
    axios.get.mockResolvedValue(mockCurrentData);
    const res = await request(app).get('/api/weather/current?city=London');
    expect(res.status).toBe(200);
    expect(res.body.city).toBe('London');
    expect(res.body.country).toBe('GB');
    expect(typeof res.body.temperature).toBe('number');
    expect(res.body.humidity).toBe(72);
  });

  test('returns 400 when city param is missing', async () => {
    const res = await request(app).get('/api/weather/current');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('City parameter is required');
  });

  test('returns 400 when city param is empty', async () => {
    const res = await request(app).get('/api/weather/current?city=');
    expect(res.status).toBe(400);
  });

  test('returns 404 when city not found', async () => {
    axios.get.mockRejectedValue({ response: { status: 404 } });
    const res = await request(app).get('/api/weather/current?city=FakeCity12345');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('City not found');
  });

  test('returns 401 when API key is invalid', async () => {
    axios.get.mockRejectedValue({ response: { status: 401 } });
    const res = await request(app).get('/api/weather/current?city=London');
    expect(res.status).toBe(401);
  });

  test('temperature is rounded integer', async () => {
    axios.get.mockResolvedValue(mockCurrentData);
    const res = await request(app).get('/api/weather/current?city=London');
    expect(res.body.temperature).toBe(16); // 15.6 rounded
    expect(Number.isInteger(res.body.temperature)).toBe(true);
  });
});

describe('GET /api/weather/forecast', () => {
  test('returns 5-day forecast for valid city', async () => {
    axios.get.mockResolvedValue(mockForecastData);
    const res = await request(app).get('/api/weather/forecast?city=London');
    expect(res.status).toBe(200);
    expect(res.body.city).toBe('London');
    expect(res.body.forecast).toHaveLength(5);
  });

  test('each forecast item has required fields', async () => {
    axios.get.mockResolvedValue(mockForecastData);
    const res = await request(app).get('/api/weather/forecast?city=London');
    const day = res.body.forecast[0];
    expect(day).toHaveProperty('date');
    expect(day).toHaveProperty('temp_max');
    expect(day).toHaveProperty('temp_min');
    expect(day).toHaveProperty('description');
    expect(day).toHaveProperty('icon');
  });

  test('returns 400 when city param is missing', async () => {
    const res = await request(app).get('/api/weather/forecast');
    expect(res.status).toBe(400);
  });

  test('returns 404 when city not found', async () => {
    axios.get.mockRejectedValue({ response: { status: 404 } });
    const res = await request(app).get('/api/weather/forecast?city=FakeCity');
    expect(res.status).toBe(404);
  });
});
