import React, { useState, useRef } from 'react';
import {
  Camera,
  Video,
  Upload,
  AlertTriangle,
  Film,
  CheckCircle2,
  MapPin,
  Clock,
  RotateCcw,
  ShieldCheck,
  ImageIcon,
} from 'lucide-react';
import CameraCaptureModal from './CameraCaptureModal';
import {
  EvidenceRecord,
  formatBytes,
  formatDuration,
  getOsmTileUrl,
  MAX_EVIDENCE_FILES,
  MAX_IMAGE_SIZE_BYTES,
  createUploadedPhotoRecord,
  reverseGeocodeCoords,
  stampGeotagWatermarkOnFile,
  formatLocationCardTimestamp,
} from '../../utils/evidenceValidator';

interface EvidenceUploaderProps {
  files: File[];
  previews: string[];
  evidenceRecords?: EvidenceRecord[];
  onChange: (files: File[], previews: string[], records?: EvidenceRecord[]) => void;
  maxFiles?: number;
  category?: string;
  subcategory?: string;
  description?: string;
  defaultLatitude?: number | null;
  defaultLongitude?: number | null;
  defaultAddress?: string;
}

export default function EvidenceUploader({
  files,
  previews,
  evidenceRecords = [],
  onChange,
  maxFiles = MAX_EVIDENCE_FILES,
  category,
  subcategory,
  defaultLatitude,
  defaultLongitude,
  defaultAddress,
}: EvidenceUploaderProps) {
  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  const [cameraMode, setCameraMode] = useState<'photo' | 'video'>('photo');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Open modal in Photo mode
  const handleOpenPhoto = () => {
    setErrorMessage(null);
    if (files.length >= maxFiles) {
      setErrorMessage(`Maximum limit of ${maxFiles} evidence files reached.`);
      return;
    }
    setCameraMode('photo');
    setCameraModalOpen(true);
  };

  // Open modal in Video mode
  const handleOpenVideo = () => {
    setErrorMessage(null);
    if (files.length >= maxFiles) {
      setErrorMessage(`Maximum limit of ${maxFiles} evidence files reached.`);
      return;
    }
    setCameraMode('video');
    setCameraModalOpen(true);
  };

  // Trigger hidden file input for Upload Image
  const handleTriggerUpload = () => {
    setErrorMessage(null);
    if (files.length >= maxFiles) {
      setErrorMessage(`Maximum limit of ${maxFiles} evidence files reached.`);
      return;
    }
    fileInputRef.current?.click();
  };

  // Handle uploaded images from device/gallery
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;
    setErrorMessage(null);

    const availableSlots = maxFiles - files.length;
    if (availableSlots <= 0) {
      setErrorMessage(`Maximum limit of ${maxFiles} evidence files reached.`);
      return;
    }

    const filesToProcess = Array.from(selectedFiles).slice(0, availableSlots);
    setIsProcessingUpload(true);

    try {
      // 1. Resolve GPS coordinates: prioritize device GPS, then default props, then fallback
      let resolvedLat = defaultLatitude || 23.0225;
      let resolvedLng = defaultLongitude || 72.5714;
      let resolvedAccuracy = 15;
      let resolvedAddress = defaultAddress || 'Municipal Jurisdiction Area';

      if (navigator.geolocation) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 6000,
              maximumAge: 10000,
            });
          });
          resolvedLat = pos.coords.latitude;
          resolvedLng = pos.coords.longitude;
          resolvedAccuracy = pos.coords.accuracy || 15;
        } catch {
          // Fallback to provided coordinates or default
        }
      }

      // Reverse geocode if coordinates available
      try {
        const geo = await reverseGeocodeCoords(resolvedLat, resolvedLng);
        if (geo?.address) {
          resolvedAddress = geo.address;
        }
      } catch {
        // Keep address
      }

      const newFilesList = [...files];
      const newPreviewsList = [...previews];
      const newRecordsList = [...evidenceRecords];

      for (const file of filesToProcess) {
        if (!file.type.startsWith('image/')) {
          setErrorMessage('Only image files (JPEG, PNG, WebP) are supported.');
          continue;
        }
        if (file.size > MAX_IMAGE_SIZE_BYTES) {
          setErrorMessage(`Image ${file.name} exceeds 10MB limit.`);
          continue;
        }

        const timestamp = formatLocationCardTimestamp(new Date());
        const watermarked = await stampGeotagWatermarkOnFile(file, {
          locationName: resolvedAddress || 'Current Device Location',
          address: resolvedAddress || '',
          latitude: resolvedLat,
          longitude: resolvedLng,
          accuracy: resolvedAccuracy,
          timestamp,
          category,
          subcategory,
        });

        const record = createUploadedPhotoRecord({
          file: watermarked.file,
          previewUrl: watermarked.previewUrl,
          latitude: resolvedLat,
          longitude: resolvedLng,
          accuracy: resolvedAccuracy,
          address: resolvedAddress,
          locationName: resolvedAddress,
          capturedAt: timestamp,
          category,
          subcategory,
          width: watermarked.width,
          height: watermarked.height,
        });

        newFilesList.push(watermarked.file);
        newPreviewsList.push(watermarked.previewUrl);
        newRecordsList.push(record);
      }

      onChange(newFilesList, newPreviewsList, newRecordsList);
    } catch (err: any) {
      setErrorMessage('Failed to process uploaded images.');
    } finally {
      setIsProcessingUpload(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle captured evidence (photo or video from modal)
  const handleEvidenceCaptured = (record: EvidenceRecord) => {
    setErrorMessage(null);
    if (files.length >= maxFiles) {
      setErrorMessage(`Maximum limit of ${maxFiles} evidence files reached.`);
      return;
    }

    const updatedFiles = [...files, record.file];
    const updatedPreviews = [...previews, record.previewUrl];
    const updatedRecords = [...evidenceRecords, record];

    onChange(updatedFiles, updatedPreviews, updatedRecords);
  };

  // Remove / Retake evidence item
  const removeFile = (index: number) => {
    setErrorMessage(null);
    const updatedFiles = files.filter((_, i) => i !== index);
    const updatedPreviews = previews.filter((_, i) => i !== index);
    const updatedRecords = evidenceRecords.filter((_, i) => i !== index);
    onChange(updatedFiles, updatedPreviews, updatedRecords);
  };

  return (
    <div className="space-y-4">
      {/* Hidden File Input for Device/Gallery Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Mandatory Live Geo-Tagged Evidence Information Box */}
      <div className="p-4 bg-amber-50/70 border border-amber-300 rounded-xl flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-bold text-slate-900">
              Geo-Tagged Civic Evidence
            </span>
            <span className="bg-emerald-700 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded tracking-wider uppercase">
              GPS VERIFIED
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Upload clear photographic evidence from your device or capture live photo/video on-site. Real-time geo-location coordinates and timestamp will be automatically tagged.
          </p>
        </div>
      </div>

      {/* Three Evidence Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* 1. Live Photo Action Card */}
        <button
          type="button"
          onClick={handleOpenPhoto}
          disabled={files.length >= maxFiles || isProcessingUpload}
          className="p-5 rounded-xl border-2 border-dashed border-blue-400 bg-blue-50/15 hover:bg-blue-50/40 transition-all flex flex-col items-center justify-center text-center cursor-pointer min-h-[145px] disabled:opacity-50 group shadow-xs"
        >
          <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 mb-2 transition-transform group-hover:scale-105">
            <Camera size={22} />
          </div>
          <span className="text-sm sm:text-base font-bold text-slate-800">Live Photo</span>
          <span className="text-xs text-slate-500 mt-0.5">
            Capture real-time photo with GPS watermark
          </span>
        </button>

        {/* 2. Upload Image Action Card */}
        <button
          type="button"
          onClick={handleTriggerUpload}
          disabled={files.length >= maxFiles || isProcessingUpload}
          className="p-5 rounded-xl border-2 border-dashed border-emerald-400 bg-emerald-50/15 hover:bg-emerald-50/40 transition-all flex flex-col items-center justify-center text-center cursor-pointer min-h-[145px] disabled:opacity-50 group shadow-xs"
        >
          <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 mb-2 transition-transform group-hover:scale-105">
            <Upload size={22} />
          </div>
          <span className="text-sm sm:text-base font-bold text-slate-800">Upload Image</span>
          <span className="text-xs text-slate-500 mt-0.5">
            {isProcessingUpload ? 'Processing upload...' : 'Select photo from gallery or device'}
          </span>
        </button>

        {/* 3. Live Video Action Card */}
        <button
          type="button"
          onClick={handleOpenVideo}
          disabled={files.length >= maxFiles || isProcessingUpload}
          className="p-5 rounded-xl border-2 border-dashed border-amber-400 bg-amber-50/15 hover:bg-amber-50/40 transition-all flex flex-col items-center justify-center text-center cursor-pointer min-h-[145px] disabled:opacity-50 group shadow-xs"
        >
          <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 mb-2 transition-transform group-hover:scale-105">
            <Video size={22} />
          </div>
          <span className="text-sm sm:text-base font-bold text-slate-800">Live Video</span>
          <span className="text-xs text-slate-500 mt-0.5">
            Record live video (Max 60s) with audio & GPS
          </span>
        </button>
      </div>

      {/* Validation / Limit Error Banner if any */}
      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-xs flex items-center gap-2">
          <AlertTriangle size={15} className="shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Evidence Previews List (when items have been captured or uploaded) */}
      {previews.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {previews.map((previewUrl, index) => {
            const file = files[index];
            const record = evidenceRecords[index];
            const isVideo =
              record?.type === 'live_video' ||
              file?.type?.toLowerCase()?.startsWith('video/') ||
              false;
            const isUpload = record?.type === 'uploaded_photo';

            return (
              <div
                key={record?.id || index}
                className="relative rounded-xl overflow-hidden border border-slate-300 bg-slate-900 shadow-md flex flex-col justify-between"
              >
                {/* Header Badge */}
                <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5 flex-wrap">
                  {isVideo ? (
                    <span className="bg-amber-500 text-slate-950 font-extrabold text-[10px] px-2 py-0.5 rounded shadow-xs flex items-center gap-1">
                      <Film size={11} /> LIVE VIDEO
                    </span>
                  ) : isUpload ? (
                    <span className="bg-emerald-600 text-white font-bold text-[10px] px-2 py-0.5 rounded shadow-xs flex items-center gap-1">
                      <Upload size={11} /> UPLOADED PHOTO
                    </span>
                  ) : (
                    <span className="bg-blue-600 text-white font-bold text-[10px] px-2 py-0.5 rounded shadow-xs flex items-center gap-1">
                      <Camera size={11} /> LIVE PHOTO
                    </span>
                  )}
                  <span className="bg-emerald-600 text-white font-bold text-[10px] px-2 py-0.5 rounded shadow-xs flex items-center gap-1">
                    <CheckCircle2 size={11} />
                    {isVideo
                      ? '✓ Geotagged Live Video Confirmed'
                      : isUpload
                      ? '✓ Geo-Tagged Photo Confirmed'
                      : '✓ Geotagged Live Photo Confirmed'}
                  </span>
                </div>

                {/* Retake / Remove Action Button */}
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute top-2.5 right-2.5 z-10 p-1.5 bg-slate-900/80 hover:bg-red-600 text-white rounded-full shadow-md transition-colors cursor-pointer border border-white/20 flex items-center gap-1 text-[11px] px-2.5"
                  aria-label={isVideo ? 'Record Again' : isUpload ? 'Remove' : 'Retake'}
                  title={isVideo ? 'Record Again' : isUpload ? 'Remove' : 'Retake'}
                >
                  <RotateCcw size={12} />
                  <span>{isVideo ? 'Record Again' : isUpload ? 'Remove' : 'Retake'}</span>
                </button>

                {/* Media Player / Image */}
                {isVideo ? (
                  <div className="w-full bg-black flex items-center justify-center aspect-[4/3] max-h-[380px]">
                    <video
                      src={previewUrl}
                      controls
                      playsInline
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-full bg-black flex items-center justify-center overflow-hidden aspect-[4/3] max-h-[380px]">
                    <img
                      src={previewUrl}
                      alt={file?.name || `Evidence ${index + 1}`}
                      className="w-full h-full object-contain block"
                    />
                  </div>
                )}

                {/* File Information & GPS Summary with Dedicated Pin Map */}
                <div className="p-3 bg-slate-950/95 text-white text-xs space-y-2 border-t border-slate-800">
                  <div className="flex items-center justify-between gap-1">
                    <span className="truncate max-w-[200px] font-semibold text-slate-200" title={file?.name || record?.fileName}>
                      {file?.name || record?.fileName}
                    </span>
                    <span className="font-mono text-slate-400 text-[11px] shrink-0">
                      {formatBytes(file?.size || record?.fileSize || 0)}
                    </span>
                  </div>

                  {isVideo && record?.duration !== undefined && (
                    <div className="text-[11px] text-amber-300 font-mono flex items-center gap-1">
                      <span>Duration: {formatDuration(record.duration)}</span>
                      <span className="text-slate-500">• Max 60s</span>
                    </div>
                  )}

                  {/* Pin Map Preview + Location Details */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-start gap-3">
                    {/* Dedicated Mini Pin Map */}
                    {record?.latitude !== undefined && record?.longitude !== undefined && (
                      <div className="w-[72px] h-[72px] rounded-lg overflow-hidden shrink-0 border border-slate-700/80 relative bg-slate-800 shadow-sm flex items-center justify-center">
                        <img
                          src={getOsmTileUrl(record.latitude, record.longitude, 16)}
                          alt="Pin Map"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        {/* Map Pin Marker */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="relative flex flex-col items-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                            <div className="w-4 h-4 rounded-full bg-red-600 border-2 border-white flex items-center justify-center shadow">
                              <div className="w-1.5 h-1.5 rounded-full bg-white" />
                            </div>
                            <div className="w-1.5 h-1.5 bg-red-600 rotate-45 -mt-1" />
                          </div>
                        </div>
                        <span className="absolute bottom-0.5 left-1 text-[7.5px] font-bold text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)] select-none pointer-events-none">
                          Map
                        </span>
                      </div>
                    )}

                    {/* Address & Coordinates Details */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-start gap-1">
                        <MapPin size={13} className="shrink-0 mt-0.5 text-blue-400" />
                        <div className="min-w-0 flex-1">
                          <span className="font-semibold text-slate-100 block text-xs leading-snug break-words">
                            Location: {record?.locationName || record?.address || 'GPS Coordinates Attached'}
                          </span>
                          {record?.address && record?.locationName && record.address !== record.locationName && (
                            <span className="text-[10px] text-slate-400 block font-normal leading-snug break-words mt-0.5">
                              Address: {record.address}
                            </span>
                          )}
                        </div>
                      </div>

                      {record?.latitude !== undefined && record?.longitude !== undefined && (
                        <div className="text-[10px] text-slate-300 font-mono flex items-center justify-between">
                          <span>Lat {record.latitude.toFixed(6)}°, Long {record.longitude.toFixed(6)}°</span>
                          {record.accuracy && (
                            <span className="text-emerald-400 font-sans font-semibold text-[10px] shrink-0 ml-1">
                              ±{Math.round(record.accuracy * 10) / 10}m
                            </span>
                          )}
                        </div>
                      )}

                      <div className="text-[10.5px] text-slate-400 flex items-center gap-1.5 pt-0.5">
                        <Clock size={11} className="shrink-0 text-amber-400" />
                        <span className="truncate">
                          {isVideo ? 'Recorded:' : isUpload ? 'Uploaded:' : 'Captured:'}{' '}
                          {record?.capturedAt || record?.recordedAt || new Date().toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Evidence Required Warning Message Box */}
      {files.length === 0 && (
        <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center justify-center gap-2">
          <AlertTriangle size={15} className="text-amber-600 shrink-0" />
          <span>Upload an image or capture live photo/video evidence before proceeding to location.</span>
        </div>
      )}

      {/* Centered Evidence Count */}
      <p className="text-xs text-slate-500 text-center font-normal pt-1">
        Evidence items: {files.length} / {maxFiles} maximum
      </p>

      {/* Unified Live Camera / Video Modal */}
      <CameraCaptureModal
        isOpen={cameraModalOpen}
        onClose={() => setCameraModalOpen(false)}
        onCapture={handleEvidenceCaptured}
        category={category}
        subcategory={subcategory}
        initialMode={cameraMode}
      />
    </div>
  );
}
