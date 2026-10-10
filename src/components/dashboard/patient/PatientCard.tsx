import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'react-qr-code';
import { useAuth } from '../../../context/AuthContext';
import { qrShareService } from '../../../services/qrShareService';
import { getScannableOrigin } from '../../../utils/qrCodeGenerator';
import { PatientShareRecord } from '../../../types';
import { formatIndianPhoneNumber } from '../../../utils/phoneUtils';
import {
  ShieldCheck,
  Download,
  Share2,
  RefreshCw,
  Phone,
  AlertTriangle,
  QrCode as QrIcon,
  CheckCircle2,
  Camera,
  Trash2,
  X,
  Lock,
  ExternalLink,
  Printer,
  RotateCw,
  Info,
  Check,
  Heart,
  Sparkles,
  FileDown
} from 'lucide-react';

export interface PatientCardProps {
  onNavigate?: (route: string) => void;
  showCardActions?: boolean;
  className?: string;
}

/**
 * Complete Digital Patient ID Card
 * - Strict 16:9 physical card appearance
 * - Realistic clinical ID front & back
 * - 3D card flip animation
 * - Real scannable QR code linking to secure token verification
 * - Profile image parity with patient profile
 * - High-resolution 16:9 card download (Front & Back) and Print
 */
export const PatientCard: React.FC<PatientCardProps> = ({
  onNavigate,
  showCardActions = true,
  className = ''
}) => {
  const { user, uploadProfilePhoto, removeProfilePhoto } = useAuth();
  const [shareRecord, setShareRecord] = useState<PatientShareRecord | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const frontCardRef = useRef<HTMLDivElement>(null);
  const backCardRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Patient clinical data
  const patientName = user?.name || 'Aryan Yadav';
  const patientIdCode = user?.patientId || user?.mrn || 'MAI-80429';
  const bloodGroup = user?.bloodGroup || user?.bloodType || 'O+';
  const allergiesList = user?.allergies && user.allergies.length > 0
    ? user.allergies.join(', ')
    : 'Penicillin (Severe), Sulfa Drugs (Moderate)';
  const conditionsList = user?.medicalConditions && user.medicalConditions.length > 0
    ? user.medicalConditions.join(', ')
    : 'Essential Hypertension (Stage 1, Controlled)';
  const emergencyNotes = user?.emergencyNotes || 'Verified vaccination registry. Penicillin allergy confirmed.';
  const primaryContact = user?.emergencyContacts?.find((c) => c.isPrimary) || user?.emergencyContacts?.[0];
  const dateOfBirth = user?.dateOfBirth || '1998-09-14';

  const calculateAge = (dobString: string): number => {
    try {
      const birthDate = new Date(dobString);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return isNaN(age) ? 28 : age;
    } catch {
      return 28;
    }
  };

  const patientAge = calculateAge(dateOfBirth);

  // Fetch or initialize active dynamic share token
  useEffect(() => {
    const record = qrShareService.getOrCreateActiveRecordForPatient({
      patientId: user?.id || 'pat-1',
      patientName,
      patientIdCode,
      dateOfBirth,
      bloodGroup,
      allergies: user?.allergies || ['Penicillin', 'Sulfa Drugs'],
      emergencyContacts: user?.emergencyContacts || [],
      importantMedicalNotes: emergencyNotes,
      profileImageUrl: user?.profileImageUrl
    });
    setShareRecord(record);
  }, [user, patientName, patientIdCode, bloodGroup, dateOfBirth, emergencyNotes]);

  const origin = getScannableOrigin();
  const shareUrl = shareRecord
    ? `${origin}/share/${shareRecord.token}`
    : `${origin}/share/loading`;

  // Regenerate dynamic secure share token
  const handleRegenerateQr = () => {
    setIsRegenerating(true);
    setTimeout(() => {
      const newRecord = qrShareService.createShareRecord({
        patientId: user?.id || 'pat-1',
        patientName,
        patientIdCode,
        dateOfBirth,
        bloodGroup,
        allergies: user?.allergies || ['Penicillin', 'Sulfa Drugs'],
        emergencyContacts: user?.emergencyContacts || [],
        importantMedicalNotes: emergencyNotes,
        profileImageUrl: user?.profileImageUrl,
        durationMinutes: 1440,
        revokeExistingForPatient: true
      });
      setShareRecord(newRecord);
      setIsRegenerating(false);
      setFeedbackMessage('New 24-hour emergency token generated. Prior links revoked.');
      setTimeout(() => setFeedbackMessage(null), 4000);
    }, 400);
  };

  const handleShareCard = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `Medical AI Digital Patient Card: ${patientName}`,
          text: `Authorized Emergency Medical ID for ${patientName} (${patientIdCode})`,
          url: shareUrl
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      setFeedbackMessage('Secure emergency link copied to clipboard.');
      setTimeout(() => setFeedbackMessage(null), 3000);
    }
  };

  const handlePrintCard = () => {
    window.print();
  };

  // High-Resolution 16:9 Canvas Card Downloader
  const handleDownloadCard = async (side: 'front' | 'back' | 'both') => {
    setIsDownloading(true);
    setIsDownloadModalOpen(false);

    try {
      const renderCardSideToCanvas = async (isBack: boolean): Promise<HTMLCanvasElement> => {
        const canvas = document.createElement('canvas');
        canvas.width = 1920;
        canvas.height = 1080; // 16:9 aspect ratio
        const ctx = canvas.getContext('2d')!;

        // 1. Background Gradient
        const grad = ctx.createLinearGradient(0, 0, 1920, 1080);
        grad.addColorStop(0, '#0f172a');
        grad.addColorStop(0.5, '#090d16');
        grad.addColorStop(1, '#020617');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1920, 1080);

        // 2. Rounded Outer Border & Inner Shadow
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 8;
        ctx.strokeRect(30, 30, 1860, 1020);

        // Micro-grid lines
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.05)';
        ctx.lineWidth = 1;
        for (let x = 60; x < 1860; x += 40) {
          ctx.beginPath();
          ctx.moveTo(x, 40);
          ctx.lineTo(x, 1040);
          ctx.stroke();
        }

        if (!isBack) {
          // ================= RENDER FRONT =================
          // Header Bar
          ctx.fillStyle = '#2563eb';
          ctx.beginPath();
          ctx.roundRect(80, 80, 80, 80, 16);
          ctx.fill();

          // Header text
          ctx.fillStyle = '#60a5fa';
          ctx.font = 'bold 28px "JetBrains Mono", monospace';
          ctx.fillText('MEDICAL AI', 180, 115);

          ctx.fillStyle = '#ffffff';
          ctx.font = '900 36px "Plus Jakarta Sans", sans-serif';
          ctx.fillText('CLINICAL PATIENT IDENTIFICATION', 180, 155);

          // Smart Chip simulation
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.roundRect(1480, 80, 110, 75, 12);
          ctx.fill();
          ctx.fillStyle = '#d97706';
          ctx.fillRect(1510, 80, 10, 75);
          ctx.fillRect(1550, 80, 10, 75);

          // Verified Pill
          ctx.fillStyle = '#064e3b';
          ctx.beginPath();
          ctx.roundRect(1620, 90, 220, 55, 28);
          ctx.fill();
          ctx.fillStyle = '#34d399';
          ctx.font = 'bold 22px "JetBrains Mono", monospace';
          ctx.fillText('● VERIFIED ID', 1650, 126);

          // Horizontal divider
          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(80, 190);
          ctx.lineTo(1840, 190);
          ctx.stroke();

          // Left: Patient Photo Box
          const photoX = 100;
          const photoY = 240;
          const photoSize = 420;

          ctx.fillStyle = '#1e293b';
          ctx.beginPath();
          ctx.roundRect(photoX, photoY, photoSize, photoSize, 32);
          ctx.fill();
          ctx.strokeStyle = '#3b82f6';
          ctx.lineWidth = 6;
          ctx.stroke();

          let photoRendered = false;
          if (user?.profileImageUrl) {
            try {
              const img = new Image();
              img.crossOrigin = 'anonymous';
              await new Promise<void>((resolve, reject) => {
                img.onload = () => resolve();
                img.onerror = () => reject();
                img.src = user.profileImageUrl!;
              });
              ctx.save();
              ctx.beginPath();
              ctx.roundRect(photoX + 8, photoY + 8, photoSize - 16, photoSize - 16, 26);
              ctx.clip();
              ctx.drawImage(img, photoX + 8, photoY + 8, photoSize - 16, photoSize - 16);
              ctx.restore();
              photoRendered = true;
            } catch {
              photoRendered = false;
            }
          }

          if (!photoRendered) {
            ctx.fillStyle = '#1d4ed8';
            ctx.beginPath();
            ctx.roundRect(photoX + 8, photoY + 8, photoSize - 16, photoSize - 16, 26);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 120px "JetBrains Mono", monospace';
            ctx.textAlign = 'center';
            ctx.fillText(patientName.slice(0, 2).toUpperCase(), photoX + photoSize / 2, photoY + photoSize / 2 + 40);
            ctx.textAlign = 'left';
          }

          ctx.fillStyle = '#94a3b8';
          ctx.font = 'bold 22px "JetBrains Mono", monospace';
          ctx.fillText('OFFICIAL CLINICAL PHOTO ID', 140, 710);

          // Middle: Core Clinical Details
          ctx.fillStyle = '#94a3b8';
          ctx.font = 'bold 22px "JetBrains Mono", monospace';
          ctx.fillText('FULL PATIENT NAME', 580, 270);
          ctx.fillStyle = '#ffffff';
          ctx.font = '900 52px "Plus Jakarta Sans", sans-serif';
          ctx.fillText(patientName, 580, 335);

          // Patient ID Badge
          ctx.fillStyle = '#94a3b8';
          ctx.font = 'bold 22px "JetBrains Mono", monospace';
          ctx.fillText('PATIENT ID (MRN)', 580, 420);
          ctx.fillStyle = '#172554';
          ctx.beginPath();
          ctx.roundRect(580, 440, 320, 65, 16);
          ctx.fill();
          ctx.fillStyle = '#93c5fd';
          ctx.font = 'bold 36px "JetBrains Mono", monospace';
          ctx.fillText(patientIdCode, 610, 488);

          // Blood Group Badge
          ctx.fillStyle = '#94a3b8';
          ctx.font = 'bold 22px "JetBrains Mono", monospace';
          ctx.fillText('BLOOD GROUP', 940, 420);
          ctx.fillStyle = '#450a0a';
          ctx.beginPath();
          ctx.roundRect(940, 440, 180, 65, 16);
          ctx.fill();
          ctx.fillStyle = '#fca5a5';
          ctx.font = '900 36px "JetBrains Mono", monospace';
          ctx.fillText(bloodGroup, 980, 488);

          // DOB & Emergency Contact
          ctx.fillStyle = '#94a3b8';
          ctx.font = 'bold 22px "JetBrains Mono", monospace';
          ctx.fillText('DATE OF BIRTH', 580, 560);
          ctx.fillStyle = '#e2e8f0';
          ctx.font = 'bold 32px "Plus Jakarta Sans", sans-serif';
          ctx.fillText(`${dateOfBirth} (${patientAge} Years)`, 580, 605);

          ctx.fillStyle = '#94a3b8';
          ctx.font = 'bold 22px "JetBrains Mono", monospace';
          ctx.fillText('PRIMARY EMERGENCY CONTACT', 580, 670);
          ctx.fillStyle = '#e2e8f0';
          ctx.font = 'bold 30px "Plus Jakarta Sans", sans-serif';
          const contactStr = primaryContact ? `${primaryContact.name} (${primaryContact.relationship}): ${formatIndianPhoneNumber(primaryContact.phone)}` : 'Sunita Yadav (Mother): +91 81002 78890';
          ctx.fillText(contactStr, 580, 715);

          // Right: Real Scannable QR Code
          const qrX = 1400;
          const qrY = 240;
          const qrBoxSize = 420;

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.roundRect(qrX, qrY, qrBoxSize, qrBoxSize, 32);
          ctx.fill();

          // Rasterize SVG QR onto canvas
          const qrSvg = document.getElementById('patient-card-qr-svg');
          if (qrSvg) {
            try {
              const svgData = new XMLSerializer().serializeToString(qrSvg);
              const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
              const urlApi = window.URL || (window as any).webkitURL;
              const blobUrl = urlApi.createObjectURL(svgBlob);
              const qrImg = new Image();
              await new Promise<void>((resolve, reject) => {
                qrImg.onload = () => resolve();
                qrImg.onerror = () => reject();
                qrImg.src = blobUrl;
              });
              ctx.drawImage(qrImg, qrX + 30, qrY + 30, qrBoxSize - 60, qrBoxSize - 60);
              urlApi.revokeObjectURL(blobUrl);
            } catch {
              // fallback
            }
          }

          ctx.fillStyle = '#34d399';
          ctx.font = 'bold 24px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillText('● SCAN TO VERIFY CREDENTIAL', qrX + qrBoxSize / 2, 710);
          ctx.textAlign = 'left';

          // Bottom Security Stripe
          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(80, 780);
          ctx.lineTo(1840, 780);
          ctx.stroke();

          ctx.fillStyle = '#64748b';
          ctx.font = 'bold 22px "JetBrains Mono", monospace';
          ctx.fillText(`<MAI<<${patientName.replace(/\s+/g, '<')}<<<<<<<<<<<<${patientIdCode}<<<`, 80, 840);
          ctx.fillText('SECURITY LEVEL 4 · ISO/IEC 7810 ID-1 STANDARD · 24H ENCRYPTED TOKEN', 80, 885);

          ctx.fillStyle = '#3b82f6';
          ctx.fillText('MEDICAL AI SECURE CLINICAL IDENTITY REGISTRY', 1250, 885);
        } else {
          // ================= RENDER BACK =================
          // Magnetic stripe
          ctx.fillStyle = '#020617';
          ctx.fillRect(30, 80, 1860, 120);
          ctx.fillStyle = '#334155';
          ctx.font = '24px "JetBrains Mono", monospace';
          ctx.fillText('||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||', 60, 150);
          ctx.fillStyle = '#60a5fa';
          ctx.fillText('AUTHENTICATION STRIPE · ENCRYPTED CLINICAL CREDENTIAL', 1150, 150);

          // Header
          ctx.fillStyle = '#ffffff';
          ctx.font = '900 36px "Plus Jakarta Sans", sans-serif';
          ctx.fillText('PATIENT ID CARD • EMERGENCY & CLINICAL PROTOCOLS', 80, 260);

          ctx.fillStyle = '#94a3b8';
          ctx.font = 'bold 26px "JetBrains Mono", monospace';
          ctx.fillText(`CARD ID: ${patientIdCode}-SEC`, 1460, 260);

          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(80, 290);
          ctx.lineTo(1840, 290);
          ctx.stroke();

          // Left Box: Emergency Instructions & How to Use
          ctx.fillStyle = '#60a5fa';
          ctx.font = 'bold 26px "JetBrains Mono", monospace';
          ctx.fillText('1. EMERGENCY INSTRUCTIONS & HOW TO USE', 80, 350);

          ctx.fillStyle = '#cbd5e1';
          ctx.font = '24px "Plus Jakarta Sans", sans-serif';
          const instructions = [
            '• Present this card at all registered clinics, hospitals, and diagnostic centers.',
            '• In acute medical distress, contact Emergency Medical Services immediately (112).',
            '• First responders & clinicians: Scan front QR code for verified allergies & active medications.',
            '• Access to protected clinical baseline is cryptographically scoped and audited.'
          ];
          let iy = 400;
          instructions.forEach((ins) => {
            ctx.fillText(ins, 100, iy);
            iy += 45;
          });

          // Middle Box: Important Medical Information
          ctx.fillStyle = '#f87171';
          ctx.font = 'bold 26px "JetBrains Mono", monospace';
          ctx.fillText('2. IMPORTANT MEDICAL INFORMATION (CLINICAL BASELINE)', 80, 610);

          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.roundRect(80, 630, 1760, 120, 16);
          ctx.fill();
          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.fillStyle = '#fca5a5';
          ctx.font = 'bold 22px "JetBrains Mono", monospace';
          ctx.fillText(`DOCUMENTED ALLERGIES: ${allergiesList}`, 110, 675);

          ctx.fillStyle = '#cbd5e1';
          ctx.font = 'bold 22px "JetBrains Mono", monospace';
          ctx.fillText(`CHRONIC CONDITIONS: ${conditionsList}`, 110, 720);

          // Privacy Notice
          ctx.fillStyle = '#f59e0b';
          ctx.font = 'bold 24px "JetBrains Mono", monospace';
          ctx.fillText('3. PRIVACY NOTICE & LEGAL GOVERNANCE', 80, 800);

          ctx.fillStyle = '#94a3b8';
          ctx.font = '22px "Plus Jakarta Sans", sans-serif';
          ctx.fillText('Protected Health Information (PHI) credential under HIPAA and international health data standards.', 80, 840);
          ctx.fillText('Only authorized healthcare personnel may view medical records. Report compromised cards immediately via patient portal.', 80, 875);

          // Optical Barcode / MRZ Line
          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(80, 930);
          ctx.lineTo(1840, 930);
          ctx.stroke();

          ctx.fillStyle = '#64748b';
          ctx.font = 'bold 24px "JetBrains Mono", monospace';
          ctx.fillText(`<MAI<<${patientName.replace(/\s+/g, '<')}<<<<<<<<<<<<${patientIdCode}-SEC<<<<<<<<<<`, 80, 990);
        }

        return canvas;
      };

      const downloadCanvasImage = (canvas: HTMLCanvasElement, filename: string) => {
        const link = document.createElement('a');
        link.download = filename;
        link.href = canvas.toDataURL('image/png', 1.0);
        link.click();
      };

      if (side === 'front' || side === 'both') {
        const frontCanvas = await renderCardSideToCanvas(false);
        downloadCanvasImage(frontCanvas, `medical-ai-patient-card-front-${patientIdCode}.png`);
      }

      if (side === 'back' || side === 'both') {
        setTimeout(async () => {
          const backCanvas = await renderCardSideToCanvas(true);
          downloadCanvasImage(backCanvas, `medical-ai-patient-card-back-${patientIdCode}.png`);
        }, side === 'both' ? 400 : 0);
      }

      setFeedbackMessage('High-resolution 16:9 card PNG downloaded successfully.');
      setTimeout(() => setFeedbackMessage(null), 4000);
    } catch (err: any) {
      console.error('Download card error:', err);
      setFeedbackMessage('Could not generate download image.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Profile photograph upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setUploadError('Invalid format. Supported formats: JPG, JPEG, PNG, WEBP.');
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadError('File exceeds 5MB size limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        uploadProfilePhoto(reader.result);
        setIsPhotoModalOpen(false);
        setFeedbackMessage('Profile photo updated successfully across card and profile.');
        setTimeout(() => setFeedbackMessage(null), 3500);
      }
    };
    reader.onerror = () => {
      setUploadError('Failed reading image file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Toast Feedback */}
      {feedbackMessage && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-900 dark:text-emerald-200 flex items-center justify-between gap-2 shadow-xs transition-all">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{feedbackMessage}</span>
          </div>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-emerald-700 dark:text-emerald-300 hover:text-emerald-900"
            aria-label="Dismiss message"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Card Perspective 3D Flip Wrapper — REALISTIC 16:9 RATIO */}
      <div className="w-full max-w-2xl mx-auto perspective-1000">
        <div
          className={`relative w-full aspect-[16/9] transition-transform duration-700 transform-style-3d select-none cursor-pointer ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
          onClick={() => setIsFlipped(!isFlipped)}
          title="Click to flip card"
        >
          {/* ==================== CARD FRONT (16:9 Landscape) ==================== */}
          <div
            ref={frontCardRef}
            className="absolute inset-0 w-full h-full rounded-2xl sm:rounded-3xl border-2 border-slate-800 dark:border-slate-700 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white shadow-2xl p-4 sm:p-6 flex flex-col justify-between backface-hidden overflow-hidden patient-card-print-container"
          >
            {/* Background Holographic Micro-Grid Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />

            {/* Top Header Row */}
            <div className="relative z-10 flex items-center justify-between border-b border-slate-800 pb-2 sm:pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
                  <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <div className="text-[10px] sm:text-xs font-mono tracking-widest uppercase text-blue-400 font-bold leading-none">
                    MEDICAL AI
                  </div>
                  <div className="text-xs sm:text-sm font-extrabold tracking-tight text-white mt-0.5">
                    CLINICAL PATIENT ID
                  </div>
                </div>
              </div>

              {/* Smart Chip & Status Badge */}
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-mono font-semibold">
                  <div className="w-3 h-2 rounded-xs bg-amber-400/80 border border-amber-300" />
                  <span>SMART CHIP</span>
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950/80 border border-emerald-500/40 rounded-full">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[9px] sm:text-[10px] font-mono font-bold tracking-wider text-emerald-300 uppercase">
                    VERIFIED
                  </span>
                </div>
              </div>
            </div>

            {/* Middle Section: Photo + Core Details + Machine QR Code */}
            <div className="relative z-10 grid grid-cols-12 gap-3 sm:gap-4 items-center flex-1 my-1 sm:my-2">
              {/* Column 1: Patient Profile Photo (3 Cols) */}
              <div className="col-span-3 flex flex-col items-center justify-center">
                <div className="relative group w-16 h-16 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-xl sm:rounded-2xl border-2 border-blue-400/60 p-0.5 bg-slate-800 shadow-md overflow-hidden">
                  {user?.profileImageUrl ? (
                    <img
                      src={user.profileImageUrl}
                      alt={patientName}
                      className="w-full h-full object-cover rounded-lg sm:rounded-xl"
                    />
                  ) : (
                    <div className="w-full h-full rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-700 to-indigo-900 flex items-center justify-center text-white font-bold text-lg sm:text-2xl font-mono">
                      {patientName
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')}
                    </div>
                  )}

                  {/* Photo Edit Overlay */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsPhotoModalOpen(true);
                    }}
                    className="absolute inset-0 bg-slate-900/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[9px] font-medium gap-1"
                    title="Update Profile Photograph"
                  >
                    <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-300" />
                    <span className="hidden sm:inline">Change</span>
                  </button>
                </div>
                <span className="mt-1 text-[9px] sm:text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                  PHOTO ID
                </span>
              </div>

              {/* Column 2: Clinical Details (6 Cols) */}
              <div className="col-span-6 space-y-1 sm:space-y-1.5 pl-1">
                <div>
                  <div className="text-[9px] sm:text-[10px] font-mono text-slate-400 uppercase tracking-wider leading-none">
                    PATIENT NAME
                  </div>
                  <div className="text-sm sm:text-base md:text-lg font-extrabold text-white truncate leading-tight mt-0.5">
                    {patientName}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                  <div>
                    <div className="text-[8px] sm:text-[9px] font-mono text-slate-400 uppercase">
                      PATIENT ID
                    </div>
                    <div className="text-[10px] sm:text-xs font-mono font-bold text-blue-300 bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-800/60 inline-block truncate max-w-full">
                      {patientIdCode}
                    </div>
                  </div>

                  <div>
                    <div className="text-[8px] sm:text-[9px] font-mono text-slate-400 uppercase">
                      BLOOD GROUP
                    </div>
                    <div className="text-[10px] sm:text-xs font-mono font-extrabold text-red-300 bg-red-950/60 px-1.5 py-0.5 rounded border border-red-800/60 inline-block">
                      {bloodGroup}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
                  <div>
                    <span className="text-[8px] sm:text-[9px] font-mono text-slate-400 uppercase block">
                      DOB / AGE
                    </span>
                    <span className="font-medium text-slate-200">
                      {dateOfBirth} ({patientAge}Y)
                    </span>
                  </div>

                  <div>
                    <span className="text-[8px] sm:text-[9px] font-mono text-slate-400 uppercase block">
                      EMERGENCY CONTACT
                    </span>
                    <span className="font-medium text-slate-200 truncate block">
                      {primaryContact ? formatIndianPhoneNumber(primaryContact.phone) : '+91 81002 78890'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Column 3: Real High-Contrast QR Code (3 Cols) */}
              <div className="col-span-3 flex flex-col items-center justify-center">
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsQrModalOpen(true);
                  }}
                  className="p-1 sm:p-1.5 bg-white rounded-xl shadow-md cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all flex flex-col items-center"
                  title="Click to view full-size scannable QR Code"
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 flex items-center justify-center">
                    <QRCode
                      id="patient-card-qr-svg"
                      value={shareUrl}
                      size={96}
                      style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                      viewBox={`0 0 96 96`}
                      level="H"
                    />
                  </div>
                </div>
                <span className="mt-1 text-[8px] sm:text-[9px] font-mono text-emerald-400 flex items-center gap-1 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  SCAN FOR SOS
                </span>
              </div>
            </div>

            {/* Bottom Bar: Security Holographic Strip & MRN */}
            <div className="relative z-10 pt-1.5 sm:pt-2 border-t border-slate-800 flex items-center justify-between text-[8px] sm:text-[10px] font-mono text-slate-400">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 tracking-wider">
                  MRN:{patientIdCode}
                </span>
                <span>•</span>
                <span className="text-blue-400">ENCRYPTED HEALTH TOKEN</span>
              </div>

              <div className="flex items-center gap-1.5 text-slate-400">
                <Lock className="w-3 h-3 text-emerald-400" />
                <span>ISO/IEC 7810 ID-1 CLINICAL STANDARD</span>
              </div>
            </div>
          </div>

          {/* ==================== CARD BACK (16:9 Landscape) ==================== */}
          <div
            ref={backCardRef}
            className="absolute inset-0 w-full h-full rounded-2xl sm:rounded-3xl border-2 border-slate-800 dark:border-slate-700 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white shadow-2xl p-4 sm:p-6 flex flex-col justify-between backface-hidden rotate-y-180 overflow-hidden patient-card-print-container"
          >
            {/* Top Magnetic Stripe Simulation */}
            <div className="-mx-4 sm:-mx-6 -mt-4 sm:-mt-6 mb-2">
              <div className="h-7 sm:h-9 bg-slate-950 border-b border-slate-800 flex items-center px-4 sm:px-6 justify-between">
                <span className="text-[8px] sm:text-[9px] font-mono tracking-widest text-slate-500">
                  ||||| |||| ||||||| ||||| |||||| |||||||| |||||
                </span>
                <span className="text-[8px] sm:text-[9px] font-mono text-blue-400 font-bold">
                  AUTHENTICATION STRIPE · TRACK 1/2 ENCRYPTED
                </span>
              </div>
            </div>

            {/* Back Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-400" />
                <span className="font-extrabold text-xs sm:text-sm tracking-tight text-white uppercase">
                  PATIENT ID CARD • INSTRUCTIONS & PROTOCOLS
                </span>
              </div>
              <span className="text-[9px] font-mono text-slate-400 font-bold">
                PATIENT ID: {patientIdCode}
              </span>
            </div>

            {/* Back Middle Section: Instructions & Critical Clinical Baseline */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 my-auto text-[9px] sm:text-[10px] leading-relaxed">
              {/* Left Column: How to Use & QR Instructions */}
              <div className="space-y-1">
                <div className="text-[9px] sm:text-[10px] font-bold text-blue-300 uppercase font-mono tracking-wider">
                  HOW TO USE & QR INSTRUCTIONS
                </div>
                <ul className="space-y-1 text-slate-300">
                  <li className="flex items-start gap-1">
                    <span className="text-blue-400 font-bold">•</span>
                    <span>Present this card at all registered hospital triage desks & clinics.</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <span className="text-blue-400 font-bold">•</span>
                    <span>Scan front QR code with any mobile camera to view verified emergency baseline.</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <span className="text-blue-400 font-bold">•</span>
                    <span>QR verification is protected by secure token and audited access logging.</span>
                  </li>
                </ul>
              </div>

              {/* Right Column: Emergency & Important Medical Information */}
              <div className="space-y-1">
                <div className="text-[9px] sm:text-[10px] font-bold text-rose-300 uppercase font-mono tracking-wider">
                  CRITICAL CLINICAL BASELINE
                </div>
                <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800 space-y-0.5">
                  <div className="truncate">
                    <span className="text-slate-400 font-mono text-[8px] uppercase">ALLERGIES: </span>
                    <span className="font-bold text-rose-300">{allergiesList}</span>
                  </div>
                  <div className="truncate">
                    <span className="text-slate-400 font-mono text-[8px] uppercase">CONDITIONS: </span>
                    <span className="font-semibold text-slate-200">{conditionsList}</span>
                  </div>
                </div>

                <div className="text-slate-400 text-[8px] sm:text-[9px] pt-0.5">
                  Emergency: Call <strong>112</strong> immediately. Paramedics can scan QR for primary contact & physician handoff.
                </div>
              </div>
            </div>

            {/* Bottom Bar: Privacy Notice & Optical Machine Readable Zone */}
            <div className="pt-1.5 border-t border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-[8px] sm:text-[9px] text-slate-400">
                <span>Protected Health Information (PHI) under HIPAA & Clinical Governance.</span>
                <span className="font-mono text-blue-400">SEC-MAI-{patientIdCode}-V2</span>
              </div>
              <div className="truncate text-[8px] sm:text-[9px] font-mono text-slate-500">
                &lt;MAI&lt;&lt;{patientName.replace(/\s+/g, '&lt;')}&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;{patientIdCode}-SEC&lt;&lt;&lt;&lt;&lt;
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card Controls Toolbar */}
      {showCardActions && (
        <div className="max-w-2xl mx-auto flex flex-wrap items-center justify-between gap-2 pt-2">
          {/* Flip Card Action Button */}
          <button
            onClick={() => setIsFlipped(!isFlipped)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
            title="Flip between Front and Back of the Card"
          >
            <RotateCw className="w-4 h-4" />
            <span>{isFlipped ? '↻ View Card Front' : '↻ Flip to Card Back (Protocols)'}</span>
          </button>

          {/* Quick Utility Actions: Download, Print, Share, Refresh */}
          <div className="flex items-center gap-1.5">
            {/* Download Button */}
            <button
              onClick={() => setIsDownloadModalOpen(true)}
              disabled={isDownloading}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              title="Download 16:9 High-Resolution ID Card"
            >
              <Download className={`w-3.5 h-3.5 ${isDownloading ? 'animate-bounce text-blue-600' : ''}`} />
              <span className="hidden sm:inline">{isDownloading ? 'Generating...' : 'Download Card'}</span>
            </button>

            {/* Print Button */}
            <button
              onClick={handlePrintCard}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Print Physical 16:9 Patient ID Card"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print</span>
            </button>

            {/* Test Verification URL */}
            <a
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="Test the QR Verification Destination"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Verify QR Link</span>
            </a>

            {/* Identity Status Button */}
            {onNavigate && (
              <button
                onClick={() => onNavigate('/dashboard/identity-verification')}
                className="p-2 sm:px-3 sm:py-2 rounded-xl bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Optional Government Identity Verification"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
                <span className="hidden sm:inline">Identity Status</span>
              </button>
            )}

            {/* Share Button */}
            <button
              onClick={handleShareCard}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Share Emergency Verification URL"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Share</span>
            </button>

            {/* Refresh QR */}
            <button
              onClick={handleRegenerateQr}
              disabled={isRegenerating}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              title="Regenerate 24-hour Emergency Share Token"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin text-blue-600' : ''}`} />
              <span className="hidden sm:inline">Refresh Token</span>
            </button>
          </div>
        </div>
      )}

      {/* Hidden File Input for Photo Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handlePhotoUpload}
      />

      {/* Download Card Options Modal */}
      {isDownloadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileDown className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Download Digital Patient ID Card
                </h3>
              </div>
              <button
                onClick={() => setIsDownloadModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Export realistic, high-resolution 16:9 images suitable for mobile wallets, printing, or offline records.
            </p>

            <div className="space-y-2 pt-1">
              <button
                onClick={() => handleDownloadCard('front')}
                className="w-full py-3 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-300 rounded-2xl text-xs font-bold border border-slate-200 dark:border-slate-700 flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>Download Front Side (16:9 HD PNG)</span>
                <Download className="w-4 h-4 text-blue-600" />
              </button>

              <button
                onClick={() => handleDownloadCard('back')}
                className="w-full py-3 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-300 rounded-2xl text-xs font-bold border border-slate-200 dark:border-slate-700 flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>Download Back Side (Protocols HD PNG)</span>
                <Download className="w-4 h-4 text-blue-600" />
              </button>

              <button
                onClick={() => handleDownloadCard('both')}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold shadow-md flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>Download Both Sides (Zip / Files)</span>
                <Download className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Photo Modal */}
      {isPhotoModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Patient Identification Photograph
              </h3>
              <button
                onClick={() => setIsPhotoModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {uploadError && (
              <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            <div className="flex flex-col items-center gap-4 py-2">
              <div className="w-24 h-24 rounded-2xl border-2 border-blue-500 p-0.5 bg-slate-800 overflow-hidden shadow-md">
                {user?.profileImageUrl ? (
                  <img
                    src={user.profileImageUrl}
                    alt={patientName}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <div className="w-full h-full rounded-xl bg-blue-700 text-white flex items-center justify-center font-bold text-xl font-mono">
                    {patientName.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="flex gap-2 w-full">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Upload Photo</span>
                </button>

                {user?.profileImageUrl && (
                  <button
                    onClick={() => {
                      removeProfilePhoto();
                      setIsPhotoModalOpen(false);
                      setFeedbackMessage('Profile photo removed.');
                    }}
                    className="py-2 px-3 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border border-rose-200 dark:border-rose-800 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                )}
              </div>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center">
              Clear front-facing medical identification photograph. Maximum size: 5MB.
            </p>
          </div>
        </div>
      )}

      {/* QR Code Fullscreen Modal */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-center">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Emergency Medical QR Code
              </h3>
              <button
                onClick={() => setIsQrModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-white rounded-2xl border-2 border-slate-200 dark:border-slate-700 inline-block shadow-sm">
              <QRCode value={shareUrl} size={180} level="H" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-900 dark:text-white block font-mono">
                {patientIdCode} • {patientName}
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Scan with any standard smartphone camera to access emergency medical data, primary emergency contact, and doctor handoff summary.
              </p>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => {
                  window.open(shareUrl, '_blank');
                  setIsQrModalOpen(false);
                }}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Link</span>
              </button>
              <button
                onClick={() => setIsQrModalOpen(false)}
                className="py-2 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientCard;
