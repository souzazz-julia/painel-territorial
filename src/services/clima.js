// Consumo da API pública e gratuita Open-Meteo (não precisa de chave).
// Documentação: https://open-meteo.com/en/docs
const URL_BASE = 'https://api.open-meteo.com/v1/forecast';
const TEMPO_LIMITE_MS = 10000;

export async function buscarClima(latitude, longitude) {
  const parametros = [
    `latitude=${latitude}`,
    `longitude=${longitude}`,
    'current=temperature_2m,relative_humidity_2m',
    'daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max',
    'timezone=America%2FSao_Paulo',
    'forecast_days=7',
  ].join('&');

  // Cancela a requisição se a API demorar demais
  const controle = new AbortController();
  const timer = setTimeout(() => controle.abort(), TEMPO_LIMITE_MS);

  try {
    const resposta = await fetch(`${URL_BASE}?${parametros}`, { signal: controle.signal });
    if (!resposta.ok) throw new Error(`Erro HTTP ${resposta.status}`);
    const json = await resposta.json();
    return normalizar(json);
  } finally {
    clearTimeout(timer);
  }
}

// Converte a resposta da API para o formato usado no app
export function normalizar(json) {
  const diario = json?.daily;
  if (!Array.isArray(diario?.time) || diario.time.length === 0) {
    throw new Error('Resposta inesperada da API de clima');
  }
  return {
    atual: {
      temperatura: json.current?.temperature_2m ?? null,
      umidade: json.current?.relative_humidity_2m ?? null,
    },
    dias: diario.time.map((data, i) => ({
      data,
      tempMax: diario.temperature_2m_max?.[i] ?? null,
      tempMin: diario.temperature_2m_min?.[i] ?? null,
      chuva: diario.precipitation_sum?.[i] ?? 0,
      probChuva: diario.precipitation_probability_max?.[i] ?? null,
    })),
    atualizadoEm: new Date().toISOString(),
  };
}
