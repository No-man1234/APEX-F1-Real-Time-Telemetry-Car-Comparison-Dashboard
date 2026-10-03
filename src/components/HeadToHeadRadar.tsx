import React from 'react';
import type { Driver, CarAnalysisStats, CarTelemetryComparisonPoint } from '../types/f1';

interface HeadToHeadRadarProps {
  driver1: Driver | null;
  driver2: Driver | null;
  stats1: CarAnalysisStats;
  stats2: CarAnalysisStats;
  selectedYear?: number;
  isComparisonMode?: boolean;
  currentPoint?: CarTelemetryComparisonPoint | null;
}

export const HeadToHeadRadar: React.FC<HeadToHeadRadarProps> = ({
  driver1,
  driver2,
  stats1,
  stats2,
  selectedYear = 2026,
  isComparisonMode = true,
  currentPoint,
}) => {
  const formatColor = (hex?: string) => {
    if (!hex) return '#e10600';
    return hex.startsWith('#') ? hex : `#${hex}`;
  };

  const c1Color = formatColor(driver1?.team_colour || '3671C6');
  const c2Color = formatColor(driver2?.team_colour || 'FF8000');

  // Concrete engineering telemetry scores
  const metrics = [
    {
      category: 'Terminal Speed / Aero Drag',
      c1Val: `${stats1.topSpeed} km/h`,
      c2Val: `${stats2.topSpeed} km/h`,
      c1Pct: Math.min(100, Math.round((stats1.topSpeed / 355) * 100)),
      c2Pct: Math.min(100, Math.round((stats2.topSpeed / 355) * 100)),
      diff: stats1.topSpeed - stats2.topSpeed,
      unit: 'km/h',
      description: selectedYear >= 2026
        ? 'End-of-straight terminal velocity with active aerodynamics (X-Mode) engaged'
        : 'End-of-straight terminal velocity with DRS deployed',
    },
    {
      category: 'Low-Speed Apex Speed',
      c1Val: `${stats1.apexSpeed} km/h`,
      c2Val: `${stats2.apexSpeed} km/h`,
      c1Pct: Math.min(100, Math.round((stats1.apexSpeed / 85) * 100)),
      c2Pct: Math.min(100, Math.round((stats2.apexSpeed / 85) * 100)),
      diff: stats1.apexSpeed - stats2.apexSpeed,
      unit: 'km/h',
      description: 'Mechanical grip and minimum apex speed in Turn 1/2 chicanes',
    },
    {
      category: 'Full-Throttle Duty Cycle',
      c1Val: `${stats1.timeUnderFullThrottle}%`,
      c2Val: `${stats2.timeUnderFullThrottle}%`,
      c1Pct: stats1.timeUnderFullThrottle,
      c2Pct: stats2.timeUnderFullThrottle,
      diff: stats1.timeUnderFullThrottle - stats2.timeUnderFullThrottle,
      unit: '%',
      description: 'Percentage of cumulative lap distance driven at 100% throttle',
    },
    {
      category: 'Average Throttle Input',
      c1Val: `${stats1.avgThrottle}%`,
      c2Val: `${stats2.avgThrottle}%`,
      c1Pct: stats1.avgThrottle,
      c2Pct: stats2.avgThrottle,
      diff: stats1.avgThrottle - stats2.avgThrottle,
      unit: '%',
      description: 'Mean throttle application rate across braking and cornering phases',
    },
    {
      category: 'Heavy Braking Applications',
      c1Val: `${stats1.hardBrakingEvents} zones`,
      c2Val: `${stats2.hardBrakingEvents} zones`,
      c1Pct: Math.min(100, 60 + stats1.hardBrakingEvents * 8),
      c2Pct: Math.min(100, 60 + stats2.hardBrakingEvents * 8),
      diff: stats1.hardBrakingEvents - stats2.hardBrakingEvents,
      unit: 'zones',
      description: 'Deceleration zones exceeding 5G threshold and 80%+ brake pressure',
    },
    {
      category: 'Engine RPM Powerband',
      c1Val: `${stats1.avgRpm.toLocaleString()} RPM`,
      c2Val: `${stats2.avgRpm.toLocaleString()} RPM`,
      c1Pct: Math.min(100, Math.round((stats1.avgRpm / 12200) * 100)),
      c2Pct: Math.min(100, Math.round((stats2.avgRpm / 12200) * 100)),
      diff: stats1.avgRpm - stats2.avgRpm,
      unit: 'RPM',
      description: 'Average engine speed through acceleration and gear-shift phases',
    },
  ];

  return (
    <section aria-label="Vehicle Dynamics Telemetry Comparison" className="bg-pitwall-panel border border-pitwall-border rounded-lg p-4 mb-5 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b border-pitwall-border">
        <div>
          <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-pitwall-textBright">
            Vehicle Dynamics & Telemetry Profiling
          </h2>
          <p className="text-xs text-pitwall-textMuted font-mono">
            Full-Lap Engineering Benchmarks (Static Analysis) • Instantaneous Snapshot (Live Replay)
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: c1Color }} aria-hidden="true" />
            <span className="font-bold text-pitwall-textBright">
              {driver1?.name_acronym} {!isComparisonMode && '(Solo Car Profile)'}
            </span>
          </div>
          {isComparisonMode && driver2 && (
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: c2Color }} aria-hidden="true" />
              <span className="font-bold text-pitwall-textBright">{driver2?.name_acronym}</span>
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Instantaneous Snapshot Strip */}
      {currentPoint && (
        <div className="bg-pitwall-subpanel border border-pitwall-border rounded p-2.5 mb-3 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-pitwall-bg text-pitwall-textMuted font-bold uppercase border border-pitwall-border">
              REPLAY SNAPSHOT
            </span>
            <span className="text-pitwall-textMuted text-[11px]">
              Pos: {currentPoint.percentage}% ({currentPoint.distance}m)
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="font-bold" style={{ color: c1Color }}>{driver1?.name_acronym}:</span>
              <span className="font-bold text-pitwall-textBright tabular-nums">{currentPoint.c1Speed} km/h</span>
              <span className="text-[11px] text-pitwall-textMuted">T:{currentPoint.c1Throttle}% B:{currentPoint.c1Brake}% G{currentPoint.c1Gear}</span>
            </div>
            {isComparisonMode && driver2 && (
              <div className="flex items-center gap-1.5 border-l border-pitwall-border pl-3">
                <span className="font-bold" style={{ color: c2Color }}>{driver2.name_acronym}:</span>
                <span className="font-bold text-pitwall-textBright tabular-nums">{currentPoint.c2Speed} km/h</span>
                <span className={`text-[11px] font-bold tabular-nums ${currentPoint.speedDelta >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  (Δ {currentPoint.speedDelta >= 0 ? `+${currentPoint.speedDelta}` : currentPoint.speedDelta} km/h)
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
        {metrics.map((m, idx) => {
          const c1Ahead = m.diff > 0;
          const c2Ahead = m.diff < 0;

          return (
            <div
              key={idx}
              className="bg-pitwall-subpanel border border-pitwall-border rounded p-3"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-pitwall-textBright">{m.category}</span>
                {isComparisonMode ? (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                      c1Ahead
                        ? 'text-emerald-700 bg-emerald-50 border border-emerald-300 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/30'
                        : c2Ahead
                        ? 'text-cyan-700 bg-cyan-50 border border-cyan-300 dark:text-cyan-400 dark:bg-cyan-500/10 dark:border-cyan-500/30'
                        : 'text-pitwall-textMuted bg-pitwall-bg border border-pitwall-border'
                    }`}
                  >
                    {c1Ahead ? `${driver1?.name_acronym} +${Math.abs(m.diff)} ${m.unit}` : c2Ahead ? `${driver2?.name_acronym} +${Math.abs(m.diff)} ${m.unit}` : 'Parity'}
                  </span>
                ) : (
                  <span className="text-[10px] px-1.5 py-0.2 rounded font-bold text-pitwall-textMuted bg-pitwall-bg border border-pitwall-border">
                    Telemetry Channel
                  </span>
                )}
              </div>
              <p className="text-[11px] text-pitwall-textMuted mb-2.5">{m.description}</p>

              {/* Progress Bars */}
              <div className="space-y-1.5">
                {/* Car 1 */}
                <div className="flex items-center gap-2">
                  <span className="w-9 font-bold text-[11px]" style={{ color: c1Color }}>
                    {driver1?.name_acronym}
                  </span>
                  <div className="flex-1 h-2 bg-pitwall-bg rounded-xs overflow-hidden">
                    <div
                      className="h-full rounded-xs transition-all duration-200"
                      style={{ width: `${m.c1Pct}%`, backgroundColor: c1Color }}
                    />
                  </div>
                  <span className="w-16 text-right font-bold text-pitwall-textBright tabular-nums text-[11px]">
                    {m.c1Val}
                  </span>
                </div>

                {/* Car 2 (Only in comparison mode) */}
                {isComparisonMode && (
                  <div className="flex items-center gap-2">
                    <span className="w-9 font-bold text-[11px]" style={{ color: c2Color }}>
                      {driver2?.name_acronym}
                    </span>
                    <div className="flex-1 h-2 bg-pitwall-bg rounded-xs overflow-hidden">
                      <div
                        className="h-full rounded-xs transition-all duration-200"
                        style={{ width: `${m.c2Pct}%`, backgroundColor: c2Color }}
                      />
                    </div>
                    <span className="w-16 text-right font-bold text-pitwall-textBright tabular-nums text-[11px]">
                      {m.c2Val}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Engineering Sector Summary */}
      <div className="mt-4 pt-3 border-t border-pitwall-border text-xs font-mono">
        <h3 className="font-bold text-pitwall-textBright text-xs uppercase mb-2">
          Telemetry Observation Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-pitwall-subpanel border border-pitwall-border rounded p-2.5">
            <span className="font-bold text-pitwall-textBright block mb-1">High-Speed Section</span>
            <p className="text-[11px] text-pitwall-textSecondary leading-relaxed">
              {isComparisonMode
                ? `${stats1.topSpeed >= stats2.topSpeed ? driver1?.full_name : driver2?.full_name} carries +${Math.abs(stats1.topSpeed - stats2.topSpeed)} km/h terminal velocity, suggesting a lower aerodynamic drag configuration or higher ERS deployment on the primary straight.`
                : `${driver1?.full_name} logs a top terminal velocity of ${stats1.topSpeed} km/h on the main straight.`}
            </p>
          </div>

          <div className="bg-pitwall-subpanel border border-pitwall-border rounded p-2.5">
            <span className="font-bold text-pitwall-textBright block mb-1">Apex Balance</span>
            <p className="text-[11px] text-pitwall-textSecondary leading-relaxed">
              {isComparisonMode
                ? `${stats1.apexSpeed >= stats2.apexSpeed ? driver1?.name_acronym : driver2?.name_acronym} maintains +${Math.abs(stats1.apexSpeed - stats2.apexSpeed)} km/h higher minimum speed through slow corners, pointing to stronger front-end mechanical bite on corner entry.`
                : `${driver1?.name_acronym} maintains a minimum apex speed of ${stats1.apexSpeed} km/h through slow-speed corners.`}
            </p>
          </div>

          <div className="bg-pitwall-subpanel border border-pitwall-border rounded p-2.5">
            <span className="font-bold text-pitwall-textBright block mb-1">Power Application</span>
            <p className="text-[11px] text-pitwall-textSecondary leading-relaxed">
              {isComparisonMode
                ? `${stats1.timeUnderFullThrottle >= stats2.timeUnderFullThrottle ? driver1?.name_acronym : driver2?.name_acronym} logged ${Math.abs(stats1.timeUnderFullThrottle - stats2.timeUnderFullThrottle)}% more time at 100% throttle, gaining time on traction-limited corner exits.`
                : `${driver1?.name_acronym} spends ${stats1.timeUnderFullThrottle}% of lap distance at 100% throttle.`}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
