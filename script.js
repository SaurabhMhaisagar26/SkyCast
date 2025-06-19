const apiKey = "591eb4eabce34eeaa87162129251906";

const form = document.getElementById("searchForm");
const input = document.getElementById("cityInput");
const loader = document.getElementById("loader");
const content = document.getElementById("weatherContent");
const forecastDiv = document.getElementById("forecast");
const toggleUnitBtn = document.getElementById("toggleUnit");
const voiceBtn = document.getElementById("voiceSearch");
const gpsBtn = document.getElementById("gpsSearch");

let useCelsius = true;
let currentWeather = null;

const elements = {
  city: document.getElementById("city"),
  icon: document.getElementById("icon"),
  condition: document.getElementById("condition"),
  temp: document.getElementById("temp"),
  feelslike: document.getElementById("feelslike"),
  humidity: document.getElementById("humidity"),
  wind: document.getElementById("wind"),
  uv: document.getElementById("uv"),
  pm: document.getElementById("pm"),
  time: document.getElementById("time"),
};

// 🌍 Search Form
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const city = input.value.trim();
  if (city) {
    localStorage.setItem("lastCity", city);
    getWeather(city);
  }
});

// 🌡️ Toggle C/F
toggleUnitBtn.addEventListener("click", () => {
  useCelsius = !useCelsius;
  toggleUnitBtn.textContent = useCelsius ? "Show in °F" : "Show in °C";
  if (currentWeather) displayWeather(currentWeather);
});

// 🌙 Dark Mode
document.getElementById("toggleTheme").addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

// 🎙️ Voice Recognition
voiceBtn.addEventListener("click", () => {
  const recognition = new (window.SpeechRecognition ||
    window.webkitSpeechRecognition)();
  recognition.lang = "en-US";
  recognition.start();
  recognition.onresult = (event) => {
    const city = event.results[0][0].transcript;
    input.value = city;
    localStorage.setItem("lastCity", city);
    getWeather(city);
  };
});

// 📍 GPS Location
gpsBtn.addEventListener("click", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        getWeather(`${latitude},${longitude}`);
      },
      () => {
        alert("Location permission denied.");
      }
    );
  } else {
    alert("Geolocation not supported.");
  }
});

function getWeather(query) {
  loader.classList.remove("hidden");
  content.classList.add("hidden");
  forecastDiv.innerHTML = "";

  const apiURL = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${query}&days=3&aqi=yes`;

  fetch(apiURL)
    .then((res) => {
      if (!res.ok) throw new Error("City not found");
      return res.json();
    })
    .then((data) => {
      currentWeather = data;
      displayWeather(data);
    })
    .catch((err) => {
      alert(err.message);
    })
    .finally(() => {
      loader.classList.add("hidden");
    });
}

function displayWeather(data) {
  const location = data.location;
  const current = data.current;
  const forecast = data.forecast.forecastday;
  const air = current.air_quality;
  const unit = useCelsius ? "°C" : "°F";
  const temp = useCelsius ? current.temp_c : current.temp_f;
  const feels = useCelsius ? current.feelslike_c : current.feelslike_f;

  elements.city.textContent = location.name;
  elements.icon.src = "https:" + current.condition.icon;
  elements.condition.textContent = current.condition.text;
  elements.temp.textContent = temp + unit;
  elements.feelslike.textContent = feels + unit;
  elements.humidity.textContent = current.humidity;
  elements.wind.textContent = current.wind_kph;
  elements.uv.textContent = current.uv;
  elements.pm.textContent = air.pm2_5.toFixed(2);
  elements.time.textContent = location.localtime;

  forecast.forEach((day) => {
    const card = document.createElement("div");
    card.className = "forecast-card";
    const avgTemp = useCelsius ? day.day.avgtemp_c : day.day.avgtemp_f;
    card.innerHTML = `
      <h4>${day.date}</h4>
      <img src="https:${day.day.condition.icon}" />
      <p>${day.day.condition.text}</p>
      <p>${avgTemp}${unit}</p>
    `;
    forecastDiv.appendChild(card);
  });

  content.classList.remove("hidden");
}

// Load saved or default
const savedCity = localStorage.getItem("lastCity") || "London";
getWeather(savedCity);
