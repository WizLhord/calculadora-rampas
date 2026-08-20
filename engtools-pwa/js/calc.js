// js/calc.js
// Funções puras de cálculo. Nenhuma delas toca o DOM — recebem números,
// devolvem números/objetos. Isso permite testá-las isoladamente
// (ver /tests/calc.test.mjs) e reaproveitá-las fora da interface no futuro.

/** @typedef {{ok: true, [key: string]: any} | {ok: false, error: string}} CalcResult */

// ---------------------------------------------------------------
// 1. Rampas & Declividades (NBR 9050)
// ---------------------------------------------------------------

/**
 * Classifica uma inclinação percentual segundo os limites de rampa da NBR 9050.
 * @param {number} iPercent
 * @returns {{level: 'ok'|'warning'|'danger', text: string}}
 */
export function nbr9050RampCompliance(iPercent) {
  const absI = Math.abs(iPercent);
  if (absI <= 5.0) return { level: 'ok', text: `i = ${absI.toFixed(2)}% (Acessível sem restrição de desnível por lance).` };
  if (absI <= 6.25) return { level: 'ok', text: `i = ${absI.toFixed(2)}% (Permitido desnível máximo de 1,00 m por lance).` };
  if (absI <= 8.333) return { level: 'ok', text: `i = ${absI.toFixed(2)}% (Permitido desnível máximo de 0,80 m por lance).` };
  if (absI <= 12.5) return { level: 'warning', text: `Declividade elevada (${absI.toFixed(2)}%). Admitida apenas em reformas onde 8,33% for impraticável.` };
  return { level: 'danger', text: `i = ${absI.toFixed(2)}% ultrapassa os limites da NBR 9050 para pedestres.` };
}

/**
 * Resolve a 4ª variável de i = (cf - ci) / c * 100, a partir de exatamente 3 preenchidas.
 * @param {{ci?: number, cf?: number, c?: number, i?: number}} input
 * @returns {CalcResult}
 */
export function calcRampas({ ci, cf, c, i }) {
  const vals = { ci, cf, c, i };
  const filled = Object.entries(vals).filter(([, v]) => v !== undefined && v !== null && !Number.isNaN(v));
  if (filled.length !== 3) return { ok: false, error: 'Preencha exatamente 3 campos para calcular o 4º.' };

  const out = { ...vals };
  if (out.cf === undefined || Number.isNaN(out.cf)) out.cf = out.ci + (out.i / 100) * out.c;
  else if (out.ci === undefined || Number.isNaN(out.ci)) out.ci = out.cf - (out.i / 100) * out.c;
  else if (out.c === undefined || Number.isNaN(out.c)) {
    if (out.i === 0) return { ok: false, error: 'Inclinação zero inviabiliza o cálculo de comprimento.' };
    out.c = (out.cf - out.ci) / (out.i / 100);
  } else if (out.i === undefined || Number.isNaN(out.i)) {
    if (out.c === 0) return { ok: false, error: 'Comprimento não pode ser zero.' };
    out.i = ((out.cf - out.ci) / out.c) * 100;
  }

  return { ok: true, ...out, deltaH: out.cf - out.ci, compliance: nbr9050RampCompliance(out.i) };
}

// ---------------------------------------------------------------
// 2. Interpolação de Estacas & Greide
// ---------------------------------------------------------------

/** Converte "N+m" (estaca de 20 m) ou um número simples em distância acumulada. */
export function parseEstaca(str) {
  if (!str) return NaN;
  const cleaned = String(str).replace(/\s+/g, '');
  if (cleaned.includes('+')) {
    const [nPart, mPart] = cleaned.split('+');
    const n = parseFloat(nPart);
    const m = parseFloat(mPart || '0');
    if (Number.isNaN(n) || Number.isNaN(m)) return NaN;
    return n * 20 + m;
  }
  const val = parseFloat(cleaned);
  return Number.isNaN(val) ? NaN : val;
}

export function formatEstaca(distMetros) {
  const n = Math.floor(distMetros / 20);
  const m = (distMetros % 20).toFixed(2);
  return `Est. ${n} + ${m}m`;
}

