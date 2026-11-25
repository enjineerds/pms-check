import { View } from 'react-native';
import { Text } from './Text';
import { cx } from './cx';

export interface PaperRow {
  label: string;
  amount: string;
}

export interface PaperHead {
  shop: string;
  meta: string;
  totalLabel: string;
}

interface Props {
  head: PaperHead;
  rows: PaperRow[];
  total?: string;
  tilt?: number;
  compact?: boolean;
}

export function QuotePaper({ head, rows, total, tilt = -1.2, compact }: Props) {
  const cell = cx('!leading-3.5', compact ? '!text-[9px]' : '!text-[10.5px]');
  return (
    <View
      className={cx('rounded-[14px] bg-surface shadow-paper', compact ? 'p-3' : 'p-4')}
      style={{ transform: [{ rotate: `${tilt}deg` }] }}
    >
      <Text weight="extrabold" className={cx('!leading-4 !tracking-[-0.2px]', compact ? '!text-[11px]' : '!text-[13px]')}>
        {head.shop}
      </Text>
      <Text weight="regular" color="ink-soft" className="mb-2 !text-[7.5px] !leading-2.5">
        {head.meta}
      </Text>
      {rows.map((r) => (
        <View key={r.label} className="flex-row justify-between border-b border-line py-1">
          <Text weight="regular" className={cell}>
            {r.label}
          </Text>
          <Text weight="regular" className={cell}>
            {r.amount}
          </Text>
        </View>
      ))}
      {total ? (
        <View className="mt-2 flex-row justify-between py-1">
          <Text weight="bold" className={cell}>
            {head.totalLabel}
          </Text>
          <Text weight="bold" className={cell}>
            {total}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
