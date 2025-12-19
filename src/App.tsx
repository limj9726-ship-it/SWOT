import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import type { Database } from './lib/supabase';
import Auth from './components/Auth';
import AnalysisList from './components/AnalysisList';
import SwotMatrix from './components/SwotMatrix';
import SwotStats from './components/SwotStats';
import SwotStrategies from './components/SwotStrategies';
import ExportButton from './components/ExportButton';
import ThemeToggle from './components/ThemeToggle';
import AiInsights from './components/AiInsights';
import { LogOut, BarChart3, Plus, FileText } from 'lucide-react';

type SwotAnalysis = Database['public']['Tables']['swot_analyses']['Row'];
type SwotItem = Database['public']['Tables']['swot_items']['Row'];
type SwotStrategy = Database['public']['Tables']['swot_strategies']['Row'];

function App() {
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyses, setAnalyses] = useState<SwotAnalysis[]>([]);
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(null);
  const [items, setItems] = useState<SwotItem[]>([]);
  const [strategies, setStrategies] = useState<SwotStrategy[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      loadAnalyses();
    }
  }, [user]);

  useEffect(() => {
    if (currentAnalysisId) {
      loadItems(currentAnalysisId);
      loadStrategies(currentAnalysisId);
    }
  }, [currentAnalysisId]);

  const loadAnalyses = async () => {
    const { data, error } = await supabase
      .from('swot_analyses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading analyses:', error);
    } else if (data) {
      setAnalyses(data);
      if (data.length > 0 && !currentAnalysisId) {
        setCurrentAnalysisId(data[0].id);
      }
    }
  };

  const loadItems = async (analysisId: string) => {
    const { data, error } = await supabase
      .from('swot_items')
      .select('*')
      .eq('swot_analysis_id', analysisId)
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Error loading items:', error);
    } else if (data) {
      setItems(data);
    }
  };

  const loadStrategies = async (analysisId: string) => {
    const { data, error } = await supabase
      .from('swot_strategies')
      .select('*')
      .eq('swot_analysis_id', analysisId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading strategies:', error);
    } else if (data) {
      setStrategies(data);
    }
  };

  const createAnalysis = async (title: string, description: string) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('swot_analyses')
      .insert({
        title,
        description,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating analysis:', error);
    } else if (data) {
      setAnalyses([data, ...analyses]);
      setCurrentAnalysisId(data.id);
    }
  };

  const deleteAnalysis = async (id: string) => {
    const { error } = await supabase.from('swot_analyses').delete().eq('id', id);

    if (error) {
      console.error('Error deleting analysis:', error);
    } else {
      setAnalyses(analyses.filter((a) => a.id !== id));
      if (currentAnalysisId === id) {
        const remaining = analyses.filter((a) => a.id !== id);
        setCurrentAnalysisId(remaining.length > 0 ? remaining[0].id : null);
      }
    }
  };

  const addItem = async (category: SwotItem['category'], content: string) => {
    if (!currentAnalysisId) return;

    const { data, error } = await supabase
      .from('swot_items')
      .insert({
        swot_analysis_id: currentAnalysisId,
        category,
        content,
        order_index: items.filter((i) => i.category === category).length,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding item:', error);
    } else if (data) {
      setItems([...items, data]);
    }
  };

  const deleteItem = async (id: string) => {
    const { error } = await supabase.from('swot_items').delete().eq('id', id);

    if (error) {
      console.error('Error deleting item:', error);
    } else {
      setItems(items.filter((i) => i.id !== id));
    }
  };

  const reorderItems = async (newItems: SwotItem[]) => {
    setItems(newItems);

    // Batch update order_index in background
    const updates = newItems.map((item, index) => ({
      id: item.id,
      order_index: index,
      swot_analysis_id: currentAnalysisId, // Ensure we keep the link if we were to support cross-analysis move (not the case here but good practice)
      // We only strictly need id and order_index if we use upsert, but update needs filter.
      // Easiest is to just update each.
    }));

    // Using Promise.all for parallel updates
    Promise.all(
      updates.map((update) =>
        supabase.from('swot_items').update({ order_index: update.order_index }).eq('id', update.id)
      )
    ).catch(err => console.error('Error updating order:', err));
  };

  const addStrategy = async (type: SwotStrategy['type'], description: string) => {
    if (!currentAnalysisId) return;

    const { data, error } = await supabase
      .from('swot_strategies')
      .insert({
        swot_analysis_id: currentAnalysisId,
        type,
        description,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding strategy:', error);
    } else if (data) {
      setStrategies([...strategies, data]);
    }
  };

  const deleteStrategy = async (id: string) => {
    const { error } = await supabase.from('swot_strategies').delete().eq('id', id);

    if (error) {
      console.error('Error deleting strategy:', error);
    } else {
      setStrategies(strategies.filter((s) => s.id !== id));
    }
  };

  const loadExample = async () => {
    if (!user) return;

    // 1. Create Analysis
    const { data: analysis, error: analysisError } = await supabase
      .from('swot_analyses')
      .insert({
        title: 'Tesla Inc. - 2024',
        description: 'Analyse stratégique de Tesla : Leader des véhicules électriques et énergies renouvelables.',
        user_id: user.id,
      })
      .select()
      .single();

    if (analysisError || !analysis) {
      console.error('Error creating example analysis:', analysisError);
      return;
    }

    // 2. Create Items
    const itemsToInsert = [
      { category: 'strength', content: 'Marque forte et visionnaire (Elon Musk)' },
      { category: 'strength', content: 'Technologie de batterie et autonomie en avance' },
      { category: 'strength', content: 'Réseau de Superchargers mondial' },
      { category: 'weakness', content: 'Prix élevés des véhicules (premium)' },
      { category: 'weakness', content: 'Contrôle qualité parfois inégal' },
      { category: 'weakness', content: 'Gamme de produits limitée' },
      { category: 'opportunity', content: 'Marché des camions électriques (Semi)' },
      { category: 'opportunity', content: 'Développement de la conduite autonome (FSD)' },
      { category: 'opportunity', content: 'Expansion sur les marchés émergents' },
      { category: 'threat', content: 'Concurrence croissante (BYD, VW, etc.)' },
      { category: 'threat', content: 'Pénuries de matières premières (Lithium)' },
      { category: 'threat', content: 'Régulations changeantes sur les VE' },
    ].map((item, index) => ({
      swot_analysis_id: analysis.id,
      category: item.category as SwotItem['category'],
      content: item.content,
      order_index: index,
    }));

    const { error: itemsError } = await supabase
      .from('swot_items')
      .insert(itemsToInsert);

    if (itemsError) console.error('Error creating example items:', itemsError);

    // 3. Create Strategies
    const strategiesToInsert = [
      { type: 'SO', description: 'Leverager la marque pour pénétrer le marché des camions' },
      { type: 'WO', description: 'Utiliser les revenus FSD pour améliorer le contrôle qualité' },
      { type: 'ST', description: 'Maintenir l\'avance technologique face à la concurrence' },
      { type: 'WT', description: 'Diversifier la supply chain pour sécuriser les ressources' },
    ].map(strategy => ({
      swot_analysis_id: analysis.id,
      type: strategy.type as SwotStrategy['type'],
      description: strategy.description,
    }));

    const { error: strategiesError } = await supabase
      .from('swot_strategies')
      .insert(strategiesToInsert);

    if (strategiesError) console.error('Error creating example strategies:', strategiesError);

    // 4. Update local state
    setAnalyses([analysis, ...analyses]);
    setCurrentAnalysisId(analysis.id);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setAnalyses([]);
    setCurrentAnalysisId(null);
    setItems([]);
    setStrategies([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Chargement...</div>
      </div>
    );
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-red-100">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Configuration Manquante</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Les variables d'environnement Supabase ne sont pas configurées.
            Veuillez ajouter <code className="bg-gray-100 px-1 rounded">VITE_SUPABASE_URL</code> et
            <code className="bg-gray-100 px-1 rounded">VITE_SUPABASE_ANON_KEY</code> dans vos paramètres Netlify.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
            <strong>Note :</strong> Après avoir ajouté les variables, vous devrez peut-être redéployer le site sur Netlify.
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  const currentAnalysis = analyses.find((a) => a.id === currentAnalysisId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 transition-colors duration-300">
      <header className="bg-white dark:bg-slate-900 shadow-sm border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestionnaire SWOT</h1>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <AnalysisList
              analyses={analyses}
              currentAnalysisId={currentAnalysisId}
              onSelect={setCurrentAnalysisId}
              onCreate={createAnalysis}
              onDelete={deleteAnalysis}
              onLoadExample={loadExample}
            />
          </div>

          <div className="lg:col-span-2 space-y-6" id="swot-export-area">
            <AnimatePresence mode="wait">
              {currentAnalysis ? (
                <motion.div
                  key={currentAnalysis.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                          {currentAnalysis.title}
                        </h2>
                        {currentAnalysis.description && (
                          <p className="text-gray-600">{currentAnalysis.description}</p>
                        )}
                      </div>
                      <ExportButton
                        title={currentAnalysis.title}
                        description={currentAnalysis.description}
                        items={items}
                        strategies={strategies}
                      />
                    </div>
                  </div>

                  <SwotStats items={items} />
                  <div className="mb-6">
                    <AiInsights items={items} />
                  </div>
                  <SwotMatrix
                    items={items}
                    onAddItem={addItem}
                    onDeleteItem={deleteItem}
                    onReorderItems={reorderItems}
                  />
                  <SwotStrategies
                    strategies={strategies}
                    onAddStrategy={addStrategy}
                    onDeleteStrategy={deleteStrategy}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-16 text-center border border-gray-100 dark:border-slate-800 transition-all duration-300"
                >
                  <div className="max-w-md mx-auto">
                    <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-8 text-blue-600 dark:text-blue-400">
                      <BarChart3 className="w-12 h-12" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                      Bienvenue dans votre Dashboard SWOT
                    </h3>
                    <p className="text-gray-600 dark:text-slate-400 mb-8 leading-relaxed">
                      L'analyse SWOT est un outil stratégique puissant pour identifier vos forces, faiblesses, opportunités et menaces.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-500">
                        <Plus className="w-4 h-4" />
                        Créez une analyse
                      </div>
                      <div className="hidden sm:block text-gray-300 dark:text-slate-700">|</div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-500">
                        <FileText className="w-4 h-4" />
                        Ou chargez l'exemple Tesla
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
