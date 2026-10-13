/**
 * Pure TypeScript EXIF and Media Metadata Parser
 * Extracts real EXIF metadata from JPEG, PNG, and WebP ArrayBuffers without external dependencies.
 * Never fabricates GPS, timestamps, or device data.
 */

export interface ExifMetadataResult {
  hasExif: boolean;
  latitude: number | null;
  longitude: number | null;
  hasGps: boolean;
  capturedAt: string | null;
  rawCaptureDate: Date | null;
  hasCaptureTime: boolean;
  cameraMake: string | null;
  cameraModel: string | null;
  software: string | null;
  orientation: number | null;
}

export function formatCaptureDate(date: Date): string {
  try {
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return date.toISOString();
  }
}

/**
 * Parses EXIF data from an image file ArrayBuffer
 */
export async function parseImageExif(file: File): Promise<ExifMetadataResult> {
  const defaultResult: ExifMetadataResult = {
    hasExif: false,
    latitude: null,
    longitude: null,
    hasGps: false,
    capturedAt: null,
    rawCaptureDate: null,
    hasCaptureTime: false,
    cameraMake: null,
    cameraModel: null,
    software: null,
    orientation: null,
  };

  try {
    // Read up to 256KB for EXIF headers (avoids loading massive files entirely into memory if not needed)
    const sliceSize = Math.min(file.size, 256 * 1024);
    const slice = file.slice(0, sliceSize);
    const arrayBuffer = await slice.arrayBuffer();
    const dataView = new DataView(arrayBuffer);

    // Check JPEG SOI (0xFFD8)
    if (dataView.byteLength > 4 && dataView.getUint16(0, false) === 0xffd8) {
      return parseJpegExif(dataView);
    }

    // Check PNG Header (0x89504E47)
    if (dataView.byteLength > 8 && dataView.getUint32(0, false) === 0x89504e47) {
      return parsePngExif(dataView);
    }

    // Check WebP RIFF (0x52494646 ... 'WEBP')
    if (
      dataView.byteLength > 12 &&
      dataView.getUint32(0, false) === 0x52494646 &&
      dataView.getUint32(8, false) === 0x57454250
    ) {
      return parseWebpExif(dataView);
    }

    return defaultResult;
  } catch (err) {
    console.warn('EXIF parsing notice: metadata not accessible or format unparsed', err);
    return defaultResult;
  }
}

function parseJpegExif(view: DataView): ExifMetadataResult {
  let offset = 2;
  const len = view.byteLength;

  while (offset + 4 < len) {
    if (view.getUint8(offset) !== 0xff) {
      offset++;
      continue;
    }

    const marker = view.getUint8(offset + 1);

    // SOS (Start of Scan 0xDA) or EOI (End of Image 0xD9)
    if (marker === 0xda || marker === 0xd9) break;

    const segmentLength = view.getUint16(offset + 2, false);

    // APP1 Marker (0xE1) contains EXIF
    if (marker === 0xe1) {
      if (offset + 10 <= len) {
        const exifHeader = getString(view, offset + 4, 6);
        if (exifHeader.startsWith('Exif\0\0')) {
          const tiffStart = offset + 10;
          return parseTiffBlock(view, tiffStart);
        }
      }
    }

    offset += 2 + segmentLength;
  }

  return {
    hasExif: false,
    latitude: null,
    longitude: null,
    hasGps: false,
    capturedAt: null,
    rawCaptureDate: null,
    hasCaptureTime: false,
    cameraMake: null,
    cameraModel: null,
    software: null,
    orientation: null,
  };
}

