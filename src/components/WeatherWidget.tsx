import React from 'react';
import { Sun, CloudRain, Cloud, CloudLightning } from 'lucide-react';
import { WeatherState, WeatherType } from '../types';

interface WeatherWidgetProps {
  weather: WeatherState;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ weather }) => {
  const getWeatherIcon = (type: WeatherType) => {
    switch (type) {
      case 'sunny':
        return <Sun className="w-5 h-5 text-amber-400" />;
      case 'rain':
      case 'heavy_rain':
        return <CloudRain className="w-5 h-5 text-sky-400" />;
      case 'thunderstorm':
        return <CloudLightning className="w-5 h-5 text-amber-400" />;
      case 'cloudy':
      case 'fog':
      default:
        return <Cloud className="w-5 h-5 text-slate-300" />;
    }
  };

  return (
    <div className="hidden xl:flex flex-col bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-3 shadow-2xl z-20 w-56 text-xs select-none">
      {/* Current Weather */}
      <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
        <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
          {getWeatherIcon(weather.current)}
        </div>
        <div>
          <div className="text-sm font-bold text-white flex items-center gap-1.5">
            <span>{weather.temperatureC}°C</span>
            <span className="capitalize text-slate-300 font-semibold">{weather.current.replace('_', ' ')}</span>
          </div>
          <div className="text-[10px] text-slate-400">
            Wind: <span className="text-white font-medium">{weather.windSpeedKmh} km/h {weather.windDirection}</span>
          </div>
          <div className="text-[10px] text-slate-400">
            Visibility: <span className="text-white font-medium">{weather.visibilityKm} km</span>
          </div>
        </div>
      </div>

      {/* 3-Day Forecast */}
      <div className="grid grid-cols-3 gap-1 pt-2 text-center">
        {weather.forecast.map((fc) => (
          <div key={fc.day} className="bg-slate-800/60 rounded-xl p-1.5 border border-slate-700/40">
            <span className="text-[10px] font-bold text-slate-400 block">{fc.day}</span>
            <div className="flex justify-center my-1">{getWeatherIcon(fc.weather)}</div>
            <span className="text-[10px] font-extrabold text-white block tabular-nums">
              {fc.tempMax}°/{fc.tempMin}°
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
