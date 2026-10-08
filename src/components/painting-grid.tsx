import { FlashList, type FlashListRef } from '@shopify/flash-list';
import { useScrollToTop } from 'expo-router';
import { useRef, type ReactElement, type RefObject } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';

import { PaintingCard } from '@/components/painting-card';
import { useBlockedIds } from '@/data/blocks';
import type { Painting } from '@/data/paintings';
import { colors, spacing } from '@/theme';

type Item =
  | { type: 'painting'; painting: Painting }
  | { type: 'section'; section: string | number | null; floatOnly?: boolean };

type PaintingGridProps = {
  paintings: Painting[];
  // 1: one post per row, like a feed. 2: packed like a wall, each card dropping
  // into the shorter column.
  columns?: 1 | 2;
  // Off on an artist's page, where every painting is theirs.
  showArtist?: boolean;
  // One column only: a heading row goes in before each run of paintings that
  // share a section (e.g. a challenge day). Expects them already in that order.
  sectionOf?: (painting: Painting) => string | number | null;
  renderSection?: (section: string | number | null) => ReactElement;
  // The section the header already names (today's prompt on the challenge tab).
  // If the list starts with it, its heading takes no room up top and only
  // floats in once you scroll past the header.
  headerSection?: string | number;
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
  showArtist = true,
  sectionOf,
  renderSection,
  headerSection,
  header,
  empty,
  footer,
  onEndReached,
  refreshing = false,
  onRefresh,
}: PaintingGridProps) {
  const oneColumn = columns === 1;
  const listRef = useRef<FlashListRef<Item>>(null);
  // Tapping the open tab again scrolls back to the top (does nothing off the tabs).
  useScrollToTop(listRef as RefObject<FlashListRef<Item>>);

  // Blocked artists' paintings are hidden from you everywhere.
  const blocked = useBlockedIds();
  const visible = blocked.size
    ? paintings.filter((painting) => !painting.artistId || !blocked.has(painting.artistId))
    : paintings;

  const items: Item[] = [];
  visible.forEach((painting, i) => {
    if (sectionOf && renderSection && oneColumn) {
      const section = sectionOf(painting);
      if (i === 0 || section !== sectionOf(visible[i - 1])) {
        items.push({ type: 'section', section, floatOnly: i === 0 && section === headerSection });
      }
    }
    items.push({ type: 'painting', painting });
  });
  // Section headings float at the top while their paintings scroll under them.
  const stickyHeaderIndices = items.flatMap((item, i) => (item.type === 'section' ? [i] : []));

  return (
    <FlashList
      ref={listRef}
      showsVerticalScrollIndicator={false}
      data={items}
      stickyHeaderIndices={stickyHeaderIndices}
      keyExtractor={(item) =>
        item.type === 'painting' ? item.painting.id : `section-${item.section}`
      }
      getItemType={(item) => item.type}
      renderItem={({ item, target }) =>
        item.type === 'section' ? (
          item.floatOnly && target !== 'StickyHeader' ? (
            <View style={styles.sectionGap} />
          ) : (
            <View style={styles.section}>{renderSection?.(item.section)}</View>
          )
        ) : (
          <View style={oneColumn ? styles.row : styles.cell}>
            <PaintingCard painting={item.painting} bleed={oneColumn} showArtist={showArtist} />
          </View>
        )
      }
      masonry={columns > 1}
      numColumns={columns}
      // One column runs paintings edge to edge; everything else keeps the page margin.
      ListHeaderComponent={header && <View style={oneColumn && styles.inset}>{header}</View>}
      ListEmptyComponent={empty && <View style={oneColumn && styles.inset}>{empty}</View>}
      ListFooterComponent={footer && <View style={oneColumn && styles.inset}>{footer}</View>}
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
      contentContainerStyle={[styles.content, !oneColumn && styles.margin]}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.lg,
  },
  // Two columns: cells pad 4pt each side, so 16pt at the screen edges.
  margin: {
    paddingHorizontal: spacing.md - spacing.xs,
  },
  // One column: what the screens' headers and states expect (they add 4pt).
  inset: {
    paddingHorizontal: spacing.md - spacing.xs,
  },
  // Two columns: 8pt between cards, 16pt from a caption to the next picture.
  cell: {
    paddingHorizontal: spacing.xs,
    paddingBottom: spacing.md,
  },
  // One column: edge to edge, 32pt between posts.
  row: {
    paddingBottom: spacing.xl,
  },
  // One column only. Solid, so paintings don't show through while it floats.
  section: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  // Where a float-only heading would sit: just the space above the first painting.
  sectionGap: {
    height: spacing.md,
  },
});
