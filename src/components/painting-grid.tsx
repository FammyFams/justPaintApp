import { FlashList } from '@shopify/flash-list';
import type { ReactElement } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';

import { PaintingCard } from '@/components/painting-card';
import type { Painting } from '@/data/paintings';
import { colors, spacing } from '@/theme';

type Item =
  | { type: 'painting'; painting: Painting }
  | { type: 'section'; section: string | number | null };

type PaintingGridProps = {
  paintings: Painting[];
  // 1: one post per row, like a feed. 2: packed like a wall, each card dropping
  // into the shorter column.
  columns?: 1 | 2;
  // One column only: a heading row goes in before each run of paintings that
  // share a section (e.g. a challenge day). Expects them already in that order.
  sectionOf?: (painting: Painting) => string | number | null;
  renderSection?: (section: string | number | null) => ReactElement;
  header?: ReactElement;
  // Shown when there are no paintings: loading, error or empty.
  empty?: ReactElement;
  footer?: ReactElement | null;
  onEndReached?: () => void;
  refreshing?: boolean;
  onRefresh?: () => void;
};

export function PaintingGrid({
  paintings,
  columns = 2,
  sectionOf,
  renderSection,
  header,
  empty,
  footer,
  onEndReached,
  refreshing = false,
  onRefresh,
}: PaintingGridProps) {
  const items: Item[] = [];
  paintings.forEach((painting, i) => {
    if (sectionOf && renderSection && columns === 1) {
      const section = sectionOf(painting);
      if (i === 0 || section !== sectionOf(paintings[i - 1])) items.push({ type: 'section', section });
    }
    items.push({ type: 'painting', painting });
  });

  return (
    <FlashList
      data={items}
      keyExtractor={(item) =>
        item.type === 'painting' ? item.painting.id : `section-${item.section}`
      }
      getItemType={(item) => item.type}
      renderItem={({ item }) =>
        item.type === 'section' ? (
          <View style={styles.section}>{renderSection?.(item.section)}</View>
        ) : (
          <View style={columns === 1 ? styles.row : styles.cell}>
            <PaintingCard painting={item.painting} />
          </View>
        )
      }
      masonry={columns > 1}
      numColumns={columns}
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
  // Cells pad 4pt each side, so 16pt at the screen edges.
  content: {
    paddingHorizontal: spacing.md - spacing.xs,
    paddingBottom: spacing.lg,
  },
  // Two columns: 8pt between cards.
  cell: {
    padding: spacing.xs,
  },
  // One column: 16pt between posts.
  row: {
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.sm,
  },
  section: {
    paddingHorizontal: spacing.xs,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
});
