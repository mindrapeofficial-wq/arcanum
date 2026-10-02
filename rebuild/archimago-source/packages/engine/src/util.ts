import { Mage } from "shared/src/mage";

// Debugging pretty print
export const LPretty = (v: any, n: number = 20) => {
  const str = '' + v;
  return str + ' '.repeat(n - str.length);
};
export const RPretty = (v: any, n: number = 10) => {
  const str = '' + v;
  return ' '.repeat(n - str.length) + str;
};
export const mageName = (mage: Mage) => {
  return `${mage.name} (#${mage.id})`;
}

// ARCANUM identity: display names for the five magic schools.
// Internal ids are kept intact; only the player-facing label changes here.
export const SCHOOL_LABELS: Record<string, string> = {
  ascendant: 'Aurea',
  verdant: 'Viridia',
  eradication: 'Cineria',
  nether: 'Nadir',
  phantasm: 'Oneiria',
};

export const readableStr = (str: string) => {
  if (!str) return '';

  if (SCHOOL_LABELS[str]) return SCHOOL_LABELS[str];

  // Insert space before capital letters and capitalize the first word
  return str
    .replace(/([A-Z])/g, ' $1')   // insert space before capital letters
    .replace(/^./, char => char.toUpperCase()); // capitalize first letter
}

export const readableNumber = (
  v: number,
  options?: Intl.NumberFormatOptions
) => {
  return new Intl.NumberFormat('en-US', options).format(v);
}

