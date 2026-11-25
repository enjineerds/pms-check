import { useEffect, useState } from 'react';
import { AppState, Linking, Pressable, View } from 'react-native';
import { useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { Card, Divider, GlassButton, GlassDisc, Header, Icon, type IconName, Screen, SecondaryButton, Text } from '@/ui';

const STEPS: { icon: IconName; title: string; body: string }[] = [
  { icon: 'expand', title: 'Hold the quote in view', body: 'We read each line and price for you.' },
  { icon: 'check', title: 'You check the lines', body: 'Fix anything we misread before we compare.' },
  { icon: 'lines', title: 'Prefer not to?', body: 'You can type the lines in instead.' },
];

const SETTINGS_STEPS = [
  ['Tap ', 'Open settings', ' below.'],
  ['Switch ', 'Camera', ' on for this app.'],
  ['Come back and scan again.'],
];

export default function CameraAccess() {
  const [permission, request, refresh] = useCameraPermissions();
  const [declined, setDeclined] = useState(false);
  const typeInstead = () => router.push('/check/add');
  const granted = permission?.granted ?? false;

  // The user may switch the camera on in Settings and come back.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') refresh();
    });
    return () => sub.remove();
  }, [refresh]);

  useEffect(() => {
    if (granted) router.replace('/check/scan');
  }, [granted]);

  if (!permission || granted) return <Screen header={<Header title="Scan the quote" />} />;

  const off = declined || (permission.status === 'denied' && !permission.canAskAgain);

  if (off) {
    return (
      <Screen
        header={<Header title="Scan the quote" subtitle="Camera access is off" />}
        footer={
          <>
            <GlassButton label="Open settings" onPress={() => Linking.openSettings().catch(() => {})} />
            <SecondaryButton label="Type the lines instead" onPress={typeInstead} />
          </>
        }
      >
        <View className="size-16 items-center justify-center rounded-full bg-surface shadow-soft">
          <Icon name="camera-off" size={28} stroke={2} />
        </View>
        <Text variant="headline" className="mt-5">
          The camera is off.
        </Text>
        <Text variant="small" color="ink-soft" className="mt-2 !text-[14px] !leading-5">
          To scan a quote, turn the camera on in Settings. Or type the lines in, which takes about a minute.
        </Text>
        <Card className="mt-5 !rounded-[28px] !py-1">
          {SETTINGS_STEPS.map((parts, i) => (
            <View key={i}>
              {i > 0 ? <Divider /> : null}
              <View className="flex-row items-center gap-3 py-3.5">
                <View className="size-8 items-center justify-center rounded-full bg-ink">
                  <Text variant="caption" weight="bold" color="panel-ink">
                    {i + 1}
                  </Text>
                </View>
                <Text variant="small" color="ink" className="flex-1">
                  {parts.map((p, j) => (
                    <Text key={j} variant="small" weight={parts.length === 3 && j === 1 ? 'bold' : 'regular'}>
                      {p}
                    </Text>
                  ))}
                </Text>
              </View>
            </View>
          ))}
        </Card>
      </Screen>
    );
  }

  return (
    <Screen
      header={<Header title="Scan the quote" subtitle="One quick thing first" />}
      footer={
        <>
          <GlassButton
            label="Allow camera"
            onPress={async () => {
              const res = await request();
              if (!res.granted) setDeclined(true);
            }}
          />
          <SecondaryButton label="Type the lines instead" onPress={typeInstead} />
          <Pressable accessibilityRole="button" onPress={() => router.back()} className="items-center py-0.5">
            <Text variant="small" weight="semibold" color="ink-soft">
              Not now
            </Text>
          </Pressable>
        </>
      }
    >
      <GlassDisc>
        <Icon name="camera" size={28} colorClassName="accent-panel-ink" stroke={2} />
      </GlassDisc>
      <Text variant="headline" className="mt-5">
        Allow the camera to read your quote.
      </Text>
      <Text variant="small" color="ink-soft" className="mt-2 !text-[14px] !leading-5">
        Your phone will ask once. Here is what happens next.
      </Text>
      <Card className="mt-5 !rounded-[28px] !py-1">
        {STEPS.map((s, i) => (
          <View key={s.title}>
            {i > 0 ? <Divider /> : null}
            <View className="flex-row items-center gap-3 py-3.5">
              <View className="size-8 items-center justify-center rounded-full bg-required-bg">
                <Icon name={s.icon} size={16} colorClassName="accent-required" stroke={2.2} />
              </View>
              <View className="flex-1">
                <Text variant="small" weight="bold">
                  {s.title}
                </Text>
                <Text variant="small" color="ink-soft">
                  {s.body}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </Card>
    </Screen>
  );
}
