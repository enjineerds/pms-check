import { View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Locale } from '@/core/types';
import { setLanguage } from '@/store/store';
import { Card, GlassDisc, Icon, Screen, Text } from '@/ui';

const OPTIONS: { value: Locale; title: string; sub: string }[] = [
  { value: 'en', title: 'English', sub: 'Use the app in English' },
  { value: 'fil', title: 'Filipino', sub: 'Gamitin ang app sa Filipino' },
];

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
        Which language do you prefer?
      </Text>
      <Text variant="body" color="ink-soft" weight="regular" className="mt-2">
        Anong wika ang gusto mo?
      </Text>
      <View className="h-10" />
      <View className="gap-3">
        {OPTIONS.map((o) => (
          <Card key={o.value} padded={false} onPress={() => pick(o.value)} className="flex-row items-center !rounded-[32px] p-5">
            <View className="flex-1">
              <Text variant="lead" weight="bold">
                {o.title}
              </Text>
              <Text variant="small" color="ink-soft">
                {o.sub}
              </Text>
            </View>
            <Icon name="chevron-right" size={18} colorClassName="accent-ink-soft" />
          </Card>
        ))}
      </View>
      <Text variant="small" color="ink-soft" className="mt-6">
        You can switch from the top of any screen.{'\n'}Puwede mong palitan ito sa taas ng bawat screen.
      </Text>
    </Screen>
  );
}
