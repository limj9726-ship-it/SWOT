/*
  # Gestionnaire de Matrices SWOT

  1. Nouvelles Tables
    - `swot_analyses`
      - `id` (uuid, clé primaire)
      - `title` (text) - Titre de l'analyse SWOT
      - `description` (text) - Description optionnelle
      - `created_at` (timestamptz) - Date de création
      - `updated_at` (timestamptz) - Date de modification
      - `user_id` (uuid) - Propriétaire de l'analyse
    
    - `swot_items`
      - `id` (uuid, clé primaire)
      - `swot_analysis_id` (uuid) - Référence à l'analyse SWOT
      - `category` (text) - Type: 'strength', 'weakness', 'opportunity', 'threat'
      - `content` (text) - Contenu de l'élément
      - `created_at` (timestamptz) - Date de création
      - `order_index` (integer) - Ordre d'affichage

  2. Sécurité
    - Active RLS sur toutes les tables
    - Politiques pour que les utilisateurs puissent gérer leurs propres analyses
*/

CREATE TABLE IF NOT EXISTS swot_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid NOT NULL
);

CREATE TABLE IF NOT EXISTS swot_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  swot_analysis_id uuid NOT NULL REFERENCES swot_analyses(id) ON DELETE CASCADE,
  category text NOT NULL CHECK (category IN ('strength', 'weakness', 'opportunity', 'threat')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  order_index integer DEFAULT 0
);

ALTER TABLE swot_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE swot_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analyses"
  ON swot_analyses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analyses"
  ON swot_analyses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analyses"
  ON swot_analyses FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own analyses"
  ON swot_analyses FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view items of own analyses"
  ON swot_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM swot_analyses
      WHERE swot_analyses.id = swot_items.swot_analysis_id
      AND swot_analyses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert items in own analyses"
  ON swot_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM swot_analyses
      WHERE swot_analyses.id = swot_items.swot_analysis_id
      AND swot_analyses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update items in own analyses"
  ON swot_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM swot_analyses
      WHERE swot_analyses.id = swot_items.swot_analysis_id
      AND swot_analyses.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM swot_analyses
      WHERE swot_analyses.id = swot_items.swot_analysis_id
      AND swot_analyses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete items from own analyses"
  ON swot_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM swot_analyses
      WHERE swot_analyses.id = swot_items.swot_analysis_id
      AND swot_analyses.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS swot_items_analysis_id_idx ON swot_items(swot_analysis_id);
CREATE INDEX IF NOT EXISTS swot_items_category_idx ON swot_items(category);
CREATE INDEX IF NOT EXISTS swot_analyses_user_id_idx ON swot_analyses(user_id);