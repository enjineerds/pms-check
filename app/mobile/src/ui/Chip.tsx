import { Pressable } from 'react-native';
import { Text } from './Text';
import { cx } from './cx';

interface Props {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}

export function Chip({ label, selected, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      onPress={onPress}
      className={cx('h-10 min-w-16 items-center justify-center rounded-pill px-4.5 shadow-chip', selected ? 'bg-ink' : 'bg-surface')}
    >
      <Text variant="body" weight="semibold" color={selected ? 'panel-ink' : 'ink'}>
        {label}
      </Text>
    </Pressable>
  );
}
