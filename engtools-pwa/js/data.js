// js/data.js
// Fonte única dos dados de referência. A interface (ui.js) apenas renderiza
// estas listas — para adicionar um parâmetro ou uma norma, basta acrescentar
// um item aqui; a busca e a exibição são automáticas.

export const REBAR_TABLE = [
  { bitola: 6.3, massa: 0.245 },
  { bitola: 8.0, massa: 0.395 },
  { bitola: 10.0, massa: 0.617 },
  { bitola: 12.5, massa: 0.963 },
  { bitola: 16.0, massa: 1.578 },
  { bitola: 20.0, massa: 2.466 },
  { bitola: 25.0, massa: 3.853 },
  { bitola: 32.0, massa: 6.313 },
];

export const MANNING_TABLE = [
  { name: 'Tubo de PVC / PEAD liso', tag: 'Condutos fechados', value: 'n = 0,011' },
  { name: 'Manilha / tubo de concreto', tag: 'Condutos fechados', value: 'n = 0,013' },
  { name: 'Tubo de aço corrugado', tag: 'Condutos fechados', value: 'n = 0,024' },
  { name: 'Sarjeta / canaleta em concreto moldado', tag: 'Canais revestidos', value: 'n = 0,015' },
  { name: 'Canal revestido em concreto liso / asfalto', tag: 'Canais revestidos', value: 'n = 0,013 – 0,018' },
  { name: 'Canal em terra, limpo e reto', tag: 'Canais e valetas', value: 'n = 0,022' },
  { name: 'Canal em terra com vegetação rasteira', tag: 'Canais e valetas', value: 'n = 0,030' },
  { name: 'Canal escavado em rocha, irregular', tag: 'Canais e valetas', value: 'n = 0,040' },
  { name: "Curso d'água natural, limpo e reto", tag: 'Cursos naturais', value: 'n = 0,030' },
  { name: "Curso d'água natural, com meandros e pedras", tag: 'Cursos naturais', value: 'n = 0,045 – 0,060' },
];

export const COBRIMENTO_TABLE = [
  { elemento: 'Laje (concreto armado)', caa1: '20 mm', caa2: '25 mm', caa3: '35 mm', caa4: '45 mm' },
  { elemento: 'Viga / Pilar (concreto armado)', caa1: '25 mm', caa2: '30 mm', caa3: '40 mm', caa4: '50 mm' },
  { elemento: 'Em contato com o solo / fundação', caa1: '30 mm', caa2: '30 mm', caa3: '40 mm', caa4: '50 mm' },
  { elemento: 'Laje (concreto protendido)', caa1: '25 mm', caa2: '30 mm', caa3: '40 mm', caa4: '50 mm' },
  { elemento: 'Viga / Pilar (concreto protendido)', caa1: '30 mm', caa2: '35 mm', caa3: '45 mm', caa4: '55 mm' },
];

export const TALUDES_TABLE = [
  { name: 'Rocha sã', tag: 'Talude de corte', value: 'próximo de vertical*' },
  { name: 'Cascalho / seixo', tag: 'Talude de corte', value: '1 : 1 (≈45°)' },
  { name: 'Argila', tag: 'Talude de corte', value: '≈1 : 1,25 (≈39°)' },
  { name: 'Areia', tag: 'Talude de corte', value: '≈1 : 1,7 (≈31°)' },
  { name: 'Terra vegetal solta', tag: 'Talude de corte', value: '1 : 2 (≈26,5°)' },
  { name: 'Aterro compactado, sem estudo específico', tag: 'Talude de aterro', value: '1,5:1 a 2:1 (H:V)' },
];

export const EMPOLAMENTO_TABLE = [
  { name: 'Areia / solo arenoso', tag: 'Empolamento', value: '≈25%' },
  { name: 'Terra comum / argila média', tag: 'Empolamento', value: '≈30%' },
  { name: 'Argila pesada / saibro', tag: 'Empolamento', value: '≈40%' },
  { name: 'Rocha detonada / enrocamento', tag: 'Empolamento', value: '≈50%' },
];

export const LIGANTE_TABLE = [
  { name: 'Imprimação Betuminosa (CM-30)', tag: 'Ligante', value: '1,20 L/m²' },
  { name: 'Pintura de Ligação (RR-1C)', tag: 'Ligante', value: '0,50 L/m²' },
  { name: 'Tratamento Superficial', tag: 'Ligante', value: '1,40 L/m²' },
];

