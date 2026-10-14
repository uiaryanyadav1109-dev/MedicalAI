import React from 'react';
import { UserCheck, Building2, FlaskConical, Award } from 'lucide-react';

interface StatItem {
  value: string;
  label: string;
  icon: React.ElementType;
}

const STATS: StatItem[] = [
  { value: '85', label: 'Doctors', icon: UserCheck },
  { value: '18', label: 'Departments', icon: Building2 },
  { value: '12', label: 'Research Labs', icon: FlaskConical },
  { value: '150', label: 'Awards', icon: Award }
];

export const MedilabStatsSection: React.FC = () => {
  return (
    <section className="py-14 bg-[#f1f7fd] dark:bg-[#0c1626] border-y border-[#DCE6EF] dark:border-[#1E2E47]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
          {STATS.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-[#132238] p-6 lg:p-8 rounded-xl shadow-sm border border-slate-200/70 dark:border-slate-800 text-center flex flex-col items-center justify-center transition-transform hover:-translate-y-1 hover:shadow-md"
              >
                <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-950/70 text-[#1977cc] dark:text-[#38BDF8] flex items-center justify-center mb-3">
                  <Icon className="w-7 h-7" />
                </div>
                <div className="text-3xl lg:text-4xl font-extrabold text-[#194376] dark:text-white tracking-tight">
                  {stat.value}
                </div>
                <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default MedilabStatsSection;
