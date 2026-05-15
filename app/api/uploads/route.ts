import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File
  const demanda_id = formData.get('demanda_id') as string

  if (!file) return NextResponse.json({ error: 'Nenhum arquivo' }, { status: 400 })

  const ext = file.name.split('.').pop()
  const path = `evidencias/${demanda_id}/${Date.now()}.${ext}`

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const { error } = await supabase.storage
    .from('evidencias')
    .upload(path, buffer, { contentType: file.type, upsert: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: urlData } = supabase.storage.from('evidencias').getPublicUrl(path)

  return NextResponse.json({ url: urlData.publicUrl, nome: file.name })
}
