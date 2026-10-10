import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Camera,
  X,
  RotateCcw,
  Check,
  SwitchCamera,
  AlertTriangle,
  Upload,
  Grid,
  Zap,
  ZapOff,
  FileText,
  Scan,
  Maximize2,
  Sparkles
} from 'lucide-react';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapturePhoto: (file: File) => void;
}

type CaptureMode = 'document' | 'symptom' | 'general';

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapturePhoto
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImageUrl, setCapturedImageUrl] = useState<string | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [captureMode, setCaptureMode] = useState<CaptureMode>('document');
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [torchOn, setTorchOn] = useState<boolean>(false);
  const [torchSupported, setTorchSupported] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasMultipleCameras, setHasMultipleCameras] = useState<boolean>(false);
  const [resolutionInfo, setResolutionInfo] = useState<string>('HD');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement>(null);

  // Stop active media stream tracks
  const stopStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {}
      });
      setStream(null);
    }
    setTorchOn(false);
  }, [stream]);

  // Check available cameras
  useEffect(() => {
    if (!isOpen) return;
    if (navigator.mediaDevices?.enumerateDevices) {
      navigator.mediaDevices
        .enumerateDevices()
        .then((devices) => {
          const videoDevices = devices.filter((d) => d.kind === 'videoinput');
          setHasMultipleCameras(videoDevices.length > 1);
        })
        .catch(() => {});
    }
  }, [isOpen]);

  // Start video stream
  const startCamera = useCallback(async (mode: 'environment' | 'user') => {
    setError(null);
    setIsLoading(true);

    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Camera access is not supported by this browser. You can use direct photo upload below.');
      setIsLoading(false);
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1920, min: 640 },
          height: { ideal: 1080, min: 480 }
        },
        audio: false
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);

      // Check torch support
      const videoTrack = newStream.getVideoTracks()[0];
      if (videoTrack) {
        const capabilities = (videoTrack.getCapabilities ? videoTrack.getCapabilities() : {}) as any;
        setTorchSupported(Boolean(capabilities?.torch));

        const settings = videoTrack.getSettings ? videoTrack.getSettings() : ({} as any);
        if (settings.width && settings.height) {
          setResolutionInfo(`${settings.width}×${settings.height}`);
        } else {
          setResolutionInfo('1080p FHD');
        }
      }

      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.warn('Camera stream initial attempt failed:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Camera permission was denied. Please allow camera permissions in your browser or select a saved image.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError('No active camera device was detected. You can upload a medical photo directly.');
      } else {
        // Fallback with basic constraint
        try {
          const basicStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          setStream(basicStream);
          if (videoRef.current) {
            videoRef.current.srcObject = basicStream;
            videoRef.current.play().catch(() => {});
          }
          setIsLoading(false);
          return;
        } catch {
          setError('Unable to activate camera sensor. Please upload your photo from device files.');
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [stream]);

  // Toggle torch / flash if supported
  const handleToggleTorch = async () => {
    if (!stream) return;
    const track = stream.getVideoTracks()[0];
    if (!track) return;
    try {
      const nextState = !torchOn;
      await (track as any).applyConstraints({
        advanced: [{ torch: nextState }]
      });
      setTorchOn(nextState);
    } catch (err) {
      console.warn('Torch constraint failed:', err);
    }
  };

  // Start camera when modal opens
  useEffect(() => {
    if (isOpen) {
      setCapturedImageUrl(null);
      setCapturedBlob(null);
      startCamera(facingMode);
    } else {
      stopStream();
    }
    return () => {
      stopStream();
    };
  }, [isOpen, facingMode]);

  // Shutter action - snap snapshot to canvas
  const handleCaptureSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // If using user/front camera, mirror canvas to match user preview
    if (facingMode === 'user') {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, width, height);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        setCapturedBlob(blob);
        const previewUrl = URL.createObjectURL(blob);
        setCapturedImageUrl(previewUrl);
        stopStream();
      },
      'image/jpeg',
      0.94
    );
  };

  // Retake photo
  const handleRetake = () => {
    if (capturedImageUrl) {
      URL.revokeObjectURL(capturedImageUrl);
    }
    setCapturedImageUrl(null);
    setCapturedBlob(null);
    startCamera(facingMode);
  };

  // Confirm photo and attach to chat
  const handleConfirmPhoto = () => {
    if (!capturedBlob) return;
    const modePrefix = captureMode === 'document' ? 'rx_document' : captureMode === 'symptom' ? 'symptom_scan' : 'clinical_photo';
    const filename = `${modePrefix}_${Date.now()}.jpg`;
    const photoFile = new File([capturedBlob], filename, {
      type: 'image/jpeg',
      lastModified: Date.now()
    });

    onCapturePhoto(photoFile);
    stopStream();
    onClose();
  };

  // Flip camera between environment and user
  const handleToggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
  };

  // Handle native mobile file / gallery fallback
  const handleNativeFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      onCapturePhoto(files[0]);
      stopStream();
      onClose();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
      style={{ top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh', margin: 0 }}
    >
      <div className="relative w-full max-w-xl sm:max-w-2xl bg-slate-950 border border-slate-800/90 rounded-2xl sm:rounded-3xl shadow-2xl shadow-black/90 overflow-hidden flex flex-col max-h-[88vh] mx-auto my-auto">
        {/* Sleek Medical Header */}
        <div className="shrink-0 flex items-center justify-between px-4 sm:px-5 py-3 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md text-white z-20">
          <div className="flex items-center gap-3">
            <div className="relative p-2 rounded-xl bg-gradient-to-br from-blue-600/20 to-cyan-500/20 border border-blue-500/30 text-blue-400">
              <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
              {!capturedImageUrl && !error && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-semibold text-white tracking-tight">
                  Clinical Optical Capture
                </h3>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-slate-800 text-slate-300 border border-slate-700">
                  {resolutionInfo}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Prescriptions, Diagnostic Reports, or Symptom Scan
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {!capturedImageUrl && (
              <>
                {/* Grid Guide Toggle */}
                <button
                  type="button"
                  onClick={() => setShowGrid(!showGrid)}
                  className={`p-1.5 sm:p-2 rounded-xl transition-colors ${
                    showGrid
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                  }`}
                  title="Toggle Framing Grid"
                  aria-label="Toggle Framing Grid"
                >
                  <Grid className="w-4 h-4" />
                </button>

                {/* Torch Toggle (if supported) */}
                {torchSupported && (
                  <button
                    type="button"
                    onClick={handleToggleTorch}
                    className={`p-1.5 sm:p-2 rounded-xl transition-colors ${
                      torchOn
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                    }`}
                    title={torchOn ? 'Turn Off Flashlight' : 'Turn On Flashlight'}
                    aria-label="Toggle Flashlight"
                  >
                    {torchOn ? <Zap className="w-4 h-4" /> : <ZapOff className="w-4 h-4" />}
                  </button>
                )}

                {/* Switch Camera Button */}
                {hasMultipleCameras && (
                  <button
                    type="button"
                    onClick={handleToggleFacingMode}
                    className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
                    title={`Switch to ${facingMode === 'environment' ? 'Front' : 'Rear'} Camera`}
                    aria-label="Switch Camera"
                  >
                    <SwitchCamera className="w-4 h-4" />
                  </button>
                )}
              </>
            )}

            {/* Close Button */}
            <button
              type="button"
              onClick={() => {
                stopStream();
                onClose();
              }}
              className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors ml-1"
              title="Close Scanner"
              aria-label="Close Scanner"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mode Selector Pill Strip (Live Viewfinder Only) */}
        {!capturedImageUrl && !error && (
          <div className="shrink-0 px-4 py-2 bg-slate-950/90 border-b border-slate-900 flex items-center justify-center gap-1.5 sm:gap-2 z-10">
            <button
              type="button"
              onClick={() => setCaptureMode('document')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                captureMode === 'document'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-1 ring-blue-400/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Document / Rx</span>
            </button>
            <button
              type="button"
              onClick={() => setCaptureMode('symptom')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                captureMode === 'symptom'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-1 ring-blue-400/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Scan className="w-3.5 h-3.5" />
              <span>Symptom / Skin</span>
            </button>
            <button
              type="button"
              onClick={() => setCaptureMode('general')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                captureMode === 'general'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-1 ring-blue-400/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Full View</span>
            </button>
          </div>
        )}

        {/* Viewfinder Area */}
        <div className="relative flex-1 min-h-0 bg-black flex items-center justify-center overflow-hidden">
          {/* Canvas for Capture Serialization */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Native file upload input for device fallback */}
          <input
            ref={nativeCameraInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleNativeFileSelect}
          />

          {/* Error Banner */}
          {error && (
            <div className="p-6 text-center max-w-sm space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-white">Camera Access Required</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{error}</p>
              </div>
              <button
                type="button"
                onClick={() => nativeCameraInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all active:scale-95"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Medical Photo / File</span>
              </button>
            </div>
          )}

          {/* Loading Indicator */}
          {isLoading && !error && (
            <div className="p-8 text-center space-y-3 text-slate-400">
              <div className="relative w-10 h-10 mx-auto">
                <div className="w-10 h-10 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Camera className="w-4 h-4 text-blue-400" />
                </div>
              </div>
              <p className="text-xs font-medium text-slate-300">Initializing clinical optical feed...</p>
            </div>
          )}

          {/* Captured Review Screen */}
          {capturedImageUrl ? (
            <div className="relative w-full h-full flex items-center justify-center bg-slate-950 p-2 min-h-0">
              <img
                src={capturedImageUrl}
                alt="Captured Clinical Snapshot"
                className="max-h-[46vh] sm:max-h-[52vh] w-auto max-w-full object-contain rounded-xl shadow-2xl border border-slate-800"
              />
              <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-emerald-500/40 text-[11px] text-emerald-400 font-semibold flex items-center gap-1.5 shadow-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Snapshot Captured Ready</span>
              </div>
            </div>
          ) : (
            /* Live Stream Viewfinder with Clinical Reticles */
            !error && (
              <div className="relative w-full h-full flex items-center justify-center bg-black min-h-0">
                <video
                  ref={videoRef}
                  playsInline
                  autoPlay
                  muted
                  className={`w-full h-full object-cover max-h-[46vh] sm:max-h-[52vh] ${
                    facingMode === 'user' ? 'scale-x-[-1]' : ''
                  }`}
                />

                {/* Optional Rule of Thirds Grid */}
                {showGrid && (
                  <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 z-10 opacity-30">
                    <div className="border-r border-b border-white" />
                    <div className="border-r border-b border-white" />
                    <div className="border-b border-white" />
                    <div className="border-r border-b border-white" />
                    <div className="border-r border-b border-white" />
                    <div className="border-b border-white" />
                    <div className="border-r border-white" />
                    <div className="border-r border-white" />
                    <div />
                  </div>
                )}

                {/* Mode-specific HUD Framing Reticle */}
                {captureMode === 'document' && (
                  <div className="absolute inset-5 sm:inset-8 pointer-events-none flex flex-col justify-between z-10">
                    <div className="relative w-full h-full border border-cyan-400/30 rounded-2xl p-2.5 flex flex-col justify-between shadow-[0_0_25px_rgba(6,182,212,0.12)]">
                      {/* High-tech Glowing Corners */}
                      <div className="flex justify-between">
                        <div className="w-6 h-6 border-t-2 border-l-2 border-cyan-400 rounded-tl-lg shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                        <div className="w-6 h-6 border-t-2 border-r-2 border-cyan-400 rounded-tr-lg shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                      </div>

                      <div className="flex justify-between">
                        <div className="w-6 h-6 border-b-2 border-l-2 border-cyan-400 rounded-bl-lg shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                        <div className="w-6 h-6 border-b-2 border-r-2 border-cyan-400 rounded-br-lg shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                      </div>
                    </div>
                  </div>
                )}

                {captureMode === 'symptom' && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
                    <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full border-2 border-dashed border-blue-400/60 flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.15)] animate-pulse">
                      {/* Center Crosshair */}
                      <div className="w-6 h-0.5 bg-blue-400/70" />
                      <div className="h-6 w-0.5 bg-blue-400/70 absolute" />
                      <div className="w-2.5 h-2.5 rounded-full border border-blue-300 absolute" />
                    </div>
                  </div>
                )}

                {captureMode === 'general' && (
                  <div className="absolute inset-5 sm:inset-7 pointer-events-none flex flex-col justify-between z-10">
                    <div className="flex justify-between">
                      <div className="w-5 h-5 border-t-2 border-l-2 border-white/60 rounded-tl" />
                      <div className="w-5 h-5 border-t-2 border-r-2 border-white/60 rounded-tr" />
                    </div>
                    <div className="flex justify-between">
                      <div className="w-5 h-5 border-b-2 border-l-2 border-white/60 rounded-bl" />
                      <div className="w-5 h-5 border-b-2 border-r-2 border-white/60 rounded-br" />
                    </div>
                  </div>
                )}

                {/* Bottom Guidance Pill - Pinned at bottom to never block center of camera */}
                <div className="absolute bottom-3 inset-x-0 flex justify-center pointer-events-none z-10 px-4">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/10 text-[11px] text-slate-200 shadow-xl">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="font-medium text-center">
                      {captureMode === 'document'
                        ? 'Fit Rx, report, or document within edges'
                        : captureMode === 'symptom'
                        ? 'Center lesion or symptom inside the focus target'
                        : 'Hold steady in adequate illumination'}
                    </span>
                  </div>
                </div>
              </div>
            )
          )}
        </div>

        {/* Polished Footer Controls - ALWAYS VISIBLE */}
        <div className="shrink-0 p-3 sm:p-4 bg-slate-950 border-t border-slate-900 z-20">
          {capturedImageUrl ? (
            /* Review Actions */
            <div className="flex flex-col sm:flex-row items-center gap-2.5">
              <button
                type="button"
                onClick={handleRetake}
                className="w-full sm:flex-1 py-2.5 px-4 rounded-xl border border-slate-800 hover:bg-slate-900 text-slate-300 hover:text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-98"
              >
                <RotateCcw className="w-4 h-4 text-slate-400" />
                <span>Retake Photo</span>
              </button>

              <button
                type="button"
                onClick={handleConfirmPhoto}
                className="w-full sm:flex-1 py-2.5 px-5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all active:scale-98"
              >
                <Check className="w-4 h-4" />
                <span>Attach to Consultation</span>
              </button>
            </div>
          ) : (
            /* Live Camera Trigger Controls */
            <div className="flex items-center justify-between">
              {/* Device Gallery Fallback */}
              <div className="w-24 sm:w-28">
                <button
                  type="button"
                  onClick={() => nativeCameraInputRef.current?.click()}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors py-2 px-2.5 rounded-xl hover:bg-slate-900"
                  title="Upload from device files"
                >
                  <Upload className="w-4 h-4 text-blue-400" />
                  <span className="hidden sm:inline font-medium">Gallery</span>
                </button>
              </div>

              {/* Shutter Button */}
              {!error && !isLoading && (
                <div className="flex-1 flex justify-center">
                  <button
                    type="button"
                    onClick={handleCaptureSnapshot}
                    className="group relative w-14 h-14 sm:w-16 sm:h-16 rounded-full border-4 border-white/30 p-1 flex items-center justify-center hover:border-cyan-400/80 active:scale-90 transition-all shadow-xl shadow-cyan-500/10"
                    title="Take Photo"
                    aria-label="Take Photo"
                  >
                    <div className="w-full h-full rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 group-hover:from-blue-500 group-hover:to-cyan-400 shadow-md transition-colors flex items-center justify-center">
                      <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white/90 shadow-sm" />
                    </div>
                  </button>
                </div>
              )}

              {/* Cancel Button */}
              <div className="w-24 sm:w-28 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    stopStream();
                    onClose();
                  }}
                  className="py-2 px-3 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

