import { Fragment } from 'react';
import { Pressable, View } from 'react-native';
import type { Locale } from '@/core/types';
import { setLanguage } from '@/store/store';
import { Text } from '@/ui';

const OPTIONS: { value: Locale; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'fil', label: 'Filipino' },
];

export function LanguageToggle({ value }: { value: Locale }) {
  return (
    <View role="radiogroup" className="flex-row items-center gap-2.5">
      {OPTIONS.map((o, i) => {
        const on = o.value === value;
        return (
          <Fragment key={o.value}>
            {i > 0 ? <View className="h-3 w-px bg-line" /> : null}
            <Pressable
              role="radio"
              aria-checked={on}
              accessibilityLanguage={o.value}
              onPress={() => setLanguage(o.value)}
              hitSlop={{ top: 10, bottom: 16, left: 5, right: 5 }}
            >
              <Text variant="small" weight="medium" color={on ? 'ink' : 'ink-faint'}>
                {o.label}
              </Text>
              <View className={on ? 'absolute inset-x-0 -bottom-1 h-[1.5px] rounded-full bg-ink' : 'hidden'} />
            </Pressable>
          </Fragment>
        );
      })}
    </View>
  );
}
