import { Pressable, View } from 'react-native';
import { Text } from './Text';
import { cx } from './cx';

interface Props<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  size?: 'md' | 'sm';
}

export function Segmented<T extends string>({ options, value, onChange, size = 'md' }: Props<T>) {
  return (
    <View className={cx('flex-row rounded-pill bg-track', size === 'sm' ? 'h-9 p-[3px]' : 'h-13 p-1')}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            onPress={() => onChange(o.value)}
            className={cx('flex-1 items-center justify-center rounded-pill', on && 'bg-surface shadow-segment')}
          >
            <Text variant={size === 'sm' ? 'caption' : 'body'} weight={on ? 'bold' : 'medium'} color={on ? 'ink' : 'ink-soft'}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
