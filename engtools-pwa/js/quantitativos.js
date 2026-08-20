// js/quantitativos.js
// "Planilha" de quantitativos dentro do app: linhas com descrição, tipo de
// medida (unidade/comprimento/área/volume) e preço unitário, com subtotal
// automático, exportação/importação CSV (compatível com Excel) e
// persistência local — pensado para substituir a tabela avulsa que muita
// gente monta no Excel para orçamento e quantitativo de obra.

import { calcQuantitativoRow } from './calc.js';
import { getTakeoffRows, setTakeoffRows } from './store.js';

let rows = [];
let elBody, elGrandTotal;

const TIPOS = [
  { value: 'unidade', label: 'Unidade' },
  { value: 'comprimento', label: 'Comprimento (m)' },
  { value: 'area', label: 'Área (m²)' },
  { value: 'volume', label: 'Volume (m³)' },
];

function uid() {
  return 'r' + Math.random().toString(36).slice(2, 9);
}

function blankRow() {
  return { id: uid(), desc: '', tipo: 'area', d1: '', d2: '', d3: '', preco: '' };
}

function persist() {
  setTakeoffRows(rows);
}

function currency(v) {
  return (v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function computeRow(row) {
  const res = calcQuantitativoRow({
    tipo: row.tipo,
    d1: parseFloat(row.d1),
    d2: parseFloat(row.d2),
    d3: parseFloat(row.d3),
    precoUnit: parseFloat(row.preco),
  });
  return res.ok ? res : { ok: false, quantidade: 0, unidade: '', subtotal: 0 };
}

function recomputeGrandTotal() {
  const total = rows.reduce((acc, row) => acc + (computeRow(row).subtotal || 0), 0);
  if (elGrandTotal) elGrandTotal.textContent = currency(total);
}

function updateRowReadouts(tr, row) {
  const res = computeRow(row);
  const readouts = tr.querySelectorAll('.qty-readout');
  readouts[0].textContent = res.ok ? `${res.quantidade.toLocaleString('pt-BR', { maximumFractionDigits: 3 })} ${res.unidade}` : '—';
  readouts[1].textContent = res.ok ? currency(res.subtotal) : '—';
  recomputeGrandTotal();
}

function rowTemplate(row) {
  const res = computeRow(row);
  const tipoOptions = TIPOS.map((t) => `<option value="${t.value}" ${row.tipo === t.value ? 'selected' : ''}>${t.label}</option>`).join('');
  const d2Disabled = row.tipo === 'unidade' || row.tipo === 'comprimento';
  const d3Disabled = row.tipo !== 'volume';
  return `
    <td><input type="text" class="qty-input" data-field="desc" value="${escapeHtml(row.desc)}" placeholder="Ex.: Contrapiso sala"></td>
    <td><select class="qty-input" data-field="tipo">${tipoOptions}</select></td>
    <td><input type="number" step="any" class="qty-input qty-dim" data-field="d1" value="${escapeHtml(row.d1)}" placeholder="${row.tipo === 'unidade' ? 'qtd.' : 'compr.'}"></td>
    <td><input type="number" step="any" class="qty-input qty-dim" data-field="d2" value="${escapeHtml(row.d2)}" placeholder="larg." ${d2Disabled ? 'disabled' : ''}></td>
    <td><input type="number" step="any" class="qty-input qty-dim" data-field="d3" value="${escapeHtml(row.d3)}" placeholder="alt." ${d3Disabled ? 'disabled' : ''}></td>
    <td class="qty-readout">${res.ok ? `${res.quantidade.toLocaleString('pt-BR', { maximumFractionDigits: 3 })} ${res.unidade}` : '—'}</td>
    <td><input type="number" step="any" class="qty-input" data-field="preco" value="${escapeHtml(row.preco)}" placeholder="0,00"></td>
    <td class="qty-readout qty-subtotal">${res.ok ? currency(res.subtotal) : '—'}</td>
    <td><button type="button" class="qty-remove" data-id="${row.id}" aria-label="Remover linha">✕</button></td>
  `;
}

function renderRows() {
  elBody.innerHTML = '';
  rows.forEach((row) => {
    const tr = document.createElement('tr');
    tr.dataset.id = row.id;
    tr.innerHTML = rowTemplate(row);
    elBody.appendChild(tr);
  });
  recomputeGrandTotal();
}

function onBodyInput(e) {
  const field = e.target.dataset.field;
  if (!field) return;
  const tr = e.target.closest('tr');
  const row = rows.find((r) => r.id === tr.dataset.id);
  if (!row) return;
  row[field] = e.target.value;
  persist();
  if (field === 'tipo') { renderRows(); return; } // precisa reabilitar/desabilitar campos de dimensão
  updateRowReadouts(tr, row);
}

function onBodyClick(e) {
  const btn = e.target.closest('.qty-remove');
  if (!btn) return;
  rows = rows.filter((r) => r.id !== btn.dataset.id);
  if (rows.length === 0) rows = [blankRow()];
  persist();
  renderRows();
}

// ---- CSV (separador ";", compatível com Excel em pt-BR) ----

function csvEscape(val) {
  const s = String(val ?? '');
  if (s.includes(';') || s.includes('"') || s.includes('\n')) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

function parseCsvLine(line) {
  const out = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (ch === '"') { inQuotes = false; }
      else cur += ch;
    } else if (ch === '"') { inQuotes = true; }
    else if (ch === ';') { out.push(cur); cur = ''; }
    else cur += ch;
  }
  out.push(cur);
  return out;
}

function exportCsv() {
  const header = ['Descricao', 'Tipo', 'Dim1', 'Dim2', 'Dim3', 'PrecoUnitario', 'Quantidade', 'Unidade', 'Subtotal'];
  const lines = [header.join(';')];
  rows.forEach((row) => {
    const res = computeRow(row);
    lines.push([
      csvEscape(row.desc), csvEscape(row.tipo), row.d1, row.d2, row.d3, row.preco,
      res.ok ? res.quantidade : '', res.ok ? res.unidade : '', res.ok ? res.subtotal.toFixed(2) : '',
    ].join(';'));
  });
  const blob = new Blob(['\uFEFF' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'quantitativos-engtools.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function importCsv(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return;
  const imported = lines.slice(1).map((line) => {
    const cols = parseCsvLine(line);
    return {
      id: uid(),
      desc: cols[0] || '',
      tipo: TIPOS.some((t) => t.value === cols[1]) ? cols[1] : 'area',
      d1: cols[2] || '', d2: cols[3] || '', d3: cols[4] || '', preco: cols[5] || '',
    };
  });
  if (imported.length > 0) {
    rows = imported;
    persist();
    renderRows();
  }
}

export function initQuantitativos() {
  elBody = document.getElementById('qtyTableBody');
  elGrandTotal = document.getElementById('qtyGrandTotal');
  if (!elBody) return; // painel ainda não está no DOM desta view

  rows = getTakeoffRows();
  if (rows.length === 0) rows = [blankRow()];
  renderRows();

  elBody.addEventListener('input', onBodyInput);
  elBody.addEventListener('click', onBodyClick);

  document.getElementById('qtyAddRow').addEventListener('click', () => {
    rows.push(blankRow());
    persist();
    renderRows();
  });

  document.getElementById('qtyClearAll').addEventListener('click', () => {
    if (!window.confirm('Limpar toda a tabela de quantitativos?')) return;
    rows = [blankRow()];
    persist();
    renderRows();
  });

  document.getElementById('qtyExportCsv').addEventListener('click', exportCsv);

  const fileInput = document.getElementById('qtyFileInput');
  document.getElementById('qtyImportCsv').addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const text = await file.text();
    importCsv(text);
    fileInput.value = '';
  });
}
