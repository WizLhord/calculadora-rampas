// js/ui.js
// Única camada que toca o DOM. Toda conta é feita em calc.js (funções puras);
// aqui só lemos os campos, chamamos a função correspondente e escrevemos o
// resultado na tela. Isso mantém a lógica testável e a interface simples.

import * as Calc from './calc.js';
import * as Store from './store.js';
import { matches } from './search.js';
import { PARAM_SECTIONS, NORM_SECTIONS, REBAR_TABLE, CALCULATORS } from './data.js';
import { initQuantitativos } from './quantitativos.js';

const $ = (sel, root = document) => root.querySelector(sel);
const $all = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function numVal(sel) {
  const el = $(sel);
  if (!el || el.value === '') return NaN;
  return parseFloat(el.value);
}

function setStatus(el, text, kind = 'normal') {
  el.className = kind === 'error' ? 'status-bar error' : 'status-bar';
  el.textContent = text;
}

function showBadge(el, level, html) {
  el.className = `info-badge active ${level}`;
  el.innerHTML = html;
}

function hideBadge(el) {
  el.className = 'info-badge';
  el.innerHTML = '';
}

function escapeAttr(str) {
  return String(str).replace(/"/g, '&quot;');
}

function calcMeta(id) {
  return CALCULATORS.find((c) => c.id === id);
}

// ---------------------------------------------------------------
// View switching (home / módulo 1 recepção / módulo 1 app / parâmetros / normas)
// ---------------------------------------------------------------

function showView(id) {
  $all('.top-view').forEach((v) => v.classList.remove('active'));
  $(`#${id}`)?.classList.add('active');
  window.scrollTo(0, 0);
  if (id === 'view-launcher') requestAnimationFrame(updateHeroFade);
}

function openCalculator(targetId) {
  $all('.nav-item').forEach((n) => n.classList.remove('active'));
  $all('.calc-panel').forEach((p) => p.classList.remove('active'));
  $(`.nav-item[data-target="${targetId}"]`)?.classList.add('active');
  $(`#${targetId}`)?.classList.add('active');
  showView('view-calc-app');
}

function initViewSwitching() {
  $all('[data-view]').forEach((el) => {
    el.addEventListener('click', () => showView(el.getAttribute('data-view')));
  });
  $('#welcomeOpenApp')?.addEventListener('click', () => showView('view-calc-app'));
  $all('[data-open-calc]').forEach((el) => {
    el.addEventListener('click', () => openCalculator(el.getAttribute('data-open-calc')));
  });
}

// ---------------------------------------------------------------
// Hero scroll fade (launcher)
// ---------------------------------------------------------------

function updateHeroFade() {
  const launcher = $('#view-launcher');
  const heroMark = $('#heroMark');
  if (!launcher || !heroMark || !launcher.classList.contains('active')) return;
  const vh = window.innerHeight || 800;
  const p = Math.min(Math.max(window.scrollY / (vh * 0.85), 0), 1);
  heroMark.style.opacity = String(1 - p);
  heroMark.style.transform = `translateY(${p * -50}px) scale(${1 - p * 0.08})`;
}

function initHeroFade() {
  window.addEventListener('scroll', updateHeroFade, { passive: true });
  updateHeroFade();
}

// ---------------------------------------------------------------
// Tema
// ---------------------------------------------------------------

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  $all('.theme-label').forEach((el) => { el.textContent = theme === 'dark' ? 'Tema Escuro' : 'Tema Claro'; });
}

function initTheme() {
  applyTheme(Store.getTheme());
  $all('.theme-toggle-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const target = current === 'dark' ? 'light' : 'dark';
      Store.setTheme(target);
      applyTheme(target);
    });
  });
}

// ---------------------------------------------------------------
// Sidebar de navegação (renderizada a partir de data.js, com favoritos)
// ---------------------------------------------------------------

