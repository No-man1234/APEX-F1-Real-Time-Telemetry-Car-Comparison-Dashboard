import React from 'react';
import type { Meeting, Session, Weather } from '../types/f1';
import { Thermometer, Wind, Droplets, CloudRain, CheckCircle2 } from 'lucide-react';

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
    <div className="bg-pitwall-panel border border-pitwall-border rounded-lg p-3 mb-4 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
      {/* Circuit & Session Details */}
      <div className="flex items-center gap-3">
        {meeting?.circuit_image && (
          <div className="w-10 h-7 rounded bg-pitwall-subpanel border border-pitwall-border p-0.5 flex items-center justify-center shrink-0">
            <img
              src={meeting.circuit_image}
              alt=""
              className="max-w-full max-h-full object-contain filter invert opacity-75"
              aria-hidden="true"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
        )}
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-xs sm:text-sm text-pitwall-textBright leading-tight">
              {meeting?.meeting_name || 'Grand Prix'}
            </h1>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-pitwall-subpanel text-[#e10600] border border-pitwall-border font-bold uppercase">
              {session?.session_name || 'Race'}
            </span>
          </div>
          <span className="text-[11px] text-pitwall-textMuted">
            {meeting?.location}, {meeting?.country_name} • {meeting?.circuit_short_name} Circuit
          </span>
        </div>
      </div>

      {/* Atmospheric Telemetry Sensors */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Track Surface Temp */}
        <div className="flex items-center gap-1.5 bg-pitwall-subpanel px-2 py-1 rounded border border-pitwall-border">
          <Thermometer className="w-3.5 h-3.5 text-rose-400" aria-hidden="true" />
          <span className="text-pitwall-textMuted">Track:</span>
          <span className="font-bold text-white tabular-nums">{trackTemp.toFixed(1)}°C</span>
        </div>

        {/* Ambient Air Temp */}
        <div className="flex items-center gap-1.5 bg-pitwall-subpanel px-2 py-1 rounded border border-pitwall-border">
          <Thermometer className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
          <span className="text-pitwall-textMuted">Air:</span>
          <span className="font-bold text-white tabular-nums">{airTemp.toFixed(1)}°C</span>
        </div>

        {/* Relative Humidity */}
        <div className="flex items-center gap-1.5 bg-pitwall-subpanel px-2 py-1 rounded border border-pitwall-border">
          <Droplets className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
          <span className="text-pitwall-textMuted">Humidity:</span>
          <span className="font-bold text-white tabular-nums">{humidity}%</span>
        </div>

        {/* Wind Speed */}
        <div className="flex items-center gap-1.5 bg-pitwall-subpanel px-2 py-1 rounded border border-pitwall-border">
          <Wind className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
          <span className="text-pitwall-textMuted">Wind:</span>
          <span className="font-bold text-white tabular-nums">{wind} m/s</span>
        </div>

        {/* Precipitation Risk */}
        <div className="flex items-center gap-1.5 bg-pitwall-subpanel px-2 py-1 rounded border border-pitwall-border">
          <CloudRain className={`w-3.5 h-3.5 ${rainfall > 0 ? 'text-blue-400' : 'text-pitwall-textMuted'}`} aria-hidden="true" />
          <span className="text-pitwall-textMuted">Rain:</span>
          <span className={`font-bold ${rainfall > 0 ? 'text-blue-400' : 'text-white'}`}>
            {rainfall > 0 ? 'WET' : '0%'}
          </span>
        </div>

        {/* FIA Track Status */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 font-bold">
          <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
          <span>TRACK CLEAR</span>
        </div>
      </div>
    </div>
  );
};
