import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import type { ScanOutcome } from '@/sample/quotes';
import { PAPER_ROWS, PAPER_TOTAL } from '@/sample/paper';
import { cx, Header, Icon, QuotePaper, Screen, Text } from '@/ui';
import { PhotoSheet } from '@/features/PhotoSheet';

// Sample photos in the picker: #2 reads a total that does not match, #3 is blurry.
const OUTCOMES: ScanOutcome[] = ['ok', 'mismatch', 'unreadable', 'ok', 'ok', 'ok'];

export default function Scan() {
  const [flash, setFlash] = useState(false);
  const [photos, setPhotos] = useState(false);
  const read = (o: ScanOutcome) => router.push({ pathname: '/check/reading', params: { outcome: o } });

  return (
    <Screen
      header={<Header title="Scan the quote" subtitle="Fit the whole quote in the frame" />}
      overlay={
      <PhotoSheet
        visible={photos}
        onClose={() => setPhotos(false)}
        onPick={(i) => {
          setPhotos(false);
          read(OUTCOMES[i]);
        }}
      />
      }
    >
      <View className="mt-1 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <View className="size-2 rounded-full bg-required" />
          <Text variant="small" weight="medium">
            Hold steady…
          </Text>
        </View>
        <Pressable accessibilityRole="button" onPress={() => setFlash((f) => !f)} className="h-9 flex-row items-center gap-1.5 rounded-pill bg-surface px-3.5 shadow-soft">
          <Icon name="flash" size={14} stroke={2} />
          <Text variant="small" weight="semibold">
            Flash {flash ? 'on' : 'off'}
          </Text>
        </Pressable>
      </View>

      <View className="mb-2 mt-4 flex-1">
        <View className="absolute inset-3 overflow-hidden">
          <QuotePaper rows={PAPER_ROWS} total={PAPER_TOTAL} />
          <View className="-mt-2 flex-1 rounded-b-[14px] bg-surface shadow-soft" />
        </View>
        <Corner pos="tl" />
        <Corner pos="tr" />
        <Corner pos="bl" />
        <Corner pos="br" />
      </View>

      <View className="flex-row items-center justify-between px-3">
        <SideButton icon="image" label="Photos" onPress={() => setPhotos(true)} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Take photo"
          onPress={() => read('ok')}
          onLongPress={() => router.push('/check/couldnt-read')}
          className="size-21 items-center justify-center rounded-full bg-surface shadow-soft"
        >
          <View className="size-16 overflow-hidden rounded-full shadow-glass">
            <View className="absolute inset-0 bg-linear-to-b/srgb from-gloss-top from-0% via-gloss-shutter via-60% to-gloss-bottom to-100%" />
          </View>
        </Pressable>
        <SideButton icon="lines" label="Type" onPress={() => router.push('/check/add')} />
      </View>
      <Text variant="small" color="ink-soft" className="mb-2 mt-3 text-center">
        Lay it flat and avoid glare from the lights.
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
