import React, { useState, useEffect } from 'react';
import { qrShareService } from '../../services/qrShareService';
import { PatientShareRecord } from '../../types';
import { ProfileAvatar } from '../common/ProfileAvatar';
import { formatIndianPhoneNumber, toDialablePhone } from '../../utils/phoneUtils';
import {
  ShieldCheck,
  AlertTriangle,
  Phone,
  Heart,
  Calendar,
  Clock,
  Lock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Activity,
  ArrowLeft
} from 'lucide-react';

interface QrScanSharePageProps {
  token: string;
  onNavigateHome?: () => void;
}

export const QrScanSharePage: React.FC<QrScanSharePageProps> = ({
  token,
  onNavigateHome
}) => {
  const [record, setRecord] = useState<PatientShareRecord | null>(null);
  const [errorStatus, setErrorStatus] = useState<'expired' | 'revoked' | 'not_found' | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    // Simulate slight token verification delay for authentic feedback
    const timer = setTimeout(() => {
      const res = qrShareService.validateAndGetRecord(token);
      if (res.isValid && res.record) {
        setRecord(res.record);
        setErrorStatus(null);
      } else {
        setRecord(null);
        setErrorStatus(res.reason || 'not_found');
      }
      setIsLoading(false);
    }, 250);

    return () => clearTimeout(timer);
  }, [token]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl max-w-md w-full text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center animate-pulse">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Verifying Security Token...</h2>
          <p className="text-xs text-slate-500">
            Enforcing zero-trust cryptographic token authorization and access rules.
          </p>
        </div>
      </div>
    );
  }

  // Error State: Expired, Revoked, or Invalid
  if (errorStatus || !record) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl max-w-md w-full text-center space-y-5">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center">
            <AlertCircle className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Link No Longer Available
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              This patient sharing link is no longer available. The token has{' '}
              {errorStatus === 'revoked'
                ? 'been revoked by the patient'
                : errorStatus === 'expired'
                ? 'expired past its authorized time window'
                : 'either expired or does not exist'}
              .
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-left text-[11px] font-mono text-slate-500 space-y-1">
            <div>Security Status: INVALID_OR_REVOKED_TOKEN</div>
            <div className="truncate">Token: {token}</div>
            <div>Enforcement: Zero-Trust Strict Expiration</div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => (onNavigateHome ? onNavigateHome() : (window.location.href = '/'))}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Medical AI Home</span>
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-slate-400">
          Medical AI Cryptographic Access Gate · HIPAA Privacy Standard
        </div>
      </div>
    );
  }

  const primaryContact = record.emergencyContacts.find((c) => c.isPrimary) || record.emergencyContacts[0];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-lg bg-white rounded-3xl border-2 border-slate-900 shadow-2xl overflow-hidden">
        {/* Verification Strip */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-mono tracking-widest uppercase text-emerald-400 font-semibold leading-none">
                VERIFIED SHARE TOKEN
              </div>
              <div className="text-xs font-bold tracking-tight text-white mt-0.5">
                Medical AI Secure Handoff
              </div>
            </div>
          </div>

          <span className="text-[10px] font-mono text-slate-400">
            Expires: {new Date(record.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Patient Overview Banner */}
          <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
            <ProfileAvatar
              name={record.patientName}
              imageUrl={record.profileImageUrl}
              size="xl"
              className="ring-4 ring-slate-100 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight truncate">
                  {record.patientName}
                </h1>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase rounded-md border border-emerald-200 shrink-0">
                  Authorized
                </span>
              </div>
              <div className="text-xs font-mono text-slate-500 mt-1">
                Patient ID: <strong className="text-slate-800">{record.patientIdCode}</strong>
              </div>
              {record.dateOfBirth && (
                <div className="text-xs text-slate-500 mt-0.5">
                  DOB: <span className="font-mono text-slate-700">{record.dateOfBirth}</span>
                </div>
              )}
            </div>
          </div>

          {/* Critical Triage Identifiers */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 bg-blue-50/60 rounded-2xl border border-blue-200/80">
              <span className="text-[10px] font-mono uppercase text-blue-700 tracking-wider block font-semibold">
                BLOOD GROUP
              </span>
              <span className="text-lg font-black text-blue-900 flex items-center gap-1.5 mt-0.5">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                <span>{record.bloodGroup || 'Not provided'}</span>
              </span>
            </div>

            <div className="p-3.5 bg-amber-50/60 rounded-2xl border border-amber-200/80">
              <span className="text-[10px] font-mono uppercase text-amber-800 tracking-wider block font-semibold">
                DOCUMENTED ALLERGIES
              </span>
              <div className="mt-1 flex flex-wrap gap-1">
                {record.allergies.length > 0 ? (
                  record.allergies.map((al, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-white text-rose-700 border border-rose-200 rounded text-xs font-semibold"
                    >
                      {al}
                    </span>
                  ))
                ) : (
                  <span className="text-xs font-semibold text-slate-700">None reported</span>
                )}
              </div>
            </div>
          </div>

          {/* Emergency Contacts */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Emergency Contacts</span>
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                {record.emergencyContacts.length} Registered
              </span>
            </div>

            {record.emergencyContacts.length > 0 ? (
              <div className="space-y-2">
                {record.emergencyContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-900 flex items-center gap-2">
                        <span>{contact.name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                          {contact.relationship}
                        </span>
                        {contact.isPrimary && (
                          <span className="text-[10px] px-1.5 py-0.2 bg-rose-100 text-rose-800 rounded font-semibold">
                            Primary
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                        {formatIndianPhoneNumber(contact.phone)}
                      </div>
                    </div>

                    <a
                      href={`tel:${toDialablePhone(contact.phone)}`}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold flex items-center gap-1 text-xs transition-colors shrink-0"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call</span>
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">No emergency contacts configured for sharing.</p>
            )}
          </div>

          {/* Important Medical Notes */}
          {record.importantMedicalNotes && (
            <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-200/60 text-xs space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-800 font-bold flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" />
                <span>Selected Clinical Notes</span>
              </span>
              <p className="text-slate-800 leading-relaxed font-medium">
                {record.importantMedicalNotes}
              </p>
            </div>
          )}

          {/* Trust Banner */}
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs text-emerald-900">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">Shared securely through Medical AI</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-700">READ-ONLY</span>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <span>Protected by Ephemeral Access Control</span>
          <button
            onClick={() => (onNavigateHome ? onNavigateHome() : (window.location.href = '/'))}
            className="text-blue-600 hover:underline font-semibold"
          >
            Medical AI Platform
          </button>
        </div>
      </div>
    </div>
  );
};
