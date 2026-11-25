import { View } from 'react-native';
import type { Centavos } from '@/core/types';
import { formatPeso } from '@/core/money';
import { GlossGradient } from './Gradient';
import { Text } from './Text';

interface Props {
  lines: { id: string; name: string; price: Centavos }[];
  total: Centavos;
}

const totalSize = (s: string) => (s.length > 7 ? 30 : 40);

export function AdvisorPanel({ lines, total }: Props) {
  const t = formatPeso(total);
  return (
    <View className="overflow-hidden rounded-[32px] px-5 pb-4.5 pt-1.5 shadow-toast">
      <GlossGradient />
      {lines.map((l) => (
        <View key={l.id} className="flex-row items-center justify-between gap-3 border-b border-glass-rule py-3.5">
          <Text variant="body" weight="semibold" color="panel-ink" className="flex-1">
            {l.name}
          </Text>
          <Text variant="body" weight="bold" color="panel-ink">
            {formatPeso(l.price)}
          </Text>
        </View>
      ))}
      <View className="flex-row items-center justify-between gap-3 pt-5">
        <Text variant="body" color="panel-soft" className="flex-1">
          I will pay
        </Text>
        <Text weight="extrabold" color="panel-ink" className="!tracking-[-1px]" style={{ fontSize: totalSize(t), lineHeight: totalSize(t) + 6 }}>
          {t}
        </Text>
      </View>
    </View>
  );
}
