import React, { useMemo } from 'react';
import type { Driver, Meeting } from '../types/f1';
import { generateMonzaTrackCoordinates } from '../services/sampleData';

interface TrackMinimapProps {
  meeting: Meeting | null;
  driver1: Driver | null;
  driver2: Driver | null;
  progressPercentage: number;
  locations?: { x: number; y: number }[];
  onTrackClick?: (percentage: number) => void;
}

export const TrackMinimap: React.FC<TrackMinimapProps> = ({
  meeting,
  driver1,
  driver2,
  progressPercentage,
  locations,
  onTrackClick,
}) => {
  const formatColor = (hex?: string) => {
    if (!hex) return '#e10600';
    return hex.startsWith('#') ? hex : `#${hex}`;
  };

  const c1Color = formatColor(driver1?.team_colour || '3671C6');
  const c2Color = formatColor(driver2?.team_colour || 'FF8000');

  // Track coordinates
  const trackPoints = useMemo(() => {
    if (locations && locations.length > 20) {
      return locations;
    }
    return generateMonzaTrackCoordinates();
  }, [locations]);

  // Normalize points to SVG coordinate space [40, 40] to [520, 320]
  const { pathString, s1Path, s2Path, s3Path, c1Pos, c2Pos, mappedPoints } = useMemo(() => {
    if (!trackPoints.length) {
      return {
        pathString: '',
        s1Path: '',
        s2Path: '',
        s3Path: '',
        c1Pos: { x: 280, y: 160 },
        c2Pos: { x: 280, y: 160 },
        mappedPoints: [],
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

    const toSvg = (p: { x: number; y: number }) => ({
      x: offsetX + (p.x - minX) * scale,
      y: offsetY + (p.y - minY) * scale,
    });

    const mapped = trackPoints.map(toSvg);
    const fullPath = mapped.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`).join(' ') + ' Z';

    // Sector divisions
    const n = mapped.length;
    const s1End = Math.floor(n * 0.33);
    const s2End = Math.floor(n * 0.68);

    const s1Segment = mapped.slice(0, s1End + 1).map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`).join(' ');
    const s2Segment = mapped.slice(s1End, s2End + 1).map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`).join(' ');
    const s3Segment = [...mapped.slice(s2End), mapped[0]].map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`).join(' ');

    const ratio = Math.max(0, Math.min(1, progressPercentage / 100));
    const idx1 = Math.floor(ratio * (n - 1));
    const idx2 = Math.max(0, Math.min(n - 1, idx1 - 2));

    return {
      pathString: fullPath,
      s1Path: s1Segment,
      s2Path: s2Segment,
      s3Path: s3Segment,
      c1Pos: mapped[idx1] || mapped[0],
      c2Pos: mapped[idx2] || mapped[0],
      mappedPoints: mapped,
    };
  }, [trackPoints, progressPercentage]);

  // Click handler on track to jump scrubber
  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!onTrackClick || !mappedPoints.length) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 560;
    const clickY = ((e.clientY - rect.top) / rect.height) * 340;

    // Find closest track point
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

  return (
    <section aria-label="Circuit GPS Track & Position Radar" className="bg-pitwall-panel border border-pitwall-border rounded-lg p-4 mb-5 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b border-pitwall-border">
        <div>
          <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-pitwall-textBright">
            Circuit GPS & Track Radar
          </h2>
          <p className="text-xs text-pitwall-textMuted font-mono">
            {meeting?.circuit_short_name || 'Autodromo Nazionale Monza'} • Sector Breakpoints & Real-Time Position
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: c1Color }} aria-hidden="true" />
            <span className="font-bold text-white">{driver1?.name_acronym || 'C1'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: c2Color }} aria-hidden="true" />
            <span className="font-bold text-white">{driver2?.name_acronym || 'C2'}</span>
          </div>
          <div className="text-pitwall-textMuted hidden sm:inline">
            Sector: <span className="text-white font-bold">{progressPercentage < 33 ? '1' : progressPercentage < 68 ? '2' : '3'}</span>
          </div>
        </div>
      </div>

      {/* SVG Circuit Canvas */}
      <div className="relative w-full h-[320px] bg-[#0b0c12] rounded border border-pitwall-border flex items-center justify-center overflow-hidden cursor-pointer">
        <svg
          viewBox="0 0 560 340"
          onClick={handleSvgClick}
          className="w-full h-full select-none"
        >
          {/* Base Asphalt Outline */}
          <path
            d={pathString}
            fill="none"
            stroke="#1a1e2c"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Sector 1 (Yellow Tint) */}
          <path
            d={s1Path}
            fill="none"
            stroke="#e0a800"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.8"
          />

          {/* Sector 2 (Cyan Tint) */}
          <path
            d={s2Path}
            fill="none"
            stroke="#00a0de"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.8"
          />

          {/* Sector 3 (Magenta Tint) */}
          <path
            d={s3Path}
            fill="none"
            stroke="#b142f5"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.8"
          />

          {/* Start / Finish Line */}
          <circle cx="280" cy="50" r="3.5" fill="#ffffff" stroke="#e10600" strokeWidth="2" />

          {/* Car 2 Marker */}
          {c2Pos && (
            <g transform={`translate(${c2Pos.x}, ${c2Pos.y})`}>
              <circle r="7" fill={c2Color} stroke="#ffffff" strokeWidth="1.5" />
              <text
                y="-10"
                textAnchor="middle"
                fill="#ffffff"
                fontSize="9"
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
              <circle r="7.5" fill={c1Color} stroke="#ffffff" strokeWidth="2" />
              <text
                y="-11"
                textAnchor="middle"
                fill="#ffffff"
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

        {/* Sector Legend Bar */}
        <div className="absolute bottom-2.5 left-2.5 bg-pitwall-panel/90 backdrop-blur px-3 py-1 rounded border border-pitwall-border text-[11px] font-mono flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-xs bg-[#e0a800]" />
            <span className="text-pitwall-textMuted">Sec 1</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-xs bg-[#00a0de]" />
            <span className="text-pitwall-textMuted">Sec 2</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-xs bg-[#b142f5]" />
            <span className="text-pitwall-textMuted">Sec 3</span>
          </div>
        </div>
      </div>
    </section>
  );
};
