import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  Video,
  X,
  RefreshCw,
  Check,
  SwitchCamera,
  AlertTriangle,
  Square,
  ShieldAlert,
  MapPin,
  Clock,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import {
  EvidenceRecord,
  createLivePhotoRecord,
  createLiveVideoRecord,
  reverseGeocodeCoords,
  formatLocationCardTimestamp,
  formatAccuracy,
  getOsmTileUrl,
  GeocodeResult,
  MAX_VIDEO_DURATION_SECONDS,
  MAX_VIDEO_SIZE_BYTES,
  formatDuration,
  drawGeotagWatermark,
} from '../../utils/evidenceValidator';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (record: EvidenceRecord) => void;
  category?: string;
  subcategory?: string;
  initialMode?: 'photo' | 'video';
  complaintNumber?: string;
  workerName?: string;
  workerBadge?: string;
  departmentName?: string;
  ward?: string;
}

type ModalState = 'capturing' | 'confirmation' | 'error';
type GpsState = 'acquiring' | 'ready' | 'denied' | 'unavailable';

export default function CameraCaptureModal({
  isOpen,
  onClose,
  onCapture,
  category,
  subcategory,
  initialMode = 'photo',
  complaintNumber,
  workerName,
  workerBadge,
  departmentName,
  ward,
}: CameraCaptureModalProps) {
  const [activeMode, setActiveMode] = useState<'photo' | 'video'>(initialMode);
  const [modalState, setModalState] = useState<ModalState>('capturing');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRecordCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);
  const videoRenderAnimRef = useRef<number | null>(null);
  const isRecordingRef = useRef(false);

  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Photo Capture State
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [capturedPhotoRecord, setCapturedPhotoRecord] = useState<EvidenceRecord | null>(null);

  // Video Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedVideoRecord, setRecordedVideoRecord] = useState<EvidenceRecord | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // GPS States
  const [gpsState, setGpsState] = useState<GpsState>('acquiring');
  const [gpsCoords, setGpsCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | undefined>(undefined);
  const [geocodeInfo, setGeocodeInfo] = useState<GeocodeResult | null>(null);
  const [gpsErrorMsg, setGpsErrorMsg] = useState<string>('Getting your current location...');
  const [currentTimeStr, setCurrentTimeStr] = useState<string>(formatLocationCardTimestamp());
  const [tileError, setTileError] = useState(false);
  const mapTileImgRef = useRef<HTMLImageElement | null>(null);

  // Keep live time ticking for location card
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setCurrentTimeStr(formatLocationCardTimestamp(new Date()));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Acquire live GPS position
  const acquireLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsState('unavailable');
      setGpsErrorMsg('Current location is required to capture live evidence.');
      setGpsCoords(null);
      setGpsAccuracy(undefined);
      return;
    }

    setGpsState('acquiring');
    setGpsErrorMsg('Getting your current location...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = parseFloat(position.coords.latitude.toFixed(6));
        const lng = parseFloat(position.coords.longitude.toFixed(6));
        const acc = position.coords.accuracy ? Math.round(position.coords.accuracy * 10) / 10 : 8.4;

        if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          setGpsCoords({ latitude: lat, longitude: lng });
          setGpsAccuracy(acc);
          setGpsState('ready');
          setGpsErrorMsg('✓ Location acquired');
          setTileError(false);

          // Preload map tile for watermark
          const tileUrl = getOsmTileUrl(lat, lng, 16);
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = tileUrl;
          mapTileImgRef.current = img;

          // Reverse geocode in background
          const geo = await reverseGeocodeCoords(lat, lng);
          if (geo) {
            setGeocodeInfo(geo);
          }
        } else {
          setGpsState('unavailable');
          setGpsErrorMsg('Current location is required to capture live evidence.');
          setGpsCoords(null);
          setGpsAccuracy(undefined);
        }
      },
      (error) => {
        setGpsCoords(null);
        setGpsAccuracy(undefined);
        if (error.code === error.PERMISSION_DENIED) {
          setGpsState('denied');
          setGpsErrorMsg('Location permission is required to capture live evidence.');
        } else {
          setGpsState('unavailable');
          setGpsErrorMsg('Current location is required to capture live evidence.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  // Update mode when modal opened with initialMode
  useEffect(() => {
    if (isOpen) {
      setActiveMode(initialMode);
      setModalState('capturing');
    }
  }, [isOpen, initialMode]);

  // Start / Stop camera stream
  const startCameraStream = useCallback(async (mode: 'photo' | 'video') => {
    setCameraError(null);
    setCameraActive(false);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    try {
      const isVideo = mode === 'video';
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: isVideo,
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: isVideo,
        });
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = async () => {
          try {
            await videoRef.current?.play();
            setCameraActive(true);
          } catch {
            setCameraActive(true);
          }
        };
      } else {
        setCameraActive(true);
      }
    } catch (err: any) {
      setCameraActive(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError(
          mode === 'video'
            ? 'Camera and microphone access permissions are required to record live video.'
            : 'Camera access permission was denied. Please allow camera access in your browser.'
        );
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No camera device found on this system.');
      } else {
        setCameraError('Unable to start live camera stream.');
      }
    }
  }, [facingMode]);

  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  const stopRecordingSession = useCallback(() => {
    isRecordingRef.current = false;
    if (videoRenderAnimRef.current) {
      cancelAnimationFrame(videoRenderAnimRef.current);
      videoRenderAnimRef.current = null;
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // Handled
      }
    }
    setIsRecording(false);
  }, []);

  // Initialize camera and location on modal open
  useEffect(() => {
    if (isOpen) {
      setCapturedImage(null);
      setCapturedBlob(null);
      setCapturedPhotoRecord(null);
      setRecordedVideoUrl(null);
      setRecordedBlob(null);
      setRecordedVideoRecord(null);
      setCameraError(null);
      setErrorMessage(null);
      setIsRecording(false);
      setSecondsElapsed(0);
      setModalState('capturing');
      startCameraStream(activeMode);
      acquireLocation();
    } else {
      stopRecordingSession();
      stopCameraStream();
    }

    return () => {
      stopRecordingSession();
      stopCameraStream();
    };
  }, [isOpen, activeMode, facingMode, acquireLocation, startCameraStream, stopCameraStream, stopRecordingSession]);

  // Switch between Live Photo and Live Video mode
  const handleModeSwitch = (newMode: 'photo' | 'video') => {
    if (isRecording || modalState !== 'capturing' || newMode === activeMode) return;
    setCapturedImage(null);
    setCapturedBlob(null);
    setCapturedPhotoRecord(null);
    setRecordedVideoUrl(null);
    setRecordedBlob(null);
    setRecordedVideoRecord(null);
    setErrorMessage(null);
    setActiveMode(newMode);
  };

  const switchCamera = () => {
    if (isRecording || modalState !== 'capturing') return;
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  /**
   * Professional GPS Map Camera Watermark physically drawn on canvas
   */
  const drawWatermarkOverlay = (
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
      complaintNumber?: string;
      workerName?: string;
      workerBadge?: string;
      departmentName?: string;
      ward?: string;
    }
  ) => {
    drawGeotagWatermark(ctx, width, height, {
      ...params,
      mapTile: mapTileImgRef.current,
    });
  };

  // CAPTURE PHOTO DIRECTLY TO CONFIRMATION (NO LOADING SCREEN)
  const snapPhoto = () => {
    if (!videoRef.current || !canvasRef.current || gpsState !== 'ready' || !gpsCoords) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setErrorMessage('Unable to generate GPS watermark canvas context.');
      setModalState('error');
      return;
    }

    // 1. Draw raw camera frame
    ctx.drawImage(video, 0, 0, width, height);

    // 2. Real timestamp & place details
    const captureTimestampStr = formatLocationCardTimestamp(new Date());
    const placeName = geocodeInfo?.locationName || 'Current Device Location';
    const address = geocodeInfo?.address || '';

    // 3. Physically burn GPS Watermark Overlay on frame
    drawWatermarkOverlay(ctx, width, height, {
      locationName: placeName,
      address,
      latitude: gpsCoords.latitude,
      longitude: gpsCoords.longitude,
      accuracy: gpsAccuracy,
      timestamp: captureTimestampStr,
      complaintNumber,
      workerName,
      workerBadge,
      departmentName,
      ward,
    });

    const finalDataUrl = canvas.toDataURL('image/jpeg', 0.94);
    setCapturedImage(finalDataUrl);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setErrorMessage('Unable to generate GPS watermark image file.');
          setModalState('error');
          return;
        }

        setCapturedBlob(blob);
        const fileName = `geotagged_photo_${Date.now()}.jpg`;
        const file = new File([blob], fileName, { type: 'image/jpeg' });

        const record = createLivePhotoRecord({
          file,
          previewUrl: finalDataUrl,
          latitude: gpsCoords.latitude,
          longitude: gpsCoords.longitude,
          accuracy: gpsAccuracy,
          locationName: placeName,
          address,
          capturedAt: captureTimestampStr,
          category,
          subcategory,
          width,
          height,
          isConfirmed: false,
        });

        setCapturedPhotoRecord(record);
      },
      'image/jpeg',
      0.94
    );

    // DIRECTLY open confirmation modal without any loading screen
    stopCameraStream();
    setModalState('confirmation');
  };

  // START LIVE VIDEO RECORDING WITH PHYSICALLY BURNED WATERMARK
  const startRecording = () => {
    if (!streamRef.current || !videoRef.current || gpsState !== 'ready' || !gpsCoords || isRecording) {
      return;
    }

    setErrorMessage(null);
    recordedChunksRef.current = [];
    setSecondsElapsed(0);
    const videoEl = videoRef.current;

    const recordCanvas = videoRecordCanvasRef.current || document.createElement('canvas');
    videoRecordCanvasRef.current = recordCanvas;
    recordCanvas.width = 1280;
    recordCanvas.height = 720;
    const ctx = recordCanvas.getContext('2d');

    if (!ctx) {
      setErrorMessage('Could not initialize video watermarking pipeline.');
      return;
    }

    isRecordingRef.current = true;

    // Draw loop burning watermark on every recorded video frame
    const renderWatermarkedFrame = () => {
      if (!isRecordingRef.current) return;

      ctx.drawImage(videoEl, 0, 0, 1280, 720);
      drawWatermarkOverlay(ctx, 1280, 720, {
        locationName: geocodeInfo?.locationName || 'Current Device Location',
        address: geocodeInfo?.address || '',
        latitude: gpsCoords.latitude,
        longitude: gpsCoords.longitude,
        accuracy: gpsAccuracy,
        timestamp: currentTimeStr,
        complaintNumber,
        workerName,
        workerBadge,
        departmentName,
        ward,
      });

      videoRenderAnimRef.current = requestAnimationFrame(renderWatermarkedFrame);
    };

    renderWatermarkedFrame();

    try {
      const canvasStream = (recordCanvas as any).captureStream
        ? (recordCanvas as any).captureStream(30)
        : streamRef.current;

      const audioTracks = streamRef.current.getAudioTracks();
      if (audioTracks.length > 0) {
        canvasStream.addTrack(audioTracks[0]);
      }

      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
        ? 'video/webm;codecs=vp9,opus'
        : MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')
        ? 'video/webm;codecs=vp8,opus'
        : MediaRecorder.isTypeSupported('video/mp4')
        ? 'video/mp4'
        : 'video/webm';

      const recorder = new MediaRecorder(canvasStream, { mimeType });

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        if (videoRenderAnimRef.current) {
          cancelAnimationFrame(videoRenderAnimRef.current);
          videoRenderAnimRef.current = null;
        }

        const finalBlob = new Blob(recordedChunksRef.current, { type: mimeType });
        setRecordedBlob(finalBlob);

        if (finalBlob.size > MAX_VIDEO_SIZE_BYTES) {
          setErrorMessage('Video is too large. Maximum allowed size is 50 MB.');
          setModalState('error');
          return;
        }

        const videoUrl = URL.createObjectURL(finalBlob);
        setRecordedVideoUrl(videoUrl);

        const videoFile = new File(
          [finalBlob],
          `geotagged_video_${Date.now()}.${mimeType.includes('mp4') ? 'mp4' : 'webm'}`,
          { type: mimeType }
        );

        const finalDuration = Math.min(secondsElapsed || 1, MAX_VIDEO_DURATION_SECONDS);

        const record = createLiveVideoRecord({
          file: videoFile,
          previewUrl: videoUrl,
          duration: finalDuration,
          latitude: gpsCoords.latitude,
          longitude: gpsCoords.longitude,
          accuracy: gpsAccuracy,
          locationName: geocodeInfo?.locationName,
          address: geocodeInfo?.address,
          recordedAt: formatLocationCardTimestamp(new Date()),
          category,
          subcategory,
          width: 1280,
          height: 720,
          isConfirmed: false,
        });

        setRecordedVideoRecord(record);

        // DIRECTLY switch to confirmation without loading screen
        stopCameraStream();
        setModalState('confirmation');
      };

      recorder.start(1000);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);

      let currentSec = 0;
      timerIntervalRef.current = setInterval(() => {
        currentSec += 1;
        setSecondsElapsed(currentSec);

        if (currentSec >= MAX_VIDEO_DURATION_SECONDS) {
          stopRecordingSession();
        }
      }, 1000);
    } catch (err: any) {
      setErrorMessage('Could not start live video recording with GPS watermark.');
      setIsRecording(false);
      isRecordingRef.current = false;
    }
  };

  const stopRecording = () => {
    stopRecordingSession();
  };

  // Retake / Discard current unconfirmed evidence and return to live camera
  const retake = () => {
    setCapturedImage(null);
    setCapturedBlob(null);
    setCapturedPhotoRecord(null);
    setRecordedVideoUrl(null);
    setRecordedBlob(null);
    setRecordedVideoRecord(null);
    setErrorMessage(null);
    setSecondsElapsed(0);
    setModalState('capturing');
    startCameraStream(activeMode);
    acquireLocation();
  };

  // Confirm Geotagged Evidence
  const confirmEvidence = () => {
    if (activeMode === 'photo') {
      if (!capturedPhotoRecord || !capturedImage) {
        setErrorMessage('Unable to confirm evidence: Watermarked image is missing.');
        return;
      }
      const confirmedRecord: EvidenceRecord = {
        ...capturedPhotoRecord,
        isConfirmed: true,
        validationStatus: 'VALID',
      };
      onCapture(confirmedRecord);
      handleClose();
    } else {
      if (!recordedVideoRecord || !recordedVideoUrl) {
        setErrorMessage('Unable to confirm evidence: Watermarked video is missing.');
        return;
      }
      const confirmedRecord: EvidenceRecord = {
        ...recordedVideoRecord,
        isConfirmed: true,
        validationStatus: 'VALID',
      };
      onCapture(confirmedRecord);
      handleClose();
    }
  };

  const handleClose = () => {
    stopRecordingSession();
    stopCameraStream();
    setCapturedImage(null);
    setCapturedBlob(null);
    setCapturedPhotoRecord(null);
    setRecordedVideoUrl(null);
    setRecordedBlob(null);
    setRecordedVideoRecord(null);
    setCameraError(null);
    setErrorMessage(null);
    setModalState('capturing');
    onClose();
  };

  if (!isOpen) return null;

  const isCaptureDisabled =
    !cameraActive || gpsState !== 'ready' || !gpsCoords || isRecording;

  const displayPlaceName =
    geocodeInfo?.locationName ||
    (gpsCoords ? `Lat ${gpsCoords.latitude}, Lng ${gpsCoords.longitude}` : 'Current Location');

  const displayAddress =
    geocodeInfo?.address ||
    (gpsCoords ? `Coordinates: ${gpsCoords.latitude.toFixed(6)}, ${gpsCoords.longitude.toFixed(6)}` : '');

  const accuracyInfo = formatAccuracy(gpsAccuracy);

  const evidenceTimestamp =
    activeMode === 'photo'
      ? capturedPhotoRecord?.capturedAt || currentTimeStr
      : recordedVideoRecord?.recordedAt || currentTimeStr;

  return (
    <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[#0b1120] border border-slate-700/60 rounded-2xl overflow-hidden max-w-[500px] w-full shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="px-4 py-3 bg-[#080d19] border-b border-slate-800/80 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <div className="text-amber-400">
              {activeMode === 'video' ? <Video size={20} /> : <Camera size={20} />}
            </div>
            <div>
              <h3 className="font-bold text-sm text-white leading-tight">
                {complaintNumber
                  ? `High-Accuracy Geotagged Evidence • ${complaintNumber}`
                  : activeMode === 'video'
                  ? 'High-Accuracy Geotagged Video'
                  : 'High-Accuracy Geotagged Photo'}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {complaintNumber
                  ? `Government Field Inspection Overlay • ${workerName || 'Field Officer'}`
                  : 'GPS Map Camera • City, Address & Coordinates Overlay'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 text-slate-400 hover:text-white rounded-md transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Mode Switcher (Visible only during live capturing) */}
        {modalState === 'capturing' && (
          <div className="py-2.5 px-4 bg-[#080d19] border-b border-slate-800/70 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => handleModeSwitch('photo')}
              disabled={isRecording}
              className={`px-4 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                activeMode === 'photo'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-medium'
              } disabled:opacity-50`}
            >
              <Camera size={13} />
              <span>Live Photo</span>
            </button>

            <button
              type="button"
              onClick={() => handleModeSwitch('video')}
              disabled={isRecording}
              className={`px-4 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                activeMode === 'video'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-medium'
              } disabled:opacity-50`}
            >
              <Video size={13} />
              <span>Live Video (Max 60s)</span>
            </button>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STATE 1: LIVE CAMERA CAPTURE VIEW                             */}
        {/* ------------------------------------------------------------- */}
        {modalState === 'capturing' && (
          <>
            <div className="relative bg-black w-full aspect-[4/3] sm:h-[350px] flex items-center justify-center overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted={activeMode === 'photo'}
                className="w-full h-full object-cover block"
              />

              {!cameraActive && !cameraError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 text-xs gap-3 p-6 text-center bg-black/80">
                  <RefreshCw size={22} className="animate-spin text-amber-400" />
                  <span>Connecting to camera stream...</span>
                </div>
              )}

              {cameraError && (
                <div className="absolute inset-0 p-6 text-center space-y-3 max-w-sm w-full flex flex-col items-center justify-center bg-black/90">
                  <div className="w-11 h-11 rounded-full bg-red-950 text-red-400 flex items-center justify-center border border-red-500/30">
                    <ShieldAlert size={20} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-white">Camera Access Required</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{cameraError}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => startCameraStream(activeMode)}
                    className="px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    Retry Camera
                  </button>
                </div>
              )}

              {/* Flip Camera Button */}
              {cameraActive && !isRecording && (
                <button
                  type="button"
                  onClick={switchCamera}
                  className="absolute top-3 right-3 z-30 p-2 bg-slate-950/70 hover:bg-slate-900 text-white rounded-full border border-white/20 shadow-md backdrop-blur-xs transition-all cursor-pointer"
                  title="Switch Front / Rear Camera"
                >
                  <SwitchCamera size={16} />
                </button>
              )}

              {/* Video Recording Live Timer Indicator */}
              {isRecording && (
                <div className="absolute top-3 left-3 z-30 px-3 py-1 rounded-full bg-red-600/90 text-white text-xs font-bold flex items-center gap-2 shadow-lg backdrop-blur-xs animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  <span>REC {formatDuration(secondsElapsed)} / 01:00</span>
                </div>
              )}

              {/* Floating Live Location Card Overlay */}
              {cameraActive && (
                <div className="absolute bottom-3 inset-x-3 z-20 bg-[#0c1322]/92 backdrop-blur-md border border-slate-700/60 rounded-xl p-2.5 shadow-2xl flex items-center gap-3 text-white">
                  {/* Google Map Mini Preview Box */}
                  <div className="w-[66px] h-[66px] rounded-lg overflow-hidden shrink-0 border border-slate-600/70 relative bg-slate-800 flex items-center justify-center shadow-inner">
                    {gpsCoords && !tileError ? (
                      <>
                        <img
                          src={getOsmTileUrl(gpsCoords.latitude, gpsCoords.longitude, 16)}
                          alt="Map Tile"
                          onError={() => setTileError(true)}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-3.5 h-3.5 rounded-full bg-red-600 border-2 border-white shadow flex items-center justify-center">
                            <div className="w-1 h-1 rounded-full bg-white" />
                          </div>
                        </div>
                        <span className="absolute bottom-0.5 left-1 text-[8px] font-bold text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)] select-none pointer-events-none">
                          Google
                        </span>
                      </>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900 flex flex-col items-center justify-center text-slate-300 relative">
                        <div className="w-3 h-3 rounded-full bg-red-500 border border-white" />
                        <span className="text-[8px] font-bold mt-1 text-slate-400">Map</span>
                      </div>
                    )}
                  </div>

                  {/* Location Details Text */}
                  <div className="flex-1 min-w-0 space-y-0.5">
                    {gpsState === 'ready' && gpsCoords ? (
                      <>
                        {complaintNumber && (
                          <div className="flex items-center gap-1.5 text-[9.5px] font-bold text-amber-400 font-mono tracking-tight pb-0.5">
                            <span className="bg-amber-500/20 px-1 py-0.2 rounded border border-amber-500/30">
                              🏛️ {complaintNumber}
                            </span>
                            {ward && <span className="text-slate-400">• {ward}</span>}
                            {workerName && (
                              <span className="text-slate-300 ml-auto font-sans truncate text-[9px]">
                                Insp: {workerName}
                              </span>
                            )}
                          </div>
                        )}
                        <div className="font-bold text-xs text-white truncate flex items-center gap-1.5">
                          <span className="truncate">{displayPlaceName}</span>
                          <span className="shrink-0 text-[11px]">🇮🇳</span>
                        </div>
                        <div className="text-[10.5px] text-slate-300 truncate font-normal leading-tight" title={displayAddress}>
                          {displayAddress}
                        </div>
                        <div className="text-[10px] text-slate-300 font-mono tracking-tight">
                          Lat {gpsCoords.latitude.toFixed(6)}° Long {gpsCoords.longitude.toFixed(6)}° • {accuracyInfo.text}
                        </div>
                        <div className="text-[10px] text-slate-300 font-normal">
                          {currentTimeStr}
                        </div>
                      </>
                    ) : gpsState === 'acquiring' ? (
                      <div className="space-y-1 py-1">
                        <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold">
                          <RefreshCw size={13} className="animate-spin text-amber-400" />
                          <span>Acquiring high-accuracy GPS...</span>
                        </div>
                        <p className="text-[10px] text-slate-400">Locking satellite signals for live geotagging</p>
                      </div>
                    ) : (
                      <div className="space-y-1 py-0.5">
                        <div className="flex items-center gap-1.5 text-red-400 text-xs font-bold">
                          <AlertTriangle size={13} className="shrink-0" />
                          <span>{gpsState === 'denied' ? 'GPS Permission Denied' : 'GPS Unavailable'}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-tight">
                          Device GPS is required to capture geotagged evidence.
                        </p>
                        <button
                          type="button"
                          onClick={acquireLocation}
                          className="text-[10.5px] text-blue-400 hover:text-blue-300 underline font-semibold cursor-pointer"
                        >
                          Retry Location
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Shutter / Capture Button */}
            <div className="p-4 bg-[#080d19] border-t border-slate-800/80 flex flex-col items-center justify-center gap-2">
              {activeMode === 'photo' ? (
                <div className="flex flex-col items-center gap-2">
                  <button
                    type="button"
                    onClick={snapPhoto}
                    disabled={isCaptureDisabled}
                    className={`w-16 h-16 rounded-full border-[3px] border-white/80 bg-slate-900/60 flex items-center justify-center shadow-lg transition-all ${
                      isCaptureDisabled
                        ? 'opacity-40 cursor-not-allowed filter grayscale'
                        : 'hover:scale-105 active:scale-95 cursor-pointer'
                    }`}
                    title={
                      isCaptureDisabled
                        ? 'Valid GPS location required before capture'
                        : 'Capture Live Photo'
                    }
                  >
                    <div className="w-12 h-12 rounded-full bg-amber-500 hover:bg-amber-400 flex items-center justify-center text-slate-950 transition-colors shadow-sm">
                      <Camera size={22} className="text-slate-950" />
                    </div>
                  </button>
                  <span className="text-xs text-slate-400 font-medium text-center">
                    {gpsState !== 'ready'
                      ? 'Waiting for accurate GPS location...'
                      : 'Tap to capture live photo with GPS watermark'}
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  {isRecording ? (
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="w-16 h-16 rounded-full border-[3px] border-red-400/80 bg-slate-900/60 flex items-center justify-center shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer"
                      title="Stop Live Video Recording"
                    >
                      <div className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center text-white transition-colors shadow-md">
                        <Square size={18} fill="currentColor" className="text-white" />
                      </div>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={startRecording}
                      disabled={isCaptureDisabled}
                      className={`w-16 h-16 rounded-full border-[3px] border-white/80 bg-slate-900/60 flex items-center justify-center shadow-lg transition-all ${
                        isCaptureDisabled
                          ? 'opacity-40 cursor-not-allowed filter grayscale'
                          : 'hover:scale-105 active:scale-95 cursor-pointer'
                      }`}
                      title={
                        isCaptureDisabled
                          ? 'Valid GPS location required before recording'
                          : 'Record Live Video (Max 60s)'
                      }
                    >
                      <div className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center text-white transition-colors shadow-md">
                        <Video size={20} className="text-white" />
                      </div>
                    </button>
                  )}
                  <span className="text-xs text-slate-400 font-medium text-center">
                    {isRecording
                      ? `Recording live video... Tap to stop (Max 60s)`
                      : gpsState !== 'ready'
                      ? 'Waiting for accurate GPS location...'
                      : 'Tap to record live video (Max 60s)'}
                  </span>
                </div>
              )}
            </div>
          </>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STATE 2: POST-CAPTURE CONFIRMATION MODAL (PERFECT SLEEK THEME)*/}
        {/* ------------------------------------------------------------- */}
        {modalState === 'confirmation' && (
          <div className="flex flex-col">
            {/* Display the ACTUAL FINAL PROCESSED MEDIA with burned-in watermark */}
            <div className="relative bg-black w-full aspect-[4/3] sm:h-[360px] flex items-center justify-center overflow-hidden border-b border-slate-800">
              {activeMode === 'photo' && capturedImage && (
                <img
                  src={capturedImage}
                  alt="Final Geotagged Evidence"
                  className="w-full h-full object-contain bg-black"
                />
              )}

              {activeMode === 'video' && recordedVideoUrl && (
                <video
                  src={recordedVideoUrl}
                  controls
                  playsInline
                  autoPlay
                  className="w-full h-full object-contain bg-black"
                />
              )}
            </div>

            {/* REALISTIC, COMPACT VERIFICATION & ACTIONS FOOTER */}
            <div className="p-3.5 bg-[#080d19] border-t border-slate-800 space-y-2.5">
              {/* Small Compact GPS Verification Box */}
              <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                  <span className="font-semibold text-slate-200 text-xs tracking-tight">GPS Geotag Verified</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-mono">
                  <span className="text-slate-400">Accuracy:</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10.5px] font-semibold ${
                      accuracyInfo.level === 'high'
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                        : accuracyInfo.level === 'good'
                        ? 'bg-slate-800 text-slate-200 border border-slate-700'
                        : 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                    }`}
                  >
                    {accuracyInfo.text}
                  </span>
                </div>
              </div>

              {/* Video-specific concise metadata if recording live video */}
              {activeMode === 'video' && (
                <div className="flex items-center justify-between px-2.5 py-1 text-[11px] text-slate-400 font-mono">
                  <span className="truncate max-w-[240px] text-slate-300">📍 {displayPlaceName}</span>
                  {recordedVideoRecord?.duration !== undefined && (
                    <span className="text-amber-400 shrink-0 font-bold">
                      Duration: {formatDuration(recordedVideoRecord.duration)}
                    </span>
                  )}
                </div>
              )}

              {/* ACTION BUTTONS: [ Retake Photo ] OR [ Confirm Geotagged Photo ] */}
              <div className="flex items-center justify-between gap-3 pt-0.5">
                <button
                  type="button"
                  onClick={retake}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700 shadow-sm"
                >
                  <RotateCcw size={13} />
                  <span>{activeMode === 'video' ? 'Record Again' : 'Retake Photo'}</span>
                </button>

                <button
                  type="button"
                  onClick={confirmEvidence}
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
                >
                  <Check size={15} />
                  <span>
                    {activeMode === 'video'
                      ? 'Confirm Geotagged Video'
                      : 'Confirm Geotagged Photo'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STATE 3: ERROR STATE                                          */}
        {/* ------------------------------------------------------------- */}
        {modalState === 'error' && (
          <div className="p-8 flex flex-col items-center justify-center space-y-4 text-center min-h-[320px] bg-[#090e1b]">
            <div className="w-12 h-12 rounded-full bg-red-950 text-red-400 flex items-center justify-center border border-red-500/30">
              <AlertTriangle size={24} />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-white">Unable to Create Geotagged Evidence</h4>
              <p className="text-xs text-red-400 max-w-xs">{errorMessage || 'Camera or GPS processing failed.'}</p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={retake}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Retake
              </button>
              <button
                type="button"
                onClick={() => {
                  setErrorMessage(null);
                  if (activeMode === 'photo') {
                    snapPhoto();
                  } else {
                    retake();
                  }
                }}
                className="px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Hidden Canvas for Watermark Processing */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
