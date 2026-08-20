// tests/calc.test.mjs
// Testes simples de asserção, sem dependências externas.
// Rodar com: node tests/calc.test.mjs

import assert from 'node:assert/strict';
import {
  calcRampas, nbr9050RampCompliance, parseEstaca, formatEstaca, calcEstacas,
  calcTaludes, calcManning, calcEmpolamento, calcLigante, calcSuperlargura,
  calcBlondel, massaVergalhao, calcVergalhao, calcQuantitativoRow,
} from '../js/calc.js';

let passed = 0;
function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  ok  - ${name}`);
  } catch (err) {
    console.error(`FAIL  - ${name}`);
    console.error(`        ${err.message}`);
    process.exitCode = 1;
  }
}

console.log('Rampas & Declividades');
test('calcula i a partir de ci, cf, c', () => {
  const r = calcRampas({ ci: 100, cf: 101, c: 20 });
  assert.ok(r.ok);
  assert.equal(r.i.toFixed(2), '5.00');
  assert.equal(r.compliance.level, 'ok');
});
test('rejeita quando menos de 3 campos preenchidos', () => {
  const r = calcRampas({ ci: 100, cf: 101 });
  assert.equal(r.ok, false);
});
test('classifica declividade acima de 12.5% como perigosa', () => {
  assert.equal(nbr9050RampCompliance(15).level, 'danger');
});

console.log('Estacas');
test('parseEstaca entende "10+5.00"', () => {
  assert.equal(parseEstaca('10+5.00'), 205);
});
test('formatEstaca formata de volta', () => {
  assert.equal(formatEstaca(205), 'Est. 10 + 5.00m');
});
test('interpola cota corretamente no meio do trecho', () => {
  const r = calcEstacas({ e1: 0, c1: 100, e2: 100, c2: 105, ex: 50 });
  assert.ok(r.ok);
  assert.equal(r.cotaX, 102.5);
});

console.log('Taludes');
test('calcula B e i a partir de H e m', () => {
  const r = calcTaludes({ h: 3, m: 1.5 });
  assert.ok(r.ok);
  assert.equal(r.b, 4.5);
  assert.equal(r.i.toFixed(2), '66.67');
});

console.log('Manning');
test('vazão cresce com a lâmina d’água', () => {
  const a = calcManning({ n: 0.015, io: 0.02, z: 20, y0: 0.05 });
  const b = calcManning({ n: 0.015, io: 0.02, z: 20, y0: 0.10 });
  assert.ok(a.ok && b.ok);
  assert.ok(b.vazaoLs > a.vazaoLs);
});

console.log('Empolamento');
test('calcula viagens necessárias arredondando para cima', () => {
  const r = calcEmpolamento({ vc: 100, taxaPercent: 30, cap: 14 });
  assert.ok(r.ok);
  assert.equal(r.volumeSolto, 130);
  assert.equal(r.numViagens, 10);
});

console.log('Ligante asfáltico');
test('calcula volume total de ligante', () => {
  const r = calcLigante({ comp: 1000, larg: 7, taxa: 1.2 });
  assert.ok(r.ok);
  assert.equal(r.areaM2, 7000);
  assert.equal(r.volumeLitros, 8400);
});

console.log('Superlargura');
test('exige raio maior que o entre-eixos do veículo', () => {
  const r = calcSuperlargura({ r: 10, v: 60, n: 2, l: 15.24 });
  assert.equal(r.ok, false);
});
test('calcula superlargura para curva válida', () => {
  const r = calcSuperlargura({ r: 150, v: 60, n: 2, l: 15.24 });
  assert.ok(r.ok);
  assert.ok(r.superlargura > 0);
});

console.log('Blondel');
test('dimensiona escada dentro do conforto ideal', () => {
  const r = calcBlondel({ h: 2.8, eIdealCm: 17.5 });
  assert.ok(r.ok);
  assert.ok(r.isOk);
});

console.log('Vergalhões');
test('fórmula d²/162 aproxima a massa tabelada da NBR 7480 (12.5mm ≈ 0.963 kg/m)', () => {
  // A fórmula é uma aproximação; o valor oficial tabelado (usado nas
  // calculadoras) vem de REBAR_TABLE em data.js, não desta fórmula.
  assert.ok(Math.abs(massaVergalhao(12.5) - 0.963) < 0.01);
});
test('peso total multiplica quantidade x comprimento x massa', () => {
  const r = calcVergalhao({ bitola: 10, massaUnit: 0.617, qtd: 5, comp: 12 });
  assert.ok(r.ok);
  assert.equal(r.compTotal, 60);
  assert.equal(r.pesoTotal.toFixed(2), '37.02');
});

console.log('Quantitativos');
test('linha do tipo área calcula L x W', () => {
  const r = calcQuantitativoRow({ tipo: 'area', d1: 4, d2: 2.5, precoUnit: 10 });
  assert.ok(r.ok);
  assert.equal(r.quantidade, 10);
  assert.equal(r.subtotal, 100);
});
test('linha do tipo volume exige as três dimensões', () => {
  const r = calcQuantitativoRow({ tipo: 'volume', d1: 4, d2: 2.5 });
  assert.equal(r.ok, false);
});

console.log(`\n${passed} teste(s) passaram.`);