function renderSidebarNav() {
  const nav = $('#navSections');
  if (!nav) return;
  const groups = [];
  CALCULATORS.forEach((c) => {
    let g = groups.find((g) => g.name === c.group);
    if (!g) { g = { name: c.group, items: [] }; groups.push(g); }
    g.items.push(c);
  });
  nav.innerHTML = groups.map((g) => `
    <div>
      <div class="nav-group-title">${g.name}</div>
      <ul class="nav-group-list">
        ${g.items.map((c) => `
          <li class="nav-item ${c.id === 'calc-rampas' ? 'active' : ''}" data-target="${c.id}">
            <button type="button" class="nav-fav-btn ${Store.isFavorite(c.id) ? 'is-fav' : ''}" data-fav="${c.id}" aria-label="Favoritar ${c.name}" title="Favoritar">★</button>
            <span class="nav-item-label">${c.name}</span>
            <span class="code-tag">${c.tag}</span>
          </li>
        `).join('')}
      </ul>
    </div>
  `).join('');
}

function initSidebarNav() {
  renderSidebarNav();
  const nav = $('#navSections');
  if (!nav) return;
  nav.addEventListener('click', (e) => {
    const favBtn = e.target.closest('.nav-fav-btn');
    if (favBtn) {
      e.stopPropagation();
      Store.toggleFavorite(favBtn.dataset.fav);
      favBtn.classList.toggle('is-fav');
      renderWelcomeFavorites();
      return;
    }
    const item = e.target.closest('.nav-item');
    if (!item) return;
    $all('.nav-item').forEach((n) => n.classList.remove('active'));
    $all('.calc-panel').forEach((p) => p.classList.remove('active'));
    item.classList.add('active');
    $(`#${item.dataset.target}`)?.classList.add('active');
    $('#sidebar')?.classList.remove('open');
    $('#sidebarOverlay')?.classList.remove('open');
  });
}

function initMobileDrawer() {
  const btn = $('#mobileMenuBtn');
  const sidebar = $('#sidebar');
  const overlay = $('#sidebarOverlay');
  if (!btn || !sidebar || !overlay) return;
  btn.addEventListener('click', () => { sidebar.classList.toggle('open'); overlay.classList.toggle('open'); });
  overlay.addEventListener('click', () => { sidebar.classList.remove('open'); overlay.classList.remove('open'); });
}

function initKeyboardShortcut() {
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    if (!$('#view-calc-app')?.classList.contains('active')) return;
    const panel = $('.calc-panel.active');
    panel?.querySelector('[data-action="calc"]')?.click();
  });
}

// ---------------------------------------------------------------
// Calculadoras — cada handler lê os campos, chama calc.js e escreve o resultado
// ---------------------------------------------------------------

function calcRampasHandler() {
  const ci = numVal('#r_ci'), cf = numVal('#r_cf'), c = numVal('#r_c'), i = numVal('#r_i');
  ['#r_ci', '#r_cf', '#r_c', '#r_i'].forEach((sel) => $(sel).classList.remove('is-calculated'));
  const status = $('#r_status'), badge = $('#r_badge');
  const res = Calc.calcRampas({ ci, cf, c, i });
  if (!res.ok) { setStatus(status, `Erro: ${res.error}`, 'error'); return; }
  if (Number.isNaN(ci)) { $('#r_ci').value = res.ci.toFixed(3); $('#r_ci').classList.add('is-calculated'); }
  if (Number.isNaN(cf)) { $('#r_cf').value = res.cf.toFixed(3); $('#r_cf').classList.add('is-calculated'); }
  if (Number.isNaN(c)) { $('#r_c').value = res.c.toFixed(3); $('#r_c').classList.add('is-calculated'); }
  if (Number.isNaN(i)) { $('#r_i').value = res.i.toFixed(3); $('#r_i').classList.add('is-calculated'); }
  $('#r_svg_c').textContent = `c: ${res.c.toFixed(2)} m`;
  $('#r_svg_dh').textContent = `Δh: ${res.deltaH.toFixed(2)} m`;
  $('#r_svg_i').textContent = `i: ${res.i.toFixed(2)} %`;
  $('#r_svg_ci').textContent = `${res.ci.toFixed(2)}m`;
  $('#r_svg_cf').textContent = `${res.cf.toFixed(2)}m`;
  const prefix = res.compliance.level === 'warning' ? 'Atenção:' : res.compliance.level === 'danger' ? 'Inacessível:' : 'NBR 9050:';
  showBadge(badge, res.compliance.level, `<strong>${prefix}</strong> ${res.compliance.text}`);
  setStatus(status, 'Cálculo executado com sucesso.');
  Store.pushHistory('calc-rampas');
  renderWelcomeRecent();
}
function clearRampasHandler() {
  ['#r_ci', '#r_cf', '#r_c', '#r_i'].forEach((sel) => { $(sel).value = ''; $(sel).classList.remove('is-calculated'); });
  hideBadge($('#r_badge'));
  setStatus($('#r_status'), 'Preencha 3 campos para calcular o 4º.');
  $('#r_svg_c').textContent = 'c: -- m';
  $('#r_svg_dh').textContent = 'Δh: -- m';
  $('#r_svg_i').textContent = 'i: -- %';
  $('#r_svg_ci').textContent = 'ci';
  $('#r_svg_cf').textContent = 'cf';
}

