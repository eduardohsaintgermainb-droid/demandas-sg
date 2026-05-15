'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import type { Demanda, Comentario, Prioridade, Status, Responsavel } from '@/lib/supabase'
import { format, parseISO, isPast, differenceInDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const PRIO_LABEL: Record<Prioridade, string> = { critica: '🔴 Crítica', alta: '🟠 Alta', media: '🟡 Média', baixa: '🟢 Baixa' }
const PRIO_ORDER: Record<Prioridade, number> = { critica: 0, alta: 1, media: 2, baixa: 3 }
const STATUS_LABEL: Record<Status, string> = { pendente: 'Pendente', em_andamento: 'Em andamento', concluido: 'Concluído', bloqueado: 'Bloqueado' }
const RESP_LABEL: Record<Responsavel, string> = { geral: '👥 Geral', rodrigo: '👤 Rodrigo' }
const RESP_COLOR: Record<Responsavel, string> = {
  geral: 'bg-blue-50 text-blue-700 border-blue-200',
  rodrigo: 'bg-purple-50 text-purple-700 border-purple-200',
}

function Badge({ type, value, className = '' }: { type: 'prio' | 'status'; value: string; className?: string }) {
  const cls = type === 'prio' ? `prio-${value}` : `status-${value}`
  const label = type === 'prio' ? PRIO_LABEL[value as Prioridade] : STATUS_LABEL[value as Status]
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${cls} ${className}`}>{label}</span>
}

function RespBadge({ value }: { value: Responsavel }) {
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${RESP_COLOR[value]}`}>{RESP_LABEL[value]}</span>
}

function PrazoTag({ prazo }: { prazo: string | null }) {
  if (!prazo) return null
  const date = parseISO(prazo)
  const diff = differenceInDays(date, new Date())
  const past = isPast(date)
  const color = past ? 'text-red-500' : diff <= 2 ? 'text-orange-500' : 'text-gray-400'
  return (
    <span className={`text-xs flex items-center gap-1 ${color}`}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
      {past ? 'Vencido ' : ''}{format(date, "d MMM", { locale: ptBR })}
    </span>
  )
}

function ConfirmModal({ msg, onConfirm, onCancel }: { msg: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="bg-white border border-gray-200 rounded-2xl p-6 w-full max-w-sm shadow-xl" onClick={e => e.stopPropagation()}>
        <p className="text-sm text-gray-500 mb-5">{msg}</p>
        <div className="flex gap-3 justify-end">
          <button className="btn-ghost" onClick={onCancel}>Cancelar</button>
          <button className="btn-primary !bg-red-500" onClick={onConfirm}>Confirmar</button>
        </div>
      </div>
    </div>
  )
}