/** @returns {CalcResult} */
export function calcEstacas({ e1, c1, e2, c2, ex }) {
  if ([e1, c1, e2, c2, ex].some((v) => v === undefined || Number.isNaN(v))) {
    return { ok: false, error: 'Preencha todas as estacas e cotas corretamente.' };
  }
  if (e1 === e2) return { ok: false, error: 'As estacas 1 e 2 devem ser diferentes.' };
  const deltaDist = e2 - e1;
  const deltaCota = c2 - c1;
  const declividadeTrecho = (deltaCota / deltaDist) * 100;
  const cotaX = c1 + ((ex - e1) / deltaDist) * deltaCota;
  return { ok: true, cotaX, declividadeTrecho, distanciaParcial: ex - e1 };
}

// ---------------------------------------------------------------
// 3. Taludes
// ---------------------------------------------------------------

/** @returns {CalcResult} */
export function calcTaludes({ h, m, b, i }) {
  if (!h || h <= 0) return { ok: false, error: 'A altura do talude (H) deve ser maior que zero.' };
  let outM = m, outB = b, outI = i;
  if (m && m > 0) { outB = h * m; outI = (1 / m) * 100; }
  else if (b && b > 0) { outM = b / h; outI = (1 / outM) * 100; }
  else if (i && i > 0) { outM = 100 / i; outB = h * outM; }
  else return { ok: false, error: 'Informe ao menos um parâmetro (m, B ou i%).' };

  const angulo = Math.atan(1 / outM) * (180 / Math.PI);
  const compRampa = Math.sqrt(h * h + outB * outB);
  return { ok: true, h, m: outM, b: outB, i: outI, angulo, compRampa };
}

// ---------------------------------------------------------------
// 4. Drenagem — Manning (calha triangular)
// ---------------------------------------------------------------

/** @returns {CalcResult} */
export function calcManning({ n, io, z, y0 }) {
  if (!(io > 0) || !(z > 0) || !(y0 > 0)) {
    return { ok: false, error: 'Informe valores positivos para declividade, inclinação transversal e lâmina d’água.' };
  }
  const area = 0.5 * (z * y0) * y0;
  const perimetro = y0 + Math.sqrt(y0 * y0 + (z * y0) ** 2);
  const rh = area / perimetro;
  const veloc = (1 / n) * rh ** (2 / 3) * Math.sqrt(io);
  const vazaoM3s = veloc * area;
  const vazaoLs = vazaoM3s * 1000;
  const larguraEspelho = z * y0;
  return { ok: true, area, rh, veloc, vazaoM3s, vazaoLs, larguraEspelho };
}

// ---------------------------------------------------------------
// 5. Empolamento & Transporte de Solos
// ---------------------------------------------------------------

/** @returns {CalcResult} */
export function calcEmpolamento({ vc, taxaPercent, cap, fhom }) {
  if (!(vc > 0) || !(cap > 0)) return { ok: false, error: 'Informe o volume de corte e a capacidade do caminhão.' };
  const fh = fhom || 1.2;
  const volumeSolto = vc * (1 + taxaPercent / 100);
  const numViagens = Math.ceil(volumeSolto / cap);
  const volumeAterroCompactado = vc / fh;
  return { ok: true, volumeSolto, numViagens, volumeAterroCompactado };
}

// ---------------------------------------------------------------
// 6. Taxa de Ligante Asfáltico
// ---------------------------------------------------------------

/** @returns {CalcResult} */
export function calcLigante({ comp, larg, taxa }) {
  if (!(comp > 0) || !(larg > 0) || !(taxa > 0)) return { ok: false, error: 'Informe dimensões e taxa válidas.' };
  const areaM2 = comp * larg;
  const volumeLitros = areaM2 * taxa;
  const volumeM3 = volumeLitros / 1000;
  const caminhoes6000L = volumeLitros / 6000;
  return { ok: true, areaM2, volumeLitros, volumeM3, caminhoes6000L };
}

// ---------------------------------------------------------------
// 7. Superlargura em Curvas (DNIT)
// ---------------------------------------------------------------