function calcEstacasHandler() {
  const e1 = Calc.parseEstaca($('#est_e1').value);
  const c1 = numVal('#est_c1');
  const e2 = Calc.parseEstaca($('#est_e2').value);
  const c2 = numVal('#est_c2');
  const ex = Calc.parseEstaca($('#est_ex').value);
  const status = $('#est_status'), badge = $('#est_badge');
  const res = Calc.calcEstacas({ e1, c1, e2, c2, ex });
  if (!res.ok) { setStatus(status, `Erro: ${res.error}`, 'error'); return; }
  showBadge(badge, 'ok', `<strong>Cota Calculada na ${Calc.formatEstaca(ex)}:</strong> ${res.cotaX.toFixed(3)} m<br><span style="font-size: 11px; opacity: 0.9;">Declividade do trecho: ${res.declividadeTrecho.toFixed(3)}% | Distância parcial: ${res.distanciaParcial.toFixed(2)} m</span>`);
  $('#est_svg_p1').textContent = `${Calc.formatEstaca(e1)} (${c1.toFixed(2)}m)`;
  $('#est_svg_p2').textContent = `${Calc.formatEstaca(e2)} (${c2.toFixed(2)}m)`;
  $('#est_svg_px').textContent = `Alvo: ${res.cotaX.toFixed(3)} m`;
  setStatus(status, 'Interpolação linear de greide concluída.');
  Store.pushHistory('calc-estacas');
  renderWelcomeRecent();
}
function clearEstacasHandler() {
  ['#est_e1', '#est_c1', '#est_e2', '#est_c2', '#est_ex'].forEach((sel) => { $(sel).value = ''; });
  hideBadge($('#est_badge'));
  setStatus($('#est_status'), 'Informe as duas estacas extremas e a estaca desejada.');
  $('#est_svg_p1').textContent = 'Est. 1';
  $('#est_svg_px').textContent = 'Est. X (Alvo)';
  $('#est_svg_p2').textContent = 'Est. 2';
}

function calcTaludesHandler() {
  const h = numVal('#tal_h'), m = numVal('#tal_m'), b = numVal('#tal_b'), i = numVal('#tal_i');
  const status = $('#tal_status'), badge = $('#tal_badge');
  const res = Calc.calcTaludes({ h, m, b, i });
  if (!res.ok) { setStatus(status, `Erro: ${res.error}`, 'error'); return; }
  $('#tal_m').value = res.m.toFixed(2);
  $('#tal_b').value = res.b.toFixed(2);
  $('#tal_i').value = res.i.toFixed(2);
  showBadge(badge, 'ok', `<strong>Talude 1:${res.m.toFixed(2)} (V:H)</strong> | Inclinação: <strong>${res.i.toFixed(1)}%</strong> (${res.angulo.toFixed(1)}°)<br><span style="font-size: 11px; opacity: 0.9;">Comprimento da rampa do talude: ${res.compRampa.toFixed(2)} m | Projeção horizontal: ${res.b.toFixed(2)} m</span>`);
  $('#tal_svg_h').textContent = `H: ${h.toFixed(2)}m`;
  $('#tal_svg_b').textContent = `B: ${res.b.toFixed(2)}m`;
  $('#tal_svg_prop').textContent = `1 : ${res.m.toFixed(2)}`;
  setStatus(status, 'Geometria do talude dimensionada.');
  Store.pushHistory('calc-taludes');
  renderWelcomeRecent();
}
function clearTaludesHandler() {
  ['#tal_h', '#tal_m', '#tal_b', '#tal_i'].forEach((sel) => { $(sel).value = ''; });
  hideBadge($('#tal_badge'));
  setStatus($('#tal_status'), 'Informe Altura (H) e um parâmetro de inclinação (m, B ou i%). Consulte o módulo Parâmetros para valores usuais por tipo de solo.');
}

