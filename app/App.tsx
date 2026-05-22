import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet } from 'react-native';

import { PreviewPocScreen } from './src/screens/PreviewPocScreen';
import { colors } from './src/theme/tokens';

export default function App() {
  return (
    <SafeAreaView style={styles.root}>
      <PreviewPocScreen />
      <StatusBar style="light" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bgDeep,
  },
});
