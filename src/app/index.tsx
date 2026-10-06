import { StyleSheet, Text, View } from 'react-native';

// Placeholder home screen until the tabs arrive in module A3.
export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>JUST PAINT</Text>
      <Text style={styles.tagline}>what did you paint today?</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
  },
  title: {
    color: '#000022',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 1,
  },
  tagline: {
    color: '#c42847',
    fontSize: 18,
  },
});
