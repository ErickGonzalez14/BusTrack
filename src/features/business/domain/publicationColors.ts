type ColorAdjustment = {
  saturation?: number;
  lightness?: number;
};
const hexToHsl = (hex: string): [number, number, number] => {
  const normalizedHex = hex.replace("#", "");

  const red = parseInt(normalizedHex.slice(0, 2), 16) / 255;
  const green = parseInt(normalizedHex.slice(2, 4), 16) / 255;
  const blue = parseInt(normalizedHex.slice(4, 6), 16) / 255;

  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);

  let hue = 0;
  let saturation = 0;
  const lightness = (max + min) / 2;
  const difference = max - min;

  if (difference !== 0) {
    saturation =
      lightness > 0.5 ? difference / (2 - max - min) : difference / (max + min);

    switch (max) {
      case red:
        hue = (green - blue) / difference + (green < blue ? 6 : 0);
        break;
      case green:
        hue = (blue - red) / difference + 2;
        break;
      default:
        hue = (red - green) / difference + 4;
        break;
    }

    hue /= 6;
  }

  return [hue * 360, saturation * 100, lightness * 100];
};

const hslToHex = (hue: number, saturation: number, lightness: number) => {
  const h = hue / 360;
  const s = saturation / 100;
  const l = lightness / 100;

  const hueToRgb = (p: number, q: number, t: number) => {
    let normalizedT = t;

    if (normalizedT < 0) normalizedT += 1;
    if (normalizedT > 1) normalizedT -= 1;
    if (normalizedT < 1 / 6) {
      return p + (q - p) * 6 * normalizedT;
    }
    if (normalizedT < 1 / 2) {
      return q;
    }
    if (normalizedT < 2 / 3) {
      return p + (q - p) * (2 / 3 - normalizedT) * 6;
    }

    return p;
  };

  let red = l;
  let green = l;
  let blue = l;

  if (s !== 0) {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    red = hueToRgb(p, q, h + 1 / 3);
    green = hueToRgb(p, q, h);
    blue = hueToRgb(p, q, h - 1 / 3);
  }

  const toHex = (value: number) =>
    Math.round(value * 255)
      .toString(16)
      .padStart(2, "0");

  return `#${toHex(red)}${toHex(green)}${toHex(blue)}`;
};

export const adjustColor = (
  color: string,
  { saturation = 0, lightness = 0 }: ColorAdjustment = {},
) => {
  const [hue, currentSaturation, currentLightness] = hexToHsl(color);

  return hslToHex(
    hue,
    Math.max(0, Math.min(100, currentSaturation + saturation)),
    Math.max(0, Math.min(100, currentLightness + lightness)),
  );
};
