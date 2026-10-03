import React, { useMemo } from 'react';
import type { Driver, Meeting } from '../types/f1';
import { getCircuitCoordinates } from '../services/circuitCoordinates';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface TrackMinimapProps {
  meeting: Meeting | null;
  driver1: Driver | null;
  driver2: Driver | null;
  progressPercentage: number;
  locations?: { x: number; y: number }[];
  onTrackClick?: (percentage: number) => void;
  isComparisonMode: boolean;
  theme: 'dark' | 'light';
  isPlaying?: boolean;
  onTogglePlay?: () => void;
  onResetReplay?: () => void;
  playbackSpeed?: number;
  onChangeSpeed?: (speed: number) => void;
  currentSpeed?: number;
  c2Speed?: number;
}

export const TrackMinimap: React.FC<TrackMinimapProps> = ({
  meeting,
  driver1,
  driver2,
  progressPercentage,
  locations,
  onTrackClick,
  isComparisonMode,
  theme,
  isPlaying,
  onTogglePlay,
  onResetReplay,
  playbackSpeed = 1,
  onChangeSpeed,
  currentSpeed,
  c2Speed,
}) => {
  const formatColor = (hex?: string) => {
    if (!hex) return '#e10600';
    return hex.startsWith('#') ? hex : `#${hex}`;
  };

  const c1Color = formatColor(driver1?.team_colour || '3671C6');
  const c2Color = formatColor(driver2?.team_colour || 'FF8000');

  const trackPoints = useMemo(() => {
    if (locations && locations.length > 20) {
      return locations;
    }
    return getCircuitCoordinates(meeting?.circuit_short_name, meeting?.meeting_name);
  }, [locations, meeting]);

  // Normalize points to SVG coordinate space
  const { pathString, s1Path, s2Path, s3Path, c1Pos, c2Pos, mappedPoints, startPos } = useMemo(() => {
    if (!trackPoints.length) {
      return {
        pathString: '',
        s1Path: '',
        s2Path: '',
        s3Path: '',
        c1Pos: { x: 280, y: 160 },
        c2Pos: { x: 280, y: 160 },
        mappedPoints: [],
        startPos: { x: 280, y: 160 },
      };
    }

    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    trackPoints.forEach((p) => {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    });

    const pad = 36;
    const svgW = 560;
    const svgH = 340;
    const scaleX = (svgW - pad * 2) / (maxX - minX || 1);
    const scaleY = (svgH - pad * 2) / (maxY - minY || 1);
    const scale = Math.min(scaleX, scaleY);

    const offsetX = (svgW - (maxX - minX) * scale) / 2;
    const offsetY = (svgH - (maxY - minY) * scale) / 2;

    // Invert Y coordinate so real-world northing maps right-side-up
    const toSvg = (p: { x: number; y: number }) => ({
      x: offsetX + (p.x - minX) * scale,
      y: offsetY + (maxY - p.y) * scale,
    });

    const mapped = trackPoints.map(toSvg);
    const fullPath = mapped.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`).join(' ') + ' Z';

    const n = mapped.length;
    const s1End = Math.floor(n * 0.33);
    const s2End = Math.floor(n * 0.68);

    const s1Segment = mapped.slice(0, s1End + 1).map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`).join(' ');
    const s2Segment = mapped.slice(s1End, s2End + 1).map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`).join(' ');
    const s3Segment = [...mapped.slice(s2End), mapped[0]].map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`).join(' ');

    const ratio = Math.max(0, Math.min(1, progressPercentage / 100));
    const exactIdx1 = ratio * (n - 1);
    const i1_floor = Math.floor(exactIdx1);
    const i1_ceil = Math.min(n - 1, i1_floor + 1);
    const f1 = exactIdx1 - i1_floor;
    const p1A = mapped[i1_floor] || mapped[0];
    const p1B = mapped[i1_ceil] || p1A;
    const c1Pos = {
      x: p1A.x + (p1B.x - p1A.x) * f1,
      y: p1A.y + (p1B.y - p1A.y) * f1,
    };

    const exactIdx2 = Math.max(0, exactIdx1 - 1.5);
    const i2_floor = Math.floor(exactIdx2);
    const i2_ceil = Math.min(n - 1, i2_floor + 1);
    const f2 = exactIdx2 - i2_floor;
    const p2A = mapped[i2_floor] || mapped[0];
    const p2B = mapped[i2_ceil] || p2A;
    const c2Pos = {
      x: p2A.x + (p2B.x - p2A.x) * f2,
      y: p2A.y + (p2B.y - p2A.y) * f2,
    };

    return {
      pathString: fullPath,
      s1Path: s1Segment,
      s2Path: s2Segment,
      s3Path: s3Segment,
      c1Pos,
      c2Pos,
      mappedPoints: mapped,
      startPos: mapped[0] || { x: 280, y: 160 },
    };
  }, [trackPoints, progressPercentage]);

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!onTrackClick || !mappedPoints.length) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 560;
    const clickY = ((e.clientY - rect.top) / rect.height) * 340;

    let closestIdx = 0;
    let closestDist = Infinity;

    mappedPoints.forEach((p, idx) => {
      const dist = Math.hypot(p.x - clickX, p.y - clickY);
      if (dist < closestDist) {
        closestDist = dist;
        closestIdx = idx;
      }
    });

    if (closestDist < 45) {
      const pct = Math.round((closestIdx / (mappedPoints.length - 1)) * 100);
      onTrackClick(pct);
    }
  };

  const isDark = theme === 'dark';
  const currentSector = progressPercentage < 33 ? 1 : progressPercentage < 68 ? 2 : 3;

  return (
    <section aria-label="Circuit GPS Track & Position Radar" className="bg-pitwall-panel border border-pitwall-border rounded-lg p-4 mb-5 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b border-pitwall-border">
        <div>
          <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-pitwall-textBright">
            Circuit GPS & Track Radar
          </h2>
          <p className="text-xs text-pitwall-textMuted font-mono">
            {meeting?.circuit_short_name || 'Grand Prix Circuit'} • Sector Breakpoints & Real-Time Position
          </p>
        </div>

        {/* In-tab Playback Controls & Status */}
        <div className="flex items-center gap-2 text-xs font-mono">
          {onTogglePlay && (
            <div className="inline-flex items-center gap-1 bg-pitwall-subpanel p-0.5 rounded border border-pitwall-border">
              <button
                onClick={onTogglePlay}
                aria-label={isPlaying ? 'Pause circuit replay' : 'Play circuit replay'}
                className="p-1 rounded bg-[#e10600] text-white hover:bg-[#b00400] transition-colors cursor-pointer"
                title={isPlaying ? 'Pause replay' : 'Play circuit replay'}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
              {onResetReplay && (
                <button
                  onClick={onResetReplay}
                  aria-label="Reset position to start line"
                  className="p-1 rounded text-pitwall-textMuted hover:text-pitwall-textBright transition-colors cursor-pointer"
                  title="Reset to Start"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Speed Multiplier Pills */}
          {onChangeSpeed && (
            <div className="inline-flex rounded bg-pitwall-subpanel p-0.5 border border-pitwall-border">
              {[1, 2, 4].map((s) => (
                <button
                  key={s}
                  onClick={() => onChangeSpeed(s)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                    playbackSpeed === s
                      ? 'bg-pitwall-border text-pitwall-textBright'
                      : 'text-pitwall-textMuted hover:text-pitwall-textBright'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          )}

          {/* Sector Jump Buttons */}
          <div className="inline-flex rounded bg-pitwall-subpanel p-0.5 border border-pitwall-border">
            {[
              { label: 'S1', pct: 0 },
              { label: 'S2', pct: 34 },
              { label: 'S3', pct: 69 },
            ].map((s) => (
              <button
                key={s.label}
                onClick={() => onTrackClick && onTrackClick(s.pct)}
                className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase transition-colors cursor-pointer ${
                  currentSector === Number(s.label[1])
                    ? 'bg-pitwall-card text-pitwall-textBright'
                    : 'text-pitwall-textMuted hover:text-pitwall-textBright'
                }`}
                title={`Jump to Sector ${s.label[1]}`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-3 ml-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: c1Color }} aria-hidden="true" />
              <span className="font-bold text-pitwall-textBright">{driver1?.name_acronym || 'C1'}</span>
            </div>
            {isComparisonMode && (
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: c2Color }} aria-hidden="true" />
                <span className="font-bold text-pitwall-textBright">{driver2?.name_acronym || 'C2'}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SVG Circuit Canvas */}
      <div className="relative w-full h-[340px] bg-pitwall-bg rounded border border-pitwall-border flex items-center justify-center overflow-hidden cursor-crosshair">
        <svg
          viewBox="0 0 560 340"
          onClick={handleSvgClick}
          className="w-full h-full select-none"
        >
          {/* Base Asphalt Outline */}
          <path
            d={pathString}
            fill="none"
            stroke={isDark ? '#1a1e2d' : '#cbd5e1'}
            strokeWidth="12"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Sector 1 (Amber / Gold) */}
          <path
            d={s1Path}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.9"
          />

          {/* Sector 2 (Cyan in dark / Blue in light for high contrast) */}
          <path
            d={s2Path}
            fill="none"
            stroke={isDark ? '#06b6d4' : '#0284c7'}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.9"
          />

          {/* Sector 3 (Purple / Violet) */}
          <path
            d={s3Path}
            fill="none"
            stroke={isDark ? '#a855f7' : '#7c3aed'}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.9"
          />

          {/* Start / Finish Line Marker */}
          {startPos && (
            <g transform={`translate(${startPos.x}, ${startPos.y})`}>
              <circle r="4" fill={isDark ? '#ffffff' : '#0f172a'} stroke="#e10600" strokeWidth="2" />
            </g>
          )}

          {/* Car 2 Marker (Only in comparison mode) */}
          {isComparisonMode && c2Pos && (
            <g transform={`translate(${c2Pos.x}, ${c2Pos.y})`}>
              <circle r="8" fill={c2Color} stroke="#ffffff" strokeWidth="2" opacity="0.9" />
              <rect
                x="-16"
                y="-23"
                width="32"
                height="13"
                rx="3"
                fill={isDark ? '#0b0c12' : '#ffffff'}
                stroke={c2Color}
                strokeWidth="1"
              />
              <text
                y="-14"
                textAnchor="middle"
                fill={isDark ? '#ffffff' : '#0f172a'}
                fontSize="8.5"
                fontFamily="monospace"
                fontWeight="bold"
                className="select-none"
              >
                {driver2?.name_acronym || 'C2'}
              </text>
            </g>
          )}

          {/* Car 1 Marker */}
          {c1Pos && (
            <g transform={`translate(${c1Pos.x}, ${c1Pos.y})`}>
              <circle r="8.5" fill={c1Color} stroke="#ffffff" strokeWidth="2" />
              <rect
                x="-18"
                y="-24"
                width="36"
                height="14"
                rx="3"
                fill={isDark ? '#0b0c12' : '#ffffff'}
                stroke={c1Color}
                strokeWidth="1"
              />
              <text
                y="-14"
                textAnchor="middle"
                fill={isDark ? '#ffffff' : '#0f172a'}
                fontSize="9"
                fontFamily="monospace"
                fontWeight="bold"
                className="select-none"
              >
                {driver1?.name_acronym || 'C1'}
              </text>
            </g>
          )}
        </svg>

        {/* Sector Legend Bar & Live Position Pill */}
        <div className="absolute bottom-2.5 left-2.5 bg-pitwall-panel/95 backdrop-blur px-3 py-1.5 rounded-md border border-pitwall-border text-[11px] font-mono flex items-center gap-3 shadow-md">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-xs bg-[#f59e0b]" />
            <span className="text-pitwall-textMuted">Sector 1</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-xs" style={{ backgroundColor: isDark ? '#06b6d4' : '#0284c7' }} />
            <span className="text-pitwall-textMuted">Sector 2</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-xs" style={{ backgroundColor: isDark ? '#a855f7' : '#7c3aed' }} />
            <span className="text-pitwall-textMuted">Sector 3</span>
          </div>
          <div className="border-l border-pitwall-border pl-2 text-pitwall-textBright font-bold">
            Pos: {Math.round(progressPercentage)}% (Sector {currentSector})
            {currentSpeed !== undefined && ` • ${driver1?.name_acronym || 'C1'}: ${currentSpeed} km/h`}
            {isComparisonMode && c2Speed !== undefined && ` • ${driver2?.name_acronym || 'C2'}: ${c2Speed} km/h`}
          </div>
        </div>
      </div>
    </section>
  );
};
