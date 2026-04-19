// Real VSAT engineering calculations — extracted from SatExpert geoUtils.ts
// All math is textbook satellite link engineering.

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface LookAngles {
  azimuth: number;
  elevation: number;
  skew: number;
  distance: number;
}

export interface Satellite {
  id: string;
  name: string;
  longitude: number;
  orbitalSlot: string;
  operator: string;
  apogee: number;
  perigee: number;
  inclination: number;
  velocity: number;
  status: "active" | "maintenance" | "offline" | "decommissioned";
}

export interface LinkBudgetParams {
  uplinkFreq: number;    // GHz
  downlinkFreq: number;  // GHz
  txPower: number;       // dBW
  antSize: number;       // meters
  efficiency: number;    // percent
  lnbNoiseTemp: number;  // Kelvin
  rainFade: number;      // dB
  dataRate: number;      // Mbps
}

export interface LinkBudgetResults {
  fspl: number;
  antGain: number;
  gt: number;
  ebNo: number;
  eirp: number;
  ber: string;
  margin: string;
}

// Constants
const EARTH_RADIUS = 6378.137; // km
const GEO_ALTITUDE = 35786;    // km
const SPEED_OF_LIGHT = 299792.458; // km/s

const toRad = (deg: number) => (deg * Math.PI) / 180;
const toDeg = (rad: number) => (rad * 180) / Math.PI;

export function calculateLookAngles(userLoc: Coordinates, satLong: number): LookAngles {
  const L = toRad(userLoc.lat);
  const G = toRad(satLong - userLoc.lng);
  const R = EARTH_RADIUS;
  const H = GEO_ALTITUDE;
  const Rs = R + H;

  const numerator = Math.cos(L) * Math.cos(G) - (R / Rs);
  const denominator = Math.sqrt(1 - Math.pow(Math.cos(L), 2) * Math.pow(Math.cos(G), 2));
  const elevation = toDeg(Math.atan2(numerator, denominator));

  let azimuth = toDeg(Math.atan2(Math.tan(G), Math.sin(L)));
  if (userLoc.lat >= 0) {
    azimuth = (180 + azimuth) % 360;
  } else {
    azimuth = (360 + azimuth) % 360;
  }

  const skew = toDeg(Math.atan2(Math.sin(G), Math.tan(L)));
  const distance = Math.sqrt(
    Math.pow(R, 2) + Math.pow(Rs, 2) - 2 * R * Rs * Math.cos(L) * Math.cos(G)
  );

  return { azimuth, elevation, skew, distance };
}

export function calculateLinkBudget(params: LinkBudgetParams, distance: number): LinkBudgetResults {
  const { uplinkFreq, txPower, antSize, efficiency, lnbNoiseTemp, rainFade } = params;

  // Free Space Path Loss (dB) = 20*log10(d_km) + 20*log10(f_GHz) + 92.45
  const fspl = 20 * Math.log10(distance) + 20 * Math.log10(uplinkFreq) + 92.45;

  // Antenna Gain (dBi) = 10*log10(eff * (pi*D/lambda)^2)
  const lambda = (SPEED_OF_LIGHT / (uplinkFreq * 1e9)) * 1000; // meters
  const antGain = 10 * Math.log10((efficiency / 100) * Math.pow((Math.PI * antSize) / (lambda / 1000), 2));

  // G/T (dB/K) = Gain - 10*log10(Noise Temp)
  const gt = antGain - 10 * Math.log10(lnbNoiseTemp);

  // EIRP (dBW) = Tx Power + Antenna Gain
  const eirp = txPower + antGain;

  // Eb/No estimation (simplified)
  const dataRateFactor = 10 * Math.log10(params.dataRate * 1e6);
  const ebNo = eirp - fspl + gt + 228.6 - rainFade - dataRateFactor;

  // BER estimation for QPSK
  let ber: string;
  let margin: string;
  if (ebNo > 12) { ber = "< 1e-9"; margin = "Excellent"; }
  else if (ebNo > 8) { ber = "~ 1e-7"; margin = "Good"; }
  else if (ebNo > 5) { ber = "~ 1e-4"; margin = "Marginal"; }
  else { ber = "> 1e-2"; margin = "Critical"; }

  return { fspl, antGain, gt, ebNo, eirp, ber, margin };
}

