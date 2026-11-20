export const OPCOES_DECISAO = [
  { valor: 'aprovar', rotulo: 'Aprovar sugestão' },
  { valor: 'adaptar', rotulo: 'Adaptar ação' },
  { valor: 'monitorar', rotulo: 'Só monitorar' },
  { valor: 'descartar', rotulo: 'Descartar alerta' },
];

// ---------- Detecção de dados pessoais (privacidade) ----------
// Os padrões usam (?:^|\D) e (?!\d) para não pegar pedaços de números maiores,
// como volumes ("72.000.000 m³") ou códigos longos.

// CPF: 11 dígitos, com ou sem pontuação (123.456.789-09 / 123 456 789 09 / 12345678909)
const PADRAO_CPF = /(?:^|\D)(\d{3})([.\s]?)(\d{3})\2(\d{3})[-\s]?(\d{2})(?!\d)/g;

// E-mail: usuario@dominio.com — e também a forma escrita "fulano arroba gmail ponto com"
const PADRAO_EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/;
const PADRAO_EMAIL_ESCRITO = /\b\S+\s+arroba\s+\S+\s+ponto\s+\S+/i;

// Telefone com DDD (os DDDs do Brasil nunca terminam em 0): (11) 98765-4321, +55 11 9 8765 4321, 1132654321
const PADRAO_TELEFONE_DDD = /(?:^|\D)(?:\+?55[\s-]?)?\(?[1-9][1-9]\)?[\s-]?(?:9[\s.-]?)?\d{4}[\s.-]?\d{4}(?!\d)/;
// Celular sem DDD: 98765-4321 / 9 8765-4321 (exige o 9 inicial para não confundir com "2025-2026")
const PADRAO_CELULAR_SEM_DDD = /(?:^|\D)9[\s.]?\d{4}[\s.-]\d{4}(?!\d)/;

// Confere os dígitos verificadores do CPF
function cpfValido(digitos) {
  if (digitos.length !== 11 || /^(\d)\1{10}$/.test(digitos)) return false;
  const calcularDigito = (quantidade) => {
    let soma = 0;
    for (let i = 0; i < quantidade; i++) soma += Number(digitos[i]) * (quantidade + 1 - i);
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };
  return calcularDigito(9) === Number(digitos[9]) && calcularDigito(10) === Number(digitos[10]);
}

function contemCpf(texto) {
  for (const encontrado of texto.matchAll(PADRAO_CPF)) {
    const trecho = encontrado[0];
    const digitos = trecho.replace(/\D/g, '');
    // Com pontuação de CPF (ponto ou traço) já é bloqueado; só números, bloqueia se o CPF for válido
    if (/[.-]/.test(trecho) || cpfValido(digitos)) return true;
  }
  return false;
}

export function contemDadoPessoal(texto) {
  if (!texto) return false;
  return (
    contemCpf(texto) ||
    PADRAO_EMAIL.test(texto) ||
    PADRAO_EMAIL_ESCRITO.test(texto) ||
    PADRAO_TELEFONE_DDD.test(texto) ||
    PADRAO_CELULAR_SEM_DDD.test(texto)
  );
}

// ---------- Validação do formulário ----------
// Letras, incluindo acentos (sem os símbolos × e ÷ que ficam no meio da faixa À-ÿ)
const LETRA = /[A-Za-zÀ-ÖØ-öø-ÿ]/g;
const NOME_PERMITIDO = /^[A-Za-zÀ-ÖØ-öø-ÿ\s.'-]+$/;

// Retorna um objeto com as mensagens de erro de cada campo.
// Se o objeto voltar vazio, o formulário é válido.
export function validarDecisao({ decisao, responsavel, justificativa, ciente } = {}) {
  const erros = {};
  const nome = String(responsavel ?? '').trim();
  const texto = String(justificativa ?? '').trim();
  const quantidadeLetras = (nome.match(LETRA) ?? []).length;

  if (!OPCOES_DECISAO.some((opcao) => opcao.valor === decisao)) {
    erros.decisao = 'Escolha uma decisão.';
  }

  if (!NOME_PERMITIDO.test(nome) && nome.length > 0) {
    erros.responsavel = 'Use apenas letras no nome do responsável.';
  } else if (quantidadeLetras < 3) {
    erros.responsavel = 'Informe o nome do responsável (mínimo 3 letras).';
  }

  if (texto.length < 15) {
    erros.justificativa = 'Explique a decisão com pelo menos 15 caracteres.';
  } else if (texto.length > 500) {
    erros.justificativa = 'A justificativa pode ter no máximo 500 caracteres.';
  } else if (contemDadoPessoal(texto)) {
    erros.justificativa = 'Remova dados pessoais (CPF, e-mail ou telefone) da justificativa.';
  }

  if (!ciente) {
    erros.ciente = 'Confirme que leu a justificativa e as limitações do alerta.';
  }

  return erros;
}
