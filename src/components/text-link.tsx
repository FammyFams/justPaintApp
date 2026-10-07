import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { Text } from '@/components/text';
import { fonts, touchTarget } from '@/theme';

type TextLinkProps = {
  title: string;
  onPress: () => void;
  // "link" opens a page; "button" does something here.
  role?: 'link' | 'button';
  style?: StyleProp<ViewStyle>;
};

// Crimson words that act like a link, with a full-size touch target.
export function TextLink({ title, onPress, role = 'button', style }: TextLinkProps) {
  return (
    <Pressable
      accessibilityRole={role}
      accessibilityLabel={title}
      onPress={onPress}
      hitSlop={4}
      style={({ pressed }) => [styles.link, pressed && styles.pressed, style]}
    >
      <Text variant="subhead" tone="primary" style={styles.text}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  link: {
    alignSelf: 'flex-start',
    minHeight: touchTarget,
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
  text: {
    fontFamily: fonts.semibold,
  },
});