export const RAMPA_TABLE = [
  { name: 'i ≤ 5,00%', tag: 'Acessibilidade', value: 'sem restrição de desnível por lance' },
  { name: '5,00% < i ≤ 6,25%', tag: 'Acessibilidade', value: 'desnível máx. 1,00 m por lance' },
  { name: '6,25% < i ≤ 8,33%', tag: 'Acessibilidade', value: 'desnível máx. 0,80 m por lance' },
  { name: '8,33% < i ≤ 12,5%', tag: 'Acessibilidade', value: 'só em reformas, quando 8,33% for impraticável' },
  { name: 'i > 12,5%', tag: 'Acessibilidade', value: 'inacessível a pedestres' },
];

/** Cada seção vira um bloco na página de Parâmetros. */
export const PARAM_SECTIONS = [
  {
    title: 'Coeficiente de Rugosidade de Manning (n)',
    category: 'Hidráulica',
    kind: 'list',
    items: MANNING_TABLE,
    note: 'Valores usuais de referência (tabela clássica de Chow, amplamente adotada em manuais de hidráulica e drenagem viária). Para projetos específicos, confirme o coeficiente no manual de drenagem do órgão contratante.',
  },
  {
    title: 'Cobrimento Nominal de Armadura',
    category: 'NBR 6118 — Tab. 7.2',
    kind: 'table',
    columns: ['Elemento', 'CAA I', 'CAA II', 'CAA III', 'CAA IV'],
    rows: COBRIMENTO_TABLE.map((r) => [r.elemento, r.caa1, r.caa2, r.caa3, r.caa4]),
    note: 'Classes de agressividade ambiental: I fraca (rural/submersa), II moderada (urbana), III forte (marinha/industrial), IV muito forte (respingos de maré/industrial agressiva). Valores para Δc = 10 mm.',
  },
  {
    title: 'Massa Nominal de Vergalhões (CA-50)',
    category: 'NBR 7480',
    kind: 'table',
    columns: ['Bitola', 'Massa nominal', 'Barra de 12 m'],
    rows: REBAR_TABLE.map((r) => [`${r.bitola.toFixed(1)} mm`, `${r.massa.toFixed(3)} kg/m`, `${(r.massa * 12).toFixed(2)} kg`]),
    note: 'Fórmula aproximada: massa (kg/m) ≈ d² / 162, com d em milímetros. Calculadora dedicada em Calculadora → Estruturas → Peso de Vergalhões.',
  },
  {
    title: 'Inclinação Usual de Taludes por Material',
    category: 'Geotecnia & Terraplenagem',
    kind: 'list',
    items: TALUDES_TABLE,
    note: '*Valores usuais para pré-dimensionamento de anteprojeto. Nunca substituem um estudo geotécnico e a verificação de estabilidade (ex.: NBR 11682) para o projeto executivo.',
  },
  {
    title: 'Fator de Empolamento por Tipo de Solo',
    category: 'Pavimentação & Solos',
    kind: 'list',
    items: EMPOLAMENTO_TABLE,
  },
  {
    title: 'Taxas de Aplicação de Ligante Asfáltico',
    category: 'Pavimentação Asfáltica',
    kind: 'list',
    items: LIGANTE_TABLE,
    note: 'Taxas de referência de projeto — a dosagem final é definida em campo por ensaio de bandejas, conforme especificação do DNIT.',
  },
  {
    title: 'Limites de Inclinação de Rampas',
    category: 'NBR 9050',
    kind: 'list',
    items: RAMPA_TABLE,
  },
];

