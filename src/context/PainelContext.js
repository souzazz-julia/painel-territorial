import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { REGIOES, gerarIndicadores } from '../data/regioes';
import { buscarClima } from '../services/clima';
import { gerarAlertas } from '../services/previsao';

// Gerenciamento de estado global com Context API.
// Persistência com AsyncStorage: região escolhida, decisões do gestor e último clima (cache offline).
const CHAVES = {
  regiao: '@mirante/regiao',
  decisoes: '@mirante/decisoes',
  clima: '@mirante/clima',
};

// ---------- Leitura e escrita seguras no AsyncStorage ----------
// Dado corrompido ou em formato antigo é descartado em vez de quebrar o app.
const climaValido = (dados) => Array.isArray(dados?.dias) && dados.dias.length > 0;
const decisaoValida = (d) =>
  d && typeof d.id === 'string' && typeof d.alertaId === 'string' && typeof d.justificativa === 'string';

function converterJSON(texto, validar) {
  if (!texto) return null;
  try {
    const dados = JSON.parse(texto);
    return validar(dados) ? dados : null;
  } catch {
    return null;
  }
}

async function lerCacheClima(regiaoId) {
  try {
    const texto = await AsyncStorage.getItem(`${CHAVES.clima}/${regiaoId}`);
    return converterJSON(texto, climaValido);
  } catch {
    return null;
  }
}

async function salvar(chave, valor) {
  try {
    await AsyncStorage.setItem(chave, typeof valor === 'string' ? valor : JSON.stringify(valor));
  } catch (erro) {
    console.warn(`Falha ao salvar ${chave}`, erro);
  }
}

const PainelContext = createContext(null);

export function PainelProvider({ children }) {
  const [carregado, setCarregado] = useState(false);
  const [regiaoId, setRegiaoId] = useState(REGIOES[0].id);
  const [decisoes, setDecisoes] = useState([]);
  // status: 'carregando' | 'ok' | 'cache' (sem rede, usando o salvo) | 'erro' (sem rede e sem cache)
  const [clima, setClima] = useState({ status: 'carregando', dados: null, erro: null, regiaoId: null });
  const ultimaBusca = useRef(0);
  // Só grava decisões depois de ler o que já existia, para não apagar o histórico se a leitura falhar
  const podeSalvarDecisoes = useRef(false);

  // 1. Ao abrir o app, recupera o que foi salvo no aparelho
  useEffect(() => {
    async function carregarSalvos() {
      try {
        const [regiaoSalva, decisoesSalvas] = await Promise.all([
          AsyncStorage.getItem(CHAVES.regiao),
          AsyncStorage.getItem(CHAVES.decisoes),
        ]);
        if (regiaoSalva && REGIOES.some((r) => r.id === regiaoSalva)) setRegiaoId(regiaoSalva);
        const lista = converterJSON(decisoesSalvas, Array.isArray);
        if (lista) setDecisoes(lista.filter(decisaoValida));
        podeSalvarDecisoes.current = true;
      } catch (erro) {
        console.warn('Falha ao ler dados salvos', erro);
      } finally {
        setCarregado(true);
      }
    }
    carregarSalvos();
  }, []);

  // 2. Sempre que a lista de decisões muda, salva no aparelho
  useEffect(() => {
    if (carregado && podeSalvarDecisoes.current) salvar(CHAVES.decisoes, decisoes);
  }, [decisoes, carregado]);

  const regiao = useMemo(() => REGIOES.find((r) => r.id === regiaoId) ?? REGIOES[0], [regiaoId]);
  const indicadores = useMemo(() => gerarIndicadores(regiao), [regiao]);

  // 3. Busca o clima na API. Se a rede falhar, usa o último clima salvo da região (cache).
  const carregarClima = useCallback(async () => {
    const buscaAtual = ++ultimaBusca.current;
    // Ao atualizar a mesma região, mantém os dados na tela enquanto carrega
    setClima((anterior) => ({
      status: 'carregando',
      dados: anterior.regiaoId === regiao.id ? anterior.dados : null,
      erro: null,
      regiaoId: regiao.id,
    }));

    try {
      const dados = await buscarClima(regiao.latitude, regiao.longitude);
      if (buscaAtual !== ultimaBusca.current) return; // usuário já trocou de região
      setClima({ status: 'ok', dados, erro: null, regiaoId: regiao.id });
      salvar(`${CHAVES.clima}/${regiao.id}`, dados);
    } catch {
      const cache = await lerCacheClima(regiao.id);
      if (buscaAtual !== ultimaBusca.current) return;
      setClima(
        cache
          ? {
              status: 'cache',
              dados: cache,
              erro: 'Sem conexão com a API. Mostrando a última previsão salva.',
              regiaoId: regiao.id,
            }
          : {
              status: 'erro',
              dados: null,
              erro: 'Não foi possível buscar a previsão do tempo. Verifique a conexão.',
              regiaoId: regiao.id,
            }
      );
    }
  }, [regiao]);

  useEffect(() => {
    if (carregado) carregarClima();
  }, [carregado, carregarClima]);

  // Só usa o clima se ele for da região selecionada
  const climaDaRegiao = clima.regiaoId === regiao.id ? clima.dados : null;
  const alertas = useMemo(
    () => gerarAlertas(regiao, indicadores, climaDaRegiao),
    [regiao, indicadores, climaDaRegiao]
  );

  const escolherRegiao = useCallback((id) => {
    if (!REGIOES.some((r) => r.id === id)) return;
    setRegiaoId(id);
    salvar(CHAVES.regiao, id);
  }, []);

  const registrarDecisao = useCallback((dados) => {
    // Data em base 36 + sufixo aleatório: evita colisão se duas decisões forem salvas no mesmo milissegundo
    const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    const nova = { ...dados, id, registradaEm: new Date().toISOString() };
    podeSalvarDecisoes.current = true;
    setDecisoes((lista) => [nova, ...lista]);
  }, []);

  const removerDecisao = useCallback((id) => {
    podeSalvarDecisoes.current = true;
    setDecisoes((lista) => lista.filter((d) => d.id !== id));
  }, []);

  const valor = {
    carregado,
    regiao,
    regioes: REGIOES,
    indicadores,
    clima,
    alertas,
    decisoes,
    escolherRegiao,
    carregarClima,
    registrarDecisao,
    removerDecisao,
  };

  return <PainelContext.Provider value={valor}>{children}</PainelContext.Provider>;
}

export function usePainel() {
  const contexto = useContext(PainelContext);
  if (!contexto) throw new Error('usePainel precisa estar dentro de <PainelProvider>');
  return contexto;
}
