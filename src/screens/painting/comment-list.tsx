import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Text } from '@/components/text';
import { useComments } from '@/data/comments';
import { formatDate } from '@/lib/dates';
import { CommentBox } from '@/screens/painting/comment-box';
import { colors, fonts, spacing } from '@/theme';

// Oldest first, like a conversation, with the comment box at the end.
export function CommentList({ paintingId }: { paintingId: string }) {
  const comments = useComments(paintingId);

  return (
    <View style={styles.section}>
      <Text variant="headline" accessibilityRole="header">
        comments{comments.data && comments.data.length > 0 ? ` (${comments.data.length})` : ''}
      </Text>

      {comments.isPending ? (
        <ActivityIndicator
          color={colors.mutedForeground}
          accessibilityLabel="loading comments"
          style={styles.spinner}
        />
      ) : comments.isError && !comments.data ? (
        <View style={styles.error}>
          <Text variant="subhead">couldn&apos;t load the comments.</Text>
          <Button title="try again" onPress={() => comments.refetch()} />
        </View>
      ) : comments.data.length === 0 ? (
        <Text variant="subhead">no comments yet.</Text>
      ) : (
        comments.data.map((comment) => (
          <View key={comment.id} style={styles.comment}>
            <Text variant="caption">
              <Text variant="caption" tone="default" style={styles.author}>
                {comment.authorName}
              </Text>
              {'  '}
              {formatDate(comment.createdAt)}
            </Text>
            <Text>{comment.body}</Text>
          </View>
        ))
      )}

      <CommentBox paintingId={paintingId} />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.md,
    borderTopColor: colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: spacing.md,
  },
  spinner: {
    alignSelf: 'flex-start',
  },
  error: {
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  comment: {
    gap: 2,
  },
  author: {
    fontFamily: fonts.semibold,
  },
});
