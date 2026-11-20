import { Pressable, StyleSheet, Text, View } from 'react-native';
import { cores, fonte } from '../theme';

// Lista de opções em "chips" onde só uma pode ser escolhida (como um radio button)
// opcoes: [{ valor: 'x', rotulo: 'X' }]
export default function SeletorOpcoes({ opcoes, selecionado, aoSelecionar, rotuloGrupo }) {
  return (
    <View style={estilos.linha} accessibilityRole="radiogroup" accessibilityLabel={rotuloGrupo}>
      {opcoes.map((opcao) => {
        const ativo = opcao.valor === selecionado;
        return (
          <Pressable
            key={opcao.valor}
            onPress={() => aoSelecionar(opcao.valor)}
            accessibilityRole="radio"
            accessibilityState={{ checked: ativo }}
            accessibilityLabel={opcao.rotulo}
            style={[estilos.chip, ativo && estilos.chipAtivo]}
          >
            <Text style={[estilos.texto, ativo && estilos.textoAtivo]}>{opcao.rotulo}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const estilos = StyleSheet.create({
  linha: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: cores.primaria,
    backgroundColor: cores.superficie,
  },
  chipAtivo: { backgroundColor: cores.primaria },
  texto: { color: cores.primaria, fontSize: fonte.corpo, fontWeight: '600' },
  textoAtivo: { color: '#FFFFFF' },
});
