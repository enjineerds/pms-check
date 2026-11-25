import { Pressable, View } from 'react-native';
import type { Centavos, VerdictKind } from '@/core/types';
import { formatPeso } from '@/core/money';
import { useCopy } from '@/i18n';
import { Text } from './Text';
import { VerdictDisc } from './VerdictDisc';
import { VERDICT } from './verdict';

interface Props {
  title: string;
  price: Centavos;
  kind: VerdictKind;
  note?: string;
  onPress?: () => void;
}

export function LineRow({ title, price, kind, note, onPress }: Props) {
  const t = useCopy().verdict;
  return (
    <Pressable accessibilityRole="button" onPress={onPress} className="flex-row items-center gap-3 py-3">
      <VerdictDisc kind={kind} />
      <View className="flex-1 gap-0.5">
        <Text variant="body">{title}</Text>
        {note ? (
          <Text variant="small" color="ink-soft">
            {note}
          </Text>
        ) : null}
      </View>
      <View className="items-end">
        <Text variant="body" weight="bold">
          {formatPeso(price)}
        </Text>
        <Text variant="caption" weight="bold" color={VERDICT[kind].color}>
          {t.word[kind]}
        </Text>
      </View>
    </Pressable>
  );
}
