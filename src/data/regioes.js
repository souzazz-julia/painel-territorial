// ATENÇÃO: os dados de consumo deste arquivo são SINTÉTICOS (simulados),
// criados apenas para fins acadêmicos. As coordenadas são reais e usadas
// para buscar o clima na API pública Open-Meteo.
// Todos os números são agregados por região: nenhum dado de cidadão.

export const INDICADORES = {
  agua: {
    nome: 'Consumo de água',
    unidade: 'm³/dia',
    icone: 'water',
    sugestao:
      'Avaliar com a concessionária uma campanha de uso consciente e a verificação de vazamentos na rede.',
  },
  energia: {
    nome: 'Consumo de energia',
    unidade: 'MWh/dia',
    icone: 'flash',
    sugestao:
      'Avaliar com a distribuidora reforço na rede e comunicação sobre horários de pico.',
  },
  residuos: {
    nome: 'Resíduos coletados',
    unidade: 't/dia',
    icone: 'trash',
    sugestao: 'Avaliar uma rota extra de coleta e reforço nos ecopontos da região.',
  },
  chamados: {
    nome: 'Demanda por serviços',
    unidade: 'chamados/dia',
    icone: 'call',
    sugestao:
      'Avaliar o remanejamento temporário de equipes de atendimento para a região.',
  },
};

// base = valor do primeiro dia | tendencia = crescimento diário (0.01 = 1% ao dia)
// capacidade = limite que a infraestrutura da região suporta por dia
export const REGIOES = [
  {
    id: 'centro',
    nome: 'Centro',
    cidade: 'São Paulo - SP',
    latitude: -23.5505,
    longitude: -46.6333,
    semente: 11,
    indicadores: {
      agua: { base: 52000, tendencia: 0.002, capacidade: 70000 },
      energia: { base: 980, tendencia: 0.011, capacidade: 1200 },
      residuos: { base: 410, tendencia: 0.001, capacidade: 520 },
      chamados: { base: 120, tendencia: 0.004, capacidade: 180 },
    },
  },
  {
    id: 'itaquera',
    nome: 'Itaquera',
    cidade: 'São Paulo - SP',
    latitude: -23.5365,
    longitude: -46.4559,
    semente: 23,
    indicadores: {
      agua: { base: 61000, tendencia: 0.012, capacidade: 72000 },
      energia: { base: 760, tendencia: 0.002, capacidade: 1000 },
      residuos: { base: 380, tendencia: 0.003, capacidade: 470 },
      chamados: { base: 140, tendencia: 0.006, capacidade: 190 },
    },
  },
  {
    id: 'capao',
    nome: 'Capão Redondo',
    cidade: 'São Paulo - SP',
    latitude: -23.6683,
    longitude: -46.7797,
    semente: 37,
    indicadores: {
      agua: { base: 48000, tendencia: 0.003, capacidade: 65000 },
      energia: { base: 690, tendencia: 0.003, capacidade: 950 },
      residuos: { base: 400, tendencia: 0.009, capacidade: 480 },
      chamados: { base: 150, tendencia: 0.012, capacidade: 200 },
    },
  },
  {
    id: 'santana',
    nome: 'Santana',
    cidade: 'São Paulo - SP',
    latitude: -23.5021,
    longitude: -46.6257,
    semente: 41,
    indicadores: {
      agua: { base: 45000, tendencia: 0.001, capacidade: 62000 },
      energia: { base: 640, tendencia: 0.001, capacidade: 900 },
      residuos: { base: 300, tendencia: 0.0, capacidade: 420 },
      chamados: { base: 95, tendencia: 0.002, capacidade: 160 },
    },
  },
];

export const DIAS_HISTORICO = 14;

// Gerador pseudoaleatório com semente: os números "aleatórios" são sempre
// os mesmos, então o app mostra os mesmos dados em toda execução.
function criarAleatorio(semente) {
  let estado = semente;
  return () => {
    estado = (estado * 9301 + 49297) % 233280;
    return estado / 233280;
  };
}

function gerarSerie({ base, tendencia }, semente, hoje) {
  const aleatorio = criarAleatorio(semente);
  return Array.from({ length: DIAS_HISTORICO }, (_, i) => {
    const data = new Date(hoje);
    data.setDate(hoje.getDate() - (DIAS_HISTORICO - 1 - i));
    const cicloSemanal = Math.sin((i / 7) * 2 * Math.PI) * 0.02;
    const ruido = (aleatorio() - 0.5) * 0.03;
    const valor = Math.round(base * (1 + tendencia * i + cicloSemanal + ruido));
    return { data, valor };
  });
}

// Monta as séries dos últimos 14 dias de cada indicador da região.
export function gerarIndicadores(regiao, hoje = new Date()) {
  const resultado = {};
  Object.keys(INDICADORES).forEach((chave, indice) => {
    const config = regiao.indicadores[chave];
    resultado[chave] = {
      ...INDICADORES[chave],
      chave,
      capacidade: config.capacidade,
      serie: gerarSerie(config, regiao.semente + indice * 7, hoje),
    };
  });
  return resultado;
}
