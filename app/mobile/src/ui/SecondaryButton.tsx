import { Pressable } from 'react-native';
import { Text } from './Text';
import { cx } from './cx';

interface Props {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  className?: string;
}

export function SecondaryButton({ label, onPress, disabled, className }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={disabled ? undefined : onPress}
      className={cx('h-13 items-center justify-center rounded-pill border-[1.5px] border-ink bg-surface active:bg-ground', className)}
    >
      <Text variant="body" weight="semibold">
        {label}
      </Text>
    </Pressable>
  );
}
