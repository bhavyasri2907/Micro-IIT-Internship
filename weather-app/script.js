// Base URL for Open-Meteo API
const BASE_URL = 'https://api.open-meteo.com/v1';

// DOM Elements
const searchInput = document.querySelector('.search-input');
const searchButton = document.querySelector('.search-button');
const cityElement = document.querySelector('.city');
const dateElement = document.querySelector('.date');
const tempElement = document.querySelector('.temp');
const windElement = document.querySelector('.wind');
const humidityElement = document.querySelector('.humidity');
const pressureElement = document.querySelector('.pressure');
const weatherIcon = document.querySelector('.weather-icon i');
const forecastList = document.querySelector('.forecast-list');
const themeToggle = document.querySelector('.theme-toggle');

// Weather Icons Mapping
const weatherIcons = {
    0: 'sun', // Clear sky
    1: 'cloud-sun', // Mainly clear
    2: 'cloud', // Partly cloudy
    3: 'cloud', // Overcast
    45: 'smog', // Foggy
    48: 'smog', // Depositing rime fog
    51: 'cloud-rain', // Light drizzle
    53: 'cloud-rain', // Moderate drizzle
    55: 'cloud-rain', // Dense drizzle
    61: 'cloud-rain', // Slight rain
    63: 'cloud-rain', // Moderate rain
    65: 'cloud-rain', // Heavy rain
    71: 'snowflake', // Slight snow
    73: 'snowflake', // Moderate snow
    75: 'snowflake', // Heavy snow
    77: 'snowflake', // Snow grains
    80: 'cloud-rain', // Slight rain showers
    81: 'cloud-rain', // Moderate rain showers
    82: 'cloud-rain', // Violent rain showers
    85: 'snowflake', // Slight snow showers
    86: 'snowflake', // Heavy snow showers
    95: 'bolt', // Thunderstorm
    96: 'bolt', // Thunderstorm with slight hail
    99: 'bolt' // Thunderstorm with heavy hail
};

// Event Listeners
searchButton.addEventListener('click', () => {
    const city = searchInput.value.trim();
    if (city) {
        getWeatherData(city);
    }
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = searchInput.value.trim();
        if (city) {
            getWeatherData(city);
        }
    }
});

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const icon = themeToggle.querySelector('i');
    icon.classList.toggle('fa-moon');
    icon.classList.toggle('fa-sun');
});

// Update current date
function updateDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateElement.textContent = now.toLocaleDateString('en-US', options);
}

// Get coordinates for a city
async function getCoordinates(city) {
    try {
        const response = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
        );
        
        if (!response.ok) {
            throw new Error('Failed to fetch coordinates');
        }
        
        const data = await response.json();
        
        if (!data.results || data.results.length === 0) {
            throw new Error('City not found. Please try again.');
        }
        
        return {
            latitude: data.results[0].latitude,
            longitude: data.results[0].longitude,
            name: data.results[0].name
        };
    } catch (error) {
        throw new Error('City not found. Please try again.');
    }
}

// Get weather data from API
async function getWeatherData(city) {
    try {
        // Show loading state
        cityElement.textContent = 'Loading...';
        tempElement.textContent = '--';
        windElement.textContent = '-- km/h';
        humidityElement.textContent = '--%';
        pressureElement.textContent = '-- hPa';
        forecastList.innerHTML = '';

        // Get coordinates for the city
        const coords = await getCoordinates(city);
        
        // Get current weather
        const currentWeatherResponse = await fetch(
            `${BASE_URL}/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,surface_pressure,weather_code&timezone=auto`
        );
        
        if (!currentWeatherResponse.ok) {
            throw new Error('Failed to fetch weather data');
        }
        
        const currentWeatherData = await currentWeatherResponse.json();

        // Get 5-day forecast
        const forecastResponse = await fetch(
            `${BASE_URL}/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`
        );
        
        if (!forecastResponse.ok) {
            throw new Error('Failed to fetch forecast data');
        }
        
        const forecastData = await forecastResponse.json();

        updateWeatherUI(currentWeatherData, coords.name);
        updateForecastUI(forecastData);
    } catch (error) {
        console.error('Error fetching weather data:', error);
        cityElement.textContent = 'Error';
        tempElement.textContent = '--';
        windElement.textContent = '-- km/h';
        humidityElement.textContent = '--%';
        pressureElement.textContent = '-- hPa';
        forecastList.innerHTML = '';
        alert(error.message || 'Error fetching weather data. Please try again.');
    }
}

// Update current weather UI
function updateWeatherUI(data, cityName) {
    cityElement.textContent = cityName;
    tempElement.textContent = Math.round(data.current.temperature_2m);
    windElement.textContent = `${Math.round(data.current.wind_speed_10m)} km/h`;
    humidityElement.textContent = `${Math.round(data.current.relative_humidity_2m)}%`;
    pressureElement.textContent = `${Math.round(data.current.surface_pressure)} hPa`;

    const weatherCode = data.current.weather_code;
    const iconClass = weatherIcons[weatherCode] || 'sun';
    weatherIcon.className = `fas fa-${iconClass}`;
}

// Update forecast UI
function updateForecastUI(data) {
    forecastList.innerHTML = '';
    
    for (let i = 0; i < 7; i++) {
        const date = new Date(data.daily.time[i]);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const maxTemp = Math.round(data.daily.temperature_2m_max[i]);
        const minTemp = Math.round(data.daily.temperature_2m_min[i]);
        const weatherCode = data.daily.weather_code[i];
        const iconClass = weatherIcons[weatherCode] || 'sun';

        const forecastItem = document.createElement('div');
        forecastItem.className = 'forecast-item';
        forecastItem.innerHTML = `
            <div class="day">${dayName}</div>
            <i class="fas fa-${iconClass}"></i>
            <div class="temp">
                <span class="max">${maxTemp}°</span>
                <span class="min">${minTemp}°</span>
            </div>
        `;
        forecastList.appendChild(forecastItem);
    }
}

// Initialize the app
updateDate();
cityElement.textContent = 'Enter City Name';
tempElement.textContent = '--';
windElement.textContent = '-- km/h';
humidityElement.textContent = '--%';
pressureElement.textContent = '-- hPa'; 