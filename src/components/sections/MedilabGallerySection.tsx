import React from 'react';

const GALLERY_IMAGES = [
  {
    url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=600&q=80',
    title: 'Diagnostic Patient Consultation'
  },
  {
    url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80',
    title: 'Physician Multidisciplinary Review'
  },
  {
    url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80',
    title: 'Intensive Care Unit & Telemetry'
  },
  {
    url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80',
    title: 'Inpatient Recovery Wing'
  },
  {
    url: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80',
    title: 'Surgical Theater & Sterile Suite'
  },
  {
    url: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=600&q=80',
    title: 'Clinical Laboratory & Pathology'
  },
  {
    url: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=600&q=80',
    title: 'Advanced Diagnostic Imaging'
  },
  {
    url: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=600&q=80',
    title: 'Clinical Care & Triage Assessment'
  }
];

export const MedilabGallerySection: React.FC = () => {
  return (
    <section id="gallery" className="py-20 bg-white dark:bg-[#0B1320] border-b border-[#DCE6EF] dark:border-[#1E2E47]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-[#1977cc] dark:text-[#38BDF8]">
            Gallery
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#194376] dark:text-white mt-1">
            Clinical Facilities & Technology
          </h2>
          <div className="w-16 h-1 bg-[#1977cc] mx-auto my-4 rounded-full" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            A glimpse inside our accredited hospital networks, cutting-edge telemetry hubs, and care environments.
          </p>
        </div>

        {/* 8 Images in 4 Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {GALLERY_IMAGES.map((img, idx) => (
            <div
              key={idx}
              className="relative overflow-hidden rounded-xl group aspect-[4/3] bg-slate-100 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm"
            >
              <img
                src={img.url}
                alt={img.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=600&q=80';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <span className="text-xs font-semibold text-white drop-shadow-sm">
                  {img.title}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MedilabGallerySection;