function parseWebpExif(view: DataView): ExifMetadataResult {
  let offset = 12; // after RIFF header
  const len = view.byteLength;

  while (offset + 8 < len) {
    const chunkId = getString(view, offset, 4);
    const chunkSize = view.getUint32(offset + 4, true);

    if (chunkId === 'EXIF') {
      const exifStart = offset + 8;
      // Some WebP files have 'Exif\0\0' prefix in the EXIF chunk
      if (exifStart + 6 <= len && getString(view, exifStart, 6).startsWith('Exif\0\0')) {
        return parseTiffBlock(view, exifStart + 6);
      }
      return parseTiffBlock(view, exifStart);
    }

    // Pad to 2-byte boundary
    offset += 8 + chunkSize + (chunkSize % 2);
  }

  return {
    hasExif: false,
    latitude: null,
    longitude: null,
    hasGps: false,
    capturedAt: null,
    rawCaptureDate: null,
    hasCaptureTime: false,
    cameraMake: null,
    cameraModel: null,
    software: null,
    orientation: null,
  };
}

function parsePngExif(view: DataView): ExifMetadataResult {
  let offset = 8;
  const len = view.byteLength;

  while (offset + 8 < len) {
    const chunkSize = view.getUint32(offset, false);
    const chunkType = getString(view, offset + 4, 4);

    if (chunkType === 'eXIf') {
      return parseTiffBlock(view, offset + 8);
    }

    offset += 12 + chunkSize; // size (4) + type (4) + data (chunkSize) + CRC (4)
  }

  return {
    hasExif: false,
    latitude: null,
    longitude: null,
    hasGps: false,
    capturedAt: null,
    rawCaptureDate: null,
    hasCaptureTime: false,
    cameraMake: null,
    cameraModel: null,
    software: null,
    orientation: null,
  };
}

