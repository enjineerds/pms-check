import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router, useFocusEffect } from 'expo-router';
import { pickFromLibrary, takeFromCamera } from '@/ocr/capture';
import { setPendingImage } from '@/ocr/pending';
import type { CapturedImage } from '@/ocr/types';
import { useCopy } from '@/i18n';
import { cx, Header, Icon, Screen, Text } from '@/ui';

export default function Scan() {
  const copy = useCopy();
  const t = copy.scan;
  const camera = useRef<CameraView>(null);
  const [permission] = useCameraPermissions();
  useEffect(() => {
    if (permission && !permission.granted) router.replace('/check/camera');
  }, [permission]);
  const [torch, setTorch] = useState(false);
  const [ready, setReady] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  // A ref, not state: two taps can land before a re-render.
  const inFlight = useRef(false);
  const unlock = () => {
    inFlight.current = false;
    setBusy(false);
  };
  // Unmount while unfocused: `active` only pauses the camera on iOS.
  const [focused, setFocused] = useState(true);
  useFocusEffect(
    useCallback(() => {
      inFlight.current = false;
      setBusy(false);
      setFocused(true);
      return () => {
        setFocused(false);
        setReady(false);
        setTorch(false);
      };
    }, []),
  );
  const run = async (get: () => Promise<CapturedImage | null>) => {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setFailed(false);
    try {
      const img = await get();
      if (!img) return unlock();
      setPendingImage(img);
      router.push('/check/reading');
    } catch {
      setFailed(true);
      unlock();
    }
  };

  return (
    <Screen header={<Header title={copy.check.scanTitle} subtitle={t.subtitle} />}>
      <View className="mt-1 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <View className="size-2 rounded-full bg-required" />
          <Text variant="small" weight="medium">
            {t.holdSteady}
          </Text>
        </View>
        {unavailable ? null : (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: torch }}
            onPress={() => setTorch((on) => !on)}
            className="h-9 flex-row items-center gap-1.5 rounded-pill bg-surface px-3.5 shadow-soft"
          >
            <Icon name="flash" size={14} stroke={2} />
            <Text variant="small" weight="semibold">
              {torch ? t.flashOn : t.flashOff}
            </Text>
          </Pressable>
        )}
      </View>

      <View className="mb-2 mt-4 flex-1">
        <View className="absolute inset-3 overflow-hidden rounded-[14px] bg-surface shadow-soft">
          {unavailable ? (
            <View className="flex-1 items-center justify-center gap-3 px-8">
              <Icon name="camera-off" size={28} stroke={2} />
              <Text variant="small" color="ink-soft" className="text-center">
                {t.unavailable}
              </Text>
            </View>
          ) : focused ? (
            <CameraView
              ref={camera}
              style={{ flex: 1 }}
              facing="back"
              enableTorch={torch}
              onCameraReady={() => setReady(true)}
              onMountError={() => setUnavailable(true)}
            />
          ) : null}
        </View>
        <Corner pos="tl" />
        <Corner pos="tr" />
        <Corner pos="bl" />
        <Corner pos="br" />
      </View>

      <View className="flex-row items-center justify-between px-3">
        <SideButton icon="image" label={t.photos} onPress={() => run(pickFromLibrary)} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t.shutter}
          accessibilityState={{ disabled: busy || !ready }}
          disabled={busy || !ready}
          onPress={() => run(() => takeFromCamera(camera.current))}
          className={cx('size-21 items-center justify-center rounded-full bg-surface shadow-soft', (busy || !ready) && 'opacity-50')}
        >
          <View className="size-16 overflow-hidden rounded-full shadow-glass">
            <View className="absolute inset-0 bg-linear-to-b/srgb from-gloss-top from-0% via-gloss-shutter via-60% to-gloss-bottom to-100%" />
          </View>
        </Pressable>
        <SideButton icon="lines" label={t.type} onPress={() => router.push('/check/add')} />
      </View>
      <Text variant="small" color={failed ? 'skip' : 'ink-soft'} className="mb-2 mt-3 text-center">
        {failed ? t.failed : t.hint}
      </Text>
    </Screen>
  );
}

function SideButton({ icon, label, onPress }: { icon: 'image' | 'lines'; label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} className="w-15 items-center gap-1.5">
      <View className="size-11 items-center justify-center rounded-full bg-surface shadow-soft">
        <Icon name={icon} size={18} stroke={2} />
      </View>
      <Text variant="small" weight="medium">
        {label}
      </Text>
    </Pressable>
  );
}

const CORNER = {
  tl: 'left-0 top-0 rounded-tl-[18px] border-l-[3px] border-t-[3px]',
  tr: 'right-0 top-0 rounded-tr-[18px] border-r-[3px] border-t-[3px]',
  bl: 'bottom-0 left-0 rounded-bl-[18px] border-b-[3px] border-l-[3px]',
  br: 'bottom-0 right-0 rounded-br-[18px] border-b-[3px] border-r-[3px]',
};

function Corner({ pos }: { pos: keyof typeof CORNER }) {
  return <View pointerEvents="none" className={cx('absolute size-8.5 border-ink', CORNER[pos])} />;
}
