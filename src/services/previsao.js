import { formatarNumero, formatarPercentual, formatarDiaMes } from '../utils/formato';

// Quantos dias à frente o app projeta a tendência
export const HORIZONTE_DIAS = 7;

// Limites usados nos alertas
const LIMITE_ATENCAO = 0.9; // 90% da capacidade
const CHUVA_FORTE_DIA_MM = 30;
const CHUVA_ACUMULADA_3_DIAS_MM = 50;
const CALOR_INTENSO_C = 32;

// Regressão linear simples (mínimos quadrados).
// Retorna a reta de tendência e o R², que diz o quanto os dados seguem essa reta (0 a 1).
export function regressaoLinear(valores) {
  const n = valores?.length ?? 0;
  if (n === 0) return { inclinacao: 0, intercepto: 0, r2: 0, prever: () => 0 };
  const mediaX = (n - 1) / 2;
  const mediaY = valores.reduce((soma, y) => soma + y, 0) / n;

  let numerador = 0;
  let denominador = 0;
  valores.forEach((y, x) => {
    numerador += (x - mediaX) * (y - mediaY);
    denominador += (x - mediaX) ** 2;
  });

  const inclinacao = denominador === 0 ? 0 : numerador / denominador;
  const intercepto = mediaY - inclinacao * mediaX;
  const prever = (x) => intercepto + inclinacao * x;

  const somaTotal = valores.reduce((s, y) => s + (y - mediaY) ** 2, 0);
  const somaResiduos = valores.reduce((s, y, x) => s + (y - prever(x)) ** 2, 0);
  const r2 = somaTotal === 0 ? 0 : 1 - somaResiduos / somaTotal;

  return { inclinacao, intercepto, r2, prever };
}

export function nivelConfianca(valor) {
  if (valor >= 0.7) return 'Alta';
  if (valor >= 0.4) return 'Média';
  return 'Baixa';
}

const LIMITACOES_TENDENCIA = [
  'Os dados de consumo são sintéticos (simulados) para fins acadêmicos.',
  'O modelo é uma tendência linear simples: não prevê eventos atípicos como feriados, falhas ou obras.',
  'A série tem só 14 dias, e a incerteza aumenta quanto mais distante for a projeção.',
];

const LIMITACOES_CLIMA = [
  'A previsão vem de modelos meteorológicos (Open-Meteo) e pode mudar a cada atualização.',
  'A previsão é para um ponto da região, não para cada rua.',
  'O app não conhece a drenagem nem as áreas de risco reais do bairro.',
];

// Alerta quando a projeção do indicador chega a 90% ou mais da capacidade
function alertaDeTendencia(regiao, indicador) {
  const valores = indicador?.serie?.map((p) => p?.valor).filter(Number.isFinite);
  // Sem dados suficientes (ou sem capacidade definida) não dá para projetar nada
  if (!valores?.length || valores.length < 2 || !(indicador.capacidade > 0)) return null;

  const { inclinacao, r2, prever } = regressaoLinear(valores);
  const projecao = prever(valores.length - 1 + HORIZONTE_DIAS);
  const uso = projecao / indicador.capacidade;

  if (inclinacao <= 0 || uso < LIMITE_ATENCAO) return null;

  const critico = uso >= 1;
  const u = indicador.unidade;

  return {
    id: `${regiao.id}-${indicador.chave}`,
    icone: indicador.icone,
    nivel: critico ? 'critico' : 'atencao',
    titulo: critico
      ? `${indicador.nome} deve passar da capacidade`
      : `${indicador.nome} perto do limite`,
    justificativa:
      `Nos últimos ${valores.length} dias, o indicador aumentou em média ${formatarNumero(inclinacao)} a cada dia (em ${u}). ` +
      `Se essa tendência continuar, a projeção para daqui a ${HORIZONTE_DIAS} dias é de ${formatarNumero(projecao)} ${u}, ` +
      `ou ${formatarPercentual(uso)} da capacidade da região (${formatarNumero(indicador.capacidade)} ${u}).`,
    confianca: {
      nivel: nivelConfianca(r2),
      explicacao: `Calculada pelo ajuste da reta de tendência aos dados (R² = ${r2.toFixed(2).replace('.', ',')}). Quanto mais perto de 1, mais os dados seguem a tendência.`,
    },
    limitacoes: LIMITACOES_TENDENCIA,
    sugestao: indicador.sugestao,
  };
}

