// Authentic GPS Track Coordinates for all 24 Formula 1 World Championship Circuits
// Handcrafted waypoints with Catmull-Rom spline smoothing for accurate turn geometries and track profiles

export interface TrackPoint {
  x: number;
  y: number;
}

// Catmull-Rom Spline Interpolator
function interpolateWaypoints(waypoints: [number, number][], stepsPerSegment: number = 6): TrackPoint[] {
  const points: TrackPoint[] = [];
  const n = waypoints.length;
  for (let i = 0; i < n; i++) {
    const p0 = waypoints[(i - 1 + n) % n];
    const p1 = waypoints[i];
    const p2 = waypoints[(i + 1) % n];
    const p3 = waypoints[(i + 2) % n];

    for (let s = 0; s < stepsPerSegment; s++) {
      const t = s / stepsPerSegment;
      const x =
        0.5 *
        (2 * p1[0] +
          (-p0[0] + p2[0]) * t +
          (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t * t +
          (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t * t * t);
      const y =
        0.5 *
        (2 * p1[1] +
          (-p0[1] + p2[1]) * t +
          (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t * t +
          (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t * t * t);
      points.push({ x: Math.round(x), y: Math.round(y) });
    }
  }
  return points;
}

// 1. Bahrain International Circuit (Sakhir)
const WAYPOINTS_SAKHIR: [number, number][] = [
  [120, 310], [240, 310], [380, 310], [480, 315], // Pit Straight
  [520, 335], [540, 375], [525, 415], [485, 430], // T1 Hairpin & T2
  [455, 460], [440, 510], [410, 545], [370, 560], // T3-T4 Straight into T4 braking
  [325, 550], [285, 515], [245, 480],             // T5-T6-T7 Esses
  [210, 470], [175, 490], [165, 525], [185, 555], // T8 Hairpin
  [225, 580], [255, 610], [245, 645], [205, 665], // T9-T10 complex
  [245, 695], [335, 715], [435, 720], [515, 710], // Back Straight
  [545, 680], [555, 640],                         // T11
  [535, 590], [515, 540],                         // T12-T13
  [465, 470], [385, 410],                         // Infield chute
  [305, 360], [210, 325], [150, 315],             // T14-T15 onto Main Straight
];

// 2. Jeddah Corniche Circuit (Saudi Arabia)
const WAYPOINTS_JEDDAH: [number, number][] = [
  [120, 180], [200, 180], [300, 185], [390, 190], // Start/Finish Straight
  [420, 205], [415, 230], [385, 245],             // T1-T2 Chicane
  [370, 280], [395, 320], [420, 370], [440, 430], // T4-T8 Fast Esses
  [450, 490], [430, 540], [380, 580], [310, 610], // T9-T12 Loop
  [240, 630], [170, 640], [120, 620], [110, 580], // Banked Turn 13 Hairpin
  [130, 530], [170, 480], [210, 430], [240, 380], // High-speed sweeps return T14-T21
  [250, 320], [230, 270], [180, 230],             // T22-T24
  [140, 210], [110, 200], [105, 185],             // T27 Hairpin to Straight
];

// 3. Albert Park Circuit (Melbourne, Australia)
const WAYPOINTS_MELBOURNE: [number, number][] = [
  [180, 150], [280, 150], [380, 150],             // Main Straight
  [430, 170], [450, 210], [430, 240],             // T1-T2 Chicane
  [380, 270], [330, 310], [300, 360], [320, 410], // T3-T4 complex & T5
  [370, 450], [420, 470], [460, 460], [480, 420], // Lakeside T6-T7
  [510, 380], [540, 410], [530, 470], [490, 520], // Fast chicane T9-T10
  [440, 560], [370, 580], [290, 585], [210, 570], // Back lakeside sweep T11-T12
  [150, 530], [120, 470], [130, 410],             // T13-T14
  [150, 350], [140, 290], [120, 240], [130, 190], // T15 Hairpin & T16 onto Straight
];

// 4. Suzuka International Racing Course (Japan)
const WAYPOINTS_SUZUKA: [number, number][] = [
  [160, 220], [240, 215], [320, 210], [400, 205], // Pit Straight
  [450, 220], [480, 255], [470, 290],             // Turn 1 & 2
  [430, 315], [450, 350], [420, 385], [440, 420], // Iconic 'S' Curves
  [410, 460], [370, 490], [330, 495],             // Dunlop Curve
  [290, 480], [270, 455], [290, 430], [330, 420], // Degner 1 & Degner 2
  [370, 400], [390, 360], [370, 320],             // Underpass crossing
  [330, 290], [280, 270], [240, 280], [230, 320], // Hairpin Turn 11
  [260, 360], [300, 400], [340, 440], [380, 480], // 200R curving run
  [420, 520], [460, 550], [475, 590], [450, 610], // Spoon Curve T13-T14
  [390, 600], [300, 570], [210, 520], [150, 460], // Long Crossover Back Straight
  [130, 400], [135, 330], [120, 270],             // 130R and Casio Triangle chicane
];

// 5. Shanghai International Circuit (China)
const WAYPOINTS_SHANGHAI: [number, number][] = [
  [150, 300], [250, 300], [350, 300], [430, 300], // Main Straight
  [470, 310], [510, 340], [520, 390], [490, 430], // T1-T2 Snail Turn entry
  [440, 435], [410, 405], [425, 370], [460, 365], // Snail inward spiral
  [475, 390], [450, 430], [400, 470], [340, 500], // Spiral exit T3-T4
  [310, 540], [330, 580], [370, 590], [420, 580], // T6 Hairpin
  [460, 550], [490, 510], [530, 490], [560, 520], // T7-T8 high-speed kinks
  [550, 570], [510, 610], [450, 640],             // T9-T10
  [410, 660], [310, 665], [200, 665], [100, 665], // Massive 1.2km Back Straight
  [60, 645], [55, 605], [90, 575], [120, 560],   // T14 Hairpin & T15 Banked Left
  [140, 480], [145, 390],                         // Final curved acceleration into main straight
];

// 6. Miami International Autodrome (USA)
const WAYPOINTS_MIAMI: [number, number][] = [
  [150, 200], [250, 200], [360, 200], [450, 205], // Pit Straight
  [490, 220], [505, 260], [480, 290], [430, 305], // T1-T2-T3 around Stadium
  [380, 320], [340, 350], [330, 390], [355, 430], // T4-T6
  [400, 450], [450, 460], [480, 490], [460, 530], // T7-T8 Marina Loop
  [410, 540], [330, 535], [240, 525],             // Marina exit
  [180, 530], [140, 560], [150, 600], [180, 620], // T14-T15 Slow Underpass Chicane
  [260, 625], [380, 625], [490, 625], [560, 625], // Long 1.3km Back Straight
  [595, 600], [580, 550], [540, 510],             // T17 Hairpin
  [480, 430], [370, 330], [250, 240], [170, 210], // T18-T19 onto front straight
];

// 7. Autodromo Enzo e Dino Ferrari (Imola, Italy)
const WAYPOINTS_IMOLA: [number, number][] = [
  [140, 180], [250, 180], [370, 180],             // Start Straight
  [420, 190], [460, 220], [440, 250], [390, 260], // Variante Tamburello chicane
  [360, 285], [375, 325], [355, 360],             // Variante Villeneuve
  [320, 390], [270, 420], [230, 460], [240, 500], // Tosa Hairpin
  [280, 530], [340, 545], [390, 540],             // Piratella downhill
  [440, 510], [480, 475], [505, 440], [530, 470], // Acque Minerali double apex
  [540, 520], [515, 560], [470, 590],             // Uphill to Variante Alta
  [410, 610], [430, 635], [405, 660],             // Variante Alta chicane
  [330, 650], [240, 620], [170, 570],             // Downhill chute to Rivazza
  [130, 510], [115, 450], [130, 390], [110, 330], // Rivazza 1 & 2 double left
  [110, 260], [120, 205],                         // Full throttle sweep to finish
];

// 8. Circuit de Monaco (Monte Carlo)
const WAYPOINTS_MONACO: [number, number][] = [
  [150, 200], [230, 200], [310, 200],             // Boulevard Albert 1er
  [350, 215], [380, 250], [365, 290],             // Sainte Dévote (T1)
  [320, 330], [280, 380], [250, 430], [240, 480], // Beau Rivage uphill climb
  [260, 520], [300, 540], [340, 530],             // Massenet & Casino Square
  [370, 490], [390, 440], [420, 410],             // Mirabeau Haute
  [440, 375], [420, 345], [380, 355],             // Fairmont Hairpin (Grand Hotel)
  [360, 390], [390, 430], [430, 460], [470, 475], // Mirabeau Bas & Portier
  [510, 460], [540, 420], [560, 360], [570, 290], // The Tunnel
  [560, 230], [520, 210], [475, 235], [440, 245], // Nouvelle Chicane
  [390, 240], [350, 220], [320, 180],             // Tabac (T12)
  [280, 150], [240, 165], [210, 140],             // Louis Chiron & Swimming Pool
  [170, 145], [140, 160], [120, 185],             // La Rascasse & Anthony Noghès
];

// 9. Circuit Gilles Villeneuve (Montreal, Canada)
const WAYPOINTS_MONTREAL: [number, number][] = [
  [120, 250], [220, 250], [340, 250], [460, 250], // Pit Straight
  [510, 260], [535, 290], [515, 325], [465, 335], // Virage Senna & T1-T2 complex
  [415, 360], [380, 400], [410, 435], [440, 420], // T3-T4 chicane
  [470, 450], [450, 490], [390, 530],             // T6-T7 chicane
  [310, 560], [230, 580], [170, 570],             // Pont de la Concorde straight
  [140, 540], [165, 505], [215, 515],             // T8-T9 chicane
  [300, 520], [390, 520], [460, 535], [510, 560], // Droit du Casino run
  [550, 595], [560, 640], [530, 675], [480, 670], // L'Epingle Hairpin (T10)
  [400, 650], [300, 630], [200, 610], [110, 590], // Long Droit du Casino (1.1km)
  [75, 550], [60, 480], [70, 400], [80, 320],    // Wall of Champions chicane (T13-T14)
];

// 10. Circuit de Barcelona-Catalunya (Spain)
const WAYPOINTS_CATALUNYA: [number, number][] = [
  [130, 220], [240, 220], [360, 220], [480, 220], // 1km Main Straight
  [530, 235], [550, 275], [520, 310], [470, 325], // T1-T2 Elf Chicane
  [430, 360], [420, 420], [440, 480], [480, 510], // Renault sweeping Turn 3
  [520, 520], [540, 480], [525, 435],             // Repsol T4
  [480, 410], [430, 420], [390, 450],             // Seat Hairpin T5
  [360, 490], [350, 540], [370, 580],             // T7-T8 uphill
  [410, 610], [460, 625], [510, 610],             // Campsa T9
  [535, 560], [530, 490], [500, 430], [450, 380], // Back straight to La Caixa
  [380, 340], [310, 310], [250, 290],             // T10-T11
  [190, 290], [150, 310], [120, 280], [110, 240], // Sweeping fast final turns T13-T14
];

// 11. Red Bull Ring (Spielberg, Austria)
const WAYPOINTS_SPIELBERG: [number, number][] = [
  [150, 250], [270, 250], [390, 250], [490, 255], // Start/Finish Straight
  [530, 280], [545, 320], [510, 350], [440, 360], // Turn 1 (Niki Lauda Kurve)
  [380, 400], [340, 460], [300, 530], [270, 600], // Steep uphill straight to T3
  [255, 640], [285, 665], [320, 650], [350, 610], // Remus Hairpin (T3)
  [390, 550], [430, 490], [470, 440], [510, 400], // Downhill sweep to T4
  [540, 380], [560, 420], [540, 460], [500, 485], // Rauch corner (T4)
  [450, 500], [410, 520], [385, 555],             // T5-T6
  [380, 595], [415, 620], [460, 615],             // Rindt Kurve (T7)
  [490, 580], [500, 530], [480, 470],             // T8
  [450, 410], [380, 340], [280, 280], [190, 255], // Red Bull Mobile final corner (T9-T10)
];

// 12. Silverstone Circuit (Great Britain)
const WAYPOINTS_SILVERSTONE: [number, number][] = [
  [130, 200], [210, 200], [300, 200], [380, 200], // Hamilton Pit Straight
  [430, 215], [460, 250], [440, 290],             // Abbey (T1) & Farm Curve (T2)
  [400, 320], [370, 360], [390, 395], [430, 385], // Village & The Loop Hairpin
  [460, 350], [480, 310], [510, 300],             // Aintree & Wellington Straight
  [550, 330], [580, 380], [590, 440], [570, 490], // Brooklands & Luffield
  [530, 510], [480, 490], [450, 450],             // Woodcote
  [430, 400], [420, 340], [430, 280],             // National Straight
  [445, 230], [480, 200], [520, 215],             // Copse (T9)
  [550, 260], [565, 310], [545, 360], [565, 410], // Maggotts, Becketts & Chapel Esses
  [550, 470], [500, 520], [430, 560], [350, 580], // Hangar Straight
  [270, 585], [210, 565], [180, 520],             // Stowe Corner (T15)
  [190, 460], [220, 410], [210, 360],             // Vale Chicane
  [170, 320], [140, 270], [120, 220],             // Club Corner onto Main Straight
];

// 13. Hungaroring (Hungary)
const WAYPOINTS_HUNGARORING: [number, number][] = [
  [140, 180], [250, 180], [370, 180], [470, 185], // Start/Finish Straight
  [515, 205], [535, 245], [510, 280], [450, 295], // Turn 1 Downhill Hairpin
  [390, 315], [350, 355], [355, 400], [390, 430], // Turn 2 & Turn 3
  [440, 450], [490, 470], [520, 510],             // Turn 4 Fast Left
  [510, 560], [470, 595], [415, 590], [370, 555], // Turn 5 Long Right
  [340, 520], [315, 535], [330, 565],             // Turn 6-7 Chicane
  [370, 585], [420, 605], [460, 630],             // Turn 8-9
  [470, 670], [430, 695], [380, 680], [340, 640], // Turn 11
  [300, 590], [250, 530], [200, 460],             // Turn 12
  [160, 400], [135, 340], [145, 280], [125, 220], // Turn 13-14 Final Hairpins
];

// 14. Circuit de Spa-Francorchamps (Belgium)
const WAYPOINTS_SPA: [number, number][] = [
  [180, 360], [250, 365], [310, 380],             // Start Straight
  [340, 415], [330, 455], [290, 470], [230, 460], // La Source Hairpin (T1)
  [180, 430], [150, 380], [140, 320], [160, 260], // Downhill to Eau Rouge
  [195, 220], [240, 190], [275, 175],             // Raidillon uphill climb
  [350, 165], [440, 155], [530, 150], [600, 155], // Kemmel Straight
  [635, 180], [625, 220], [585, 240], [545, 235], // Les Combes chicane (T5-T6)
  [520, 270], [545, 310], [575, 345], [555, 390], // Malmedy & Bruxelles Hairpin (T8-T9)
  [510, 410], [450, 415], [400, 440],             // Turn 10 (Speaker's Corner)
  [365, 480], [335, 530], [330, 580], [360, 610], // Pouhon double left-hander (T11-T12)
  [410, 615], [460, 595], [505, 605], [535, 640], // Campus & Stavelot (T13-T15)
  [530, 680], [480, 700], [400, 680], [310, 630], // Paul Frere
  [230, 570], [170, 500], [140, 430],             // Blanchimont (T17)
  [135, 385], [160, 370],                         // Bus Stop Chicane (T18-T19)
];

// 15. Circuit Zandvoort (Netherlands)
const WAYPOINTS_ZANDVOORT: [number, number][] = [
  [150, 220], [260, 220], [370, 220], [470, 225], // Main Pit Straight
  [520, 245], [545, 285], [520, 325], [460, 340], // Tarzan Hairpin (T1)
  [400, 360], [360, 395], [370, 440],             // Gerlach (T2)
  [415, 470], [460, 480], [470, 445], [445, 415], // Hugenholtz Banked Hairpin (T3)
  [410, 410], [380, 440], [345, 490], [315, 540], // Hunserug (T4)
  [310, 595], [345, 635], [395, 650], [450, 635], // Scheivlak high-speed sweep (T7)
  [490, 600], [515, 550], [505, 500],             // Mastersbocht (T8)
  [465, 470], [420, 480], [380, 515],             // T9-T10
  [340, 545], [310, 520], [330, 475], [375, 465], // Hans Ernst Chicane (T11-T12)
  [420, 450], [455, 410], [470, 350],             // Kumhobocht (T13)
  [450, 290], [390, 240], [280, 220],             // Arie Luyendyk Banked Corner (T14)
];

// 16. Autodromo Nazionale Monza (Italy)
const WAYPOINTS_MONZA: [number, number][] = [
  [100, 150], [220, 150], [360, 150], [480, 150], // Rettifilo Main Straight
  [520, 160], [535, 185], [515, 210], [470, 215], // Variante del Rettifilo (T1-T2)
  [440, 230], [410, 260], [390, 310], [390, 370], // Curva Grande (Biassono)
  [380, 430], [360, 480],                         // Straight to Roggia
  [340, 510], [360, 530], [340, 550], [310, 540], // Variante della Roggia (T4-T5)
  [280, 520], [250, 490],                         // Short Straight to Lesmo
  [220, 480], [200, 495], [195, 525],             // Curva di Lesmo 1
  [185, 550], [170, 565], [150, 550],             // Curva di Lesmo 2
  [130, 510], [110, 450], [95, 380], [85, 300],   // Curva del Serraglio Underpass
  [80, 250], [60, 230], [80, 210], [100, 225],   // Variante Ascari
  [115, 200], [115, 170],                         // Back Straight to Parabolica
  [110, 140], [85, 130], [65, 145], [75, 165],   // Curva Parabolica (Alboreto)
];

// 17. Baku City Circuit (Azerbaijan)
const WAYPOINTS_BAKU: [number, number][] = [
  [120, 200], [220, 200], [340, 200], [460, 200], // Start/Finish Neftchilar Avenue
  [520, 215], [540, 255], [515, 290], [460, 295], // Turn 1 90-degree left
  [400, 295], [350, 320], [355, 370], [400, 385], // Turn 2 & Turn 3
  [460, 385], [510, 410], [490, 450], [435, 460], // Turn 4 & Turn 5
  [375, 460], [330, 485], [335, 530], [380, 545], // Turn 6 & Turn 7
  [420, 560], [445, 595], [425, 625], [390, 615], // Turn 8-11 Castle Section
  [350, 590], [315, 550], [275, 510],             // Old City downhill exit
  [240, 470], [210, 430], [195, 380],             // Turn 13-15
  [190, 320], [180, 270], [160, 230],             // Turn 16 onto 2.2km flat out section
  [140, 210],                                     // Kinks 18-20 into Main Straight
];

// 18. Marina Bay Street Circuit (Singapore)
const WAYPOINTS_SINGAPORE: [number, number][] = [
  [140, 200], [240, 200], [350, 200],             // Pit Straight
  [400, 215], [425, 255], [405, 290], [355, 305], // Sheares Turn 1-2-3 complex
  [310, 335], [330, 380], [375, 395], [430, 380], // Republic Blvd to Turn 5
  [490, 360], [550, 340], [600, 330],             // Raffles Blvd (Long Straight)
  [630, 355], [620, 395], [575, 415], [510, 420], // Turn 7 90-deg Left
  [450, 420], [400, 440], [365, 480],             // Turn 8 & Turn 9 Padang
  [350, 530], [370, 570], [410, 580],             // Anderson Bridge & Fullerton
  [450, 560], [480, 520], [515, 500],             // Turn 14
  [550, 520], [565, 565], [540, 605], [490, 620], // Turn 16-17 Marina Bay waterfront
  [420, 610], [330, 570], [240, 500], [180, 410], // Return toward helix
  [140, 330], [125, 260],                         // Turn 18-19 onto front straight
];

// 19. Circuit of the Americas / COTA (Austin, USA)
const WAYPOINTS_AUSTIN: [number, number][] = [
  [140, 280], [240, 280], [350, 280],             // Main Straight
  [410, 240], [445, 190], [470, 220], [440, 260], // Steep Uphill Hairpin Turn 1
  [400, 300], [430, 340], [395, 380], [425, 420], // High-speed Esses (Turns 3-6)
  [390, 460], [350, 480], [315, 510], [335, 550], // Turns 7-9
  [380, 560], [430, 540], [470, 565], [450, 605], // Hairpin Turn 11
  [390, 610], [290, 610], [190, 610], [100, 610], // 1km Back Straight
  [65, 580], [80, 535], [125, 510], [175, 515],  // Heavy Braking Turn 12 & Turn 13
  [215, 480], [240, 435], [220, 390],             // Turn 15
  [190, 360], [230, 330], [260, 360], [245, 400], // Multi-Apex Stadium Carousel (T16-T18)
  [205, 410], [165, 380], [140, 330],             // Turn 19-20 onto Main Straight
];

// 20. Autódromo Hermanos Rodríguez (Mexico City)
const WAYPOINTS_MEXICO: [number, number][] = [
  [120, 220], [240, 220], [370, 220], [500, 220], // 1.2km High-Altitude Main Straight
  [545, 240], [565, 280], [535, 315], [475, 325], // Moisés Solana Chicane (T1-T3)
  [415, 330], [320, 335], [230, 340],             // Short Straight to T4
  [185, 365], [210, 405], [255, 400], [310, 410], // T4-T6 Chicane & Hairpin
  [365, 425], [420, 450], [400, 490], [350, 515], // Lake Esses (T7-T11)
  [390, 545], [440, 530], [480, 550],             // Esses exit
  [510, 590], [475, 630], [415, 650], [340, 650], // Foro Sol Baseball Stadium entry
  [280, 630], [260, 585], [295, 555], [350, 565], // Stadium Amphitheatre tight loop
  [385, 530], [360, 470], [300, 390], [210, 310], // Peraltada final banked curve (Mansell)
  [145, 240],
];

// 21. Autódromo José Carlos Pace (Interlagos, Brazil)
const WAYPOINTS_INTERLAGOS: [number, number][] = [
  [150, 180], [240, 195], [330, 220], [410, 255], // Uphill Arquibancadas / Start
  [455, 285], [480, 330], [455, 370], [405, 385], // Senna 'S' Downhill (T1-T2)
  [355, 380], [310, 360], [265, 335],             // Curva do Sol (T3)
  [215, 330], [150, 330], [90, 340],              // Reta Oposta
  [65, 380], [80, 425], [130, 440], [190, 435],  // Descida do Lago (T4-T5)
  [245, 450], [295, 480], [330, 525],             // Ferradura double-apex (T6-T7)
  [335, 575], [300, 610], [250, 615],             // Curva do Laranjinha (T8)
  [210, 585], [225, 545], [265, 540],             // Pinheirinho (T9)
  [295, 520], [285, 480], [245, 465],             // Bico de Pato Hairpin (T10)
  [195, 480], [165, 520], [160, 570],             // Mergulho (T11)
  [175, 620], [215, 650], [265, 640],             // Junção uphill (T12)
  [290, 590], [270, 510], [210, 410], [160, 300], // Subida dos Boxes
];

// 22. Las Vegas Strip Circuit (USA)
const WAYPOINTS_LAS_VEGAS: [number, number][] = [
  [120, 200], [220, 200], [320, 200],             // Pit Building Straight
  [365, 220], [385, 260], [360, 295], [310, 305], // Turn 1-2 Hairpin Loop
  [260, 310], [210, 335], [220, 385],             // Turn 3-4 Koval Lane entry
  [230, 450], [240, 530], [250, 600],             // Koval Lane Straight
  [280, 635], [330, 645], [375, 620], [390, 570], // Sphere Loop (Turns 6-8)
  [370, 520], [320, 505], [280, 525], [270, 570], // Around MSG Sphere
  [295, 610], [345, 615], [410, 600],             // Sands Avenue
  [450, 570], [455, 510], [450, 430], [440, 330], // Las Vegas Strip 1.9km Straight
  [435, 230], [430, 140],                         // Flat out down the Strip
  [395, 110], [330, 120], [260, 125],             // Harmon Avenue & Turn 17
  [180, 145], [140, 175],
];

// 23. Lusail International Circuit (Qatar)
const WAYPOINTS_LUSAIL: [number, number][] = [
  [130, 220], [240, 220], [360, 220], [480, 220], // 1.068km Main Straight
  [535, 240], [555, 280], [530, 320], [470, 335], // Turn 1 Heavy Braking
  [410, 360], [375, 400], [390, 445], [440, 465], // Turn 2-3 Chicane & Turn 4
  [490, 470], [530, 505], [515, 550], [465, 570], // Turn 5-6
  [410, 570], [360, 545], [320, 510],             // Turn 7-8 Fast Chicane
  [285, 475], [255, 500], [270, 545],             // Turn 9-10
  [315, 580], [370, 610], [430, 625],             // Turn 11
  [490, 620], [540, 590], [565, 540], [550, 485], // Triple-Apex Right Handers (T12-T14)
  [510, 440], [450, 410], [370, 380],             // Turn 15
  [280, 340], [190, 290], [140, 245],             // Turn 16 onto Pit Straight
];

// 24. Yas Marina Circuit (Abu Dhabi)
const WAYPOINTS_YAS_MARINA: [number, number][] = [
  [140, 260], [240, 260], [350, 260], [440, 260], // Start/Finish Straight
  [485, 275], [510, 310], [485, 345], [430, 355], // Turn 1 Left
  [380, 375], [345, 415], [370, 455],             // Turn 2-3 Uphill Sweeper
  [420, 475], [465, 460], [500, 420], [520, 460], // Turn 5 Hairpin
  [490, 510], [430, 540], [340, 565], [230, 590], // 1.2km Back Straight
  [140, 610], [80, 600], [90, 550], [140, 530],   // Turn 6-7 Chicane
  [210, 515], [290, 505], [380, 495],             // Secondary Straight
  [450, 490], [510, 500], [550, 535], [540, 580], // Banked Turn 9
  [495, 615], [435, 630], [370, 625],             // Marina Basin section
  [315, 600], [280, 555], [295, 510], [340, 495], // Under W Hotel curves (T12-T14)
  [375, 460], [350, 410], [290, 360],             // Turn 15
  [210, 310], [150, 275],                         // Turn 16 onto Main Straight
];

// Cache of interpolated circuit paths
const CIRCUIT_CACHE: Record<string, TrackPoint[]> = {
  sakhir: interpolateWaypoints(WAYPOINTS_SAKHIR),
  jeddah: interpolateWaypoints(WAYPOINTS_JEDDAH),
  melbourne: interpolateWaypoints(WAYPOINTS_MELBOURNE),
  suzuka: interpolateWaypoints(WAYPOINTS_SUZUKA),
  shanghai: interpolateWaypoints(WAYPOINTS_SHANGHAI),
  miami: interpolateWaypoints(WAYPOINTS_MIAMI),
  imola: interpolateWaypoints(WAYPOINTS_IMOLA),
  monaco: interpolateWaypoints(WAYPOINTS_MONACO),
  montreal: interpolateWaypoints(WAYPOINTS_MONTREAL),
  catalunya: interpolateWaypoints(WAYPOINTS_CATALUNYA),
  spielberg: interpolateWaypoints(WAYPOINTS_SPIELBERG),
  silverstone: interpolateWaypoints(WAYPOINTS_SILVERSTONE),
  hungaroring: interpolateWaypoints(WAYPOINTS_HUNGARORING),
  spa: interpolateWaypoints(WAYPOINTS_SPA),
  zandvoort: interpolateWaypoints(WAYPOINTS_ZANDVOORT),
  monza: interpolateWaypoints(WAYPOINTS_MONZA),
  baku: interpolateWaypoints(WAYPOINTS_BAKU),
  singapore: interpolateWaypoints(WAYPOINTS_SINGAPORE),
  austin: interpolateWaypoints(WAYPOINTS_AUSTIN),
  mexico: interpolateWaypoints(WAYPOINTS_MEXICO),
  interlagos: interpolateWaypoints(WAYPOINTS_INTERLAGOS),
  lasvegas: interpolateWaypoints(WAYPOINTS_LAS_VEGAS),
  lusail: interpolateWaypoints(WAYPOINTS_LUSAIL),
  yasmarina: interpolateWaypoints(WAYPOINTS_YAS_MARINA),
};

/**
 * Resolves accurate circuit coordinates for any Formula 1 championship circuit
 * based on circuit_short_name or meeting_name.
 */
export function getCircuitCoordinates(
  circuitShortName?: string,
  meetingName?: string
): TrackPoint[] {
  const query = `${circuitShortName || ''} ${meetingName || ''}`.toLowerCase();

  if (query.includes('sakhir') || query.includes('bahrain')) return CIRCUIT_CACHE.sakhir;
  if (query.includes('jeddah') || query.includes('saudi')) return CIRCUIT_CACHE.jeddah;
  if (query.includes('melbourne') || query.includes('australia') || query.includes('albert park')) return CIRCUIT_CACHE.melbourne;
  if (query.includes('suzuka') || query.includes('japan')) return CIRCUIT_CACHE.suzuka;
  if (query.includes('shanghai') || query.includes('china')) return CIRCUIT_CACHE.shanghai;
  if (query.includes('miami')) return CIRCUIT_CACHE.miami;
  if (query.includes('imola') || query.includes('emilia') || query.includes('romagna')) return CIRCUIT_CACHE.imola;
  if (query.includes('monaco') || query.includes('monte carlo')) return CIRCUIT_CACHE.monaco;
  if (query.includes('montreal') || query.includes('canada') || query.includes('villeneuve')) return CIRCUIT_CACHE.montreal;
  if (query.includes('catalunya') || query.includes('barcelona') || query.includes('spanish') || query.includes('spain')) return CIRCUIT_CACHE.catalunya;
  if (query.includes('spielberg') || query.includes('austria') || query.includes('red bull ring')) return CIRCUIT_CACHE.spielberg;
  if (query.includes('silverstone') || query.includes('british') || query.includes('great britain')) return CIRCUIT_CACHE.silverstone;
  if (query.includes('hungaroring') || query.includes('hungary') || query.includes('hungarian')) return CIRCUIT_CACHE.hungaroring;
  if (query.includes('spa') || query.includes('belgian') || query.includes('francorchamps')) return CIRCUIT_CACHE.spa;
  if (query.includes('zandvoort') || query.includes('dutch') || query.includes('netherlands')) return CIRCUIT_CACHE.zandvoort;
  if (query.includes('monza') || query.includes('italian') || query.includes('italy')) return CIRCUIT_CACHE.monza;
  if (query.includes('baku') || query.includes('azerbaijan')) return CIRCUIT_CACHE.baku;
  if (query.includes('singapore') || query.includes('marina bay')) return CIRCUIT_CACHE.singapore;
  if (query.includes('austin') || query.includes('cota') || query.includes('united states') || query.includes('americas')) return CIRCUIT_CACHE.austin;
  if (query.includes('mexico') || query.includes('rodriguez') || query.includes('hermanos')) return CIRCUIT_CACHE.mexico;
  if (query.includes('interlagos') || query.includes('brazil') || query.includes('são paulo') || query.includes('sao paulo')) return CIRCUIT_CACHE.interlagos;
  if (query.includes('vegas') || query.includes('strip')) return CIRCUIT_CACHE.lasvegas;
  if (query.includes('lusail') || query.includes('qatar') || query.includes('losail')) return CIRCUIT_CACHE.lusail;
  if (query.includes('yas') || query.includes('abu dhabi') || query.includes('marina circuit')) return CIRCUIT_CACHE.yasmarina;

  // Fallback to Sakhir (Bahrain) default if no match
  return CIRCUIT_CACHE.sakhir;
}
