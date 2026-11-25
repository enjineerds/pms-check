import { View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Locale } from '@/core/types';
import { copyFor } from '@/i18n';
import { setLanguage } from '@/store/store';
import { Card, GlassDisc, Icon, Screen, Text } from '@/ui';

const LOCALES: Locale[] = ['en', 'fil'];
// Shown before a language is chosen, so this screen speaks both.
const en = copyFor('en').language;
const fil = copyFor('fil').language;

export default function LanguageScreen() {
  const insets = useSafeAreaInsets();
  const pick = (l: Locale) => {
    setLanguage(l);
    router.replace('/');
  };
  return (
    <Screen>
      <View style={{ height: insets.top > 20 ? 24 : 40 }} />
      <GlassDisc>
        <Icon name="globe" size={30} colorClassName="accent-panel-ink" stroke={2} />
      </GlassDisc>
      <Text variant="display" className="mt-6">
        {en.question}
      </Text>
      <Text variant="body" color="ink-soft" weight="regular" className="mt-2">
        {fil.question}
      </Text>
      <View className="h-10" />
      <View className="gap-3">
        {LOCALES.map((locale) => (
          <Card key={locale} padded={false} onPress={() => pick(locale)} className="flex-row items-center !rounded-[32px] p-5">
            <View className="flex-1">
              <Text variant="lead" weight="bold">
                {copyFor(locale).language.name}
              </Text>
              <Text variant="small" color="ink-soft">
                {copyFor(locale).language.use}
              </Text>
            </View>
            <Icon name="chevron-right" size={18} colorClassName="accent-ink-soft" />
          </Card>
        ))}
      </View>
      <Text variant="small" color="ink-soft" className="mt-6">
        {en.switchHint}
        {'\n'}
        {fil.switchHint}
      </Text>
    </Screen>
  );
}
