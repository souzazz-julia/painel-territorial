// Formata número no padrão brasileiro: 12345.6 -> "12.346"
export function formatarNumero(valor, casas = 0) {
  if (typeof valor !== 'number' || !Number.isFinite(valor)) return '—';
  const [inteiro, decimal] = Math.abs(valor).toFixed(casas).split('.');
  const comPontos = inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const sinal = valor < 0 ? '-' : '';
  return decimal ? `${sinal}${comPontos},${decimal}` : `${sinal}${comPontos}`;
}

export function formatarPercentual(valor) {
  if (typeof valor !== 'number' || !Number.isFinite(valor)) return '—';
  return `${formatarNumero(valor * 100, 0)}%`;
}

// "2026-11-19" ou Date -> "19/11"
export function formatarDiaMes(data) {
  const d = typeof data === 'string' ? new Date(`${data}T12:00:00`) : new Date(data);
  if (Number.isNaN(d.getTime())) return '—';
  const dia = String(d.getDate()).padStart(2, '0');
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  return `${dia}/${mes}`;
}

export function formatarDataHora(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const hora = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${formatarDiaMes(d)} às ${hora}:${min}`;
}
