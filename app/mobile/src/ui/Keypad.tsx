import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCopy } from '@/i18n';
import { Icon } from './Icon';
import { Text } from './Text';
import { cx } from './cx';

const ROWS = [['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9'], ['.', '0', 'back']];

interface Props {
  onKey: (key: string) => void;
}

export function Keypad({ onKey }: Props) {
  const insets = useSafeAreaInsets();
  const t = useCopy().common;
  return (
    <View className="gap-2 bg-keypad px-1.5 pt-2" style={{ paddingBottom: Math.max(insets.bottom, 8) }}>
      {ROWS.map((row, i) => (
        <View key={i} className="flex-row gap-1.5">
          {row.map((k) => (
            <Pressable
              key={k}
              accessibilityRole="button"
              accessibilityLabel={k === 'back' ? t.deleteKey : k}
              testID={`key-${k}`}
              onPress={() => onKey(k)}
              className={cx('h-11.5 flex-1 items-center justify-center rounded-[7px] shadow-key active:opacity-60', k === 'back' ? 'bg-keypad-back' : 'bg-surface')}
            >
              {k === 'back' ? (
                <Icon name="backspace" size={24} stroke={1.8} />
              ) : (
                <Text variant="lead" weight="regular" className="!text-[22px] !leading-7">
                  {k}
                </Text>
              )}
            </Pressable>
          ))}
        </View>
      ))}
    </View>
  );
}