function parseTiffBlock(view: DataView, tiffStart: number): ExifMetadataResult {
  const result: ExifMetadataResult = {
    hasExif: true,
    latitude: null,
    longitude: null,
    hasGps: false,
    capturedAt: null,
    rawCaptureDate: null,
    hasCaptureTime: false,
    cameraMake: null,
    cameraModel: null,
    software: null,
    orientation: null,
  };

  if (tiffStart + 8 > view.byteLength) return result;

  const endianIndicator = view.getUint16(tiffStart, false);
  const isLittle = endianIndicator === 0x4949; // 'II'
  const isBig = endianIndicator === 0x4d4d; // 'MM'

  if (!isLittle && !isBig) return result;

  const signature = view.getUint16(tiffStart + 2, isLittle);
  if (signature !== 0x002a) return result;

  const firstIfdOffset = view.getUint32(tiffStart + 4, isLittle);
  if (tiffStart + firstIfdOffset > view.byteLength) return result;

  interface TagEntry {
    type: number;
    count: number;
    valOrOffset: number;
    entryOffset: number;
  }

  function readIFD(ifdOffset: number): Record<number, TagEntry> {
    const tags: Record<number, TagEntry> = {};
    const fullOffset = tiffStart + ifdOffset;
    if (fullOffset + 2 > view.byteLength) return tags;

    const numEntries = view.getUint16(fullOffset, isLittle);
    for (let i = 0; i < numEntries; i++) {
      const entry = fullOffset + 2 + i * 12;
      if (entry + 12 > view.byteLength) break;
      const tag = view.getUint16(entry, isLittle);
      const type = view.getUint16(entry + 2, isLittle);
      const count = view.getUint32(entry + 4, isLittle);
      const valOrOffset = view.getUint32(entry + 8, isLittle);
      tags[tag] = { type, count, valOrOffset, entryOffset: entry + 8 };
    }
    return tags;
  }

  function readStringTag(entry?: TagEntry): string | null {
    if (!entry) return null;
    let offset = entry.count <= 4 ? entry.entryOffset : tiffStart + entry.valOrOffset;
    if (offset + entry.count > view.byteLength) return null;
    let str = '';
    for (let i = 0; i < entry.count; i++) {
      const ch = view.getUint8(offset + i);
      if (ch === 0) break; // null terminator
      str += String.fromCharCode(ch);
    }
    return str.trim() || null;
  }

  function readRational(offset: number): number {
    if (offset + 8 > view.byteLength) return 0;
    const num = view.getUint32(offset, isLittle);
    const den = view.getUint32(offset + 4, isLittle);
    return den === 0 ? 0 : num / den;
  }

  function readRationals(entry?: TagEntry, expectedCount = 3): number[] {
    if (!entry || entry.count < expectedCount) return [];
    const offset = tiffStart + entry.valOrOffset;
    if (offset + expectedCount * 8 > view.byteLength) return [];
    const res: number[] = [];
    for (let i = 0; i < expectedCount; i++) {
      res.push(readRational(offset + i * 8));
    }
    return res;
  }

  const ifd0 = readIFD(firstIfdOffset);

  // Make, Model, Software, Orientation
  result.cameraMake = readStringTag(ifd0[0x010f]);
  result.cameraModel = readStringTag(ifd0[0x0110]);
  result.software = readStringTag(ifd0[0x0131]);
  if (ifd0[0x0112]) {
    result.orientation = view.getUint16(ifd0[0x0112].entryOffset, isLittle);
  }

  // Capture Date / Time in IFD0
  const dateStr0 = readStringTag(ifd0[0x0132]);
  if (dateStr0) {
    const parsed = parseExifDateString(dateStr0);
    if (parsed) {
      result.rawCaptureDate = parsed;
      result.capturedAt = formatCaptureDate(parsed);
      result.hasCaptureTime = true;
    }
  }

  // Exif SubIFD (0x8769)
  if (ifd0[0x8769]) {
    const exifIfd = readIFD(ifd0[0x8769].valOrOffset);
    const dto = readStringTag(exifIfd[0x9003]) || readStringTag(exifIfd[0x9004]);
    if (dto) {
      const parsed = parseExifDateString(dto);
      if (parsed) {
        result.rawCaptureDate = parsed;
        result.capturedAt = formatCaptureDate(parsed);
        result.hasCaptureTime = true;
      }
    }
  }

  // GPS SubIFD (0x8825)
  if (ifd0[0x8825]) {
    const gpsIfd = readIFD(ifd0[0x8825].valOrOffset);
    const latRef = readStringTag(gpsIfd[0x0001]);
    const latRats = readRationals(gpsIfd[0x0002], 3);
    const lonRef = readStringTag(gpsIfd[0x0003]);
    const lonRats = readRationals(gpsIfd[0x0004], 3);

    if (latRats.length === 3 && lonRats.length === 3) {
      let lat = latRats[0] + latRats[1] / 60 + latRats[2] / 3600;
      let lon = lonRats[0] + lonRats[1] / 60 + lonRats[2] / 3600;

      if (latRef === 'S') lat = -lat;
      if (lonRef === 'W') lon = -lon;

      if (!isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
        result.latitude = parseFloat(lat.toFixed(6));
        result.longitude = parseFloat(lon.toFixed(6));
        result.hasGps = true;
      }
    }
  }

  return result;
}

function parseExifDateString(dateStr: string): Date | null {
  // Format: "YYYY:MM:DD HH:MM:SS"
  const match = dateStr.match(/^(\d{4})[:\-](\d{2})[:\-](\d{2})\s+(\d{2}):(\d{2}):(\d{2})/);
  if (!match) return null;
  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10) - 1;
  const day = parseInt(match[3], 10);
  const hour = parseInt(match[4], 10);
  const min = parseInt(match[5], 10);
  const sec = parseInt(match[6], 10);

  const d = new Date(year, month, day, hour, min, sec);
  return isNaN(d.getTime()) ? null : d;
}

function getString(view: DataView, offset: number, length: number): string {
  let str = '';
  for (let i = 0; i < length; i++) {
    if (offset + i >= view.byteLength) break;
    str += String.fromCharCode(view.getUint8(offset + i));
  }
  return str;
}
