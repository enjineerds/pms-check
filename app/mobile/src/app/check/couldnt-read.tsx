import { View } from 'react-native';
import { router } from 'expo-router';
import { Card, Divider, GlassButton, Header, Icon, type IconName, Screen, SecondaryButton, Text } from '@/ui';

const TIPS: { icon: IconName; title: string; body: string }[] = [
  { icon: 'sun', title: 'Tilt away from the lights', body: 'Glare on glossy paper hides the prices. Try the flash off.' },
  { icon: 'expand', title: 'Fit all four corners', body: 'Lay the quote flat and keep the whole page in view.' },
  { icon: 'clock', title: 'Hold still for a second', body: 'A steady phone gives a sharp photo.' },
];

export default function CouldntRead() {
  return (
    <Screen
      header={<Header title="Scan the quote" subtitle="That one didn’t work" />}
      footer={
        <>
          <GlassButton label="Scan again" onPress={() => router.replace('/check/scan')} />
          <SecondaryButton label="Type the lines instead" onPress={() => router.push('/check/add')} />
        </>
      }
    >
      <Text variant="display" className="mt-1 !text-[30px] !leading-[34px]">
        We couldn’t read that clearly.
      </Text>
      <Text variant="small" color="ink-soft" className="mt-2 !text-[14px] !leading-5">
        Nothing was saved. A new photo usually fixes it.
      </Text>
      <Card className="mt-5 !rounded-[28px] !py-1">
        {TIPS.map((t, i) => (
          <View key={t.title}>
            {i > 0 ? <Divider /> : null}
            <View className="flex-row items-center gap-3 py-3.5">
              <View className="size-9 items-center justify-center rounded-full bg-optional-bg">
                <Icon name={t.icon} size={18} colorClassName="accent-optional" stroke={2} />
              </View>
              <View className="flex-1">
                <Text variant="small" weight="bold">
                  {t.title}
                </Text>
                <Text variant="small" color="ink-soft">
                  {t.body}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </Card>
    </Screen>
  );
}
