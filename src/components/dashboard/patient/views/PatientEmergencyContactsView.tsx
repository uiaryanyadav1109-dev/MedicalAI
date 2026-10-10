import React, { useState } from 'react';
import { RoutePath, EmergencyContact } from '../../../../types';
import { useAuth } from '../../../../context/AuthContext';
import { formatIndianPhoneNumber, toDialablePhone } from '../../../../utils/phoneUtils';
import {
  Users,
  Plus,
  Phone,
  Mail,
  ShieldCheck,
  AlertTriangle,
  Edit2,
  Trash2,
  CheckCircle2,
  Star,
  X,
  MessageSquare,
  ShieldAlert
} from 'lucide-react';

export const PatientEmergencyContactsView: React.FC<{
  onNavigate: (route: RoutePath) => void;
}> = ({ onNavigate }) => {
  const { user, addEmergencyContact, updateEmergencyContact, deleteEmergencyContact } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState<EmergencyContact['relationship']>('Mother');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [preferredMethod, setPreferredMethod] = useState<'sms' | 'phone' | 'email'>('sms');
  const [priority, setPriority] = useState<number>(1);
  const [isPrimary, setIsPrimary] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [feedbackNote, setFeedbackNote] = useState<string | null>(null);

  const contacts = user?.emergencyContacts || [];

  const openAddModal = () => {
    setEditingId(null);
    setName('');
    setRelationship('Mother');
    setPhone('');
    setEmail('');
    setPreferredMethod('sms');
    setPriority(contacts.length + 1);
    setIsPrimary(contacts.length === 0);
    setIsActive(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (contact: EmergencyContact) => {
    setEditingId(contact.id);
    setName(contact.name);
    setRelationship(contact.relationship);
    setPhone(contact.phone);
    setEmail(contact.email || '');
    setPreferredMethod(contact.preferredMethod || 'phone');
    setPriority(contact.priority || (contact.isPrimary ? 1 : 2));
    setIsPrimary(contact.isPrimary);
    setIsActive(contact.isActive);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setFormError('Please provide both contact name and phone number.');
      return;
    }

    const normalizedPhone = formatIndianPhoneNumber(phone);
    if (editingId) {
      updateEmergencyContact(editingId, {
        name: name.trim(),
        relationship,
        phone: normalizedPhone,
        email: email.trim() || undefined,
        preferredMethod,
        priority,
        isPrimary,
        isActive
      });
      setFeedbackNote(`Updated emergency contact: ${name.trim()}`);
    } else {
      addEmergencyContact({
        name: name.trim(),
        relationship,
        phone: normalizedPhone,
        email: email.trim() || undefined,
        preferredMethod,
        priority,
        isPrimary,
        isActive
      });
      setFeedbackNote(`Added emergency contact: ${name.trim()}`);
    }

    setIsModalOpen(false);
    setTimeout(() => setFeedbackNote(null), 3500);
  };

  const handleDelete = (id: string, contactName: string) => {
    if (confirm(`Remove ${contactName} from your emergency contacts?`)) {
      deleteEmergencyContact(id);
      setFeedbackNote(`Removed ${contactName} from emergency contacts.`);
      setTimeout(() => setFeedbackNote(null), 3500);
    }
  };

  const toggleActiveStatus = (contact: EmergencyContact) => {
    updateEmergencyContact(contact.id, { isActive: !contact.isActive });
    setFeedbackNote(`${contact.name} is now ${!contact.isActive ? 'active' : 'inactive'}.`);
    setTimeout(() => setFeedbackNote(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase text-rose-700 dark:text-rose-400">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span>Emergency Preparedness · Family & Guardian Registry</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-1">
            Emergency Contacts
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Designated responders alerted during Emergency SOS activations and clinical escalation.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Emergency Contact</span>
        </button>
      </div>

      {feedbackNote && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{feedbackNote}</span>
        </div>
      )}

      {/* Safety Advisory Banner */}
      <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200/80 dark:border-amber-900/40 flex items-start gap-3 transition-colors">
        <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-0.5">
          <span className="font-bold text-amber-900 dark:text-amber-300">Privacy & Authority Notice</span>
          <p className="text-amber-800 dark:text-amber-200 leading-relaxed">
            Only add people you trust to receive your emergency medical alerts and device coordinates.
            Coordinates are only retrieved and transmitted when you explicitly trigger Emergency SOS.
          </p>
        </div>
      </div>

      {/* Contacts List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contacts.map((contact, index) => (
          <div
            key={contact.id}
            className={`p-5 rounded-2xl border transition-all ${
              contact.isActive
                ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs'
                : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 text-xs font-bold flex items-center justify-center font-mono">
                  {index + 1}
                </span>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">{contact.name}</h4>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    {contact.relationship}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-mono font-bold rounded-md border border-slate-200 dark:border-slate-700">
                  Priority {contact.priority || (contact.isPrimary ? 1 : 2)}
                </span>
                {contact.isPrimary && (
                  <span className="px-2 py-0.5 bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 text-[10px] font-bold uppercase rounded-md border border-rose-200 dark:border-rose-900/60 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-rose-600 text-rose-600" />
                    <span>Primary</span>
                  </span>
                )}
                {!contact.isPrimary && (
                  <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-medium rounded-md">
                    Secondary
                  </span>
                )}
              </div>
            </div>

            <div className="mt-4 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                <span className="text-slate-400 dark:text-slate-500 text-[11px]">Telephone</span>
                <a
                  href={`tel:${toDialablePhone(contact.phone)}`}
                  className="font-mono font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1"
                >
                  <Phone className="w-3 h-3" />
                  <span>{formatIndianPhoneNumber(contact.phone)}</span>
                </a>
              </div>

              {contact.email && (
                <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                  <span className="text-slate-400 dark:text-slate-500 text-[11px]">Email</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200 truncate max-w-[170px]">
                    {contact.email}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                <span className="text-slate-400 dark:text-slate-500 text-[11px]">Channel</span>
                <span className="font-mono text-slate-600 dark:text-slate-300 uppercase text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">
                  {contact.preferredMethod}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => toggleActiveStatus(contact)}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  contact.isActive
                    ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
                    : 'text-slate-600 dark:text-slate-400 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                {contact.isActive ? 'Active Responder' : 'Inactive'}
              </button>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => openEditModal(contact)}
                  className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                  title="Edit Contact"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(contact.id, contact.name)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg cursor-pointer"
                  title="Remove Contact"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {contacts.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 space-y-3">
            <Users className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">No Emergency Contacts Configured</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Please register at least one primary family member, guardian, or emergency contact.
            </p>
            <button
              onClick={openAddModal}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl cursor-pointer"
            >
              Add First Contact
            </button>
          </div>
        )}
      </div>

      {/* Add / Edit Contact Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 transition-colors">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                <h4 className="font-bold text-slate-900 dark:text-white text-base">
                  {editingId ? 'Edit Emergency Contact' : 'Add Emergency Contact'}
                </h4>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveContact} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Contact Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sunita Yadav"
                  required
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Relationship</label>
                  <select
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  >
                    <option value="Mother">Mother</option>
                    <option value="Father">Father</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Brother">Brother</option>
                    <option value="Sister">Sister</option>
                    <option value="Child">Child</option>
                    <option value="Guardian">Guardian</option>
                    <option value="Physician">Physician</option>
                    <option value="Friend">Friend</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    required
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address (Optional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@example.com"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Response Priority Level</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                >
                  <option value={1}>Priority 1 — Immediate Dispatch (Primary)</option>
                  <option value={2}>Priority 2 — Secondary Responder</option>
                  <option value={3}>Priority 3 — Tertiary / General Family</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Preferred Channel</label>
                <select
                  value={preferredMethod}
                  onChange={(e) => setPreferredMethod(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                >
                  <option value="sms">SMS Text Alert</option>
                  <option value="phone">Direct Phone Call</option>
                  <option value="email">Email Notification</option>
                </select>
              </div>

              <div className="pt-2 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPrimary}
                    onChange={(e) => setIsPrimary(e.target.checked)}
                    className="w-4 h-4 text-rose-600 rounded"
                  />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Set as Primary Emergency Contact</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span className="text-slate-700 dark:text-slate-300">Active (Receive automated SOS notifications)</span>
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl shadow-xs cursor-pointer"
                >
                  {editingId ? 'Save Changes' : 'Add Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
