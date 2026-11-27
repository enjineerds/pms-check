import { Pressable, View } from 'react-native';
import { confirmShown } from '@/core/draft';
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
  onConfirm: () => void;
}

export function DraftRow({ line, mark, onPress, onConfirm }: Props) {
  const t = useCopy().lines;
  const unsure = line.price.kind === 'unsure';
  const fuzzy = line.match.kind === 'fuzzy';
  const price = priceLabel(line, t.free);
  const priceNote = priceOf(line.price) === 0 ? t.freeCheck : t.checkPrice(price);
  const note = mark === 'added' ? t.justAdded : mark === 'updated' ? t.updated : unsure ? priceNote : fuzzy ? t.rightItem : undefined;
  const tone = rowTone(line, mark);
  const askable = tone === 'amber' && confirmShown(line) !== null;
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
        {askable ? (
          <View className="mt-2 flex-row gap-2">
            <Answer label={t.yes} hint={note} onPress={onConfirm} strong />
            <Answer label={t.fix} hint={note} onPress={onPress} />
          </View>
        ) : null}
      </View>
      <Text variant="body" weight="bold">
        {price}
      </Text>
      <Icon name="pencil" size={14} colorClassName="accent-ink-soft" stroke={2} />
    </Pressable>
  );
}

function Answer({ label, hint, onPress, strong }: { label: string; hint?: string; onPress: () => void; strong?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={hint ? `${label}. ${hint}` : label}
      onPress={onPress}
      hitSlop={6}
      className={cx('h-8 min-w-16 items-center justify-center rounded-pill px-4 active:opacity-60', strong ? 'bg-ink' : 'border border-line bg-surface')}
    >
      <Text variant="small" weight="bold" color={strong ? 'panel-ink' : 'ink'}>
        {label}
      </Text>
    </Pressable>
  );
}
