import { useState, useEffect, useCallback } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Weather icon mapping to emoji + gradient pairs
const WEATHER_THEMES = {
  "01d": { emoji: "☀️", gradient: "linear-gradient(135deg, #f6d365 0%, #fda085 100%)", label: "Clear Sky" },
  "01n": { emoji: "🌙", gradient: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)", label: "Clear Night" },
  "02d": { emoji: "⛅", gradient: "linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)", label: "Partly Cloudy" },
  "02n": { emoji: "🌤", gradient: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)", label: "Partly Cloudy" },
  "03d": { emoji: "🌥", gradient: "linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)", label: "Cloudy" },
  "03n": { emoji: "☁️", gradient: "linear-gradient(135deg, #2c3e50 0%, #3498db 100%)", label: "Cloudy" },
  "04d": { emoji: "☁️", gradient: "linear-gradient(135deg, #636e72 0%, #2d3436 100%)", label: "Overcast" },
  "04n": { emoji: "☁️", gradient: "linear-gradient(135deg, #2d3436 0%, #636e72 100%)", label: "Overcast" },
  "09d": { emoji: "🌧", gradient: "linear-gradient(135deg, #4b79a1 0%, #283e51 100%)", label: "Shower Rain" },
  "09n": { emoji: "🌧", gradient: "linear-gradient(135deg, #283e51 0%, #0a3d62 100%)", label: "Shower Rain" },
  "10d": { emoji: "🌦", gradient: "linear-gradient(135deg, #4b6cb7 0%, #182848 100%)", label: "Rain" },
  "10n": { emoji: "🌧", gradient: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)", label: "Rain" },
  "11d": { emoji: "⛈", gradient: "linear-gradient(135deg, #373b44 0%, #4286f4 100%)", label: "Thunderstorm" },
  "11n": { emoji: "⛈", gradient: "linear-gradient(135deg, #0f0c29 0%, #373b44 100%)", label: "Thunderstorm" },
  "13d": { emoji: "❄️", gradient: "linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)", label: "Snow" },
  "13n": { emoji: "🌨", gradient: "linear-gradient(135deg, #c9d6ff 0%, #e2e2e2 100%)", label: "Snow" },
  "50d": { emoji: "🌫", gradient: "linear-gradient(135deg, #757f9a 0%, #d7dde8 100%)", label: "Mist" },
  "50n": { emoji: "🌫", gradient: "linear-gradient(135deg, #373b44 0%, #757f9a 100%)", label: "Mist" },
};

const getTheme = (icon) => WEATHER_THEMES[icon] || WEATHER_THEMES["02d"];

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

function WindIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/>
    </svg>
  );
}

function DropIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <circle cx="11" cy="11" r="8"/>
      <path d="m21 21-4.35-4.35"/>
    </svg>
  );
}

function LoadingSpinner() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
      <div style={{
        width: "56px", height: "56px", borderRadius: "50%",
        border: "3px solid rgba(255,255,255,0.2)",
        borderTop: "3px solid white",
        animation: "spin 0.8s linear infinite"
      }} />
      <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px", letterSpacing: "0.1em" }}>FETCHING WEATHER</p>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.12)",
      backdropFilter: "blur(12px)",
      borderRadius: "16px",
      padding: "16px",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      border: "1px solid rgba(255,255,255,0.15)",
      transition: "background 0.2s",
    }}>
      <span style={{ opacity: 0.8 }}>{icon}</span>
      <div>
        <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</div>
        <div style={{ fontSize: "15px", fontWeight: "600", color: "white", marginTop: "2px" }}>{value}</div>
      </div>
    </div>
  );
}

function ForecastCard({ day, theme }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.1)",
      backdropFilter: "blur(12px)",
      borderRadius: "20px",
      padding: "20px 16px",
      textAlign: "center",
      border: "1px solid rgba(255,255,255,0.15)",
      flex: "1",
      minWidth: "120px",
      transition: "transform 0.2s, background 0.2s",
      cursor: "default",
    }}
      onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.18)"}
      onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
    >
      <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.65)", fontWeight: "500", letterSpacing: "0.05em" }}>
        {formatDate(day.date).split(",")[0].substring(0, 3).toUpperCase()}
      </div>
      <div style={{ fontSize: "28px", margin: "10px 0" }}>{getTheme(day.icon).emoji}</div>
      <div style={{ fontSize: "18px", fontWeight: "700", color: "white" }}>{day.temp_max}°</div>
      <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", marginTop: "2px" }}>{day.temp_min}°</div>
      <div style={{
        fontSize: "10px", color: "rgba(255,255,255,0.6)", marginTop: "8px",
        background: "rgba(0,0,0,0.15)", borderRadius: "8px", padding: "3px 6px",
        textTransform: "capitalize"
      }}>
        {day.description}
      </div>
    </div>
  );
}

