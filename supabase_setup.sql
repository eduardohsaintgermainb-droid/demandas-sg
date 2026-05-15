-- ============================================================
-- DEMANDAS — Saint Germain Brand
-- Execute este script no SQL Editor do Supabase
-- ============================================================

-- Tabela principal de demandas
CREATE TABLE IF NOT EXISTS demandas (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo        TEXT NOT NULL,
  descricao     TEXT DEFAULT '',
  prioridade    TEXT NOT NULL DEFAULT 'media'
                  CHECK (prioridade IN ('critica','alta','media','baixa')),
  status        TEXT NOT NULL DEFAULT 'pendente'
                  CHECK (status IN ('pendente','em_andamento','concluido','bloqueado')),
  prazo         DATE,
  tags          TEXT[] DEFAULT '{}',
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  concluido_em  TIMESTAMPTZ
);

-- Tabela de comentários / histórico
CREATE TABLE IF NOT EXISTS comentarios (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  demanda_id     UUID NOT NULL REFERENCES demandas(id) ON DELETE CASCADE,
  autor          TEXT NOT NULL,
  texto          TEXT NOT NULL,
  evidencia_url  TEXT,
  evidencia_nome TEXT,
  criado_em      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_demandas_status    ON demandas(status);
CREATE INDEX IF NOT EXISTS idx_demandas_prioridade ON demandas(prioridade);
CREATE INDEX IF NOT EXISTS idx_comentarios_demanda ON comentarios(demanda_id);

-- RLS desligado (acesso via service_role key nas API routes)
ALTER TABLE demandas    DISABLE ROW LEVEL SECURITY;
ALTER TABLE comentarios DISABLE ROW LEVEL SECURITY;

-- Storage bucket para evidências
INSERT INTO storage.buckets (id, name, public)
VALUES ('evidencias', 'evidencias', true)
ON CONFLICT DO NOTHING;