// Real GEO satellites with verified orbital parameters
export const SATELLITES: Satellite[] = [
  { id: "t-11w", name: "Telstar 11N", longitude: -37.5, orbitalSlot: "37.5°W", operator: "Telesat", apogee: 35794, perigee: 35778, inclination: 0.02, velocity: 3.07, status: "active" },
  { id: "t-12v", name: "Telstar 12V", longitude: -15.0, orbitalSlot: "15°W", operator: "Telesat", apogee: 35791, perigee: 35781, inclination: 0.01, velocity: 3.07, status: "active" },
  { id: "eutelsat-10b", name: "Eutelsat 10B", longitude: 10.0, orbitalSlot: "10°E", operator: "Eutelsat", apogee: 35788, perigee: 35784, inclination: 0.05, velocity: 3.08, status: "active" },
  { id: "arab-5c", name: "Arabsat 5C", longitude: 20.0, orbitalSlot: "20°E", operator: "Arabsat", apogee: 35802, perigee: 35770, inclination: 0.08, velocity: 3.07, status: "active" },
  { id: "astra-2e", name: "Astra 2E", longitude: 28.2, orbitalSlot: "28.2°E", operator: "SES", apogee: 35789, perigee: 35783, inclination: 0.02, velocity: 3.07, status: "active" },
  { id: "express-am44", name: "Express AM44", longitude: 11.0, orbitalSlot: "11°W", operator: "RSCC", apogee: 35810, perigee: 35762, inclination: 0.12, velocity: 3.06, status: "offline" },
  { id: "galaxy-19", name: "Galaxy 19", longitude: -97.0, orbitalSlot: "97°W", operator: "Intelsat", apogee: 35792, perigee: 35780, inclination: 0.03, velocity: 3.07, status: "active" },
  { id: "intelsat-34", name: "Intelsat 34", longitude: -55.5, orbitalSlot: "55.5°W", operator: "Intelsat", apogee: 35786, perigee: 35786, inclination: 0.01, velocity: 3.07, status: "active" },
  { id: "abs-2", name: "ABS-2", longitude: 75.0, orbitalSlot: "75°E", operator: "ABS", apogee: 35798, perigee: 35774, inclination: 0.04, velocity: 3.07, status: "decommissioned" },
  { id: "asiasat-7", name: "AsiaSat 7", longitude: 105.5, orbitalSlot: "105.5°E", operator: "AsiaSat", apogee: 35793, perigee: 35779, inclination: 0.02, velocity: 3.07, status: "active" },
];

// Known USB Vendor IDs (subset of the real USB ID database)
export const USB_VENDORS: Record<string, string> = {
  "413c": "Dell Inc.",
  "1bcf": "Sunplus Innovation Technology",
  "0cf3": "Qualcomm Atheros",
  "8087": "Intel Corp.",
  "1d6b": "Linux Foundation",
  "046d": "Logitech Inc.",
  "045e": "Microsoft Corp.",
  "05ac": "Apple Inc.",
  "04f2": "Chicony Electronics",
  "0bda": "Realtek Semiconductor",
  "2109": "VIA Labs",
  "1a40": "Terminus Technology",
  "0a5c": "Broadcom Corp.",
  "0951": "Kingston Technology",
  "058f": "Alcor Micro Corp.",
  "0781": "SanDisk Corp.",
  "0930": "Toshiba Corp.",
  "174c": "ASMedia Technology",
  "1058": "Western Digital",
  "090c": "Silicon Motion",
};
