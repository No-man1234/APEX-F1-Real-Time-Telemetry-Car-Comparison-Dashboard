import React from 'react';
import type { Driver } from '../types/f1';
import { ArrowLeftRight, Plus, X } from 'lucide-react';
import { formatLapTime } from '../utils/f1Formatters';

interface DriverPickerProps {
  drivers: Driver[];
  driver1: Driver | null;
  driver2: Driver | null;
  onSelectDriver1: (driver: Driver) => void;
  onSelectDriver2: (driver: Driver) => void;
  onSwapDrivers: () => void;
  isComparisonMode: boolean;
  onToggleComparisonMode: () => void;
  driverLapsMap?: Map<number, { best: number }>;
}

export const DriverPicker: React.FC<DriverPickerProps> = ({
  drivers,
  driver1,
  driver2,
  onSelectDriver1,
  onSelectDriver2,
  onSwapDrivers,
  isComparisonMode,
  onToggleComparisonMode,
  driverLapsMap,
}) => {
  const formatColor = (hex?: string) => {
    if (!hex) return '#e10600';
    return hex.startsWith('#') ? hex : `#${hex}`;
  };

  const c1Color = formatColor(driver1?.team_colour || '3671C6');
  const c2Color = formatColor(driver2?.team_colour || 'FF8000');

  // Format driver label with position and best lap time
  const getDriverOptionLabel = (d: Driver, idx: number) => {
    const bestSec = driverLapsMap?.get(d.driver_number)?.best;
    const timeStr = bestSec ? ` (${formatLapTime(bestSec)})` : '';
    return `P${idx + 1} • #${d.driver_number} ${d.broadcast_name}${timeStr} - ${d.team_name}`;
  };

  return (
    <section aria-label="Telemetry Driver Channels" className="bg-pitwall-panel border border-pitwall-border rounded-lg p-3.5 mb-5 shadow-xs">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* CHANNEL 1: ACTIVE / REFERENCE CAR */}
        <div className="flex-1 bg-pitwall-subpanel border border-pitwall-border rounded-md p-3 transition-colors hover:border-pitwall-borderLight">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-xs shrink-0"
                style={{ backgroundColor: c1Color }}
                aria-hidden="true"
              />
              <span className="text-[11px] font-mono uppercase font-bold tracking-wider text-pitwall-textMuted">
                {isComparisonMode ? 'Channel 1 • Reference Car' : 'Primary Car Telemetry'}
              </span>
            </div>
            {driver1 && (
              <span
                className="text-xs font-mono font-bold px-1.5 py-0.2 rounded text-white"
                style={{ backgroundColor: c1Color }}
              >
                #{driver1.driver_number}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded bg-pitwall-bg border border-pitwall-border flex items-center justify-center overflow-hidden shrink-0">
              {driver1?.headshot_url ? (
                <img
                  src={driver1.headshot_url}
                  alt={`${driver1.broadcast_name} headshot`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <span className="font-mono font-black text-xs text-pitwall-textMuted">
                  {driver1?.name_acronym || 'C1'}
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <label htmlFor="driver1-select" className="sr-only">Select Reference Driver</label>
              <select
                id="driver1-select"
                value={driver1?.driver_number || ''}
                onChange={(e) => {
                  const d = drivers.find((x) => x.driver_number === Number(e.target.value));
                  if (d) onSelectDriver1(d);
                }}
                className="w-full bg-pitwall-bg text-pitwall-textBright font-mono font-bold text-xs sm:text-sm px-2.5 py-1.5 rounded border border-pitwall-border outline-none cursor-pointer focus-visible:ring-1 focus-visible:ring-[#e10600]"
              >
                {drivers.map((d, idx) => (
                  <option key={d.driver_number} value={d.driver_number} className="bg-pitwall-panel text-pitwall-textBright">
                    {getDriverOptionLabel(d, idx)}
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-2 mt-1 text-xs text-pitwall-textSecondary truncate font-mono">
                <span className="font-semibold text-pitwall-textBright">{driver1?.team_name || 'Constructor'}</span>
                <span className="text-pitwall-textMuted">•</span>
                <span className="font-bold" style={{ color: c1Color }}>
                  {driver1?.name_acronym}
                </span>
                {driverLapsMap?.get(driver1?.driver_number || 0)?.best && (
                  <>
                    <span className="text-pitwall-textMuted">•</span>
                    <span className="text-pitwall-textMuted font-bold">
                      Best: {formatLapTime(driverLapsMap.get(driver1?.driver_number || 0)?.best)}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* COMPARISON CONTROLS */}
        {isComparisonMode ? (
          <>
            {/* SWAP BUTTON */}
            <div className="flex items-center justify-center py-1 lg:py-0 shrink-0">
              <button
                onClick={onSwapDrivers}
                aria-label="Swap Reference and Comparison Channels"
                className="p-2 rounded bg-pitwall-subpanel hover:bg-pitwall-card text-pitwall-textSecondary hover:text-pitwall-textBright border border-pitwall-border transition-colors flex items-center gap-1.5 text-xs font-mono font-semibold"
                title="Swap Channel 1 and Channel 2"
              >
                <ArrowLeftRight className="w-4 h-4" aria-hidden="true" />
                <span className="lg:hidden">Swap Channels</span>
              </button>
            </div>

            {/* CHANNEL 2: COMPARISON CAR */}
            <div className="flex-1 bg-pitwall-subpanel border border-pitwall-border rounded-md p-3 transition-colors hover:border-pitwall-borderLight relative">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-xs shrink-0"
                    style={{ backgroundColor: c2Color }}
                    aria-hidden="true"
                  />
                  <span className="text-[11px] font-mono uppercase font-bold tracking-wider text-pitwall-textMuted">
                    Channel 2 • Comparison Car
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {driver2 && (
                    <span
                      className="text-xs font-mono font-bold px-1.5 py-0.2 rounded text-white"
                      style={{ backgroundColor: c2Color }}
                    >
                      #{driver2.driver_number}
                    </span>
                  )}
                  {/* Remove Comparison Button */}
                  <button
                    onClick={onToggleComparisonMode}
                    aria-label="Remove comparison and return to Solo mode"
                    className="p-1 rounded text-pitwall-textMuted hover:text-pitwall-textBright hover:bg-pitwall-card transition-colors"
                    title="Remove Comparison (Solo Mode)"
                  >
                    <X className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded bg-pitwall-bg border border-pitwall-border flex items-center justify-center overflow-hidden shrink-0">
                  {driver2?.headshot_url ? (
                    <img
                      src={driver2.headshot_url}
                      alt={`${driver2.broadcast_name} headshot`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <span className="font-mono font-black text-xs text-pitwall-textMuted">
                      {driver2?.name_acronym || 'C2'}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <label htmlFor="driver2-select" className="sr-only">Select Comparison Driver</label>
                  <select
                    id="driver2-select"
                    value={driver2?.driver_number || ''}
                    onChange={(e) => {
                      const d = drivers.find((x) => x.driver_number === Number(e.target.value));
                      if (d) onSelectDriver2(d);
                    }}
                    className="w-full bg-pitwall-bg text-pitwall-textBright font-mono font-bold text-xs sm:text-sm px-2.5 py-1.5 rounded border border-pitwall-border outline-none cursor-pointer focus-visible:ring-1 focus-visible:ring-[#e10600]"
                  >
                    {drivers.map((d, idx) => (
                      <option key={d.driver_number} value={d.driver_number} className="bg-pitwall-panel text-pitwall-textBright">
                        {getDriverOptionLabel(d, idx)}
                      </option>
                    ))}
                  </select>
                  <div className="flex items-center gap-2 mt-1 text-xs text-pitwall-textSecondary truncate font-mono">
                    <span className="font-semibold text-pitwall-textBright">{driver2?.team_name || 'Constructor'}</span>
                    <span className="text-pitwall-textMuted">•</span>
                    <span className="font-bold" style={{ color: c2Color }}>
                      {driver2?.name_acronym}
                    </span>
                    {driverLapsMap?.get(driver2?.driver_number || 0)?.best && (
                      <>
                        <span className="text-pitwall-textMuted">•</span>
                        <span className="text-pitwall-textMuted font-bold">
                          Best: {formatLapTime(driverLapsMap.get(driver2?.driver_number || 0)?.best)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* OPTIONAL COMPARISON PROMPT (SOLO MODE) */
          <div className="flex-1 flex items-center justify-center p-3 border border-dashed border-pitwall-border rounded-md bg-pitwall-subpanel/50">
            <button
              onClick={onToggleComparisonMode}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded bg-pitwall-panel hover:bg-pitwall-card text-pitwall-textSecondary hover:text-pitwall-textBright border border-pitwall-border transition-colors text-xs font-mono font-semibold"
            >
              <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
              <span>+ Add Comparison Car (Head-to-Head Mode)</span>
            </button>
          </div>
        )}
      </div>

      {/* Benchmark Pairings Bar (Only shown in comparison mode) */}
      {isComparisonMode && (
        <div className="mt-3 pt-2.5 border-t border-pitwall-border flex flex-wrap items-center gap-1.5 text-xs font-mono">
          <span className="text-[11px] text-pitwall-textMuted mr-1">
            Quick Pairs:
          </span>
          {[
            { label: 'P1 vs P2 (Leaders)', i1: 0, i2: 1 },
            { label: 'VER / NOR', d1: 1, d2: 4 },
            { label: 'LEC / HAM', d1: 16, d2: 44 },
            { label: 'NOR / PIA', d1: 4, d2: 81 },
            { label: 'RUS / ANT', d1: 63, d2: 12 },
          ].map((preset) => (
            <button
              key={preset.label}
              onClick={() => {
                if (preset.i1 !== undefined && preset.i2 !== undefined) {
                  if (drivers[preset.i1] && drivers[preset.i2]) {
                    onSelectDriver1(drivers[preset.i1]);
                    onSelectDriver2(drivers[preset.i2]);
                  }
                } else if (preset.d1 && preset.d2) {
                  const p1 = drivers.find((x) => x.driver_number === preset.d1);
                  const p2 = drivers.find((x) => x.driver_number === preset.d2);
                  if (p1 && p2) {
                    onSelectDriver1(p1);
                    onSelectDriver2(p2);
                  }
                }
              }}
              className="text-[11px] px-2 py-0.5 rounded bg-pitwall-subpanel hover:bg-pitwall-card text-pitwall-textSecondary hover:text-pitwall-textBright border border-pitwall-border transition-colors font-semibold"
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}
    </section>
  );
};
