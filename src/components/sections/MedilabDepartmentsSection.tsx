import React, { useState } from 'react';

interface DepartmentData {
  id: string;
  name: string;
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
}

const DEPARTMENTS: DepartmentData[] = [
  {
    id: 'cardiology',
    name: 'Cardiology',
    title: 'Comprehensive Cardiovascular Care & Acute Telemetry',
    subtitle: 'Qui laudantium consequatur laborum sit qui ad sapiente dila parde sonata raqer a videna mareta paulona marka',
    description: 'Our Cardiology unit integrates advanced AI-assisted ECG arrhythmia detection, telemetry monitoring, and rapid intervention protocols for acute coronary syndrome. Attending cardiologists oversee every emergency case with direct cath lab access.',
    imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'neurology',
    name: 'Neurology',
    title: 'Neurovascular Assessment & Critical Neurological Care',
    subtitle: 'Ea ipsum voluptatem consequatur quis est. Illum error ullam omnis quia et reiciendis sunt sunt est',
    description: 'Neurological intelligence unit specializes in acute ischemic stroke evaluation, seizure classification, and continuous cognitive monitoring. Features automated NIHSS scoring tools for attending neurocritical teams.',
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'hepatology',
    name: 'Hepatology',
    title: 'Gastroenterology, Liver Health & Metabolic Diagnostics',
    subtitle: 'Autem ipsum nam porro corporis rerum. Quis eos dolorem eos itaque inventore commodi labore',
    description: 'Dedicated to complex hepatic disorders, acute pancreatitis, and gastrointestinal conditions. Integrates automated hepatic function panel analysis and ultrasound-guided differential diagnostics.',
    imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'pediatrics',
    name: 'Pediatrics',
    title: 'Pediatric Care, Neonatology & Child Wellness',
    subtitle: 'Omnis blanditiis saepe eos autem qui sunt debitis porro quia. Exercitationem nostrum omnis',
    description: 'Child-centric medical department led by board-certified pediatricians. Designed with age-adjusted vital sign ranges, pediatric triage calculators, and warm family-focused examination suites.',
    imageUrl: 'https://images.unsplash.com/photo-1594824813583-4a11707d727b?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'ophthalmology',
    name: 'Eye Care & Ophthalmology',
    title: 'Advanced Ophthalmology & Retinal Imaging Diagnostics',
    subtitle: 'Rerum et voluptatibus alias architecto ipsum omnis corporis laborum. Esse consequuntur alias labore',
    description: 'State-of-the-art ophthalmological care providing automated fundus photography assessment, diabetic retinopathy screening, and precision microsurgical treatment planning.',
    imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'
  }
];

export const MedilabDepartmentsSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('cardiology');
  const activeDept = DEPARTMENTS.find((d) => d.id === activeTab) || DEPARTMENTS[0];

  return (
    <section id="departments" className="py-20 bg-white dark:bg-[#0B1320] border-b border-[#DCE6EF] dark:border-[#1E2E47]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-[#1977cc] dark:text-[#38BDF8]">
            Departments
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#194376] dark:text-white mt-1">
            Clinical Departments
          </h2>
          <div className="w-16 h-1 bg-[#1977cc] mx-auto my-4 rounded-full" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Specialized medical divisions staffed by board-certified practitioners and powered by continuous clinical intelligence.
          </p>
        </div>

        {/* Tabbed Layout: Left vertical tabs, Right content & photo */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left: Department Nav Tabs */}
          <div className="lg:col-span-3 space-y-1 border-r-0 lg:border-r border-slate-200 dark:border-slate-800 pr-0 lg:pr-4">
            {DEPARTMENTS.map((dept) => {
              const isActive = dept.id === activeTab;
              return (
                <button
                  key={dept.id}
                  type="button"
                  onClick={() => setActiveTab(dept.id)}
                  className={`w-full text-left px-5 py-3.5 rounded-lg text-sm font-semibold transition-all cursor-pointer flex items-center justify-between ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-[#1977cc] dark:text-[#38BDF8] border-l-4 border-[#1977cc]'
                      : 'text-slate-600 dark:text-slate-400 hover:text-[#1977cc] hover:bg-slate-50 dark:hover:bg-slate-900/50'
                  }`}
                >
                  <span>{dept.name}</span>
                </button>
              );
            })}
          </div>

          {/* Right: Department Details + Image */}
          <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-7 space-y-4">
              <h3 className="text-2xl font-bold text-[#194376] dark:text-white">
                {activeDept.title}
              </h3>
              <p className="text-sm italic text-slate-500 dark:text-slate-400 border-l-2 border-[#1977cc] pl-3 py-0.5">
                {activeDept.subtitle}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {activeDept.description}
              </p>
            </div>

            <div className="md:col-span-5">
              <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800">
                <img
                  src={activeDept.imageUrl}
                  alt={activeDept.name}
                  className="w-full h-64 object-cover transition-transform duration-500 hover:scale-105"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MedilabDepartmentsSection;