function DemandaForm({ initial, onSave, onClose }: {
  initial?: Partial<Demanda>
  onSave: (d: Partial<Demanda>) => Promise<void>
  onClose: () => void
}) {
  const [titulo, setTitulo] = useState(initial?.titulo || '')
  const [descricao, setDescricao] = useState(initial?.descricao || '')
  const [prioridade, setPrioridade] = useState<Prioridade>(initial?.prioridade || 'media')
  const [responsavel, setResponsavel] = useState<Responsavel>(initial?.responsavel || 'geral')
  const [prazo, setPrazo] = useState(initial?.prazo?.slice(0, 10) || '')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>(initial?.tags || [])
  const [saving, setSaving] = useState(false)

  const addTag = () => {
    const t = tagInput.trim().toLowerCase()
    if (t && !tags.includes(t)) setTags(p => [...p, t])
    setTagInput('')
  }

  const submit = async () => {
    if (!titulo.trim()) return
    setSaving(true)
    await onSave({ titulo, descricao, prioridade, responsavel, prazo: prazo || null, tags })
    setSaving(false)
    onClose()
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-100">
          <h2 className="font-display text-lg font-700">{initial?.id ? 'Editar demanda' : 'Nova demanda'}</h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">Título *</label>
            <input className="field" placeholder="Ex: Mapear transportadoras ativas" value={titulo} onChange={e => setTitulo(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">Descrição detalhada</label>
            <textarea className="field" rows={5} placeholder="Descreva o que precisa ser feito, critérios de aceite, etc..." value={descricao} onChange={e => setDescricao(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">Prioridade</label>
              <select className="field" value={prioridade} onChange={e => setPrioridade(e.target.value as Prioridade)}>
                <option value="critica">🔴 Crítica</option>
                <option value="alta">🟠 Alta</option>
                <option value="media">🟡 Média</option>
                <option value="baixa">🟢 Baixa</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">Responsável</label>
              <select className="field" value={responsavel} onChange={e => setResponsavel(e.target.value as Responsavel)}>
                <option value="geral">👥 Geral</option>
                <option value="rodrigo">👤 Rodrigo</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">Prazo</label>
            <input type="date" className="field" value={prazo} onChange={e => setPrazo(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">Tags</label>
            <div className="flex gap-2">
              <input className="field" placeholder="ex: wms, frete..." value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }} />
              <button className="btn-ghost shrink-0" onClick={addTag}>+ Add</button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map(t => (
                  <span key={t} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-gray-100 border border-gray-200 text-gray-500">
                    {t}
                    <button onClick={() => setTags(p => p.filter(x => x !== t))} className="hover:text-black ml-0.5">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="p-6 border-t border-gray-100 flex gap-3 justify-end">
          <button className="btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" onClick={submit} disabled={saving || !titulo.trim()}>
            {saving ? 'Salvando...' : initial?.id ? 'Salvar alterações' : 'Criar demanda'}
          </button>
        </div>
      </div>
    </div>
  )
}

function DemandaDrawer({ demanda, onClose, onStatusChange, onDelete, onEdit }: {
  demanda: Demanda
  onClose: () => void
  onStatusChange: (id: string, status: Status) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onEdit: () => void
}) {
  const [comentarios, setComentarios] = useState<Comentario[]>([])
  const [texto, setTexto] = useState('')
  const [autor, setAutor] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('nome_usuario') || '' : '')
  const [sending, setSending] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [confirmDel, setConfirmDel] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const loadComentarios = useCallback(async () => {
    const r = await fetch(`/api/comentarios?demanda_id=${demanda.id}`)
    if (r.ok) setComentarios(await r.json())
  }, [demanda.id])

  useEffect(() => { loadComentarios() }, [loadComentarios])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [comentarios])

  const saveAutor = (v: string) => {
    setAutor(v)
    if (typeof window !== 'undefined') localStorage.setItem('nome_usuario', v)
  }

  const sendComentario = async () => {
    if (!texto.trim() || !autor.trim()) return
    setSending(true)
    let evidencia_url = null, evidencia_nome = null
    if (pendingFile) {
      setUploading(true)
      const fd = new FormData()
      fd.append('file', pendingFile)
      fd.append('demanda_id', demanda.id)
      const r = await fetch('/api/uploads', { method: 'POST', body: fd })
      if (r.ok) { const d = await r.json(); evidencia_url = d.url; evidencia_nome = d.nome }
      setUploading(false)
      setPendingFile(null)
    }
    await fetch('/api/comentarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ demanda_id: demanda.id, autor, texto, evidencia_url, evidencia_nome }),
    })
    setTexto('')
    await loadComentarios()
    setSending(false)
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-gray-100 flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge type="prio" value={demanda.prioridade} />
              <Badge type="status" value={demanda.status} />
              <RespBadge value={demanda.responsavel || 'geral'} />
              <PrazoTag prazo={demanda.prazo} />
            </div>
            <h2 className="font-display text-base font-600 leading-snug text-black">{demanda.titulo}</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-black text-xl leading-none shrink-0">×</button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {demanda.descricao && (
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Descrição</p>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 rounded-xl p-4 border border-gray-100">{demanda.descricao}</p>
            </div>
          )}
          {demanda.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {demanda.tags.map(t => <span key={t} className="text-xs px-2.5 py-0.5 rounded-full bg-gray-100 border border-gray-200 text-gray-500">#{t}</span>)}
            </div>
          )}
          {demanda.status !== 'concluido' && (
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Atualizar status</p>
              <div className="flex gap-2 flex-wrap">
                {(['pendente', 'em_andamento', 'bloqueado', 'concluido'] as Status[]).map(s => (
                  <button key={s}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${demanda.status === s ? `status-${s} font-medium` : 'border-gray-200 text-gray-400 hover:text-black hover:border-gray-400'}`}
                    onClick={() => onStatusChange(demanda.id, s)}>
                    {STATUS_LABEL[s]}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Histórico ({comentarios.length})</p>
            <div className="space-y-3">
              {comentarios.length === 0 && <p className="text-sm text-gray-400 text-center py-4">Nenhuma atualização ainda.</p>}
              {comentarios.map(c => (
                <div key={c.id} className="bg-gray-50 border border-gray-100 rounded-xl p-3.5">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-blue-600">{c.autor}</span>
                    <span className="text-xs text-gray-400">{format(parseISO(c.criado_em), "d MMM 'às' HH:mm", { locale: ptBR })}</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{c.texto}</p>
                  {c.evidencia_url && (
                    <a href={c.evidencia_url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1.5 text-xs text-blue-600 hover:underline">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      {c.evidencia_nome || 'Evidência'}
                    </a>
                  )}
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-gray-100 space-y-3">
          <input className="field" placeholder="Seu nome" value={autor} onChange={e => saveAutor(e.target.value)} />
          <textarea className="field" rows={2} placeholder="Adicionar atualização..." value={texto} onChange={e => setTexto(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) sendComentario() }} />
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button className="btn-ghost text-xs flex items-center gap-1.5" onClick={() => fileRef.current?.click()}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                {pendingFile ? pendingFile.name.slice(0, 20) + '…' : 'Evidência'}
              </button>
              <input type="file" ref={fileRef} className="hidden" onChange={e => setPendingFile(e.target.files?.[0] || null)} />
            </div>
            <div className="flex gap-2">
              <button className="btn-ghost text-xs text-red-400 hover:text-red-600" onClick={() => setConfirmDel(true)}>Excluir</button>
              <button className="btn-ghost text-xs" onClick={onEdit}>Editar</button>
              <button className="btn-primary text-sm" onClick={sendComentario} disabled={sending || uploading || !texto.trim() || !autor.trim()}>
                {uploading ? 'Enviando...' : sending ? 'Salvando...' : 'Enviar'}
              </button>
            </div>
          </div>
        </div>
      </div>
      {confirmDel && (
        <ConfirmModal msg="Tem certeza que quer excluir esta demanda?" onConfirm={async () => { await onDelete(demanda.id); onClose() }} onCancel={() => setConfirmDel(false)} />
      )}
    </div>
  )
}

function StatsBar({ demandas }: { demandas: Demanda[] }) {
  const total = demandas.length
  const concluidas = demandas.filter(d => d.status === 'concluido').length
  const criticas = demandas.filter(d => d.prioridade === 'critica' && d.status !== 'concluido').length
  const andamento = demandas.filter(d => d.status === 'em_andamento').length
  const pct = total > 0 ? Math.round((concluidas / total) * 100) : 0
  const doRodrigo = demandas.filter(d => d.responsavel === 'rodrigo' && d.status !== 'concluido').length

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
      {[
        { label: 'Total', value: total },
        { label: 'Em andamento', value: andamento },
        { label: 'Críticas abertas', value: criticas, red: criticas > 0 },
        { label: 'Do Rodrigo', value: doRodrigo, purple: true },
        { label: 'Concluídas', value: `${concluidas} (${pct}%)` },
      ].map(s => (
        <div key={s.label} className="bg-gray-50 border border-gray-200 rounded-xl p-3.5">
          <p className="text-xs text-gray-400 mb-1">{s.label}</p>
          <p className={`font-display text-xl font-700 ${s.red ? 'text-red-500' : s.purple ? 'text-purple-600' : 'text-black'}`}>{s.value}</p>
        </div>
      ))}
    </div>
  )
}

export default function Home() {
  const [demandas, setDemandas] = useState<Demanda[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingDemanda, setEditingDemanda] = useState<Demanda | null>(null)
  const [selectedDemanda, setSelectedDemanda] = useState<Demanda | null>(null)
  const [filterStatus, setFilterStatus] = useState<Status | 'todas'>('todas')
  const [filterPrio, setFilterPrio] = useState<Prioridade | 'todas'>('todas')
  const [filterResp, setFilterResp] = useState<Responsavel | 'todas'>('todas')
  const [search, setSearch] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const r = await fetch('/api/demandas')
    if (r.ok) setDemandas(await r.json())
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const createDemanda = async (d: Partial<Demanda>) => {
    await fetch('/api/demandas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) })
    await load()
  }

  const updateDemanda = async (d: Partial<Demanda>) => {
    await fetch('/api/demandas', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editingDemanda?.id, ...d }) })
    await load()
    if (selectedDemanda?.id === editingDemanda?.id) {
      const r = await fetch('/api/demandas')
      if (r.ok) { const all: Demanda[] = await r.json(); setSelectedDemanda(all.find(x => x.id === editingDemanda?.id) || null) }
    }
  }

  const statusChange = async (id: string, status: Status) => {
    await fetch('/api/demandas', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) })
    await load()
    if (selectedDemanda?.id === id) {
      const r = await fetch('/api/demandas')
      if (r.ok) { const all: Demanda[] = await r.json(); setSelectedDemanda(all.find(x => x.id === id) || null) }
    }
  }

  const deleteDemanda = async (id: string) => {
    await fetch(`/api/demandas?id=${id}`, { method: 'DELETE' })
    await load()
    setSelectedDemanda(null)
  }

  const filtered = demandas
    .filter(d => filterStatus === 'todas' || d.status === filterStatus)
    .filter(d => filterPrio === 'todas' || d.prioridade === filterPrio)
    .filter(d => filterResp === 'todas' || d.responsavel === filterResp)
    .filter(d => !search || d.titulo.toLowerCase().includes(search.toLowerCase()) || d.descricao?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => PRIO_ORDER[a.prioridade] - PRIO_ORDER[b.prioridade])

  return (
    <main className="min-h-screen bg-white px-4 py-8 max-w-5xl mx-auto">
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="font-display text-2xl font-800 tracking-tight text-black">Demandas</h1>
          <p className="text-sm text-gray-400 mt-0.5">Saint Germain Brand — Gestão de atividades</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => { setEditingDemanda(null); setShowForm(true) }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nova demanda
        </button>
      </div>

      <StatsBar demandas={demandas} />

      <div className="flex flex-wrap gap-2 mb-5 items-center">
        <input className="field !py-2 !text-sm max-w-xs" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} />
        <div className="flex gap-1.5 flex-wrap">
          {(['todas', 'pendente', 'em_andamento', 'bloqueado', 'concluido'] as const).map(s => (
            <button key={s}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${filterStatus === s ? (s === 'todas' ? 'border-blue-500 text-blue-600 bg-blue-50' : `status-${s}`) : 'border-gray-200 text-gray-400 hover:text-black'}`}
              onClick={() => setFilterStatus(s)}>
              {s === 'todas' ? 'Todos status' : STATUS_LABEL[s]}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {(['todas', 'critica', 'alta', 'media', 'baixa'] as const).map(p => (
            <button key={p}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${filterPrio === p ? (p === 'todas' ? 'border-blue-500 text-blue-600 bg-blue-50' : `prio-${p}`) : 'border-gray-200 text-gray-400 hover:text-black'}`}
              onClick={() => setFilterPrio(p)}>
              {p === 'todas' ? 'Todas prio.' : PRIO_LABEL[p]}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {(['todas', 'geral', 'rodrigo'] as const).map(r => (
            <button key={r}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${filterResp === r ? (r === 'todas' ? 'border-blue-500 text-blue-600 bg-blue-50' : r === 'rodrigo' ? 'border-purple-300 text-purple-700 bg-purple-50' : 'border-blue-300 text-blue-700 bg-blue-50') : 'border-gray-200 text-gray-400 hover:text-black'}`}
              onClick={() => setFilterResp(r)}>
              {r === 'todas' ? 'Todos resp.' : RESP_LABEL[r as Responsavel]}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-sm">Nenhuma demanda encontrada.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((d, i) => (
            <div key={d.id}
              className="card-hover bg-white border border-gray-200 rounded-xl p-4 cursor-pointer fade-up"
              style={{ animationDelay: `${i * 30}ms` }}
              onClick={() => setSelectedDemanda(d)}>
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <Badge type="prio" value={d.prioridade} />
                    <Badge type="status" value={d.status} />
                    <RespBadge value={d.responsavel || 'geral'} />
                    <PrazoTag prazo={d.prazo} />
                  </div>
                  <p className={`text-sm font-medium leading-snug ${d.status === 'concluido' ? 'line-through text-gray-400' : 'text-black'}`}>{d.titulo}</p>
                  {d.descricao && <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">{d.descricao}</p>}
                  {d.tags?.length > 0 && (
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      {d.tags.map(t => <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 border border-gray-200 text-gray-400">#{t}</span>)}
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-400 shrink-0 text-right">
                  <p>{format(parseISO(d.criado_em), "d MMM", { locale: ptBR })}</p>
                  {d.status === 'concluido' && d.concluido_em && (
                    <p className="text-green-500 mt-0.5">✓ {format(parseISO(d.concluido_em), "d MMM", { locale: ptBR })}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <DemandaForm
          initial={editingDemanda || undefined}
          onSave={editingDemanda ? updateDemanda : createDemanda}
          onClose={() => { setShowForm(false); setEditingDemanda(null) }}
        />
      )}

      {selectedDemanda && (
        <DemandaDrawer
          demanda={selectedDemanda}
          onClose={() => setSelectedDemanda(null)}
          onStatusChange={statusChange}
          onDelete={deleteDemanda}
          onEdit={() => { setEditingDemanda(selectedDemanda); setShowForm(true) }}
        />
      )}
    </main>
  )
}
