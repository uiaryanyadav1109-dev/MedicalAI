import React from 'react';
import { DOCTOR_CREDENTIALS } from '../../data/doctorCredentials';
import { Twitter, Facebook, Instagram, Linkedin } from 'lucide-react';
import { RoutePath } from '../../types';

interface MedilabDoctorsSectionProps {
  onNavigate?: (route: RoutePath) => void;
}

export const MedilabDoctorsSection: React.FC<MedilabDoctorsSectionProps> = ({ onNavigate }) => {
  // Use first 4 doctors
  const doctors = DOCTOR_CREDENTIALS.slice(0, 4);

  return (
    <section id="doctors" className="py-20 bg-[#f1f7fd] dark:bg-[#0c1626] border-b border-[#DCE6EF] dark:border-[#1E2E47]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-[#1977cc] dark:text-[#38BDF8]">
            Doctors
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#194376] dark:text-white mt-1">
            Attending Medical Specialists
          </h2>
          <div className="w-16 h-1 bg-[#1977cc] mx-auto my-4 rounded-full" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Certified attending physicians providing oversight, clinical verification, and high-urgency escalation pathways.
          </p>
        </div>

        {/* 4 Doctors Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {doctors.map((doc) => (
            <div
              key={doc.id}
              className="bg-white dark:bg-[#132238] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 border border-slate-200/80 dark:border-slate-800 flex flex-col group"
            >
              <div className="relative overflow-hidden h-72 bg-slate-100 dark:bg-slate-900">
                <img
                  src={doc.avatarUrl || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=600'}
                  alt={doc.name}
                  className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=600';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4 gap-3 text-white">
                  <span className="p-2 rounded-full bg-white/20 hover:bg-[#1977cc] transition-colors cursor-pointer">
                    <Twitter className="w-4 h-4" />
                  </span>
                  <span className="p-2 rounded-full bg-white/20 hover:bg-[#1977cc] transition-colors cursor-pointer">
                    <Facebook className="w-4 h-4" />
                  </span>
                  <span className="p-2 rounded-full bg-white/20 hover:bg-[#1977cc] transition-colors cursor-pointer">
                    <Instagram className="w-4 h-4" />
                  </span>
                  <span className="p-2 rounded-full bg-white/20 hover:bg-[#1977cc] transition-colors cursor-pointer">
                    <Linkedin className="w-4 h-4" />
                  </span>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[#194376] dark:text-white">
                    {doc.name}
                  </h3>
                  <p className="text-xs font-semibold text-[#1977cc] dark:text-[#38BDF8] mt-0.5">
                    {doc.badge} &bull; {doc.specialty.split('&')[0].trim()}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2.5 line-clamp-3 leading-relaxed">
                    {doc.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
                  <span>{doc.hospitalAffiliation.split(' ')[0]} Hospital</span>
                  {onNavigate && (
                    <button
                      type="button"
                      onClick={() => onNavigate('/doctors')}
                      className="text-[#1977cc] dark:text-[#38BDF8] hover:underline font-semibold"
                    >
                      Profile &rarr;
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MedilabDoctorsSection;
