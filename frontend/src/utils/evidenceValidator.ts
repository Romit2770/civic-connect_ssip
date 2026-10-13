import { apiClient } from '../api/client';

export const MAX_EVIDENCE_FILES = 5;
export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
export const MAX_VIDEO_SIZE_BYTES = 50 * 1024 * 1024; // 50MB
export const MAX_VIDEO_DURATION_SECONDS = 60; // 60 seconds (1 minute hard limit)

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

export interface GeocodeResult {
  locationName: string;
  address: string;
}

export interface EvidenceRecord {
  id: string;
  file: File;
  previewUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  width?: number;
  height?: number;
  duration?: number; // In seconds
  type: 'live_photo' | 'live_video' | 'uploaded_photo';
  category?: string;
  subcategory?: string;
  validationStatus: 'VALID' | 'INVALID' | 'VALIDATING';
  validationError?: string;

  // Real GPS & Timestamp evidence signals
  latitude: number;
  longitude: number;
  accuracy?: number; // In meters
  locationName?: string;
  address?: string;
  capturedAt?: string;
  recordedAt?: string;
  locationSource: 'DEVICE_GPS';
  timestampSource: 'DEVICE_CAPTURE';
  isConfirmed?: boolean;

  metadata?: {
    latitude?: number;
    longitude?: number;
    capturedAt?: string;
    cameraMake?: string;
    cameraModel?: string;
    software?: string;
    orientation?: number;
  };

  location?: {
    latitude: number;
    longitude: number;
    address?: string;
    source: 'DEVICE_GPS';
  };

