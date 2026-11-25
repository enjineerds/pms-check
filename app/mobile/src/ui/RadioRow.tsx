import { Pressable, View } from 'react-native';
import { Text } from './Text';
import { cx } from './cx';

interface Props {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export function RadioRow({ label, selected, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      className={cx('h-15 flex-row items-center gap-3.5 rounded-pill border-[1.5px] bg-surface px-4.5 shadow-soft', selected ? 'border-ink' : 'border-transparent')}
    >
      <View className={cx('size-[22px] items-center justify-center rounded-full border-[1.5px]', selected ? 'border-ink' : 'border-line')}>
        {selected ? <View className="size-3 rounded-full bg-ink" /> : null}
      </View>
      <Text variant="body" weight="bold">
        {label}
      </Text>
    </Pressable>
  );
}
