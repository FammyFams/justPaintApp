import { router } from 'expo-router';
import { useState } from 'react';
import { AccessibilityInfo, StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { FormError } from '@/components/form-error';
import { Text } from '@/components/text';
import { TextField } from '@/components/text-field';
import { TextLink } from '@/components/text-link';
import { errorMessage, useSession } from '@/data/account';
import { COMMENT_MAX_LENGTH, useAddComment } from '@/data/comments';
import { spacing } from '@/theme';

// Shows how many characters are left once they're this close to the limit.
const NEAR_LIMIT = 100;

// Under the comments. Signed out, a link to the sign-in sheet instead. The
// text only clears once the website has the comment; if sending fails it
// stays, with the reason above the button.
export function CommentBox({ paintingId }: { paintingId: string }) {
  const { signedIn } = useSession();
  const [text, setText] = useState('');
  const add = useAddComment(paintingId);

  if (!signedIn) {
    return <TextLink title="sign in to comment" onPress={() => router.push('/require-account')} />;
  }

  const left = COMMENT_MAX_LENGTH - text.length;

  const send = () => {
    if (add.isPending) return;
    add.mutate(text, {
      onSuccess: () => {
        setText('');
        AccessibilityInfo.announceForAccessibility('comment posted');
      },
    });
  };

  return (
    <View style={styles.box}>
      <TextField
        label="add a comment"
        value={text}
        onChangeText={(value) => {
          setText(value);
          if (add.isError) add.reset();
        }}
        placeholder="say something about this piece"
        multiline
        maxLength={COMMENT_MAX_LENGTH}
      />
      <FormError message={add.error && errorMessage(add.error)} />
      <View style={styles.actions}>
        <Text variant="caption" accessibilityLiveRegion="polite">
          {left <= NEAR_LIMIT ? `${left} ${left === 1 ? 'character' : 'characters'} left` : ''}
        </Text>
        <Button title="post" onPress={send} loading={add.isPending} disabled={!text.trim()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    gap: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
});
