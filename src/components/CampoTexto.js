import { StyleSheet, Text, TextInput, View } from 'react-native';
import { cores, espaco, fonte, raio } from '../theme';

export default function CampoTexto({ rotulo, erro, dica, multiline, ...props }) {
  return (
    <View style={estilos.grupo}>
      <Text style={estilos.rotulo}>{rotulo}</Text>
      {dica ? <Text style={estilos.dica}>{dica}</Text> : null}
      <TextInput
        accessibilityLabel={rotulo}
        accessibilityHint={dica}
        placeholderTextColor={cores.textoSuave}
        multiline={multiline}
        style={[estilos.campo, multiline && estilos.multilinha, erro && estilos.campoErro]}
        {...props}
      />
      {erro ? (
        <Text style={estilos.erro} accessibilityLiveRegion="polite" accessibilityRole="alert">
          {erro}
        </Text>
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  grupo: { marginBottom: espaco.m },
  rotulo: { fontSize: fonte.corpo, fontWeight: '700', color: cores.texto, marginBottom: 4 },
  dica: { fontSize: fonte.pequeno, color: cores.textoSuave, marginBottom: 6 },
  campo: {
    minHeight: 48,
    borderWidth: 1.5,
    borderColor: cores.borda,
    borderRadius: raio,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: fonte.corpo,
    color: cores.texto,
    backgroundColor: cores.superficie,
  },
  multilinha: { minHeight: 100, textAlignVertical: 'top' },
  campoErro: { borderColor: cores.critico },
  erro: { color: cores.critico, fontSize: fonte.pequeno, marginTop: 4 },
});
