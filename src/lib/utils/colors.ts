import colorName from 'color-name';

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalizedHex = hex.charAt(0) === '#' ? hex.substring(1) : hex;

  if (normalizedHex.length === 3) {
    const r = parseInt(normalizedHex.charAt(0) + normalizedHex.charAt(0), 16);
    const g = parseInt(normalizedHex.charAt(1) + normalizedHex.charAt(1), 16);
    const b = parseInt(normalizedHex.charAt(2) + normalizedHex.charAt(2), 16);
    return { r, g, b };
  }

  if (normalizedHex.length === 6) {
    const r = parseInt(normalizedHex.substring(0, 2), 16);
    const g = parseInt(normalizedHex.substring(2, 4), 16);
    const b = parseInt(normalizedHex.substring(4, 6), 16);
    return { r, g, b };
  }

  return null;
}

export function getLuminance(rgb: { r: number; g: number; b: number }): number {
  const { r, g, b } = rgb;
  const sR = r / 255, sG = g / 255, sB = b / 255;
  const R = sR <= 0.03928 ? sR / 12.92 : Math.pow((sR + 0.055) / 1.055, 2.4);
  const G = sG <= 0.03928 ? sG / 12.92 : Math.pow((sG + 0.055) / 1.055, 2.4);
  const B = sB <= 0.03928 ? sB / 12.92 : Math.pow((sB + 0.055) / 1.055, 2.4);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

export function getContrastColor(luminance: number): string {
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

export function parseColor(color: string): { r: number; g: number; b: number } | null {
  const hexResult = hexToRgb(color);
  if (hexResult) return hexResult;

  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
  if (rgbMatch) {
    return { r: parseInt(rgbMatch[1]), g: parseInt(rgbMatch[2]), b: parseInt(rgbMatch[3]) };
  }

  return null;
}
