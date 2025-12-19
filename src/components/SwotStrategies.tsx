import { Plus, Trash2, Lightbulb } from 'lucide-react';
import { useState } from 'react';

type Strategy = {
  id: string;
  type: 'SO' | 'WO' | 'ST' | 'WT';
  description: string;
};

type SwotStrategiesProps = {
  strategies: Strategy[];
  onAddStrategy: (type: Strategy['type'], description: string) => void;
  onDeleteStrategy: (id: string) => void;
};

const strategyTypes = {
  SO: {
    label: 'Maxi-Maxi',
    title: 'Forces + Opportunités',
    color: 'text-green-700 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-900/10',
    borderColor: 'border-green-200 dark:border-green-800/30',
    description: 'Stratégies de croissance en exploitant nos forces pour saisir les opportunités',
  },
  WO: {
    label: 'Mini-Maxi',
    title: 'Faiblesses + Opportunités',
    color: 'text-blue-700 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-900/10',
    borderColor: 'border-blue-200 dark:border-blue-800/30',
    description: 'Stratégies de développement en corrigeant les faiblesses pour profiter des opportunités',
  },
  ST: {
    label: 'Maxi-Mini',
    title: 'Forces + Menaces',
    color: 'text-orange-700 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-900/10',
    borderColor: 'border-orange-200 dark:border-orange-800/30',
    description: 'Stratégies de défense en utilisant nos forces pour neutraliser les menaces',
  },
  WT: {
    label: 'Mini-Mini',
    title: 'Faiblesses + Menaces',
    color: 'text-red-700 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-900/10',
    borderColor: 'border-red-200 dark:border-red-800/30',
    description: 'Stratégies de survie pour réduire les faiblesses et éviter les menaces',
  },
};

type StrategyType = keyof typeof strategyTypes;

function StrategyCard({
  type,
  strategies,
  onAddStrategy,
  onDeleteStrategy,
}: {
  type: StrategyType;
  strategies: Strategy[];
  onAddStrategy: (description: string) => void;
  onDeleteStrategy: (id: string) => void;
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [newStrategy, setNewStrategy] = useState('');
  const config = strategyTypes[type];

  const handleAdd = () => {
    if (newStrategy.trim()) {
      onAddStrategy(newStrategy.trim());
      setNewStrategy('');
      setIsAdding(false);
    }
  };

  return (
    <div className={`${config.bgColor} border-2 ${config.borderColor} rounded-xl p-5 dark:bg-slate-900/40 transition-all duration-300`}>
      <div className="mb-3">
        <span className={`inline-block text-xs font-bold ${config.color} bg-white dark:bg-slate-800 px-2 py-1 rounded-full mb-2`}>
          {config.label}
        </span>
        <h4 className={`text-lg font-bold ${config.color}`}>{config.title}</h4>
        <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">{config.description}</p>
      </div>

      <div className="space-y-2 mb-3">
        {strategies.map((strategy) => (
          <div
            key={strategy.id}
            className="bg-white dark:bg-slate-800 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-slate-700 group hover:shadow-md transition flex items-start justify-between gap-2"
          >
            <p className="text-sm text-gray-700 dark:text-gray-300 flex-1">{strategy.description}</p>
            <button
              onClick={() => onDeleteStrategy(strategy.id)}
              className="opacity-0 group-hover:opacity-100 text-gray-400 dark:text-slate-500 hover:text-red-600 transition flex-shrink-0"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {strategies.length === 0 && !isAdding && (
          <p className="text-xs text-gray-400 dark:text-slate-500 italic text-center py-2">
            Aucune stratégie définie
          </p>
        )}
      </div>

      {isAdding ? (
        <div className="space-y-2">
          <textarea
            value={newStrategy}
            onChange={(e) => setNewStrategy(e.target.value)}
            placeholder="Décrivez la stratégie..."
            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none dark:text-white"
            rows={2}
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
            >
              Ajouter
            </button>
            <button
              onClick={() => {
                setIsAdding(false);
                setNewStrategy('');
              }}
              className="px-3 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition"
            >
              Annuler
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center justify-center gap-2 w-full py-2 border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 hover:bg-white dark:hover:bg-slate-800 transition text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm"
        >
          <Plus className="w-4 h-4" />
          Ajouter une stratégie
        </button>
      )}
    </div>
  );
}

export default function SwotStrategies({
  strategies,
  onAddStrategy,
  onDeleteStrategy,
}: SwotStrategiesProps) {
  const getStrategiesByType = (type: StrategyType) =>
    strategies.filter((s) => s.type === type);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-slate-800 transition-colors duration-300">
      <div className="flex items-center gap-2 mb-6">
        <Lightbulb className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Stratégies</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {(Object.keys(strategyTypes) as StrategyType[]).map((type) => (
          <StrategyCard
            key={type}
            type={type}
            strategies={getStrategiesByType(type)}
            onAddStrategy={(description) => onAddStrategy(type, description)}
            onDeleteStrategy={onDeleteStrategy}
          />
        ))}
      </div>
    </div>
  );
}
