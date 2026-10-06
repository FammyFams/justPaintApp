import { FlashList } from '@shopify/flash-list';
import type { ReactElement } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';

import { PaintingCard } from '@/components/painting-card';
import type { Painting } from '@/data/paintings';
import { colors, spacing } from '@/theme';

type PaintingGridProps = {
  paintings: Painting[];
  header?: ReactElement;
  // Shown when there are no paintings: loading, error or empty.
  empty?: ReactElement;
  footer?: ReactElement | null;
  onEndReached?: () => void;
  refreshing?: boolean;
  onRefresh?: () => void;
};

// Two columns, packed like a wall: each card drops into the shorter column.
export function PaintingGrid({
  paintings,
  header,
  empty,
  footer,
  onEndReached,
  refreshing = false,
  onRefresh,
}: PaintingGridProps) {
  return (
    <FlashList
      data={paintings}
      keyExtractor={(painting) => painting.id}
      renderItem={({ item }) => (
        <View style={styles.cell}>
          <PaintingCard painting={item} />
        </View>
      )}
      masonry
      numColumns={2}
      ListHeaderComponent={header}
      ListEmptyComponent={empty}
      ListFooterComponent={footer}
      onEndReached={onEndReached}
      onEndReachedThreshold={1}
      refreshControl={
        onRefresh && (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.mutedForeground}
            colors={[colors.primary]}
          />
        )
      }
      contentContainerStyle={styles.content}
    />
  );
}

const styles = StyleSheet.create({
  // Cells pad 4pt each side: 8pt between cards, 16pt at the screen edges.
  content: {
    paddingHorizontal: spacing.md - spacing.xs,
    paddingBottom: spacing.lg,
  },
  cell: {
    padding: spacing.xs,
  },
});