/** @returns {CalcResult} */
export function calcSuperlargura({ r, v, n, l }) {
  const faixas = n || 2;
  if (!(r > 0) || !(v > 0) || !(l > 0)) return { ok: false, error: 'Preencha raio, velocidade e veículo de projeto.' };
  if (r <= l) return { ok: false, error: 'O raio da curva deve ser estritamente maior que o entre-eixos do veículo.' };
  const parcelaMecanica = faixas * (r - Math.sqrt(r * r - l * l));
  const parcelaPsicologica = v / (10 * Math.sqrt(r));
  return { ok: true, superlargura: parcelaMecanica + parcelaPsicologica, parcelaMecanica, parcelaPsicologica };
}

// ---------------------------------------------------------------
// 8. Escadas — Fórmula de Blondel
// ---------------------------------------------------------------

/** @returns {CalcResult} */
export function calcBlondel({ h, eIdealCm }) {
  if (!(h > 0)) return { ok: false, error: 'Informe o desnível vertical em metros.' };
  const eIdeal = eIdealCm || 17.5;
  const hCm = h * 100;
  const numEspelhos = Math.round(hCm / eIdeal);
  const espelhoReal = hCm / numEspelhos;
  const numPisos = numEspelhos - 1;
  const pisoIdeal = 63.5 - 2 * espelhoReal;
  const blondelCheck = 2 * espelhoReal + pisoIdeal;
  const compTotalEscada = (numPisos * pisoIdeal) / 100;
  const isOk = espelhoReal >= 16 && espelhoReal <= 18.5 && pisoIdeal >= 27;
  return { ok: true, numEspelhos, espelhoReal, numPisos, pisoIdeal, blondelCheck, compTotalEscada, isOk };
}

// ---------------------------------------------------------------
// 9. Peso de Vergalhões (NBR 7480) — massa (kg/m) = d² / 162
// ---------------------------------------------------------------

export function massaVergalhao(diametroMm) {
  return (diametroMm * diametroMm) / 162;
}

/** @returns {CalcResult} */
export function calcVergalhao({ bitola, massaUnit, qtd, comp }) {
  if (!(qtd > 0) || !(comp > 0)) return { ok: false, error: 'Informe quantidade e comprimento válidos.' };
  const compTotal = qtd * comp;
  const pesoTotal = compTotal * massaUnit;
  return { ok: true, bitola, compTotal, pesoTotal };
}

// ---------------------------------------------------------------
// 10. Quantitativos (tabela genérica tipo planilha)
// ---------------------------------------------------------------

/**
 * Calcula a quantidade de uma linha de quantitativo a partir do tipo de medida.
 * @param {{tipo: 'unidade'|'comprimento'|'area'|'volume', d1?: number, d2?: number, d3?: number, precoUnit?: number}} row
 * @returns {CalcResult}
 */
export function calcQuantitativoRow({ tipo, d1, d2, d3, precoUnit }) {
  let quantidade;
  let unidade;
  if (tipo === 'unidade') {
    if (!(d1 > 0)) return { ok: false, error: 'Informe a quantidade.' };
    quantidade = d1; unidade = 'un';
  } else if (tipo === 'comprimento') {
    if (!(d1 > 0)) return { ok: false, error: 'Informe o comprimento.' };
    quantidade = d1; unidade = 'm';
  } else if (tipo === 'area') {
    if (!(d1 > 0) || !(d2 > 0)) return { ok: false, error: 'Informe comprimento e largura.' };
    quantidade = d1 * d2; unidade = 'm²';
  } else if (tipo === 'volume') {
    if (!(d1 > 0) || !(d2 > 0) || !(d3 > 0)) return { ok: false, error: 'Informe comprimento, largura e altura.' };
    quantidade = d1 * d2 * d3; unidade = 'm³';
  } else {
    return { ok: false, error: 'Tipo de medida inválido.' };
  }
  const preco = precoUnit || 0;
  const subtotal = quantidade * preco;
  return { ok: true, quantidade, unidade, subtotal };
}