function calcManningHandler() {
  const n = numVal('#man_n'), io = numVal('#man_io'), z = numVal('#man_z'), y0 = numVal('#man_y');
  const status = $('#man_status'), badge = $('#man_badge');
  const res = Calc.calcManning({ n, io, z, y0 });
  if (!res.ok) { setStatus(status, `Erro: ${res.error}`, 'error'); return; }
  showBadge(badge, 'ok', `<strong>Vazão Máxima (Q):</strong> ${res.vazaoLs.toFixed(2)} L/s (${res.vazaoM3s.toFixed(4)} m³/s)<br><strong>Velocidade de Escoamento (v):</strong> ${res.veloc.toFixed(2)} m/s<br><span style="font-size: 11px; opacity: 0.9;">Largura do espelho d'água (T): ${res.larguraEspelho.toFixed(2)} m | Raio Hidráulico: ${(res.rh * 100).toFixed(2)} cm</span>`);
  $('#man_svg_q').textContent = `Q = ${res.vazaoLs.toFixed(1)} L/s`;
  $('#man_svg_v').textContent = `v = ${res.veloc.toFixed(2)} m/s`;
  setStatus(status, 'Capacidade de drenagem calculada.');
  Store.pushHistory('calc-manning');
  renderWelcomeRecent();
}
function clearManningHandler() {
  ['#man_io', '#man_y'].forEach((sel) => { $(sel).value = ''; });
  hideBadge($('#man_badge'));
  setStatus($('#man_status'), 'Insira os parâmetros geométricos e hidráulicos da calha. Tabela completa de "n" no módulo Parâmetros.');
  $('#man_svg_q').textContent = 'Q = -- L/s';
  $('#man_svg_v').textContent = 'v = -- m/s';
}

function calcEmpolamentoHandler() {
  const vc = numVal('#emp_vc'), taxaPercent = numVal('#emp_taxa'), cap = numVal('#emp_cap'), fhom = numVal('#emp_fhom');
  const status = $('#emp_status'), badge = $('#emp_badge');
  const res = Calc.calcEmpolamento({ vc, taxaPercent, cap, fhom });
  if (!res.ok) { setStatus(status, `Erro: ${res.error}`, 'error'); return; }
  showBadge(badge, 'ok', `<strong>Volume de Transporte (Solto):</strong> ${res.volumeSolto.toFixed(2)} m³<br><strong>Total de Viagens (Caçamba ${cap.toFixed(0)}m³):</strong> ${res.numViagens} viagens<br><span style="font-size: 11px; opacity: 0.9;">Rendimento em Aterro Compactado (Fh=${(fhom || 1.2).toFixed(2)}): ≈ ${res.volumeAterroCompactado.toFixed(2)} m³</span>`);
  setStatus(status, 'Dimensionamento de terraplenagem concluído.');
  Store.pushHistory('calc-empolamento');
  renderWelcomeRecent();
}
function clearEmpolamentoHandler() {
  $('#emp_vc').value = '';
  hideBadge($('#emp_badge'));
  setStatus($('#emp_status'), 'Preencha o volume medido no corte e o tipo de solo.');
}

