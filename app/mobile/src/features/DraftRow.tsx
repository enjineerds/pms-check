import { Pressable, View } from 'react-native';
import { priceOf } from '@/core/quote';
import type { DraftLine } from '@/core/types';
import { useCopy } from '@/i18n';
import { cx, Icon, Text } from '@/ui';
import { priceLabel } from './EditLineSheet';

type Mark = 'added' | 'updated' | undefined;

export function rowTone(line: DraftLine, mark: Mark): 'green' | 'amber' | null {
  if (mark) return 'green';
  return line.price.kind === 'unsure' || line.match.kind === 'fuzzy' ? 'amber' : null;
}

interface Props {
  line: DraftLine;
  mark: Mark;
  onPress: () => void;
}

export function DraftRow({ line, mark, onPress }: Props) {
  const t = useCopy().lines;
  const unsure = line.price.kind === 'unsure';
  const fuzzy = line.match.kind === 'fuzzy';
  const price = priceLabel(line, t.free);
  const priceNote = priceOf(line.price) === 0 ? t.freeCheck : t.checkPrice(price);
  const note = mark === 'added' ? t.justAdded : mark === 'updated' ? t.updated : unsure ? priceNote : fuzzy ? t.rightItem : undefined;
  const tone = rowTone(line, mark);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t.edit(line.rawText)}
      onPress={onPress}
      className={cx('min-h-12 flex-row items-center gap-2.5 rounded-[18px] px-3 py-2', tone === 'amber' && 'bg-optional-bg', tone === 'green' && 'bg-required-bg')}
    >
      <View className="flex-1">
        <Text variant="body">{line.rawText}</Text>
        {note ? (
          <Text variant="caption" weight="regular" color={tone === 'green' ? 'required' : 'optional'}>
            {note}
          </Text>
        ) : null}
      </View>
      <Text variant="body" weight="bold">
        {price}
      </Text>
      <Icon name="pencil" size={14} colorClassName="accent-ink-soft" stroke={2} />
    </Pressable>
  );
}
