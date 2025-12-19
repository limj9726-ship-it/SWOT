/*
  # Ajouter table des stratégies

  1. Nouvelle Table
    - `swot_strategies`
      - `id` (uuid, clé primaire)
      - `swot_analysis_id` (uuid) - Référence à l'analyse SWOT
      - `type` (text) - SO, WO, ST, WT (combinaisons)
      - `description` (text) - Stratégie
      - `created_at` (timestamptz)

  2. Sécurité
    - Active RLS avec les mêmes politiques que swot_items
*/

CREATE TABLE IF NOT EXISTS swot_strategies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  swot_analysis_id uuid NOT NULL REFERENCES swot_analyses(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('SO', 'WO', 'ST', 'WT')),
  description text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE swot_strategies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view strategies of own analyses"
  ON swot_strategies FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM swot_analyses
      WHERE swot_analyses.id = swot_strategies.swot_analysis_id
      AND swot_analyses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert strategies in own analyses"
  ON swot_strategies FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM swot_analyses
      WHERE swot_analyses.id = swot_strategies.swot_analysis_id
      AND swot_analyses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete strategies from own analyses"
  ON swot_strategies FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM swot_analyses
      WHERE swot_analyses.id = swot_strategies.swot_analysis_id
      AND swot_analyses.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS swot_strategies_analysis_id_idx ON swot_strategies(swot_analysis_id);
CREATE INDEX IF NOT EXISTS swot_strategies_type_idx ON swot_strategies(type);