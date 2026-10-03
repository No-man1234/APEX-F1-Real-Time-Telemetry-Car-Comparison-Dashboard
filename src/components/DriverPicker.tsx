import React from 'react';
import type { Driver } from '../types/f1';
import { ArrowLeftRight, Sparkles } from 'lucide-react';

interface DriverPickerProps {
  drivers: Driver[];
  driver1: Driver | null;
  driver2: Driver | null;
  onSelectDriver1: (driver: Driver) => void;
  onSelectDriver2: (driver: Driver) => void;
  onSwapDrivers: () => void;
}

export const DriverPicker: React.FC<DriverPickerProps> = ({
  drivers,
  driver1,
  driver2,
  onSelectDriver1,
  onSelectDriver2,
  onSwapDrivers,
}) => {
  const formatColor = (hex: string) => {
    if (!hex) return '#e10600';
    return hex.startsWith('#') ? hex : `#${hex}`;
  };

  const c1Color = formatColor(driver1?.team_colour || '3671C6');
  const c2Color = formatColor(driver2?.team_colour || 'FF8000');

  return (
    <div className="bg-[#141620] border border-[#232735] rounded-xl p-4 shadow-lg mb-6">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* CAR 1 SELECTOR */}
        <div className="flex-1 w-full bg-[#191c28] border border-[#2b3042] rounded-lg p-3 relative overflow-hidden transition-all hover:border-[#3d455d]">
          <div
            className="absolute top-0 left-0 bottom-0 w-1.5"
            style={{ backgroundColor: c1Color }}
          />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono uppercase font-bold tracking-wider text-[#8f96a8] flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: c1Color }} />
              Car 1 (Benchmark)
            </span>
            {driver1 && (
              <span className="text-xs font-mono font-bold text-white px-2 py-0.5 rounded bg-[#0d0e14] border border-[#2e3346]">
                #{driver1.driver_number}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-[#0d0e14] border border-[#2b3042] flex items-center justify-center overflow-hidden shrink-0">
              {driver1?.headshot_url ? (
                <img
                  src={driver1.headshot_url}
                  alt={driver1.broadcast_name}
                  className="w-full h-full object-cover scale-110"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <span className="font-mono font-black text-sm text-[#8f96a8]">#{driver1?.driver_number || 1}</span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <select
                value={driver1?.driver_number || ''}
                onChange={(e) => {
                  const d = drivers.find((x) => x.driver_number === Number(e.target.value));
                  if (d) onSelectDriver1(d);
                }}
                className="w-full bg-[#0d0e14] text-white font-bold text-sm px-3 py-1.5 rounded border border-[#2b3042] outline-none cursor-pointer focus:border-[#e10600]"
              >
                {drivers.map((d) => (
                  <option key={d.driver_number} value={d.driver_number}>
                    #{d.driver_number} {d.full_name} ({d.team_name})
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-2 mt-1 text-xs text-[#8f96a8] truncate">
                <span className="font-semibold text-white">{driver1?.team_name || 'Team'}</span>
                <span>•</span>
                <span className="font-mono font-bold" style={{ color: c1Color }}>
                  {driver1?.name_acronym}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SWAP BUTTON */}
        <div className="flex flex-row lg:flex-col items-center gap-2 shrink-0">
          <button
            onClick={onSwapDrivers}
            className="p-2.5 rounded-lg bg-[#191c28] hover:bg-[#25293a] text-[#8f96a8] hover:text-white border border-[#2b3042] transition-transform active:scale-95 shadow-md flex items-center gap-1.5 text-xs font-semibold"
            title="Swap Car 1 and Car 2"
          >
            <ArrowLeftRight className="w-4 h-4 text-[#e10600]" />
            <span className="lg:hidden">Swap</span>
          </button>
        </div>

        {/* CAR 2 SELECTOR */}
        <div className="flex-1 w-full bg-[#191c28] border border-[#2b3042] rounded-lg p-3 relative overflow-hidden transition-all hover:border-[#3d455d]">
          <div
            className="absolute top-0 left-0 bottom-0 w-1.5"
            style={{ backgroundColor: c2Color }}
          />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono uppercase font-bold tracking-wider text-[#8f96a8] flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: c2Color }} />
              Car 2 (Challenger)
            </span>
            {driver2 && (
              <span className="text-xs font-mono font-bold text-white px-2 py-0.5 rounded bg-[#0d0e14] border border-[#2e3346]">
                #{driver2.driver_number}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-[#0d0e14] border border-[#2b3042] flex items-center justify-center overflow-hidden shrink-0">
              {driver2?.headshot_url ? (
                <img
                  src={driver2.headshot_url}
                  alt={driver2.broadcast_name}
                  className="w-full h-full object-cover scale-110"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <span className="font-mono font-black text-sm text-[#8f96a8]">#{driver2?.driver_number || 4}</span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <select
                value={driver2?.driver_number || ''}
                onChange={(e) => {
                  const d = drivers.find((x) => x.driver_number === Number(e.target.value));
                  if (d) onSelectDriver2(d);
                }}
                className="w-full bg-[#0d0e14] text-white font-bold text-sm px-3 py-1.5 rounded border border-[#2b3042] outline-none cursor-pointer focus:border-[#e10600]"
              >
                {drivers.map((d) => (
                  <option key={d.driver_number} value={d.driver_number}>
                    #{d.driver_number} {d.full_name} ({d.team_name})
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-2 mt-1 text-xs text-[#8f96a8] truncate">
                <span className="font-semibold text-white">{driver2?.team_name || 'Team'}</span>
                <span>•</span>
                <span className="font-mono font-bold" style={{ color: c2Color }}>
                  {driver2?.name_acronym}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Rivalry Presets */}
      <div className="mt-3 pt-3 border-t border-[#1e2230] flex flex-wrap items-center gap-2">
        <span className="text-[11px] text-[#71788d] flex items-center gap-1 font-mono font-medium">
          <Sparkles className="w-3 h-3 text-amber-400" /> Rivalry Presets:
        </span>
        {[
          { label: 'VER vs NOR', d1: 1, d2: 4 },
          { label: 'LEC vs HAM', d1: 16, d2: 44 },
          { label: 'NOR vs PIA', d1: 4, d2: 81 },
          { label: 'RUS vs ANT', d1: 63, d2: 12 },
          { label: 'SAI vs ALB', d1: 55, d2: 23 },
        ].map((preset) => (
          <button
            key={preset.label}
            onClick={() => {
              const p1 = drivers.find((x) => x.driver_number === preset.d1);
              const p2 = drivers.find((x) => x.driver_number === preset.d2);
              if (p1 && p2) {
                onSelectDriver1(p1);
                onSelectDriver2(p2);
              }
            }}
            className="text-[11px] px-2.5 py-1 rounded bg-[#191c28] hover:bg-[#25293a] text-[#a0a8be] hover:text-white border border-[#2b3042] transition-colors font-mono font-semibold"
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
};
