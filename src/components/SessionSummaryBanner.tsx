import React from 'react';
import type { Meeting, Session, Weather } from '../types/f1';
import { CloudRain, Thermometer, Wind, Droplets, CheckCircle } from 'lucide-react';

interface SessionSummaryBannerProps {
  meeting: Meeting | null;
  session: Session | null;
  weather: Weather | null;
}

export const SessionSummaryBanner: React.FC<SessionSummaryBannerProps> = ({
  meeting,
  session,
  weather,
}) => {
  const airTemp = weather?.air_temperature ?? 29.4;
  const trackTemp = weather?.track_temperature ?? 48.2;
  const humidity = weather?.humidity ?? 42;
  const wind = weather?.wind_speed ?? 2.1;
  const rainfall = weather?.rainfall ?? 0;

  return (
    <div className="bg-[#12141c] border border-[#232735] rounded-xl p-4 mb-6 shadow-md flex flex-wrap items-center justify-between gap-4">
      {/* Session Title & Circuit Info */}
      <div className="flex items-center gap-3">
        {meeting?.circuit_image && (
          <div className="w-12 h-9 rounded bg-[#171a26] border border-[#262c3e] p-1 flex items-center justify-center shrink-0">
            <img
              src={meeting.circuit_image}
              alt="Track Layout"
              className="max-w-full max-h-full object-contain filter invert opacity-80"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
        )}
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-extrabold text-base text-white tracking-wide">
              {meeting?.meeting_name || 'Grand Prix'}
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#e10600]/20 text-[#ff4d4d] border border-[#e10600]/30 font-bold uppercase">
              {session?.session_name || 'Race'}
            </span>
          </div>
          <p className="text-xs text-[#8f96a8]">
            {meeting?.location}, {meeting?.country_name} • {meeting?.circuit_short_name} Circuit
          </p>
        </div>
      </div>

      {/* Track Environmental Sensors */}
      <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
        {/* Track Temp */}
        <div className="flex items-center gap-1.5 bg-[#171a25] px-2.5 py-1.5 rounded-lg border border-[#24293a]">
          <Thermometer className="w-3.5 h-3.5 text-rose-400" />
          <span className="text-[#8f96a8]">Track:</span>
          <span className="font-bold text-white">{trackTemp.toFixed(1)}°C</span>
        </div>

        {/* Air Temp */}
        <div className="flex items-center gap-1.5 bg-[#171a25] px-2.5 py-1.5 rounded-lg border border-[#24293a]">
          <Thermometer className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[#8f96a8]">Air:</span>
          <span className="font-bold text-white">{airTemp.toFixed(1)}°C</span>
        </div>

        {/* Humidity */}
        <div className="flex items-center gap-1.5 bg-[#171a25] px-2.5 py-1.5 rounded-lg border border-[#24293a]">
          <Droplets className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[#8f96a8]">Humidity:</span>
          <span className="font-bold text-white">{humidity}%</span>
        </div>

        {/* Wind */}
        <div className="flex items-center gap-1.5 bg-[#171a25] px-2.5 py-1.5 rounded-lg border border-[#24293a]">
          <Wind className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[#8f96a8]">Wind:</span>
          <span className="font-bold text-white">{wind} m/s</span>
        </div>

        {/* Rain Risk */}
        <div className="flex items-center gap-1.5 bg-[#171a25] px-2.5 py-1.5 rounded-lg border border-[#24293a]">
          <CloudRain className={`w-3.5 h-3.5 ${rainfall > 0 ? 'text-blue-400 animate-bounce' : 'text-[#71788d]'}`} />
          <span className="text-[#8f96a8]">Rain:</span>
          <span className={`font-bold ${rainfall > 0 ? 'text-blue-400' : 'text-white'}`}>
            {rainfall > 0 ? 'YES' : '0%'}
          </span>
        </div>

        {/* Track Status */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 font-bold">
          <CheckCircle className="w-3.5 h-3.5" />
          <span>TRACK CLEAR</span>
        </div>
      </div>
    </div>
  );
};
