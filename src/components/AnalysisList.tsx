import { Plus, FileText, Trash2, Calendar } from 'lucide-react';
import { useState } from 'react';

type Analysis = {
  id: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
};

type AnalysisListProps = {
  analyses: Analysis[];
  currentAnalysisId: string | null;
  onSelect: (id: string) => void;
  onCreate: (title: string, description: string) => void;
  onDelete: (id: string) => void;
  onLoadExample: () => void;
};

export default function AnalysisList({
  analyses,
  currentAnalysisId,
  onSelect,
  onCreate,
  onDelete,
  onLoadExample,
}: AnalysisListProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const handleCreate = () => {
    if (newTitle.trim()) {
      onCreate(newTitle.trim(), newDescription.trim());
      setNewTitle('');
      setNewDescription('');
      setIsCreating(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-slate-800 transition-colors duration-300">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Mes Analyses</h2>
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-md"
          >
            <Plus className="w-4 h-4" />
            Nouvelle analyse
          </button>
        </div>
        <button
          onClick={onLoadExample}
          className="w-full py-2 text-sm text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition flex items-center justify-center gap-2"
        >
          <FileText className="w-4 h-4" />
          Charger un exemple (Tesla)
        </button>
      </div>

      {isCreating && (
        <div className="mb-6 p-4 border-2 border-blue-200 dark:border-blue-900/30 rounded-lg bg-blue-50 dark:bg-blue-900/10">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Titre de l'analyse"
            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg mb-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white"
            autoFocus
          />
          <textarea
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="Description (optionnelle)"
            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg mb-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none dark:text-white"
            rows={2}
          />
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Créer
            </button>
            <button
              onClick={() => {
                setIsCreating(false);
                setNewTitle('');
                setNewDescription('');
              }}
              className="px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-slate-800 dark:text-gray-300 transition"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {analyses.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-slate-400">
          <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>Aucune analyse créée</p>
          <p className="text-sm mt-2">Créez votre première analyse SWOT</p>
        </div>
      ) : (
        <div className="space-y-3">
          {analyses.map((analysis) => (
            <div
              key={analysis.id}
              className={`p-4 rounded-lg border-2 transition cursor-pointer group ${currentAnalysisId === analysis.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-900 hover:bg-gray-50 dark:hover:bg-slate-800/50'
                }`}
              onClick={() => onSelect(analysis.id)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-1">{analysis.title}</h3>
                  {analysis.description && (
                    <p className="text-sm text-gray-600 dark:text-slate-400 mb-2 truncate">{analysis.description}</p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-500">
                    <Calendar className="w-3 h-3" />
                    {formatDate(analysis.created_at)}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Supprimer cette analyse ?')) {
                      onDelete(analysis.id);
                    }
                  }}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 transition p-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
