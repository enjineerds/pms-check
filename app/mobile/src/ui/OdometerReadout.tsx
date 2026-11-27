import { Pressable } from 'react-native';
import { groupDigits } from '@/core/money';
import { Text } from './Text';
import { cx } from './cx';

interface Props {
  raw: string;
  label?: string;
  editing?: boolean;
  onPress?: () => void;
}

export function OdometerReadout({ raw, label, editing = true, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={label && `${label}, ${raw ? groupDigits(Number(raw)) : '0'} km`}
      accessibilityState={onPress ? { expanded: editing } : undefined}
      disabled={!onPress}
      onPress={onPress}
      className={cx('h-18 flex-row items-center justify-between rounded-pill bg-surface px-6', editing ? 'border-[1.5px] border-ink' : 'border border-line')}
    >
      <Text weight="bold" color={raw ? 'ink' : 'ink-faint'} className="!text-[36px] !leading-[44px] !tracking-[-0.5px]">
        {raw ? groupDigits(Number(raw)) : '0'}
      </Text>
      <Text variant="body" weight="medium" color="ink-soft">
        km
      </Text>
    </Pressable>
  );
}
