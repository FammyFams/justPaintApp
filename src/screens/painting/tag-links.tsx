import { Link } from 'expo-router';
import { Fragment } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/text';
import type { Tag } from '@/data/paintings';
import { fonts, touchTarget } from '@/theme';

// A painting's tags as plain lowercase words, each opening every painting with
// that tag (the website links them to /?tag=).
export function TagLinks({ tags }: { tags: Tag[] }) {
  return (
    <View style={styles.row}>
      {tags.map((tag, i) => (
        <Fragment key={tag.id}>
          <Link href={{ pathname: '/tag/[slug]', params: { slug: tag.slug } }} asChild>
            <Pressable
              accessibilityRole="link"
              accessibilityLabel={`Paintings tagged ${tag.name.toLowerCase()}`}
              style={({ pressed }) => [styles.link, pressed && styles.pressed]}
            >
              <Text variant="subhead" tone="primary" style={styles.name}>
                {tag.name.toLowerCase()}
              </Text>
            </Pressable>
          </Link>
          {i < tags.length - 1 && <Text variant="subhead">, </Text>}
        </Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  link: {
    minHeight: touchTarget,
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
  name: {
    fontFamily: fonts.semibold,
  },
});