function alertasDeClima(regiao, clima) {
  if (!Array.isArray(clima?.dias)) return [];
  const proximos = clima.dias
    .slice(0, 3)
    .filter(Boolean)
    .map((d) => ({ ...d, chuva: Number.isFinite(d.chuva) ? d.chuva : 0 }));
  if (!proximos.length) return [];
  const alertas = [];

  // Risco de alagamento
  const diaMaisChuvoso = proximos.reduce((maior, d) => (d.chuva > maior.chuva ? d : maior));
  const chuvaAcumulada = proximos.reduce((soma, d) => soma + d.chuva, 0);
  if (diaMaisChuvoso.chuva >= CHUVA_FORTE_DIA_MM || chuvaAcumulada >= CHUVA_ACUMULADA_3_DIAS_MM) {
    const prob = diaMaisChuvoso.probChuva;
    alertas.push({
      id: `${regiao.id}-chuva-${diaMaisChuvoso.data}`, // inclui a data: chuva de outro dia é outro alerta
      icone: 'rainy',
      nivel: diaMaisChuvoso.chuva >= 50 ? 'critico' : 'atencao',
      titulo: 'Risco de alagamento por chuva forte',
      justificativa:
        `A previsão indica ${formatarNumero(diaMaisChuvoso.chuva, 1)} mm de chuva em ${formatarDiaMes(diaMaisChuvoso.data)} ` +
        `e ${formatarNumero(chuvaAcumulada, 1)} mm acumulados nos próximos 3 dias. ` +
        `Volumes acima de ${CHUVA_FORTE_DIA_MM} mm em um dia costumam sobrecarregar a drenagem urbana.`,
      confianca: {
        nivel: prob === null ? 'Média' : nivelConfianca(prob / 100),
        explicacao:
          prob === null
            ? 'A API não informou a probabilidade de chuva para esse dia.'
            : `Baseada na probabilidade de chuva informada pela previsão: ${prob}%.`,
      },
      limitacoes: LIMITACOES_CLIMA,
      sugestao:
        'Avaliar limpeza preventiva de bueiros e deixar a Defesa Civil de sobreaviso nas áreas mais baixas.',
    });
  }

  // Calor intenso
  const diaMaisQuente = proximos.reduce((maior, d) => ((d.tempMax ?? 0) > (maior.tempMax ?? 0) ? d : maior));
  if ((diaMaisQuente.tempMax ?? 0) >= CALOR_INTENSO_C) {
    alertas.push({
      id: `${regiao.id}-calor-${diaMaisQuente.data}`,
      icone: 'thermometer',
      nivel: diaMaisQuente.tempMax >= 35 ? 'critico' : 'atencao',
      titulo: 'Calor intenso nos próximos dias',
      justificativa:
        `A máxima prevista é de ${formatarNumero(diaMaisQuente.tempMax, 1)} °C em ${formatarDiaMes(diaMaisQuente.data)}. ` +
        'Dias muito quentes aumentam o consumo de água e energia e o risco à saúde de idosos e crianças.',
      confianca: {
        nivel: 'Média',
        explicacao: 'Previsões de temperatura para 1 a 3 dias costumam ser boas, mas podem variar alguns graus.',
      },
      limitacoes: LIMITACOES_CLIMA,
      sugestao: 'Avaliar a abertura de pontos de hidratação e um aviso preventivo à população.',
    });
  }

  return alertas;
}

const PESO_NIVEL = { critico: 0, atencao: 1 };
const PESO_CONFIANCA = { Alta: 0, Média: 1, Baixa: 2 };

// Ordena: 1º nível (crítico antes de atenção), 2º confiança (Alta antes de Baixa),
// 3º título em ordem alfabética, para a lista nunca mudar de ordem sozinha.
export function compararAlertas(a, b) {
  return (
    (PESO_NIVEL[a.nivel] ?? 9) - (PESO_NIVEL[b.nivel] ?? 9) ||
    (PESO_CONFIANCA[a.confianca?.nivel] ?? 9) - (PESO_CONFIANCA[b.confianca?.nivel] ?? 9) ||
    a.titulo.localeCompare(b.titulo, 'pt-BR')
  );
}

// Junta todos os alertas da região
export function gerarAlertas(regiao, indicadores, clima) {
  if (!regiao) return [];
  const deTendencia = Object.values(indicadores ?? {})
    .map((indicador) => alertaDeTendencia(regiao, indicador))
    .filter(Boolean);
  const todos = [...alertasDeClima(regiao, clima), ...deTendencia];
  return todos.sort(compararAlertas);
}
