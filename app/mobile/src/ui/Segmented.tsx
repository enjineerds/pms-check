import { Pressable, View } from 'react-native';
import { Text } from './Text';
import { cx } from './cx';

interface Props<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  size?: 'md' | 'sm';
  /** `equal` splits the track evenly. `content` sizes each segment to its label, for crowded sets ("Hatchback" among five). */
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
            // The small track is 36pt; extend the touch area to the 44pt / 48dp minimum.
            hitSlop={size === 'sm' ? { top: 6, bottom: 6 } : undefined}
            className={cx(
              'items-center justify-center rounded-pill',
              widths === 'equal' ? 'flex-1' : 'grow basis-auto px-2',
              on && 'bg-surface shadow-segment',
            )}
          >
            {widths === 'content' ? (
              // Sized by an invisible bold copy, so selecting a segment never shifts its neighbours.
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