function calcLiganteHandler() {
  const comp = numVal('#lig_comp'), larg = numVal('#lig_larg'), taxa = numVal('#lig_taxa');
  const status = $('#lig_status'), badge = $('#lig_badge');
  const res = Calc.calcLigante({ comp, larg, taxa });
  if (!res.ok) { setStatus(status, `Erro: ${res.error}`, 'error'); return; }
  showBadge(badge, 'ok', `<strong>Área Total de Aplicação:</strong> ${res.areaM2.toLocaleString('pt-BR')} m²<br><strong>Volume de Ligante Necessário:</strong> ${res.volumeLitros.toLocaleString('pt-BR', { minimumFractionDigits: 1 })} L (${res.volumeM3.toFixed(2)} m³)<br><span style="font-size: 11px; opacity: 0.9;">Equivalente a ≈ ${res.caminhoes6000L.toFixed(1)} tanques de caminhão espargidor (6.000 L)</span>`);
  setStatus(status, 'Volume de emulsão asfáltica dimensionado.');
  Store.pushHistory('calc-ligante');
  renderWelcomeRecent();
}
function clearLiganteHandler() {
  ['#lig_comp', '#lig_larg'].forEach((sel) => { $(sel).value = ''; });
  hideBadge($('#lig_badge'));
  setStatus($('#lig_status'), 'Informe as dimensões da pista e a taxa de projeto.');
}

function calcSuperlarguraHandler() {
  const r = numVal('#sup_r'), v = numVal('#sup_v'), n = numVal('#sup_n'), l = numVal('#sup_l');
  const status = $('#sup_status'), badge = $('#sup_badge');
  const res = Calc.calcSuperlargura({ r, v, n, l });
  if (!res.ok) { setStatus(status, `Erro: ${res.error}`, 'error'); return; }
  showBadge(badge, 'ok', `<strong>Superlargura Total Recomendada (S):</strong> ${res.superlargura.toFixed(2)} m<br><span style="font-size: 11px; opacity: 0.9;">Parcela mecânica: ${res.parcelaMecanica.toFixed(2)} m | Parcela dinâmica (velocidade): ${res.parcelaPsicologica.toFixed(2)} m</span>`);
  setStatus(status, 'Alargamento de curva calculado de acordo com as normas viárias.');
  Store.pushHistory('calc-superlargura');
  renderWelcomeRecent();
}
function clearSuperlarguraHandler() {
  ['#sup_r', '#sup_v'].forEach((sel) => { $(sel).value = ''; });
  hideBadge($('#sup_badge'));
  setStatus($('#sup_status'), 'Norma DNIT: Cálculo de alargamento para acomodação de veículos pesados.');
}

function calcBlondelHandler() {
  const h = numVal('#esc_h'), eIdealCm = numVal('#esc_emax');
  const status = $('#esc_status'), badge = $('#esc_badge');
  const res = Calc.calcBlondel({ h, eIdealCm });
  if (!res.ok) { setStatus(status, `Erro: ${res.error}`, 'error'); return; }
  showBadge(badge, res.isOk ? 'ok' : 'warning', `<strong>${res.numEspelhos} Espelhos de ${res.espelhoReal.toFixed(2)} cm</strong> e <strong>${res.numPisos} Pisos de ${res.pisoIdeal.toFixed(2)} cm</strong><br>Fórmula de Blondel: 2(${res.espelhoReal.toFixed(1)}) + ${res.pisoIdeal.toFixed(1)} = <strong>${res.blondelCheck.toFixed(1)} cm</strong> (Ideal: 63 a 64 cm)<br><span style="font-size: 11px; opacity: 0.9;">Comprimento horizontal em planta: ${res.compTotalEscada.toFixed(2)} m</span>`);
  $('#esc_svg_h').textContent = `H: ${h.toFixed(2)}m`;
  $('#esc_svg_p').textContent = `p: ${res.pisoIdeal.toFixed(1)}cm`;
  $('#esc_svg_e').textContent = `e: ${res.espelhoReal.toFixed(1)}cm`;
  setStatus(status, 'Escada dimensionada com base no conforto ergonômico.');
  Store.pushHistory('calc-blondel');
  renderWelcomeRecent();
}
function clearBlondelHandler() {
  $('#esc_h').value = '';
  hideBadge($('#esc_badge'));
  setStatus($('#esc_status'), 'Insira o desnível vertical para calcular o número de degraus e o piso ideal.');
  $('#esc_svg_h').textContent = 'H: -- cm';
  $('#esc_svg_p').textContent = 'p: -- cm';
  $('#esc_svg_e').textContent = 'e: -- cm';
}

