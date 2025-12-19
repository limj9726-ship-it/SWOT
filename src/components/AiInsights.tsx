import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, TrendingUp, AlertTriangle, Target, Zap } from 'lucide-react';

interface SwotItem {
    category: 'strength' | 'weakness' | 'opportunity' | 'threat';
    content: string;
}

interface AiInsightsProps {
    items: SwotItem[];
}

const AiInsights: React.FC<AiInsightsProps> = ({ items }) => {
    const insights = useMemo(() => {
        const counts = {
            strength: items.filter(i => i.category === 'strength').length,
            weakness: items.filter(i => i.category === 'weakness').length,
            opportunity: items.filter(i => i.category === 'opportunity').length,
            threat: items.filter(i => i.category === 'threat').length,
        };

        const recommendations = [];

        // Strategic Logic
        if (counts.strength > counts.weakness && counts.opportunity > counts.threat) {
            recommendations.push({
                type: 'growth',
                title: 'Stratégie Offensive',
                description: 'Utilisez vos forces dominantes pour saisir les opportunités majeures. Le moment est idéal pour l\'expansion.',
                icon: TrendingUp,
                color: 'text-green-600 bg-green-50 dark:bg-green-900/20',
            });
        }

        if (counts.weakness > counts.strength) {
            recommendations.push({
                type: 'warning',
                title: 'Focus Interne Requis',
                description: 'Vos faiblesses surpassent vos forces. Priorisez la consolidation interne et la formation avant toute nouvelle initiative.',
                icon: AlertTriangle,
                color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20',
            });
        }

        if (counts.threat > counts.opportunity) {
            recommendations.push({
                type: 'defense',
                title: 'Posture Défensive',
                description: 'L\'environnement externe est risqué. Renforcez vos barrières à l\'entrée et diversifiez pour minimiser les impacts.',
                icon: Target,
                color: 'text-red-600 bg-red-50 dark:bg-red-900/20',
            });
        }

        if (items.length > 8) {
            recommendations.push({
                type: 'efficiency',
                title: 'Priorisation Nécessaire',
                description: 'Analyse dense. Identifiez les 3 points critiques par quadrant pour éviter la paralysie par l\'analyse.',
                icon: Zap,
                color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
            });
        }

        return recommendations;
    }, [items]);

    if (items.length === 0) return null;

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 border border-indigo-100 dark:border-indigo-900/30 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Sparkles className="w-24 h-24 text-indigo-600" />
            </div>

            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg">
                    <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">IA Insights Stratégiques</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence mode="popLayout">
                    {insights.map((insight, index) => (
                        <motion.div
                            key={insight.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: index * 0.1 }}
                            className={`p-4 rounded-xl border border-transparent hover:border-current transition-colors duration-300 ${insight.color}`}
                        >
                            <div className="flex items-start gap-3">
                                <insight.icon className="w-5 h-5 mt-1 shrink-0" />
                                <div>
                                    <h4 className="font-bold mb-1">{insight.title}</h4>
                                    <p className="text-sm opacity-90 leading-relaxed text-gray-700 dark:text-gray-300">
                                        {insight.description}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {insights.length === 0 && (
                <div className="text-center py-8 text-gray-500 italic">
                    Ajoutez plus d'éléments pour débloquer des analyses plus profondes...
                </div>
            )}
        </div>
    );
};

export default AiInsights;
