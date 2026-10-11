import React, { useState, useEffect } from 'react';
import { RoutePath, PatientShareRecord } from '../../../../types';
import { useAuth } from '../../../../context/AuthContext';
import { qrShareService } from '../../../../services/qrShareService';
import { RealQrCode } from '../../../common/RealQrCode';
import { getScannableOrigin, initScannableOrigin } from '../../../../utils/qrCodeGenerator';
import { ProfileAvatar } from '../../../common/ProfileAvatar';
import {
  QrCode,
  ShieldCheck,
  Clock,
  Key,
  Copy,
  Check,
  Ban,
  Eye,
  CheckCircle2,
  Lock,
  Smartphone,
  ExternalLink,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

export const PatientQrSharingView: React.FC<{ onNavigate: (route: RoutePath) => void }> = ({
  onNavigate
}) => {
  const { user } = useAuth();
  const [expiryMinutes, setExpiryMinutes] = useState<number>(60); // 1h default
  const [shareRecord, setShareRecord] = useState<PatientShareRecord | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showClinicianPreview, setShowClinicianPreview] = useState(false);
  const [feedbackNote, setFeedbackNote] = useState<string | null>(null);

  const patientName = user?.name || 'Aryan Yadav';
  const patientIdCode = user?.patientId || user?.mrn || 'MAI-80429';

  useEffect(() => {
    const record = qrShareService.getOrCreateActiveRecordForPatient({
      patientId: user?.id || 'pat-1',
      patientName,
      patientIdCode,
      dateOfBirth: user?.dateOfBirth,
      bloodGroup: user?.bloodGroup || user?.bloodType || 'O+',
      allergies: user?.allergies || ['None reported'],
      emergencyContacts: user?.emergencyContacts || [],
      importantMedicalNotes: user?.emergencyNotes || 'No acute contraindications.',
      profileImageUrl: user?.profileImageUrl
    });
    setShareRecord(record);
  }, [user, patientName, patientIdCode]);

  const [origin, setOrigin] = useState<string>(() => getScannableOrigin());

  useEffect(() => {
    initScannableOrigin().then((resolved) => {
      if (resolved) setOrigin(resolved);
    });
  }, []);

  const shareableUrl = shareRecord
    ? `${origin}/share/${shareRecord.token}`
    : `${origin}/share/loading`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareableUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleRevoke = () => {
    if (shareRecord) {
      qrShareService.revokeToken(shareRecord.token);
      setShareRecord({ ...shareRecord, isRevoked: true });
      setFeedbackNote('Access token has been revoked immediately. Any subsequent scan will be rejected.');
      setTimeout(() => setFeedbackNote(null), 4500);
    }
  };

  const handleRegenerate = () => {
    setIsRegenerating(true);
    setTimeout(() => {
      const newRec = qrShareService.createShareRecord({
        patientId: user?.id || 'pat-1',
        patientName,
        patientIdCode,
        dateOfBirth: user?.dateOfBirth,
        bloodGroup: user?.bloodGroup || user?.bloodType || 'O+',
        allergies: user?.allergies || ['None reported'],
        emergencyContacts: user?.emergencyContacts || [],
        importantMedicalNotes: user?.emergencyNotes,
        profileImageUrl: user?.profileImageUrl,
        durationMinutes: expiryMinutes,
        revokeExistingForPatient: true
      });
      setShareRecord(newRec);
      setIsRegenerating(false);
      setFeedbackNote('Your previous QR sharing link has been revoked and a new one has been generated.');
      setTimeout(() => setFeedbackNote(null), 4500);
    }, 350);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase text-emerald-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Zero-Trust Privacy · Ephemeral QR Access Control</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Machine-Readable QR Sharing
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Grant temporary, cryptographically isolated read access to attending physicians and emergency first responders.
          </p>
        </div>

        <button
          onClick={() => setShowClinicianPreview(!showClinicianPreview)}
          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 shrink-0"
        >
          <Eye className="w-4 h-4" />
          <span>{showClinicianPreview ? 'Hide Clinician Screen' : 'Preview Doctor Screen'}</span>
        </button>
      </div>

      {feedbackNote && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedbackNote}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: QR Code & Active State */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col items-center text-center space-y-4">
          <div className="space-y-1">
            <h3 className="font-bold text-slate-900 text-base">Attending Clinician QR</h3>
            <p className="text-xs text-slate-500">
              Hold screen for doctor or clinic intake tablet to scan using standard camera.
            </p>
          </div>

          {/* Genuine QR Component */}
          <div className="p-4 bg-white rounded-2xl border-2 border-slate-900 shadow-md">
            <RealQrCode
              value={shareableUrl}
              size={210}
              showActions={true}
              onRegenerate={handleRegenerate}
              isRegenerating={isRegenerating}
              isRevoked={shareRecord?.isRevoked}
            />
          </div>

          {/* Destination URL */}
          <div className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs space-y-1">
            <div className="flex items-center justify-between font-semibold text-slate-700">
              <span>Authorized Share URL:</span>
              <a
                href={shareableUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-[11px]"
              >
                <span>Test Page</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="font-mono text-[11px] text-slate-500 break-all select-all">
              {shareableUrl}
            </div>
          </div>

          {/* Actions */}
          <div className="w-full flex gap-2">
            {shareRecord?.isRevoked ? (
              <button
                onClick={handleRegenerate}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Issue New Active Token</span>
              </button>
            ) : (
              <button
                onClick={handleRevoke}
                className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-xl border border-rose-200 flex items-center justify-center gap-2"
              >
                <Ban className="w-4 h-4" />
                <span>Revoke Access Immediately</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Ephemeral Controls & Scopes */}
        <div className="lg:col-span-7 space-y-6">
          {/* Expiration Settings */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Clock className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-sm">Token Expiration Window</h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {[
                { label: '15 Minutes', minutes: 15 },
                { label: '1 Hour', minutes: 60 },
                { label: '24 Hours', minutes: 1440 },
                { label: '7 Days', minutes: 10080 }
              ].map((opt) => (
                <button
                  key={opt.minutes}
                  type="button"
                  onClick={() => {
                    setExpiryMinutes(opt.minutes);
                    handleRegenerate();
                  }}
                  className={`py-2 px-3 rounded-xl border font-semibold transition-all ${
                    expiryMinutes === opt.minutes
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                When the expiration window elapses, the token is permanently invalidated. Anyone scanning the QR code thereafter will be greeted with a secure link revocation notice.
              </p>
            </div>
          </div>

          {/* Minimal Data Sharing Guarantee */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm">Protected Information Scope</h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                DATA MINIMIZATION ENFORCED
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">Critical Emergency Demographics</span>
                  <span className="text-slate-500 text-[11px]">
                    Patient name, MRN, Blood Group ({user?.bloodGroup || user?.bloodType || 'O+'}), Allergies
                  </span>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">Designated Emergency Contacts</span>
                  <span className="text-slate-500 text-[11px]">
                    {user?.emergencyContacts?.length || 0} family / guardian contacts for emergency outreach
                  </span>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              </div>

              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 flex items-center justify-between text-rose-900">
                <div>
                  <span className="font-bold block">Sensitive Private Health Data Excluded</span>
                  <span className="text-rose-800 text-[11px]">
                    Passwords, portal credentials, full billing history, and raw database IDs are NEVER encoded into QR codes.
                  </span>
                </div>
                <Lock className="w-4 h-4 text-rose-600 shrink-0" />
              </div>
            </div>
          </div>

          {/* Simulated Doctor Preview */}
          {showClinicianPreview && shareRecord && (
            <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-mono uppercase text-emerald-400 font-bold">
                  Doctor Screen Preview (/share/{shareRecord.token.substring(0, 12)}...)
                </span>
                <span className="text-[10px] text-slate-400">What the scanner sees</span>
              </div>

              <div className="flex items-center gap-3">
                <ProfileAvatar
                  name={patientName}
                  imageUrl={user?.profileImageUrl}
                  size="md"
                  className="ring-2 ring-slate-700"
                />
                <div>
                  <span className="font-bold text-sm block">{patientName}</span>
                  <span className="text-xs text-slate-400 font-mono">
                    ID: {patientIdCode} · Blood Group: {user?.bloodGroup || user?.bloodType || 'O+'}
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-300 bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                Allergies: {(user?.allergies || ['None reported']).join(', ')} · Emergency Contact: {user?.emergencyContacts?.[0]?.name || 'Registered family member'} ({user?.emergencyContacts?.[0]?.phone || 'Phone on file'})
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
