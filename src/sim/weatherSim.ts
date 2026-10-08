import { WeatherState, WeatherType } from '../types';

export interface RainDrop {
  x: number;
  y: number;
  length: number;
  speed: number;
}

export function initRainParticles(count: number = 180): RainDrop[] {
  const drops: RainDrop[] = [];
  for (let i = 0; i < count; i++) {
    drops.push({
      x: Math.random() * 2000,
      y: Math.random() * 1500,
      length: 12 + Math.random() * 14,
      speed: 400 + Math.random() * 300,
    });
  }
  return drops;
}

export function updateRainParticles(drops: RainDrop[], dt: number, width: number = 2000, height: number = 1500): RainDrop[] {
  return drops.map((d) => {
    let y = d.y + d.speed * dt;
    let x = d.x + (d.speed * 0.25) * dt; // angled wind
    if (y > height) {
      y = -20;
      x = Math.random() * width;
    }
    if (x > width) {
      x = 0;
    }
    return { ...d, x, y };
  });
}

export function advanceGameClock(
  timeString: string,
  gameDay: number,
  dt: number,
  simSpeed: number
): { newTimeString: string; newGameDay: number; dayChanged: boolean } {
  if (simSpeed === 0) return { newTimeString: timeString, newGameDay: gameDay, dayChanged: false };

  const [hoursStr, minsStr] = timeString.split(':');
  let hours = parseInt(hoursStr, 10);
  let mins = parseInt(minsStr, 10);

  // Each real second at 1x = 1 simulation minute
  const totalSimMinutes = dt * simSpeed * 1;
  const addedMins = totalSimMinutes;

  mins += Math.floor(addedMins);
  let dayChanged = false;

  if (mins >= 60) {
    hours += Math.floor(mins / 60);
    mins = mins % 60;
  }

  let newGameDay = gameDay;
  if (hours >= 24) {
    hours = hours % 24;
    newGameDay += 1;
    dayChanged = true;
  }

  const newTimeString = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  return { newTimeString, newGameDay, dayChanged };
}

export function getAmbientLighting(timeString: string): { ambientAlpha: number; ambientColor: string; isNight: boolean } {
  const [hStr] = timeString.split(':');
  const h = parseInt(hStr, 10);

  // Night: 21:00 to 05:00
  // Morning: 06:00 to 11:00
  // Afternoon: 12:00 to 17:00
  // Sunset: 18:00 to 20:00

  if (h >= 21 || h < 5) {
    return { ambientAlpha: 0.68, ambientColor: '#030712', isNight: true };
  } else if (h >= 5 && h < 7) {
    return { ambientAlpha: 0.35, ambientColor: '#1e1b4b', isNight: false };
  } else if (h >= 18 && h < 21) {
    return { ambientAlpha: 0.42, ambientColor: '#31102b', isNight: false }; // sunset purple-warm
  }
  return { ambientAlpha: 0, ambientColor: '#000000', isNight: false };
}

export function cycleWeather(current: WeatherState): WeatherState {
  const types: WeatherType[] = ['sunny', 'cloudy', 'rain', 'heavy_rain', 'thunderstorm'];
  const nextType = types[Math.floor(Math.random() * types.length)];
  const temp = nextType === 'sunny' ? 26 + Math.floor(Math.random() * 5) : 20 + Math.floor(Math.random() * 4);
  const wind = 8 + Math.floor(Math.random() * 20);

  return {
    ...current,
    current: nextType,
    temperatureC: temp,
    windSpeedKmh: wind,
    visibilityKm: nextType === 'fog' ? 1.5 : nextType === 'heavy_rain' ? 4 : 10,
  };
}
