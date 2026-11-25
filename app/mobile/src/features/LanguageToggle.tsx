import { Fragment } from 'react';
import { Pressable, View } from 'react-native';
import type { Locale } from '@/core/types';
import { copyFor } from '@/i18n';
import { setLanguage } from '@/store/store';
import { Text } from '@/ui';

// Each name stays in its own language, so either reader finds theirs.
const LOCALES: Locale[] = ['en', 'fil'];

export function LanguageToggle({ value }: { value: Locale }) {
  return (
    <View role="radiogroup" className="flex-row items-center gap-2.5">
      {LOCALES.map((locale, i) => {
        const on = locale === value;
        return (
          <Fragment key={locale}>
            {i > 0 ? <View className="h-3 w-px bg-line" /> : null}
            <Pressable
              role="radio"
              aria-checked={on}
              accessibilityLanguage={locale}
              onPress={() => setLanguage(locale)}
              hitSlop={{ top: 10, bottom: 16, left: 5, right: 5 }}
            >
              <Text variant="small" weight="medium" color={on ? 'ink' : 'ink-faint'}>
                {copyFor(locale).language.name}
              </Text>
              <View className={on ? 'absolute inset-x-0 -bottom-1 h-[1.5px] rounded-full bg-ink' : 'hidden'} />
            </Pressable>
          </Fragment>
        );
      })}
    </View>
  );
}
