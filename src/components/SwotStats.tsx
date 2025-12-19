import { BarChart3 } from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { Database } from '../lib/supabase';
import { motion } from 'framer-motion';

type SwotItem = Database['public']['Tables']['swot_items']['Row'];

type SwotStatsProps = {
  items: SwotItem[];
};

export default function SwotStats({ items }: SwotStatsProps) {
  const isDarkMode = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

  const stats = {
    strength: items.filter((i) => i.category === 'strength').length,
    weakness: items.filter((i) => i.category === 'weakness').length,
    opportunity: items.filter((i) => i.category === 'opportunity').length,
    threat: items.filter((i) => i.category === 'threat').length,
  };

  const total = Object.values(stats).reduce((a, b) => a + b, 0);

  const data = [
    { subject: 'Forces', A: stats.strength, fullMark: total, fill: '#15803d' },
    { subject: 'Opportunités', A: stats.opportunity, fullMark: total, fill: '#1d4ed8' },
    { subject: 'Menaces', A: stats.threat, fullMark: total, fill: '#c2410c' },
    { subject: 'Faiblesses', A: stats.weakness, fullMark: total, fill: '#b91c1c' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-panel p-6 mb-8 rounded-xl dark:bg-slate-900/60 transition-colors duration-300"
    >
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <h3 className="text-lg font-bold text-gray-800 dark:text-white">Analyse d'équilibre</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
              <PolarGrid stroke={isDarkMode ? "#334155" : "#e5e7eb"} />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: isDarkMode ? '#94a3b8' : '#4b5563', fontSize: 12, fontWeight: 500 }}
              />
              <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
              <Radar
                name="Points"
                dataKey="A"
                stroke="#3b82f6"
                strokeWidth={3}
                fill="#3b82f6"
                fillOpacity={0.3}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  color: isDarkMode ? '#f8fafc' : '#1f2937'
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-green-50/80 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800/30 flex flex-col items-center justify-center text-center transition-transform hover:scale-105">
            <p className="text-sm text-green-700 dark:text-green-400 font-bold mb-1">Forces</p>
            <p className="text-3xl font-black text-green-600 dark:text-green-500">{stats.strength}</p>
          </div>

          <div className="p-4 bg-red-50/80 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800/30 flex flex-col items-center justify-center text-center transition-transform hover:scale-105">
            <p className="text-sm text-red-700 dark:text-red-400 font-bold mb-1">Faiblesses</p>
            <p className="text-3xl font-black text-red-600 dark:text-red-500">{stats.weakness}</p>
          </div>

          <div className="p-4 bg-blue-50/80 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/30 flex flex-col items-center justify-center text-center transition-transform hover:scale-105">
            <p className="text-sm text-blue-700 dark:text-blue-400 font-bold mb-1">Opportunités</p>
            <p className="text-3xl font-black text-blue-600 dark:text-blue-500">{stats.opportunity}</p>
          </div>

          <div className="p-4 bg-orange-50/80 dark:bg-orange-900/20 rounded-xl border border-orange-100 dark:border-orange-800/30 flex flex-col items-center justify-center text-center transition-transform hover:scale-105">
            <p className="text-sm text-orange-700 dark:text-orange-400 font-bold mb-1">Menaces</p>
            <p className="text-3xl font-black text-orange-600 dark:text-orange-500">{stats.threat}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
          <div>
            <p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Puissance Interne</p>
            <p className="text-lg font-bold text-gray-800 dark:text-white">
              {stats.strength > stats.weakness ? 'Dominant' : stats.strength === stats.weakness ? 'Équilibré' : 'Fragile'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
              {Math.max(0, Math.min(100, Math.round((stats.strength / (stats.strength + stats.weakness || 1)) * 100)))}%
            </div>
            <p className="text-[10px] text-gray-400">Score de force</p>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
          <div>
            <p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Potentiel Externe</p>
            <p className="text-lg font-bold text-gray-800 dark:text-white">
              {stats.opportunity > stats.threat ? 'Elevé' : stats.opportunity === stats.threat ? 'Modéré' : 'Risqué'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-cyan-600 dark:text-cyan-400">
              {Math.max(0, Math.min(100, Math.round((stats.opportunity / (stats.opportunity + stats.threat || 1)) * 100)))}%
            </div>
            <p className="text-[10px] text-gray-400">Score de potentiel</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
