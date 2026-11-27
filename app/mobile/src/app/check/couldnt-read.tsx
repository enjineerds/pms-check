import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useCopy } from '@/i18n';
import type { UnreadableReason } from '@/ocr/types';
import { Card, Divider, GlassButton, Header, Icon, type IconName, Screen, SecondaryButton, Text } from '@/ui';

const TIP_ICONS: IconName[] = ['sun', 'expand', 'clock'];

export default function CouldntRead() {
  const { reason } = useLocalSearchParams<{ reason?: UnreadableReason }>();
  const copy = useCopy();
  const t = copy.couldntRead;
  const special = reason === 'handwritten' || reason === 'guide' ? t[reason] : null;
  const scan = () => router.replace('/check/scan');
  const type = () => router.push('/check/add');
  const typeFirst = reason === 'handwritten';
  return (
    <Screen
      header={<Header title={copy.check.scanTitle} subtitle={t.subtitle} />}
      footer={
        typeFirst ? (
          <>
            <GlassButton label={copy.common.typeInstead} onPress={type} />
            <SecondaryButton label={t.again} onPress={scan} />
          </>
        ) : (
          <>
            <GlassButton label={t.again} onPress={scan} />
            <SecondaryButton label={copy.common.typeInstead} onPress={type} />
          </>
        )
      }
    >
      <Text variant="headline" className="mt-1">
        {special?.headline ?? t.headline}
      </Text>
      <Text variant="small" color="ink-soft" className="mt-2 !text-[14px] !leading-5">
        {special?.body ?? t.body}
      </Text>
      {special ? null : (
        <Card className="mt-5 !rounded-[28px] !py-1">
          {t.tips.map((tip, i) => (
            <View key={tip.title}>
              {i > 0 ? <Divider /> : null}
              <View className="flex-row items-center gap-3 py-3.5">
                <View className="size-9 items-center justify-center rounded-full bg-optional-bg">
                  <Icon name={TIP_ICONS[i]} size={18} colorClassName="accent-optional" stroke={2} />
                </View>
                <View className="flex-1">
                  <Text variant="small" weight="bold">
                    {tip.title}
                  </Text>
                  <Text variant="small" color="ink-soft">
                    {tip.body}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </Card>
      )}
    </Screen>
  );
}
