/**
 * Byte unit sizes.
 * SI (decimal) units use powers of 1000; IEC (binary) units use powers of 1024.
 */
export const BYTE_UNIT_SIZES = {
  KB: 1000 ** 1,
  MB: 1000 ** 2,
  GB: 1000 ** 3,
  TB: 1000 ** 4,
  KiB: 1024 ** 1,
  MiB: 1024 ** 2,
  GiB: 1024 ** 3,
  TiB: 1024 ** 4,
} as const;

export type ByteUnit = keyof typeof BYTE_UNIT_SIZES;

function toFiniteNumber(input: number): number {
  return Number.isFinite(input) ? input : 0;
}

/**
 * Converts a value from one unit to another (e.g. TiB to GB, KB to GiB).
 * The result is not rounded; round at the call site when displaying.
 * Non-finite input (NaN, ±Infinity) is treated as 0.
 */
export function convertUnit(value: number, from: ByteUnit, to: ByteUnit): number {
  const finiteValue = toFiniteNumber(value);
  if (from === to) return finiteValue;

  return (finiteValue * BYTE_UNIT_SIZES[from]) / BYTE_UNIT_SIZES[to];
}

/**
 * Converts a value in the given unit into bytes.
 * Non-finite input (NaN, ±Infinity) is treated as 0.
 */
export function unitToBytes(value: number, unit: ByteUnit): number {
  return toFiniteNumber(value) * BYTE_UNIT_SIZES[unit];
}

/**
 * Converts a byte count into the given unit.
 * Non-finite input (NaN, ±Infinity) is treated as 0.
 */
export function convertBytes(bytes: number, unit: ByteUnit): number {
  return toFiniteNumber(bytes) / BYTE_UNIT_SIZES[unit];
}

// SI (decimal) units
export const bytesToKB = (bytes: number): number => convertBytes(bytes, 'KB');
export const bytesToMB = (bytes: number): number => convertBytes(bytes, 'MB');
export const bytesToGB = (bytes: number): number => convertBytes(bytes, 'GB');
export const bytesToTB = (bytes: number): number => convertBytes(bytes, 'TB');

// IEC (binary) units
export const bytesToKiB = (bytes: number): number => convertBytes(bytes, 'KiB');
export const bytesToMiB = (bytes: number): number => convertBytes(bytes, 'MiB');
export const bytesToGiB = (bytes: number): number => convertBytes(bytes, 'GiB');
export const bytesToTiB = (bytes: number): number => convertBytes(bytes, 'TiB');
