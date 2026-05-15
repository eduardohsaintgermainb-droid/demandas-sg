import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const demanda_id = searchParams.get('demanda_id')
  const { data, error } = await supabase
    .from('comentarios')
    .select('*')
    .eq('demanda_id', demanda_id)
    .order('criado_em', { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { data, error } = await supabase
    .from('comentarios')
    .insert([{
      demanda_id: body.demanda_id,
      autor: body.autor,
      texto: body.texto,
      evidencia_url: body.evidencia_url || null,
      evidencia_nome: body.evidencia_nome || null,
    }])
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
