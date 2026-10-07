import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { ReportBlockMenu } from '@/components/report-block-menu';
import { Text } from '@/components/text';
import { useBlockedIds } from '@/data/blocks';
import { useComments } from '@/data/comments';
import { formatDate } from '@/lib/dates';
import { CommentBox } from '@/screens/painting/comment-box';
import { colors, fonts, spacing } from '@/theme';

type CommentListProps = {
  paintingId: string;
  // For reports: a comment is reported on its painting.
  paintingTitle: string;
};

// Oldest first, like a conversation, with the comment box at the end.
// Blocked artists' comments are left out.
export function CommentList({ paintingId, paintingTitle }: CommentListProps) {
  const comments = useComments(paintingId);
  const blocked = useBlockedIds();
  const shown = comments.data?.filter((comment) => !blocked.has(comment.authorId));

  return (
    <View style={styles.section}>
      <Text variant="headline" accessibilityRole="header">
        comments{shown && shown.length > 0 ? ` (${shown.length})` : ''}
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
      ) : !shown || shown.length === 0 ? (
        <Text variant="subhead">no comments yet.</Text>
      ) : (
        shown.map((comment) => (
          <View key={comment.id} style={styles.row}>
            <View style={styles.comment}>
              <Text variant="caption">
                <Text variant="caption" tone="default" style={styles.author}>
                  {comment.authorName}
                </Text>
                {'  '}
                {formatDate(comment.createdAt)}
              </Text>
              <Text>{comment.body}</Text>
            </View>
            <ReportBlockMenu
              label={`more options for ${comment.authorName}'s comment`}
              report={{
                paintingId,
                title: paintingTitle,
                about: `comment by ${comment.authorName}: "${comment.body}"`,
              }}
              artist={{ id: comment.authorId, name: comment.authorName }}
            />
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
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  comment: {
    flex: 1,
    gap: 2,
  },
  author: {
    fontFamily: fonts.semibold,
  },
});
