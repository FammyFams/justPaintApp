import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { HandCircle } from '@/components/hand-circle';
import { PaperBackground } from '@/components/paper-background';
import { Text } from '@/components/text';
import { spacing } from '@/theme';

// Temporary: shows each theme piece from module A2. Replaced by the tabs in A3.
export function ThemeSampleScreen() {
  const [loading, setLoading] = useState(false);

  const fakeSend = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <PaperBackground>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text variant="largeTitle">just paint</Text>
          <Text variant="caption" tone="primary">
            today&apos;s challenge
          </Text>
          <Text variant="prompt">a cup of tea</Text>

          <Button title="post yours" variant="circled" style={styles.circled} />

          <Text variant="title">text styles</Text>
          <Text variant="headline">headline: what did you paint today?</Text>
          <Text>body: a chronological wall of beginner paintings.</Text>
          <Text variant="subhead">subhead: posted by sam</Text>
          <Text variant="caption">caption: 6 october</Text>

          <Text variant="title">buttons</Text>
          <View style={styles.row}>
            <Button title="send" onPress={fakeSend} loading={loading} />
            <Button title="disabled" disabled />
          </View>

          <Text variant="title">hand circle</Text>
          <View style={styles.circledWord}>
            <Text variant="headline">circled by hand</Text>
            <HandCircle />
          </View>
        </ScrollView>
      </SafeAreaView>
    </PaperBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  content: {
    gap: spacing.md,
    padding: spacing.md,
  },
  circled: {
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  circledWord: {
    alignSelf: 'flex-start',
    padding: spacing.sm,
  },
});
