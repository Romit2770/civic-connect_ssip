/**
 * Media Validation Utility for CivicConnect Backend
 * Enforces file size, MIME type, file integrity, and container-level video duration limits.
 */

export const MAX_EVIDENCE_FILES = 5;
export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
export const MAX_VIDEO_SIZE_BYTES = 50 * 1024 * 1024; // 50MB
export const MAX_VIDEO_DURATION_SECONDS = 60; // 60 seconds (1 minute)

export const ALLOWED_IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp'];
export const ALLOWED_VIDEO_MIMES = ['video/mp4', 'video/webm', 'video/quicktime'];
export const ALLOWED_AUDIO_MIMES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/webm',
  'audio/ogg',
  'audio/m4a',
  'audio/x-m4a',
];

/**
 * Parses container-level video duration (in seconds) from an MP4, MOV, or WebM buffer.
 * Returns duration in seconds or null if the container duration box cannot be determined.
 */
export function parseVideoDurationFromBuffer(buffer: Buffer): number | null {
  if (!buffer || buffer.length < 16) return null;

  try {
    // 1. Check for MP4 / MOV (ISO Base Media File Format)
    const isIsoBmff =
      buffer.length >= 8 &&
      (buffer.toString('ascii', 4, 8) === 'ftyp' ||
        buffer.toString('ascii', 4, 8) === 'moov' ||
        buffer.toString('ascii', 4, 8) === 'free' ||
        buffer.toString('ascii', 4, 8) === 'mdat' ||
        buffer.toString('ascii', 4, 8) === 'wide');

    if (isIsoBmff) {
      return parseIsoBmffDuration(buffer);
    }

    // 2. Check for WebM / Matroska EBML header (0x1A 0x45 0xDF 0xA3)
    if (buffer[0] === 0x1a && buffer[1] === 0x45 && buffer[2] === 0xdf && buffer[3] === 0xa3) {
      return parseWebmDuration(buffer);
    }

    return null;
  } catch (e) {
    return null;
  }
}

/**
 * Searches for 'moov' -> 'mvhd' atom in ISO BMFF (MP4/MOV) buffer.
 */
function parseIsoBmffDuration(buffer: Buffer): number | null {
  let offset = 0;
  const len = buffer.length;

  function findBox(start: number, end: number, targetType: string): { start: number; end: number } | null {
    let p = start;
    while (p + 8 <= end) {
      let size = buffer.readUInt32BE(p);
      const type = buffer.toString('ascii', p + 4, p + 8);

      if (size === 1) {
        if (p + 16 > end) break;
        size = Number(buffer.readBigUInt64BE(p + 8));
      } else if (size === 0) {
        size = end - p;
      }

      if (size < 8) break;
      if (type === targetType) {
        return { start: p, end: Math.min(p + size, end) };
      }
      p += size;
    }
    return null;
  }

  const moov = findBox(0, len, 'moov');
  if (!moov) return null;

  const mvhd = findBox(moov.start + 8, moov.end, 'mvhd');
  if (!mvhd) return null;

  const payload = mvhd.start + 8;
  if (payload + 28 > len) return null;

  const version = buffer.readUInt8(payload);
  if (version === 0) {
    const timescale = buffer.readUInt32BE(payload + 12);
    const duration = buffer.readUInt32BE(payload + 16);
    return timescale > 0 ? duration / timescale : null;
  } else if (version === 1) {
    if (payload + 36 > len) return null;
    const timescale = buffer.readUInt32BE(payload + 20);
    const duration = Number(buffer.readBigUInt64BE(payload + 24));
    return timescale > 0 ? duration / timescale : null;
  }

  return null;
}

/**
 * Parses EBML duration in WebM buffer.
 */
function parseWebmDuration(buffer: Buffer): number | null {
  // Look for EBML Duration element tag (0x44 0x89) in first 1MB of header
  const searchLimit = Math.min(buffer.length - 8, 1024 * 1024);
  let timecodeScale = 1000000; // default 1ms

  // Search for TimecodeScale (0x2A 0xD7 0xB1)
  for (let i = 0; i < searchLimit - 5; i++) {
    if (buffer[i] === 0x2a && buffer[i + 1] === 0xd7 && buffer[i + 2] === 0xb1) {
      const len = buffer[i + 3];
      if (len === 1) timecodeScale = buffer.readUInt8(i + 4);
      else if (len === 2) timecodeScale = buffer.readUInt16BE(i + 4);
      else if (len === 4) timecodeScale = buffer.readUInt32BE(i + 4);
      break;
    }
  }

  // Search for Duration (0x44 0x89)
  for (let i = 0; i < searchLimit - 6; i++) {
    if (buffer[i] === 0x44 && buffer[i + 1] === 0x89) {
      const len = buffer[i + 2];
      if (len === 4 && i + 7 <= buffer.length) {
        const floatVal = buffer.readFloatBE(i + 3);
        return (floatVal * timecodeScale) / 1000000000;
      } else if (len === 8 && i + 11 <= buffer.length) {
        const doubleVal = buffer.readDoubleBE(i + 3);
        return (doubleVal * timecodeScale) / 1000000000;
      }
    }
  }

  return null;
}