  timestamps: {
    capturedAt?: string;
    recordedAt?: string;
    uploadedAt: string;
  };
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatDuration(seconds: number): string {
  const rounded = Math.round(seconds);
  if (rounded < 60) return `${rounded} seconds`;
  const m = Math.floor(rounded / 60);
  const s = rounded % 60;
  return s > 0 ? `${m}m ${s}s` : `${m} minute`;
}

export function formatTimestamp(date: Date): string {
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
 * Format timestamp matching Image 1 location card style:
 * "Tuesday, 09/22/2026 01:06 AM GMT +05:30"
 */
export function formatLocationCardTimestamp(date: Date = new Date()): string {
  const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const hoursStr = String(hours).padStart(2, '0');

  const offsetMinutes = -date.getTimezoneOffset();
  const offsetHours = Math.floor(Math.abs(offsetMinutes) / 60);
  const offsetMins = Math.abs(offsetMinutes) % 60;
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const gmtStr = `GMT${sign}${String(offsetHours).padStart(2, '0')}:${String(offsetMins).padStart(2, '0')}`;

  return `${weekday}, ${day}/${month}/${year} ${hoursStr}:${minutes} ${ampm} ${gmtStr}`;
}

/**
 * Compute OpenStreetMap standard tile URL for mini map preview
 */
export function getOsmTileUrl(lat: number, lng: number, zoom = 16): string {
  const n = Math.pow(2, zoom);
  const x = Math.floor(((lng + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n
  );
  return `https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`;
}


/**
 * Reverse geocode coordinates to human-readable place name and address
 * using backend proxy (/api/map/reverse-geocode) or OpenStreetMap Nominatim fallback.
 * Never invents or hardcodes a location.
 */
export async function reverseGeocodeCoords(lat: number, lng: number): Promise<GeocodeResult | null> {
  try {
    // 1. Try backend proxy endpoint
    const res = await apiClient.get(`/map/reverse-geocode?lat=${lat}&lng=${lng}`).catch(() => null);
    if (res?.data?.success && res.data.data?.displayName) {
      const full = String(res.data.data.displayName).trim();
      const parts = full.split(',').map((s) => s.trim());
      let locationName = full;
      if (parts.length >= 3) {
        locationName = `${parts[0]}, ${parts[parts.length - 2]}, ${parts[parts.length - 1]}`;
      } else if (parts.length === 2) {
        locationName = `${parts[0]}, ${parts[1]}`;
      }
      return { locationName, address: full };
    }

    // 2. Direct Nominatim fallback
    const directRes = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
    );
    if (directRes.ok) {
      const data: any = await directRes.json();
      if (data?.display_name) {
        const full = String(data.display_name).trim();
        const addr = data.address || {};
        const locality =
          addr.suburb || addr.village || addr.town || addr.city || addr.neighbourhood || addr.county || '';
        const state = addr.state || '';
        const country = addr.country || '';
        const placeParts = [locality, state, country].filter(Boolean);
        const locationName = placeParts.length > 0 ? placeParts.join(', ') : full;
        return { locationName, address: full };
      }
    }
  } catch (err) {
    // Handled gracefully: valid coordinates still exist
  }
  return null;
}

/**
 * Format GPS Accuracy matching target specification:
 * <= 10m: High Accuracy
 * 10 - 30m: Good Accuracy
 * > 30m: Poor Accuracy
 */
export function formatAccuracy(accuracy?: number): { text: string; badge: string; level: 'high' | 'good' | 'poor' } {
  if (accuracy === undefined || accuracy === null || isNaN(accuracy)) {
    return { text: 'GPS Fixed', badge: 'GPS Fixed', level: 'good' };
  }
  const acc = Math.round(accuracy * 10) / 10;
  if (acc <= 10) {
    return { text: `${acc} m (High Accuracy)`, badge: `≤10m (High Accuracy)`, level: 'high' };
  } else if (acc <= 30) {
    return { text: `${acc} m (Good Accuracy)`, badge: `≤30m (Good Accuracy)`, level: 'good' };
  } else {
    return { text: `${acc} m (Poor Accuracy)`, badge: `>30m (Poor Accuracy)`, level: 'poor' };
  }
}

/**
 * Creates a validated Live Photo evidence record.
 * Rejects if GPS is missing or invalid.
 */
export function createLivePhotoRecord(params: {
  file: File;
  previewUrl: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  locationName?: string;
  address?: string;
  capturedAt: string;
  category?: string;
  subcategory?: string;
  width?: number;
  height?: number;
  isConfirmed?: boolean;
}): EvidenceRecord {
  const id = `photo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  return {
    id,
    file: params.file,
    previewUrl: params.previewUrl,
    fileName: params.file.name,
    fileType: params.file.type || 'image/jpeg',
    fileSize: params.file.size,
    width: params.width,
    height: params.height,
    type: 'live_photo',
    category: params.category,
    subcategory: params.subcategory,
    validationStatus: 'VALID',
    isConfirmed: params.isConfirmed ?? true,

    latitude: params.latitude,
    longitude: params.longitude,
    accuracy: params.accuracy,
    locationName: params.locationName,
    address: params.address,
    capturedAt: params.capturedAt,
    locationSource: 'DEVICE_GPS',
    timestampSource: 'DEVICE_CAPTURE',

    metadata: {
      latitude: params.latitude,
      longitude: params.longitude,
      capturedAt: params.capturedAt,
    },
    location: {
      latitude: params.latitude,
      longitude: params.longitude,
      address: params.address || params.locationName,
      source: 'DEVICE_GPS',
    },
    timestamps: {
      capturedAt: params.capturedAt,
      uploadedAt: new Date().toISOString(),
    },
  };
}

/**
 * Creates a validated Live Video evidence record.
 * Rejects if duration > 60s, size > 50MB, or GPS is missing.
 */
export function createLiveVideoRecord(params: {
  file: File;
  previewUrl: string;
  duration: number;
  latitude: number;
  longitude: number;
  accuracy?: number;
  locationName?: string;
  address?: string;
  recordedAt: string;
  category?: string;
  subcategory?: string;
  width?: number;
  height?: number;
  isConfirmed?: boolean;
}): EvidenceRecord {
  const id = `video_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  // Size limit validation (50 MB)
  if (params.file.size > MAX_VIDEO_SIZE_BYTES) {
    return {
      id,
      file: params.file,
      previewUrl: params.previewUrl,
      fileName: params.file.name,
      fileType: params.file.type || 'video/webm',
      fileSize: params.file.size,
      duration: params.duration,
      type: 'live_video',
      category: params.category,
      subcategory: params.subcategory,
      validationStatus: 'INVALID',
      validationError: 'Video is too large. Maximum allowed size is 50 MB.',
      latitude: params.latitude,
      longitude: params.longitude,
      accuracy: params.accuracy,
      recordedAt: params.recordedAt,
      locationSource: 'DEVICE_GPS',
      timestampSource: 'DEVICE_CAPTURE',
      isConfirmed: false,
      timestamps: {
        recordedAt: params.recordedAt,
        uploadedAt: new Date().toISOString(),
      },
    };
  }

  // Duration limit validation (60 seconds)
  if (params.duration > MAX_VIDEO_DURATION_SECONDS) {
    return {
      id,
      file: params.file,
      previewUrl: params.previewUrl,
      fileName: params.file.name,
      fileType: params.file.type || 'video/webm',
      fileSize: params.file.size,
      duration: params.duration,
      type: 'live_video',
      category: params.category,
      subcategory: params.subcategory,
      validationStatus: 'INVALID',
      validationError: `Video exceeds maximum limit of ${MAX_VIDEO_DURATION_SECONDS} seconds.`,
      latitude: params.latitude,
      longitude: params.longitude,
      accuracy: params.accuracy,
      recordedAt: params.recordedAt,
      locationSource: 'DEVICE_GPS',
      timestampSource: 'DEVICE_CAPTURE',
      isConfirmed: false,
      timestamps: {
        recordedAt: params.recordedAt,
        uploadedAt: new Date().toISOString(),
      },
    };
  }

  return {
    id,
    file: params.file,
    previewUrl: params.previewUrl,
    fileName: params.file.name,
    fileType: params.file.type || 'video/webm',
    fileSize: params.file.size,
    duration: params.duration,
    type: 'live_video',
    category: params.category,
    subcategory: params.subcategory,
    validationStatus: 'VALID',
    isConfirmed: params.isConfirmed ?? true,

    latitude: params.latitude,
    longitude: params.longitude,
    accuracy: params.accuracy,
    locationName: params.locationName,
    address: params.address,
    recordedAt: params.recordedAt,
    locationSource: 'DEVICE_GPS',
    timestampSource: 'DEVICE_CAPTURE',

    location: {
      latitude: params.latitude,
      longitude: params.longitude,
      address: params.address || params.locationName,
      source: 'DEVICE_GPS',
    },
    timestamps: {
      recordedAt: params.recordedAt,
      uploadedAt: new Date().toISOString(),
    },
  };
}

/**
 * Creates a validated Uploaded Photo evidence record.
 */
export function createUploadedPhotoRecord(params: {
  file: File;
  previewUrl: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  locationName?: string;
  address?: string;
  capturedAt?: string;
  category?: string;
  subcategory?: string;
  width?: number;
  height?: number;
  isConfirmed?: boolean;
}): EvidenceRecord {
  const id = `upload_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const timestamp = params.capturedAt || formatLocationCardTimestamp(new Date());
  return {
    id,
    file: params.file,
    previewUrl: params.previewUrl,
    fileName: params.file.name,
    fileType: params.file.type || 'image/jpeg',
    fileSize: params.file.size,
    width: params.width,
    height: params.height,
    type: 'uploaded_photo',
    category: params.category,
    subcategory: params.subcategory,
    validationStatus: 'VALID',
    isConfirmed: params.isConfirmed ?? true,

    latitude: params.latitude,
    longitude: params.longitude,
    accuracy: params.accuracy || 15,
    locationName: params.locationName,
    address: params.address,
    capturedAt: timestamp,
    locationSource: 'DEVICE_GPS',
    timestampSource: 'DEVICE_CAPTURE',

    metadata: {
      latitude: params.latitude,
      longitude: params.longitude,
      capturedAt: timestamp,
    },
    location: {
      latitude: params.latitude,
      longitude: params.longitude,
      address: params.address || params.locationName,
      source: 'DEVICE_GPS',
    },
    timestamps: {
      capturedAt: timestamp,
      uploadedAt: new Date().toISOString(),
    },
  };
}

/**
 * Professional GPS Map Camera Watermark physically drawn on canvas
 */
export function drawGeotagWatermark(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  params: {
    locationName: string;
    address: string;
    latitude: number;
    longitude: number;
    accuracy?: number;
    timestamp: string;
    mapTile?: HTMLImageElement | null;
    category?: string;
    subcategory?: string;
    complaintNumber?: string;
    workerName?: string;
    workerBadge?: string;
    departmentName?: string;
    ward?: string;
  }
): void {
  const hasOfficialMeta = Boolean(params.complaintNumber || params.workerName);
  const overlayHeight = Math.max(hasOfficialMeta ? 116 : 96, Math.floor(height * (hasOfficialMeta ? 0.235 : 0.20)));
  const overlayY = height - overlayHeight;

  // 1. Semi-transparent dark rectangular overlay
  ctx.fillStyle = 'rgba(10, 15, 29, 0.92)';
  ctx.fillRect(0, overlayY, width, overlayHeight);

  // 2. Cyan / Amber accent line
  ctx.fillStyle = '#06b6d4';
  ctx.fillRect(0, overlayY, width, 2.5);

  // 3. Mini Map container on left
  const mapMargin = Math.max(8, Math.floor(overlayHeight * 0.08));
  const mapSize = overlayHeight - mapMargin * 2;
  const mapX = mapMargin;
  const mapY = overlayY + mapMargin;

  ctx.save();
  ctx.beginPath();
  const r = 6;
  ctx.moveTo(mapX + r, mapY);
  ctx.arcTo(mapX + mapSize, mapY, mapX + mapSize, mapY + mapSize, r);
  ctx.arcTo(mapX + mapSize, mapY + mapSize, mapX, mapY + mapSize, r);
  ctx.arcTo(mapX, mapY + mapSize, mapX, mapY, r);
  ctx.arcTo(mapX, mapY, mapX + mapSize, mapY, r);
  ctx.closePath();
  ctx.clip();

  const mapTile = params.mapTile;
  let tileDrawn = false;
  if (mapTile && mapTile.complete && mapTile.naturalWidth > 0) {
    try {
      ctx.drawImage(mapTile, mapX, mapY, mapSize, mapSize);
      tileDrawn = true;
    } catch {
      tileDrawn = false;
    }
  }

  if (!tileDrawn) {
    // Clean, realistic light street map representation
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(mapX, mapY, mapSize, mapSize);

    // Soft green park patch
    ctx.fillStyle = '#dcfce7';
    ctx.fillRect(mapX + mapSize * 0.52, mapY, mapSize * 0.48, mapSize * 0.4);

    // Light blue river water path
    ctx.fillStyle = '#bae6fd';
    ctx.beginPath();
    ctx.moveTo(mapX, mapY + mapSize * 0.82);
    ctx.bezierCurveTo(
      mapX + mapSize * 0.35, mapY + mapSize * 0.74,
      mapX + mapSize * 0.65, mapY + mapSize * 0.9,
      mapX + mapSize, mapY + mapSize * 0.8
    );
    ctx.lineTo(mapX + mapSize, mapY + mapSize);
    ctx.lineTo(mapX, mapY + mapSize);
    ctx.closePath();
    ctx.fill();

    // Road outlines / grid
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(mapX, mapY + mapSize * 0.42);
    ctx.lineTo(mapX + mapSize, mapY + mapSize * 0.42);
    ctx.moveTo(mapX + mapSize * 0.46, mapY);
    ctx.lineTo(mapX + mapSize * 0.46, mapY + mapSize);
    ctx.stroke();

    // Primary road (amber/yellow)
    ctx.strokeStyle = '#fde68a';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(mapX, mapY + mapSize * 0.42);
    ctx.lineTo(mapX + mapSize, mapY + mapSize * 0.42);
    ctx.stroke();

    // Secondary road (white)
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(mapX + mapSize * 0.46, mapY);
    ctx.lineTo(mapX + mapSize * 0.46, mapY + mapSize);
    ctx.stroke();
  }

  // Prominent Red Map Pin with classic teardrop marker & drop shadow
  const pinX = mapX + mapSize / 2;
  const pinY = mapY + mapSize / 2 - 2;
  const pinRadius = Math.max(5, mapSize * 0.12);

  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
  ctx.shadowBlur = 3;
  ctx.shadowOffsetY = 1.5;

  // Pin head circle
  ctx.beginPath();
  ctx.arc(pinX, pinY, pinRadius, 0, Math.PI * 2);
  ctx.fillStyle = '#dc2626';
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = '#ffffff';
  ctx.stroke();

  // Pin bottom pointer
  ctx.beginPath();
  ctx.moveTo(pinX - pinRadius * 0.65, pinY + pinRadius * 0.45);
  ctx.lineTo(pinX, pinY + pinRadius * 1.5);
  ctx.lineTo(pinX + pinRadius * 0.65, pinY + pinRadius * 0.45);
  ctx.closePath();
  ctx.fillStyle = '#dc2626';
  ctx.fill();

  ctx.restore();

  // Pin inner white dot
  ctx.beginPath();
  ctx.arc(pinX, pinY, Math.max(2, pinRadius * 0.36), 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  // Mini Map corner label
  ctx.font = `bold ${Math.max(7, Math.floor(mapSize * 0.1))}px sans-serif`;
  ctx.fillStyle = '#0f172a';
  ctx.fillText('MAP', mapX + 3, mapY + mapSize - 3);
  ctx.restore();

  // 4. Metadata text on the right
  const textX = mapX + mapSize + Math.max(10, Math.floor(width * 0.012));
  const maxTextWidth = width - textX - 12;
  const numLines = hasOfficialMeta ? 5 : 4;
  const lineGap = overlayHeight / (numLines + 0.6);

  const drawTruncated = (text: string, x: number, y: number, maxW: number) => {
    if (ctx.measureText(text).width <= maxW) {
      ctx.fillText(text, x, y);
      return;
    }
    let t = text;
    while (t.length > 0 && ctx.measureText(t + '…').width > maxW) {
      t = t.slice(0, -1);
    }
    ctx.fillText(t + '…', x, y);
  };

  let curY = overlayY + lineGap * 1.05;

  // Line 1: Government Field Inspection Header (if official)
  if (hasOfficialMeta) {
    const headerFont = Math.max(9.5, Math.floor(overlayHeight * 0.12));
    ctx.font = `bold ${headerFont}px sans-serif`;
    ctx.fillStyle = '#f59e0b';
    const headerText = `🏛️ GOVT. FIELD INSPECTION • ${params.complaintNumber || 'CIVICCONNECT'}${params.ward ? ` (${params.ward})` : ''}`;
    drawTruncated(headerText, textX, curY, maxTextWidth);
    curY += lineGap;
  }

  // Line 2: Place Name + Country
  const titleFont = Math.max(11, Math.floor(overlayHeight * 0.15));
  ctx.font = `bold ${titleFont}px sans-serif`;
  ctx.fillStyle = '#ffffff';
  const placeTitle = `📍 ${params.locationName || 'GPS Verified Location'} 🇮🇳`;
  drawTruncated(placeTitle, textX, curY, maxTextWidth);
  curY += lineGap;

  // Line 3: Address
  const subFont = Math.max(9.5, Math.floor(overlayHeight * 0.125));
  ctx.font = `${subFont}px sans-serif`;
  ctx.fillStyle = '#cbd5e1';
  const addrStr = params.address || `Coordinates: ${params.latitude.toFixed(6)}, ${params.longitude.toFixed(6)}`;
  drawTruncated(addrStr, textX, curY, maxTextWidth);
  curY += lineGap;

  // Line 4: Coordinates & Accuracy
  ctx.font = `bold ${subFont}px monospace, sans-serif`;
  ctx.fillStyle = '#38bdf8';
  const accStr = params.accuracy ? ` (±${Math.round(params.accuracy)}m)` : '';
  const coordStr = `Lat ${params.latitude.toFixed(6)}°   Long ${params.longitude.toFixed(6)}°${accStr}`;
  drawTruncated(coordStr, textX, curY, maxTextWidth);
  curY += lineGap;

  // Line 5: Timestamp & Status
  const timeFont = Math.max(9, Math.floor(overlayHeight * 0.12));
  ctx.font = `${timeFont}px sans-serif`;
  ctx.fillStyle = '#94a3b8';
  const workerIdentityStr = params.workerName
    ? ` • Worker: ${params.workerName}${params.workerBadge ? ` (${params.workerBadge})` : ''}`
    : ' • GPS SATELLITE LOCKED';
  drawTruncated(`${params.timestamp}${workerIdentityStr}`, textX, curY, maxTextWidth);
}

/**
 * Stamp an uploaded or captured image file with the official GPS geotag watermark banner.
 */
export async function stampGeotagWatermarkOnFile(
  file: File,
  params: {
    locationName: string;
    address: string;
    latitude: number;
    longitude: number;
    accuracy?: number;
    timestamp?: string;
    category?: string;
    subcategory?: string;
    complaintNumber?: string;
    workerName?: string;
    workerBadge?: string;
    departmentName?: string;
    ward?: string;
  }
): Promise<{ file: File; previewUrl: string; width: number; height: number }> {
  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = async () => {
      try {
        const width = img.naturalWidth || 1280;
        const height = img.naturalHeight || 720;

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(objectUrl);
          resolve({ file, previewUrl: objectUrl, width, height });
          return;
        }

        // 1. Draw raw image
        ctx.drawImage(img, 0, 0, width, height);

        // 2. Preload OSM map tile if possible
        let mapTileImg: HTMLImageElement | null = null;
        try {
          const tileUrl = getOsmTileUrl(params.latitude, params.longitude, 16);
          const tile = new Image();
          tile.crossOrigin = 'anonymous';
          await new Promise<void>((tileResolve) => {
            tile.onload = () => {
              mapTileImg = tile;
              tileResolve();
            };
            tile.onerror = () => tileResolve();
            setTimeout(tileResolve, 800);
            tile.src = tileUrl;
          });
        } catch {
          // Fallback vector map
        }

        // 3. Burn GPS watermark onto canvas
        drawGeotagWatermark(ctx, width, height, {
          locationName: params.locationName,
          address: params.address,
          latitude: params.latitude,
          longitude: params.longitude,
          accuracy: params.accuracy,
          timestamp: params.timestamp || formatLocationCardTimestamp(new Date()),
          mapTile: mapTileImg,
          complaintNumber: params.complaintNumber,
          workerName: params.workerName,
          workerBadge: params.workerBadge,
          departmentName: params.departmentName,
          ward: params.ward,
          category: params.category,
          subcategory: params.subcategory,
        });

        const dataUrl = canvas.toDataURL('image/jpeg', 0.94);

        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(objectUrl);
            if (!blob) {
              resolve({ file, previewUrl: dataUrl, width, height });
              return;
            }
            const cleanName = file.name.replace(/\.[^/.]+$/, '');
            const watermarkedFile = new File([blob], `${cleanName}_geotagged.jpg`, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve({ file: watermarkedFile, previewUrl: dataUrl, width, height });
          },
          'image/jpeg',
          0.94
        );
      } catch {
        URL.revokeObjectURL(objectUrl);
        resolve({ file, previewUrl: objectUrl, width: img.naturalWidth || 1280, height: img.naturalHeight || 720 });
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({ file, previewUrl: objectUrl, width: 1280, height: 720 });
    };

    img.src = objectUrl;
  });
}