function initVergalhaoOptions() {
  const sel = $('#verg_bitola');
  if (!sel) return;
  sel.innerHTML = REBAR_TABLE.map((r) => `<option value="${r.bitola}|${r.massa}" ${r.bitola === 12.5 ? 'selected' : ''}>${r.bitola.toFixed(1)} mm — ${r.massa.toFixed(3)} kg/m</option>`).join('');
}
function calcVergalhaoHandler() {
  const [bitolaStr, massaStr] = $('#verg_bitola').value.split('|');
  const bitola = parseFloat(bitolaStr), massaUnit = parseFloat(massaStr);
  const qtd = numVal('#verg_qtd'), comp = numVal('#verg_comp');
  const status = $('#verg_status'), badge = $('#verg_badge');
  const res = Calc.calcVergalhao({ bitola, massaUnit, qtd, comp });
  if (!res.ok) { setStatus(status, `Erro: ${res.error}`, 'error'); return; }
  showBadge(badge, 'ok', `<strong>Peso Total:</strong> ${res.pesoTotal.toFixed(2)} kg<br><span style="font-size: 11px; opacity: 0.9;">Bitola Ø${bitola.toFixed(1)}mm (${massaUnit.toFixed(3)} kg/m) | Comprimento total: ${res.compTotal.toFixed(2)} m</span>`);
  setStatus(status, 'Peso calculado conforme NBR 7480.');
  Store.pushHistory('calc-vergalhao');
  renderWelcomeRecent();
}
function clearVergalhaoHandler() {
  $('#verg_qtd').value = '1';
  $('#verg_comp').value = '12.00';
  hideBadge($('#verg_badge'));
  setStatus($('#verg_status'), 'Selecione a bitola e informe quantidade e comprimento das barras.');
}

const CALC_HANDLERS = {
  rampas: { calc: calcRampasHandler, clear: clearRampasHandler },
  estacas: { calc: calcEstacasHandler, clear: clearEstacasHandler },
  taludes: { calc: calcTaludesHandler, clear: clearTaludesHandler },
  manning: { calc: calcManningHandler, clear: clearManningHandler },
  empolamento: { calc: calcEmpolamentoHandler, clear: clearEmpolamentoHandler },
  ligante: { calc: calcLiganteHandler, clear: clearLiganteHandler },
  superlargura: { calc: calcSuperlarguraHandler, clear: clearSuperlarguraHandler },
  blondel: { calc: calcBlondelHandler, clear: clearBlondelHandler },
  vergalhao: { calc: calcVergalhaoHandler, clear: clearVergalhaoHandler },
};

function initCalculators() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const handler = CALC_HANDLERS[btn.dataset.calc]?.[btn.dataset.action];
    if (handler) handler();
  });
  $all('input').forEach((inp) => inp.addEventListener('input', () => inp.classList.remove('is-calculated')));
  $('#lig_servico')?.addEventListener('change', (e) => {
    if (e.target.value !== 'custom') $('#lig_taxa').value = e.target.value;
  });
}

// ---------------------------------------------------------------
// Páginas de referência (Parâmetros & Normas) — renderizadas a partir de data.js
// ---------------------------------------------------------------

