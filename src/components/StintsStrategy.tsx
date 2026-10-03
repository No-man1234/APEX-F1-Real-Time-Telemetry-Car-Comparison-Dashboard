import React from 'react';
import type { Driver, Stint } from '../types/f1';
import { Disc, TrendingDown } from 'lucide-react';

interface StintsStrategyProps {
  driver1: Driver | null;
  driver2: Driver | null;
  stints: Stint[];
}

export const StintsStrategy: React.FC<StintsStrategyProps> = ({
  driver1,
  driver2,
  stints,
}) => {
  const formatColor = (hex?: string) => {
    if (!hex) return '#e10600';
    return hex.startsWith('#') ? hex : `#${hex}`;
  };

  const c1Color = formatColor(driver1?.team_colour || '3671C6');
  const c2Color = formatColor(driver2?.team_colour || 'FF8000');

  const getTyreColor = (compound: string) => {
    switch (compound?.toUpperCase()) {
      case 'SOFT':
        return '#e10600';
      case 'MEDIUM':
        return '#ffd100';
      case 'HARD':
        return '#ffffff';
      case 'INTERMEDIATE':
        return '#39b54a';
      case 'WET':
        return '#0072ce';
      default:
        return '#ffd100';
    }
  };

  // Filter stints or provide representative simulation
  const d1Stints = stints.filter((s) => s.driver_number === driver1?.driver_number);
  const d2Stints = stints.filter((s) => s.driver_number === driver2?.driver_number);

  const fallbackD1Stints: Stint[] = [
    { meeting_key: 1244, session_key: 9662, stint_number: 1, driver_number: 1, lap_start: 1, lap_end: 28, compound: 'MEDIUM', tyre_age_at_start: 0 },
    { meeting_key: 1244, session_key: 9662, stint_number: 2, driver_number: 1, lap_start: 29, lap_end: 53, compound: 'HARD', tyre_age_at_start: 0 },
  ];

  const fallbackD2Stints: Stint[] = [
    { meeting_key: 1244, session_key: 9662, stint_number: 1, driver_number: 4, lap_start: 1, lap_end: 18, compound: 'MEDIUM', tyre_age_at_start: 0 },
    { meeting_key: 1244, session_key: 9662, stint_number: 2, driver_number: 4, lap_start: 19, lap_end: 42, compound: 'HARD', tyre_age_at_start: 0 },
    { meeting_key: 1244, session_key: 9662, stint_number: 3, driver_number: 4, lap_start: 43, lap_end: 53, compound: 'SOFT', tyre_age_at_start: 2 },
  ];

  const s1List = d1Stints.length ? d1Stints : fallbackD1Stints;
  const s2List = d2Stints.length ? d2Stints : fallbackD2Stints;
  const totalLaps = 53;

  const renderStintBar = (stintsList: Stint[], driverName?: string, driverColor?: string) => {
    return (
      <div className="bg-[#171a26] border border-[#262c3e] rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: driverColor }} />
            <span className="font-mono font-bold text-sm text-white">{driverName}</span>
          </div>
          <span className="text-xs font-mono text-[#8f96a8]">
            {stintsList.length} Stint{stintsList.length > 1 ? 's' : ''} ({stintsList.length - 1} Pit Stop{stintsList.length > 2 ? 's' : ''})
          </span>
        </div>

        {/* Visual Stint Bar */}
        <div className="w-full h-8 bg-[#0b0c12] rounded-lg overflow-hidden flex border border-[#232735]">
          {stintsList.map((stint, idx) => {
            const lapsInStint = Math.max(1, (stint.lap_end || totalLaps) - stint.lap_start + 1);
            const widthPct = (lapsInStint / totalLaps) * 100;
            const tyreCol = getTyreColor(stint.compound);

            return (
              <div
                key={idx}
                className="h-full relative flex items-center justify-center border-r border-[#0b0c12] transition-all hover:brightness-110"
                style={{
                  width: `${widthPct}%`,
                  backgroundColor: `${tyreCol}30`,
                  borderBottom: `4px solid ${tyreCol}`,
                }}
                title={`Stint ${stint.stint_number}: ${stint.compound} (Laps ${stint.lap_start}-${stint.lap_end || totalLaps})`}
              >
                <div className="flex items-center gap-1">
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block shadow-sm"
                    style={{ backgroundColor: tyreCol }}
                  />
                  <span className="font-mono font-black text-[11px] text-white">
                    {stint.compound?.[0]}
                  </span>
                  <span className="text-[10px] font-mono text-[#8f96a8] hidden sm:inline">
                    ({lapsInStint}L)
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Stint Breakdown Badges */}
        <div className="mt-3 flex flex-wrap gap-2">
          {stintsList.map((stint, idx) => {
            const lapsInStint = Math.max(1, (stint.lap_end || totalLaps) - stint.lap_start + 1);
            const tyreCol = getTyreColor(stint.compound);

            return (
              <div
                key={idx}
                className="bg-[#0f1118] px-2.5 py-1 rounded border border-[#202534] text-[11px] font-mono flex items-center gap-1.5"
              >
                <span className="text-[#71788d]">Stint {stint.stint_number}:</span>
                <span className="font-bold text-white flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tyreCol }} />
                  {stint.compound}
                </span>
                <span className="text-[#8f96a8]">({lapsInStint} laps)</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[#12141c] border border-[#232735] rounded-xl p-5 shadow-2xl mb-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-4 border-b border-[#1f2331]">
        <div>
          <div className="flex items-center gap-2">
            <Disc className="w-5 h-5 text-[#e10600]" />
            <h2 className="text-base font-bold text-white tracking-wide uppercase font-f1">
              Tyre Compounds & Pit Stop Strategy
            </h2>
          </div>
          <p className="text-xs text-[#8f96a8]">
            Head-to-head stint lengths, tyre compound progression & pit windows
          </p>
        </div>

        {/* Compound Legend */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#e10600]" />
            <span className="text-white">Soft</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ffd100]" />
            <span className="text-white">Medium</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-white" />
            <span className="text-white">Hard</span>
          </div>
        </div>
      </div>

      {/* STINT BARS COMPARISON */}
      <div className="space-y-4">
        {renderStintBar(s1List, driver1?.full_name || 'Car 1', c1Color)}
        {renderStintBar(s2List, driver2?.full_name || 'Car 2', c2Color)}
      </div>

      {/* TYRE DEGRADATION & STRATEGY INSIGHT */}
      <div className="mt-5 p-4 rounded-xl bg-[#151824] border border-[#232838] flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono">
        <div className="flex items-center gap-3">
          <TrendingDown className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <div className="font-bold text-white">Estimated Tyre Degradation Slope</div>
            <div className="text-[11px] text-[#8f96a8]">
              Soft: ~0.082s / lap • Medium: ~0.048s / lap • Hard: ~0.025s / lap
            </div>
          </div>
        </div>

        <div className="text-[#8f96a8] bg-[#0c0e14] px-3 py-1.5 rounded-lg border border-[#202534]">
          Optimal Pit Window: <span className="text-emerald-400 font-bold">Laps 22 - 27</span>
        </div>
      </div>
    </div>
  );
};
