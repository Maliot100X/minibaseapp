import { formatUnits } from 'viem';

export const formatToken = (value: bigint, decimals = 18, fractionDigits = 4) => {
  const asString = formatUnits(value, decimals);
  const num = Number(asString);
  if (Number.isNaN(num)) return '0';
  return num.toFixed(fractionDigits);
};

export const formatTimestamp = (value: bigint) => {
  const asNumber = Number(value);
  if (!asNumber) return 'Never';
  const date = new Date(asNumber * 1000);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return date.toLocaleString();
};