/** Índice de normas técnicas, agrupado por disciplina. */
export const NORM_SECTIONS = [
  {
    title: 'Estruturas',
    category: 'Projeto Estrutural',
    items: [
      { code: 'NBR 6118', org: 'ABNT', desc: 'Projeto de estruturas de concreto armado e protendido: cobrimentos, durabilidade, estados-limite e detalhamento.' },
      { code: 'NBR 7480', org: 'ABNT', desc: 'Especificação do aço destinado a armaduras para concreto armado (bitolas, massas nominais, categorias CA-50/CA-60).' },
      { code: 'NBR 8800', org: 'ABNT', desc: 'Projeto de estruturas de aço e de estruturas mistas de aço e concreto para edifícios.' },
      { code: 'NBR 6120', org: 'ABNT', desc: 'Ações para o cálculo de estruturas de edificações — cargas permanentes e acidentais de referência.' },
      { code: 'NBR 6123', org: 'ABNT', desc: 'Forças devidas ao vento em edificações — determinação das cargas de vento para o projeto estrutural.' },
      { code: 'NBR 12655', org: 'ABNT', desc: 'Concreto de cimento Portland — preparo, controle, recebimento e aceitação.' },
      { code: 'NBR 14931', org: 'ABNT', desc: 'Execução de estruturas de concreto — requisitos para fôrmas, escoramentos, lançamento e cura.' },
    ],
  },
  {
    title: 'Fundações & Geotecnia',
    category: 'Solos',
    items: [
      { code: 'NBR 6122', org: 'ABNT', desc: 'Projeto e execução de fundações — critérios de dimensionamento e investigação do subsolo.' },
      { code: 'NBR 6484', org: 'ABNT', desc: 'Sondagem de simples reconhecimento com SPT — método de execução do ensaio.' },
      { code: 'NBR 7181', org: 'ABNT', desc: 'Solo — análise granulométrica, para classificação e caracterização de solos em projeto.' },
      { code: 'NBR 11682', org: 'ABNT', desc: 'Estabilidade de taludes — critérios para análise e verificação de segurança de taludes de corte e aterro.' },
    ],
  },
  {
    title: 'Instalações Prediais',
    category: 'Instalações',
    items: [
      { code: 'NBR 5410', org: 'ABNT', desc: 'Instalações elétricas de baixa tensão — requisitos de projeto e execução em edificações.' },
      { code: 'NBR 5626', org: 'ABNT', desc: 'Instalação predial de água fria — dimensionamento de tubulações e reservatórios.' },
      { code: 'NBR 8160', org: 'ABNT', desc: 'Sistemas prediais de esgoto sanitário — projeto e execução.' },
      { code: 'NBR 5419', org: 'ABNT', desc: 'Proteção contra descargas atmosféricas (SPDA) — projeto e instalação de para-raios.' },
    ],
  },
  {
    title: 'Acessibilidade & Desempenho',
    category: 'Uso e Ocupação',
    items: [
      { code: 'NBR 9050', org: 'ABNT', desc: 'Acessibilidade a edificações, mobiliário, espaços e equipamentos urbanos — rampas, rotas acessíveis e sinalização.' },
      { code: 'NBR 15575', org: 'ABNT', desc: 'Edificações habitacionais — desempenho, com requisitos mínimos para os sistemas da construção.' },
    ],
  },
  {
    title: 'Segurança do Trabalho',
    category: 'Normas Regulamentadoras',
    items: [
      { code: 'NR-18', org: 'MTE', desc: 'Condições e meio ambiente de trabalho na indústria da construção — segurança de canteiro de obras.' },
      { code: 'NR-35', org: 'MTE', desc: 'Trabalho em altura — requisitos mínimos para planejamento, organização e execução do trabalho acima de 2 m.' },
    ],
  },
];

/** Lista de calculadoras, usada para montar a navegação, os favoritos e o histórico. */
export const CALCULATORS = [
  { id: 'calc-rampas', group: 'Geometria & Topografia', name: 'Rampas & Declividades', tag: 'NBR 9050' },
  { id: 'calc-estacas', group: 'Geometria & Topografia', name: 'Interpolação de Estacas', tag: 'Greide' },
  { id: 'calc-taludes', group: 'Geometria & Topografia', name: 'Taludes (V:H e %)', tag: 'Terrapl.' },
  { id: 'calc-superlargura', group: 'Geometria & Topografia', name: 'Superlargura em Curvas', tag: 'DNIT' },
  { id: 'calc-blondel', group: 'Geometria & Topografia', name: 'Escadas (Blondel)', tag: 'Conforto' },
  { id: 'calc-manning', group: 'Hidráulica & Drenagem', name: 'Sarjetas & Canais', tag: 'Manning' },
  { id: 'calc-empolamento', group: 'Pavimentação & Solos', name: 'Empolamento & Caçambas', tag: 'Corte/Aterro' },
  { id: 'calc-ligante', group: 'Pavimentação & Solos', name: 'Taxa de Ligante Asfáltico', tag: 'Espargidor' },
  { id: 'calc-vergalhao', group: 'Estruturas', name: 'Peso de Vergalhões', tag: 'NBR 7480' },
  { id: 'calc-quantitativos', group: 'Quantitativos & Orçamento', name: 'Tabela de Quantitativos', tag: 'CSV' },
];
