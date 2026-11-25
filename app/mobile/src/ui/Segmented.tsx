import { Pressable, View } from 'react-native';
import { Text } from './Text';
import { cx } from './cx';

interface Props<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  size?: 'md' | 'sm';
  widths?: 'equal' | 'content';
}

export function Segmented<T extends string>({ options, value, onChange, size = 'md', widths = 'equal' }: Props<T>) {
  const variant = size === 'sm' ? 'caption' : 'body';
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
            hitSlop={size === 'sm' ? { top: 6, bottom: 6 } : undefined}
            className={cx(
              'items-center justify-center rounded-pill',
              widths === 'equal' ? 'flex-1' : 'grow basis-auto px-2',
              on && 'bg-surface shadow-segment',
            )}
          >
            {widths === 'content' ? (
              // Invisible bold copy reserves the width, so selection never shifts neighbours.
              <Text variant={variant} weight="bold" numberOfLines={1} className="opacity-0" accessibilityElementsHidden importantForAccessibility="no">
                {o.label}
              </Text>
            ) : null}
            <Text
              variant={variant}
              weight={on ? 'bold' : 'medium'}
              color={on ? 'ink' : 'ink-soft'}
              numberOfLines={1}
              className={widths === 'content' ? 'absolute' : undefined}
            >
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
