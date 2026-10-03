import React from 'react';
import type { Driver, CarAnalysisStats } from '../types/f1';
import { Radar, Award, Zap, Compass, Flame } from 'lucide-react';

interface HeadToHeadRadarProps {
  driver1: Driver | null;
  driver2: Driver | null;
  stats1: CarAnalysisStats;
  stats2: CarAnalysisStats;
}

export const HeadToHeadRadar: React.FC<HeadToHeadRadarProps> = ({
  driver1,
  driver2,
  stats1,
  stats2,
}) => {
  const formatColor = (hex?: string) => {
    if (!hex) return '#e10600';
    return hex.startsWith('#') ? hex : `#${hex}`;
  };

  const c1Color = formatColor(driver1?.team_colour || '3671C6');
  const c2Color = formatColor(driver2?.team_colour || 'FF8000');

  // Compute normalized scores out of 100
  const scores = [
    {
      category: 'Top Speed / Low Drag',
      c1: Math.min(100, Math.round((stats1.topSpeed / 355) * 100)),
      c2: Math.min(100, Math.round((stats2.topSpeed / 355) * 100)),
      description: 'Efficiency down main straight with DRS open',
    },
    {
      category: 'Slow Corner Apex Speed',
      c1: Math.min(100, Math.round((stats1.apexSpeed / 85) * 100)),
      c2: Math.min(100, Math.round((stats2.apexSpeed / 85) * 100)),
      description: 'Mechanical grip through slow chicanes (Turn 1/2)',
    },
    {
      category: 'Throttle Aggression',
      c1: stats1.avgThrottle,
      c2: stats2.avgThrottle,
      description: 'Average throttle input percentage per lap',
    },
    {
      category: 'Braking Commitment',
      c1: Math.min(100, 70 + stats1.hardBrakingEvents * 6),
      c2: Math.min(100, 70 + stats2.hardBrakingEvents * 6),
      description: 'Peak braking force and late apex deceleration',
    },
    {
      category: 'Power Delivery / Full Throttle',
      c1: stats1.timeUnderFullThrottle,
      c2: stats2.timeUnderFullThrottle,
      description: 'Percentage of the lap driven at 100% throttle',
    },
    {
      category: 'Engine RPM Utilization',
      c1: Math.min(100, Math.round((stats1.avgRpm / 12200) * 100)),
      c2: Math.min(100, Math.round((stats2.avgRpm / 12200) * 100)),
      description: 'Gear shift optimization and rev-band discipline',
    },
  ];

  return (
    <div className="bg-[#12141c] border border-[#232735] rounded-xl p-5 shadow-2xl mb-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-4 border-b border-[#1f2331]">
        <div>
          <div className="flex items-center gap-2">
            <Radar className="w-5 h-5 text-[#e10600]" />
            <h2 className="text-base font-bold text-white tracking-wide uppercase font-f1">
              Vehicle Dynamics & Performance Radar
            </h2>
          </div>
          <p className="text-xs text-[#8f96a8]">
            Multi-dimensional telemetry breakdown comparing aero efficiency, braking & traction
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: c1Color }} />
            <span className="text-white font-bold">{driver1?.name_acronym}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: c2Color }} />
            <span className="text-white font-bold">{driver2?.name_acronym}</span>
          </div>
        </div>
      </div>

      {/* COMPARATIVE BARS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scores.map((s, idx) => {
          const delta = s.c1 - s.c2;
          const winner = delta > 0 ? driver1?.name_acronym : delta < 0 ? driver2?.name_acronym : 'Tied';
          const winnerColor = delta > 0 ? c1Color : delta < 0 ? c2Color : '#ffffff';

          return (
            <div
              key={idx}
              className="bg-[#161925] border border-[#24293a] rounded-lg p-3.5 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-white font-mono">{s.category}</span>
                <span
                  className="text-[10px] font-mono px-2 py-0.5 rounded font-black"
                  style={{ color: winnerColor, backgroundColor: `${winnerColor}20` }}
                >
                  {winner} Advantage
                </span>
              </div>
              <p className="text-[11px] text-[#71788d] mb-3">{s.description}</p>

              {/* Bar Comparison */}
              <div className="space-y-2">
                {/* Car 1 Bar */}
                <div className="flex items-center gap-2">
                  <span className="w-8 text-[11px] font-mono font-bold text-[#8f96a8]">
                    {driver1?.name_acronym}
                  </span>
                  <div className="flex-1 h-2.5 bg-[#0e1017] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${s.c1}%`, backgroundColor: c1Color }}
                    />
                  </div>
                  <span className="w-8 text-right text-[11px] font-mono font-bold text-white">
                    {s.c1}
                  </span>
                </div>

                {/* Car 2 Bar */}
                <div className="flex items-center gap-2">
                  <span className="w-8 text-[11px] font-mono font-bold text-[#8f96a8]">
                    {driver2?.name_acronym}
                  </span>
                  <div className="flex-1 h-2.5 bg-[#0e1017] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${s.c2}%`, backgroundColor: c2Color }}
                    />
                  </div>
                  <span className="w-8 text-right text-[11px] font-mono font-bold text-white">
                    {s.c2}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* AUTOMATED AI TELEMETRY VERDICT */}
      <div className="mt-6 pt-5 border-t border-[#1f2331]">
        <div className="flex items-center gap-2 mb-3">
          <Flame className="w-4 h-4 text-[#e10600]" />
          <h3 className="text-xs font-mono font-bold uppercase text-white tracking-wider">
            Automated Telemetry Insights & Engineering Summary
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-[#171a26] border border-[#262c3e] rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs font-bold text-white mb-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Straight-Line Efficiency</span>
            </div>
            <p className="text-[11px] text-[#8f96a8] leading-relaxed">
              {stats1.topSpeed >= stats2.topSpeed ? driver1?.full_name : driver2?.full_name} produces higher end-of-straight terminal velocity (+{Math.abs(stats1.topSpeed - stats2.topSpeed)} km/h), demonstrating lower aerodynamic drag in high-speed DRS sections.
            </p>
          </div>

          <div className="bg-[#171a26] border border-[#262c3e] rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs font-bold text-white mb-1">
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>Apex Speed & Mechanical Grip</span>
            </div>
            <p className="text-[11px] text-[#8f96a8] leading-relaxed">
              {stats1.apexSpeed >= stats2.apexSpeed ? driver1?.name_acronym : driver2?.name_acronym} maintains higher minimum speeds (+{Math.abs(stats1.apexSpeed - stats2.apexSpeed)} km/h) through low-speed apexes, highlighting superior slow-speed turn-in balance.
            </p>
          </div>

          <div className="bg-[#171a26] border border-[#262c3e] rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs font-bold text-white mb-1">
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              <span>Traction & Throttle Commitment</span>
            </div>
            <p className="text-[11px] text-[#8f96a8] leading-relaxed">
              {stats1.timeUnderFullThrottle >= stats2.timeUnderFullThrottle ? driver1?.name_acronym : driver2?.name_acronym} spends {Math.abs(stats1.timeUnderFullThrottle - stats2.timeUnderFullThrottle)}% more time at full throttle, delivering power earlier on corner exits.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