export default function WeatherDashboard() {
  const [city, setCity] = useState("");
  const [inputVal, setInputVal] = useState("");
  const [current, setCurrent] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [theme, setTheme] = useState(WEATHER_THEMES["02d"]);

  const fetchWeather = useCallback(async (cityName) => {
    if (!cityName.trim()) return;
    setLoading(true);
    setError("");
    try {
      const [currentRes, forecastRes] = await Promise.all([
        fetch(`${API_BASE}/weather/current?city=${encodeURIComponent(cityName)}`),
        fetch(`${API_BASE}/weather/forecast?city=${encodeURIComponent(cityName)}`),
      ]);
      if (!currentRes.ok) {
        const err = await currentRes.json();
        throw new Error(err.error || "City not found");
      }
      const currentData = await currentRes.json();
      const forecastData = await forecastRes.json();
      setCurrent(currentData);
      setForecast(forecastData);
      setTheme(getTheme(currentData.icon));
    } catch (err) {
      setError(err.message || "Failed to fetch weather");
      setCurrent(null);
      setForecast(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = () => {
    if (inputVal.trim()) {
      setCity(inputVal.trim());
      fetchWeather(inputVal.trim());
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const now = new Date();

  return (
    <div style={{
      minHeight: "100vh",
      background: theme.gradient,
      transition: "background 1.2s ease",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "flex-start",
      padding: "40px 20px 60px",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      position: "relative",
      overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,300&family=DM+Mono:wght@400;500&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { margin: 0; }
        input::placeholder { color: rgba(255,255,255,0.45); }
        input:focus { outline: none; }
      `}</style>

      {/* Background decorative blobs */}
      <div style={{
        position: "fixed", top: "-20%", right: "-10%", width: "500px", height: "500px",
        borderRadius: "50%", background: "rgba(255,255,255,0.06)", pointerEvents: "none"
      }} />
      <div style={{
        position: "fixed", bottom: "-20%", left: "-10%", width: "400px", height: "400px",
        borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none"
      }} />

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "36px", animation: "fadeIn 0.6s ease" }}>
        <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.55)", letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: "8px", fontFamily: "'DM Mono', monospace" }}>
          Weather Dashboard
        </div>
        <h1 style={{ fontSize: "clamp(28px,5vw,42px)", fontWeight: "700", color: "white", letterSpacing: "-0.02em" }}>
          Real-Time Weather
        </h1>
        <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", marginTop: "6px" }}>
          {now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </div>
      </div>

      {/* Search Bar */}
      <div style={{
        display: "flex", gap: "12px", width: "100%", maxWidth: "480px",
        marginBottom: "40px", animation: "fadeIn 0.7s ease"
      }}>
        <div style={{
          flex: 1, display: "flex", alignItems: "center",
          background: "rgba(255,255,255,0.15)", backdropFilter: "blur(20px)",
          borderRadius: "16px", padding: "0 16px", border: "1px solid rgba(255,255,255,0.25)",
          transition: "border-color 0.2s, background 0.2s",
        }}>
          <span style={{ color: "rgba(255,255,255,0.6)", marginRight: "10px", display: "flex" }}>
            <SearchIcon />
          </span>
          <input
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search city..."
            style={{
              flex: 1, background: "transparent", border: "none", color: "white",
              fontSize: "15px", padding: "14px 0", fontFamily: "inherit", fontWeight: "500",
            }}
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={loading}
          style={{
            background: "rgba(255,255,255,0.2)", backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.3)", borderRadius: "16px",
            padding: "0 24px", color: "white", fontSize: "14px", fontWeight: "600",
            cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit",
            letterSpacing: "0.04em", transition: "background 0.2s",
            whiteSpace: "nowrap",
          }}
          onMouseEnter={e => !loading && (e.target.style.background = "rgba(255,255,255,0.3)")}
          onMouseLeave={e => (e.target.style.background = "rgba(255,255,255,0.2)")}
        >
          Search
        </button>
      </div>

      {/* States */}
      {loading && <div style={{ animation: "fadeIn 0.3s ease" }}><LoadingSpinner /></div>}

      {error && (
        <div style={{
          background: "rgba(255,80,80,0.2)", backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,80,80,0.4)", borderRadius: "16px",
          padding: "16px 24px", color: "white", fontSize: "14px",
          animation: "fadeIn 0.3s ease", maxWidth: "480px", textAlign: "center"
        }}>
          ⚠️ {error}
        </div>
      )}

      {!loading && !current && !error && (
        <div style={{ textAlign: "center", animation: "float 3s ease-in-out infinite" }}>
          <div style={{ fontSize: "80px", marginBottom: "16px" }}>🌍</div>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "15px" }}>Search any city to get started</p>
          <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginTop: "16px", flexWrap: "wrap" }}>
            {["London", "Tokyo", "New York", "Dubai", "Mumbai"].map(c => (
              <button key={c} onClick={() => { setInputVal(c); fetchWeather(c); }} style={{
                background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "20px", padding: "6px 14px", color: "rgba(255,255,255,0.8)",
                cursor: "pointer", fontSize: "13px", fontFamily: "inherit",
                transition: "background 0.2s"
              }}>{c}</button>
            ))}
          </div>
        </div>
      )}

      {/* Main Weather Card */}
      {!loading && current && (
        <div style={{ width: "100%", maxWidth: "520px", animation: "fadeIn 0.5s ease" }}>
          {/* Current Weather Hero */}
          <div style={{
            background: "rgba(255,255,255,0.12)", backdropFilter: "blur(24px)",
            borderRadius: "28px", padding: "36px 32px", marginBottom: "16px",
            border: "1px solid rgba(255,255,255,0.2)", textAlign: "center",
          }}>
            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "4px", fontFamily: "'DM Mono', monospace" }}>
              {current.country}
            </div>
            <h2 style={{ fontSize: "clamp(24px,4vw,34px)", fontWeight: "700", color: "white", marginBottom: "20px" }}>
              {current.city}
            </h2>
            <div style={{ fontSize: "90px", margin: "0 0 8px", lineHeight: 1, animation: "float 4s ease-in-out infinite" }}>
              {theme.emoji}
            </div>
            <div style={{ fontSize: "clamp(64px,12vw,96px)", fontWeight: "300", color: "white", lineHeight: 1, letterSpacing: "-0.04em", marginBottom: "8px" }}>
              {current.temperature}°<span style={{ fontSize: "0.4em", fontWeight: "600" }}>C</span>
            </div>
            <div style={{ fontSize: "16px", color: "rgba(255,255,255,0.7)", textTransform: "capitalize", marginBottom: "4px" }}>
              {current.description}
            </div>
            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>
              Feels like {current.feels_like}°C
            </div>
          </div>

          {/* Stats Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
            <StatCard icon={<DropIcon />} label="Humidity" value={`${current.humidity}%`} />
            <StatCard icon={<WindIcon />} label="Wind Speed" value={`${current.wind_speed} m/s`} />
            <StatCard icon={<EyeIcon />} label="Visibility" value={`${(current.visibility / 1000).toFixed(1)} km`} />
            <StatCard icon="🌡" label="Pressure" value={`${current.pressure} hPa`} />
          </div>

          {/* 5-Day Forecast */}
          {forecast && (
            <div style={{
              background: "rgba(255,255,255,0.1)", backdropFilter: "blur(20px)",
              borderRadius: "24px", padding: "24px 20px",
              border: "1px solid rgba(255,255,255,0.15)"
            }}>
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "16px", fontFamily: "'DM Mono', monospace" }}>
                5-Day Forecast
              </div>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {forecast.forecast.map((day, i) => (
                  <ForecastCard key={i} day={day} theme={theme} />
                ))}
              </div>
            </div>
          )}

          {/* Footer note */}
          <div style={{ textAlign: "center", marginTop: "20px", fontSize: "11px", color: "rgba(255,255,255,0.35)", fontFamily: "'DM Mono', monospace" }}>
            Powered by OpenWeatherMap API · Built with React + Node.js · Deployed on AWS EKS
          </div>
        </div>
      )}
    </div>
  );
}
