import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Prioridade = 'critica' | 'alta' | 'media' | 'baixa'
export type Status = 'pendente' | 'em_andamento' | 'concluido' | 'bloqueado'

export interface Demanda {
  id: string
  titulo: string
  descricao: string
  prioridade: Prioridade
  status: Status
  prazo: string | null
  criado_em: string
  atualizado_em: string
  concluido_em: string | null
  tags: string[]
}

export interface Comentario {
  id: string
  demanda_id: string
  autor: string
  texto: string
  criado_em: string
  evidencia_url: string | null
  evidencia_nome: string | null
}
