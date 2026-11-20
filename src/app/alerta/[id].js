import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import Card from '../../components/Card';
import Selo from '../../components/Selo';
import Botao from '../../components/Botao';
import CampoTexto from '../../components/CampoTexto';
import SeletorOpcoes from '../../components/SeletorOpcoes';
import { NOME_NIVEL } from '../../components/AlertaCard';
import { usePainel } from '../../context/PainelContext';
import { OPCOES_DECISAO, validarDecisao } from '../../services/validacao';
import { cores, espaco, fonte } from '../../theme';

export default function TelaDetalheAlerta() {
  const params = useLocalSearchParams();
  // O parâmetro pode vir como lista (ex.: /alerta/a/b) ou vazio
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();
  const { alertas, regiao, registrarDecisao, carregado, clima } = usePainel();
  const alerta = typeof id === 'string' ? alertas.find((a) => a.id === id) : undefined;

  // Estado do formulário
  const [decisao, setDecisao] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [justificativa, setJustificativa] = useState('');
  const [ciente, setCiente] = useState(false);
  const [erros, setErros] = useState({});
  const [salvando, setSalvando] = useState(false);

  // Se a tela foi aberta direto pelo link, não existe tela anterior para voltar
  function voltar() {
    if (router.canGoBack()) router.back();
    else router.replace('/alertas');
  }

  // Alertas de clima só existem depois que a previsão carrega
  const aindaCarregando = !carregado || (clima.status === 'carregando' && !clima.dados);
  if (!alerta && aindaCarregando) {
    return (
      <View style={[estilos.tela, estilos.centro]}>
        <ActivityIndicator color={cores.primaria} accessibilityLabel="Carregando alerta" />
      </View>
    );
  }

  if (!alerta) {
    return (
      <View style={estilos.tela}>
        <Card titulo="Alerta não encontrado" icone="search">
          <Text style={estilos.texto}>
            Esse alerta não existe ou não está mais ativo para {regiao.nome}. Ele pode ter sido resolvido ou ser de
            outra região.
          </Text>
          <Botao titulo="Ver alertas ativos" variante="secundaria" onPress={() => router.replace('/alertas')} />
        </Card>
      </View>
    );
  }

  function salvar() {
    if (salvando) return; // evita registrar duas vezes com toque duplo
    const novosErros = validarDecisao({ decisao, responsavel, justificativa, ciente });
    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) return;

    setSalvando(true);
    registrarDecisao({
      // "Foto" do alerta no momento da decisão: o histórico não depende do alerta continuar ativo
      alertaId: alerta.id,
      alertaTitulo: alerta.titulo,
      alertaNivel: alerta.nivel,
      alertaConfianca: alerta.confianca?.nivel ?? null,
      regiaoId: regiao.id,
      regiaoNome: regiao.nome,
      decisao,
      responsavel: responsavel.trim(),
      justificativa: justificativa.trim(),
    });
    if (Platform.OS !== 'web') {
      Alert.alert('Decisão registrada', 'Você pode consultar o histórico na aba Decisões.');
    }
    voltar();
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={estilos.tela} keyboardShouldPersistTaps="handled">
        <View style={estilos.selos}>
          <Selo texto={NOME_NIVEL[alerta.nivel] ?? 'ALERTA'} tom={alerta.nivel} />
          <Selo texto={regiao.nome} />
        </View>
        <Text style={estilos.titulo} accessibilityRole="header">
          {alerta.titulo}
        </Text>

        <Card titulo="Por que este alerta?" icone="help-circle">
          <Text style={estilos.texto}>{alerta.justificativa}</Text>
        </Card>

        <Card titulo={`Confiança: ${alerta.confianca.nivel}`} icone="stats-chart">
          <Text style={estilos.texto}>{alerta.confianca.explicacao}</Text>
        </Card>

        <Card titulo="Limitações" icone="warning">
          {(alerta.limitacoes ?? []).map((l) => (
            <Text key={l} style={estilos.item}>
              • {l}
            </Text>
          ))}
        </Card>

        <Card titulo="Sugestão para avaliação" icone="bulb">
          <Text style={estilos.texto}>{alerta.sugestao}</Text>
        </Card>

        {/* Formulário de decisão do gestor */}
        <Card titulo="Registrar decisão do gestor" icone="create">
          <Text style={estilos.rotulo}>Decisão</Text>
          <SeletorOpcoes
            rotuloGrupo="Decisão"
            opcoes={OPCOES_DECISAO}
            selecionado={decisao}
            aoSelecionar={setDecisao}
          />
          {erros.decisao ? <Text style={estilos.erro}>{erros.decisao}</Text> : null}
          <View style={{ height: espaco.m }} />

          <CampoTexto
            rotulo="Responsável"
            placeholder="Nome do gestor"
            value={responsavel}
            onChangeText={setResponsavel}
            erro={erros.responsavel}
            autoCapitalize="words"
            maxLength={60}
          />

          <CampoTexto
            rotulo="Justificativa"
            dica="Não inclua dados pessoais de cidadãos (nome, CPF, telefone)."
            placeholder="Explique o motivo da decisão"
            value={justificativa}
            onChangeText={setJustificativa}
            erro={erros.justificativa}
            multiline
            maxLength={500}
          />

          <Pressable
            onPress={() => setCiente(!ciente)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: ciente }}
            accessibilityLabel="Li a justificativa e as limitações deste alerta"
            style={estilos.checkbox}
          >
            <Ionicons
              name={ciente ? 'checkbox' : 'square-outline'}
              size={26}
              color={cores.primaria}
              importantForAccessibility="no"
            />
            <Text style={estilos.checkboxTexto}>Li a justificativa e as limitações deste alerta</Text>
          </Pressable>
          {erros.ciente ? <Text style={estilos.erro}>{erros.ciente}</Text> : null}

          <View style={{ marginTop: espaco.m }}>
            <Botao titulo="Salvar decisão" onPress={salvar} desabilitado={salvando} />
          </View>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  tela: { padding: espaco.m, paddingBottom: espaco.g * 2 },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  selos: { flexDirection: 'row', gap: 6, marginBottom: espaco.p },
  titulo: { fontSize: fonte.titulo, fontWeight: '800', color: cores.texto, marginBottom: espaco.m },
  texto: { fontSize: fonte.corpo, color: cores.texto, lineHeight: 22, marginBottom: espaco.m },
  item: { fontSize: fonte.corpo, color: cores.texto, lineHeight: 22, marginBottom: 4 },
  rotulo: { fontSize: fonte.corpo, fontWeight: '700', color: cores.texto, marginBottom: 6 },
  erro: { color: cores.critico, fontSize: fonte.pequeno, marginTop: 4 },
  checkbox: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 44 },
  checkboxTexto: { flex: 1, fontSize: fonte.corpo, color: cores.texto },
});
