import React, { useState } from 'react';
import type { Driver, CarTelemetryComparisonPoint } from '../types/f1';

interface CockpitHUDProps {
  driver1: Driver | null;
  driver2: Driver | null;
  currentPoint: CarTelemetryComparisonPoint | null;
}

export const CockpitHUD: React.FC<CockpitHUDProps> = ({
  driver1,
  driver2,
  currentPoint
}) => {
  const [useMph, setUseMph] = useState(false);

  const formatColor = (hex?: string) => {
    if (!hex) return '#e10600';
    return hex.startsWith('#') ? hex : `#${hex}`;
  };

  const c1Color = formatColor(driver1?.team_colour || '3671C6');
  const c2Color = formatColor(driver2?.team_colour || 'FF8000');

  const c1Speed = currentPoint ? currentPoint.c1Speed : 295;
  const c2Speed = currentPoint ? currentPoint.c2Speed : 291;
  const c1Throttle = currentPoint ? currentPoint.c1Throttle : 100;
  const c2Throttle = currentPoint ? currentPoint.c2Throttle : 100;
  const c1Brake = currentPoint ? currentPoint.c1Brake : 0;
  const c2Brake = currentPoint ? currentPoint.c2Brake : 0;
  const c1Rpm = currentPoint ? currentPoint.c1Rpm : 11850;
  const c2Rpm = currentPoint ? currentPoint.c2Rpm : 11720;
  const c1Gear = currentPoint ? currentPoint.c1Gear : 7;
  const c2Gear = currentPoint ? currentPoint.c2Gear : 7;
  const c1Drs = currentPoint ? currentPoint.c1Drs > 0 : true;
  const c2Drs = currentPoint ? currentPoint.c2Drs > 0 : true;
  const timeDelta = currentPoint ? currentPoint.timeDelta : 0.084;

  const toSpeed = (val: number) => (useMph ? Math.round(val * 0.621371) : val);
  const speedUnit = useMph ? 'MPH' : 'KM/H';

  // 15-LED Sequential Rev Counter (5 Green, 5 Red, 5 Blue)
  const renderShiftLights = (rpm: number) => {
    const totalLeds = 15;
    const minRpm = 6000;
    const maxRpm = 12500;
    const activeLeds = Math.min(
      totalLeds,
      Math.max(0, Math.floor(((rpm - minRpm) / (maxRpm - minRpm)) * totalLeds))
    );
    const isShiftWindow = rpm >= 12100;

    return (
      <div className="flex items-center justify-between gap-1 p-1.5 rounded bg-[#090b10] border border-pitwall-border">
        {Array.from({ length: totalLeds }).map((_, i) => {
          let ledColor = '#00d26a'; // Green 1-5
          if (i >= 5 && i < 10) ledColor = '#e10600'; // Red 6-10
          if (i >= 10) ledColor = '#1e88e5'; // Blue 11-15

          const isActive = i < activeLeds;
          return (
            <div
              key={i}
              className={`flex-1 h-3 rounded-xs transition-colors ${
                isShiftWindow && i >= 10 ? 'animate-pulse' : ''
              }`}
              style={{
                backgroundColor: isActive ? ledColor : '#181c28',
                border: `1px solid ${isActive ? ledColor : '#252a3b'}`,
              }}
              aria-hidden="true"
            />
          );
        })}
      </div>
    );
  };

  const renderWheelDisplay = (
    driver: Driver | null,
    color: string,
    speed: number,
    gear: number,
    rpm: number,
    throttle: number,
    brake: number,
    drs: boolean,
    delta: number,
    channelLabel: string
  ) => {
    return (
      <div className="bg-pitwall-subpanel border border-pitwall-border rounded-lg p-4 flex flex-col justify-between">
        {/* Steering Wheel Header */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-pitwall-border">
          <div className="flex items-center gap-2">
            <span
              className="px-1.5 py-0.5 rounded text-xs font-mono font-bold text-white"
              style={{ backgroundColor: color }}
            >
              #{driver?.driver_number || 1}
            </span>
            <div>
              <span className="font-mono font-bold text-xs text-pitwall-textBright block leading-tight">
                {driver?.full_name || 'Driver'}
              </span>
              <span className="text-[10px] text-pitwall-textMuted font-mono">
                {channelLabel} • {driver?.team_name}
              </span>
            </div>
          </div>

          {/* DRS State */}
          <div
            className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-bold border ${
              drs
                ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/50'
                : 'bg-pitwall-bg text-pitwall-textMuted border-pitwall-border'
            }`}
          >
            {drs ? 'DRS ENABLED' : 'DRS CLOSED'}
          </div>
        </div>

        {/* 15-LED Shift Light Bar */}
        <div className="mb-3">
          {renderShiftLights(rpm)}
          <div className="flex justify-between items-center text-[10px] font-mono text-pitwall-textMuted mt-1">
            <span>6k</span>
            <span className="text-white font-bold tabular-nums">{rpm.toLocaleString()} RPM</span>
            <span>12.5k</span>
          </div>
        </div>

        {/* PCU-8D Display Core */}
        <div className="bg-[#08090d] border border-pitwall-border rounded p-3 grid grid-cols-3 gap-2 items-center mb-3 text-center font-mono">
          {/* Velocity Display */}
          <div className="col-span-2 bg-[#0d0f15] border border-pitwall-border/80 rounded p-2">
            <span className="text-[10px] text-pitwall-textMuted block uppercase">VELOCITY</span>
            <div className="flex items-baseline justify-center gap-1 mt-0.5">
              <span className="text-4xl font-extrabold text-white tracking-tighter tabular-nums">
                {toSpeed(speed)}
              </span>
              <span className="text-[11px] text-pitwall-textMuted font-bold">{speedUnit}</span>
            </div>
          </div>

          {/* Large Gear Character */}
          <div className="bg-[#0d0f15] border border-pitwall-border/80 rounded p-2 flex flex-col justify-center">
            <span className="text-[10px] text-pitwall-textMuted block uppercase">GEAR</span>
            <span className="text-4xl font-black text-amber-400 tabular-nums">
              {gear > 0 ? gear : 'N'}
            </span>
          </div>
        </div>

        {/* Telemetry Delta Pill */}
        <div className="bg-pitwall-bg border border-pitwall-border rounded p-2 flex items-center justify-between text-xs font-mono mb-3">
          <span className="text-pitwall-textMuted text-[11px]">LAP DELTA (Δt):</span>
          <span
            className={`font-bold tabular-nums ${
              delta >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {delta >= 0 ? `+${delta.toFixed(3)}s` : `${delta.toFixed(3)}s`}
          </span>
        </div>

        {/* Graduated Pedal Gauges */}
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          {/* Throttle Bar */}
          <div className="bg-[#0a0c12] border border-pitwall-border rounded p-2">
            <div className="flex justify-between items-center text-[11px] mb-1">
              <span className="text-emerald-400 font-bold">THROTTLE</span>
              <span className="text-white font-bold tabular-nums">{throttle}%</span>
            </div>
            <div className="w-full h-2.5 bg-pitwall-bg rounded-xs overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-75"
                style={{ width: `${throttle}%` }}
              />
            </div>
          </div>

          {/* Brake Bar */}
          <div className="bg-[#0a0c12] border border-pitwall-border rounded p-2">
            <div className="flex justify-between items-center text-[11px] mb-1">
              <span className="text-rose-400 font-bold">BRAKE</span>
              <span className="text-white font-bold tabular-nums">{brake}%</span>
            </div>
            <div className="w-full h-2.5 bg-pitwall-bg rounded-xs overflow-hidden">
              <div
                className="h-full bg-rose-500 transition-all duration-75"
                style={{ width: `${brake}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section aria-label="Cockpit Telemetry Gauges" className="bg-pitwall-panel border border-pitwall-border rounded-lg p-4 mb-5 shadow-xs">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-pitwall-border">
        <div>
          <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-pitwall-textBright">
            Cockpit Telemetry Gauges
          </h2>
          <p className="text-xs text-pitwall-textMuted font-mono">
            Dual Steering Wheel Displays • Shift Light Sequencing • Pedal Travel
          </p>
        </div>

        {/* Speed Unit Toggle */}
        <div className="flex items-center gap-1 bg-pitwall-subpanel p-0.5 rounded border border-pitwall-border text-xs font-mono">
          <button
            onClick={() => setUseMph(false)}
            aria-pressed={!useMph}
            className={`px-2 py-0.5 rounded font-bold text-[11px] ${
              !useMph ? 'bg-pitwall-card text-white' : 'text-pitwall-textMuted hover:text-white'
            }`}
          >
            KM/H
          </button>
          <button
            onClick={() => setUseMph(true)}
            aria-pressed={useMph}
            className={`px-2 py-0.5 rounded font-bold text-[11px] ${
              useMph ? 'bg-pitwall-card text-white' : 'text-pitwall-textMuted hover:text-white'
            }`}
          >
            MPH
          </button>
        </div>
      </div>

      {/* Dual Steering Wheel Displays Side-by-Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderWheelDisplay(
          driver1,
          c1Color,
          c1Speed,
          c1Gear,
          c1Rpm,
          c1Throttle,
          c1Brake,
          c1Drs,
          timeDelta,
          'Reference Car'
        )}
        {renderWheelDisplay(
          driver2,
          c2Color,
          c2Speed,
          c2Gear,
          c2Rpm,
          c2Throttle,
          c2Brake,
          c2Drs,
          -timeDelta,
          'Challenger Car'
        )}
      </div>
    </section>
  );
};
