import { useEffect, useState } from 'react';
import { AppState, Linking, Pressable, View } from 'react-native';
import { useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useCopy } from '@/i18n';
import { Card, Divider, GlassButton, GlassDisc, Header, Icon, type IconName, Screen, SecondaryButton, Text } from '@/ui';

const STEP_ICONS: IconName[] = ['expand', 'check', 'lines'];

export default function CameraAccess() {
  const copy = useCopy();
  const t = copy.camera;
  const [permission, request, refresh] = useCameraPermissions();
  const [declined, setDeclined] = useState(false);
  const typeInstead = () => router.push('/check/add');
  const granted = permission?.granted ?? false;

  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') refresh();
    });
    return () => sub.remove();
  }, [refresh]);

  useEffect(() => {
    if (granted) router.replace('/check/scan');
  }, [granted]);

  if (!permission || granted) return <Screen header={<Header title={copy.check.scanTitle} />} />;

  const off = declined || (permission.status === 'denied' && !permission.canAskAgain);

  if (off) {
    return (
      <Screen
        header={<Header title={copy.check.scanTitle} subtitle={t.offSubtitle} />}
        footer={
          <>
            <GlassButton label={t.openSettings} onPress={() => Linking.openSettings().catch(() => {})} />
            <SecondaryButton label={copy.common.typeInstead} onPress={typeInstead} />
          </>
        }
      >
        <View className="size-16 items-center justify-center rounded-full bg-surface shadow-soft">
          <Icon name="camera-off" size={28} stroke={2} />
        </View>
        <Text variant="headline" className="mt-5">
          {t.offHeadline}
        </Text>
        <Text variant="small" color="ink-soft" className="mt-2 !text-[14px] !leading-5">
          {t.offBody}
        </Text>
        <Card className="mt-5 !rounded-[28px] !py-1">
          {t.settingsSteps.map((parts, i) => (
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
      header={<Header title={copy.check.scanTitle} subtitle={t.askSubtitle} />}
      footer={
        <>
          <GlassButton
            label={t.allow}
            onPress={async () => {
              const res = await request();
              if (!res.granted) setDeclined(true);
            }}
          />
          <SecondaryButton label={copy.common.typeInstead} onPress={typeInstead} />
          <Pressable accessibilityRole="button" onPress={() => router.back()} className="items-center py-0.5">
            <Text variant="small" weight="semibold" color="ink-soft">
              {t.notNow}
            </Text>
          </Pressable>
        </>
      }
    >
      <GlassDisc>
        <Icon name="camera" size={28} colorClassName="accent-panel-ink" stroke={2} />
      </GlassDisc>
      <Text variant="headline" className="mt-5">
        {t.askHeadline}
      </Text>
      <Text variant="small" color="ink-soft" className="mt-2 !text-[14px] !leading-5">
        {t.askBody}
      </Text>
      <Card className="mt-5 !rounded-[28px] !py-1">
        {t.steps.map((s, i) => (
          <View key={s.title}>
            {i > 0 ? <Divider /> : null}
            <View className="flex-row items-center gap-3 py-3.5">
              <View className="size-8 items-center justify-center rounded-full bg-required-bg">
                <Icon name={STEP_ICONS[i]} size={16} colorClassName="accent-required" stroke={2.2} />
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