function renderParamSection(section) {
  const bodyHtml = section.kind === 'table'
    ? `<div class="ref-table-wrap"><table class="ref-table"><thead><tr>${section.columns.map((c) => `<th>${c}</th>`).join('')}</tr></thead><tbody>
        ${section.rows.map((row) => `<tr class="ref-item" data-search="${escapeAttr(`${row.join(' ')} ${section.title}`)}">${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`).join('')}
      </tbody></table></div>`
    : `<div class="ref-list">${section.items.map((item) => `
        <div class="ref-item" data-search="${escapeAttr(`${item.name} ${item.tag} ${section.title}`)}">
          <div class="ref-item-main"><span class="ref-item-name">${item.name}</span><span class="ref-item-tag">${item.tag}</span></div>
          <span class="ref-item-value">${item.value}</span>
        </div>`).join('')}</div>`;
  return `
    <div class="ref-section">
      <div class="ref-section-head"><h2>${section.title}</h2><span class="ref-section-cat">${section.category}</span></div>
      ${bodyHtml}
      ${section.note ? `<p class="ref-note">${section.note}</p>` : ''}
    </div>`;
}

function renderNormSection(section) {
  return `
    <div class="ref-section">
      <div class="ref-section-head"><h2>${section.title}</h2><span class="ref-section-cat">${section.category}</span></div>
      <div class="ref-list">
        ${section.items.map((item) => `
          <div class="ref-item norm-item" data-search="${escapeAttr(`${item.code} ${item.org} ${item.desc}`)}">
            <div class="ref-item-top"><span class="ref-item-name">${item.code}</span><span class="ref-item-tag">${item.org}</span></div>
            <p class="ref-item-desc">${item.desc}</p>
          </div>`).join('')}
      </div>
    </div>`;
}

function setupRefSearch(inputId, clearId, scopeId, emptyId) {
  const input = $(`#${inputId}`), clearBtn = $(`#${clearId}`), scope = $(`#${scopeId}`), empty = $(`#${emptyId}`);
  if (!input) return;
  function apply() {
    const q = input.value.trim();
    clearBtn.classList.toggle('show', q.length > 0);
    let any = false;
    $all('.ref-section', scope).forEach((section) => {
      let sectionMatch = false;
      $all('.ref-item', section).forEach((item) => {
        const ok = matches(q, item.dataset.search || '');
        item.style.display = ok ? '' : 'none';
        if (ok) sectionMatch = true;
      });
      section.style.display = sectionMatch ? '' : 'none';
      if (sectionMatch) any = true;
    });
    empty.style.display = any ? 'none' : 'block';
  }
  input.addEventListener('input', apply);
  clearBtn.addEventListener('click', () => { input.value = ''; apply(); input.focus(); });
}

function initReferencePages() {
  const paramsScope = $('#paramsScope');
  if (paramsScope) paramsScope.innerHTML = PARAM_SECTIONS.map(renderParamSection).join('');
  const normsScope = $('#normsScope');
  if (normsScope) normsScope.innerHTML = NORM_SECTIONS.map(renderNormSection).join('');
  setupRefSearch('paramsSearch', 'paramsSearchClear', 'paramsScope', 'paramsEmptyState');
  setupRefSearch('normsSearch', 'normsSearchClear', 'normsScope', 'normsEmptyState');
}

// ---------------------------------------------------------------
// Página de recepção do Módulo 1 — favoritos e uso recente
// ---------------------------------------------------------------

function renderWelcomeFavorites() {
  const wrap = $('#welcomeFavorites'), row = $('#welcomeFavoritesRow');
  if (!wrap || !row) return;
  const favs = Store.getFavorites().map(calcMeta).filter(Boolean);
  wrap.hidden = favs.length === 0;
  row.innerHTML = favs.map((c) => `<button type="button" class="welcome-chip" data-open-calc="${c.id}">★ ${c.name}</button>`).join('');
  $all('[data-open-calc]', row).forEach((el) => el.addEventListener('click', () => openCalculator(el.dataset.openCalc)));
}

function renderWelcomeRecent() {
  const wrap = $('#welcomeRecent'), row = $('#welcomeRecentRow');
  if (!wrap || !row) return;
  const recent = Store.getHistory().map((h) => calcMeta(h.id)).filter(Boolean);
  wrap.hidden = recent.length === 0;
  row.innerHTML = recent.map((c) => `<button type="button" class="welcome-chip" data-open-calc="${c.id}">${c.name}</button>`).join('');
  $all('[data-open-calc]', row).forEach((el) => el.addEventListener('click', () => openCalculator(el.dataset.openCalc)));
}

function initWelcomePage() {
  renderWelcomeFavorites();
  renderWelcomeRecent();
}

// ---------------------------------------------------------------
// Bootstrap
// ---------------------------------------------------------------

export function initUI() {
  initViewSwitching();
  initHeroFade();
  initTheme();
  initSidebarNav();
  initMobileDrawer();
  initVergalhaoOptions();
  initCalculators();
  initReferencePages();
  initWelcomePage();
  initQuantitativos();
  initKeyboardShortcut();
}
