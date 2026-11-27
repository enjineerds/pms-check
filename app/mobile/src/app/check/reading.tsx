import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import Animated, { type CSSAnimationProperties } from 'react-native-reanimated';
import { withUniwind } from 'uniwind';
import { release } from '@/ocr/capture';
import { clearPendingImage, peekPendingImage } from '@/ocr/pending';
import { readQuote } from '@/ocr/read';
import type { CapturedImage, ReadResult } from '@/ocr/types';
import { useCopy } from '@/i18n';
import { PAPER_HEAD, PAPER_ROWS } from '@/sample/paper';
import { useDraft } from '@/store/draft';
import { Card, Divider, Header, QuotePaper, Screen, SecondaryButton, Text } from '@/ui';

const StyledImage = withUniwind(Image);
const SKELETON_ROWS = [0, 1, 2, 3];

const SWEEP: CSSAnimationProperties = {
  animationName: { from: { top: '0%' }, to: { top: '100%' } },
  animationDuration: '1.6s',
  animationTimingFunction: 'ease-in-out',
  animationIterationCount: 'infinite',
  animationDirection: 'alternate',
};
const PULSE: CSSAnimationProperties = {
  animationName: { '0%': { opacity: 0.5 }, '50%': { opacity: 1 }, '100%': { opacity: 0.5 } },
  animationDuration: '1.2s',
  animationTimingFunction: 'ease-in-out',
  animationIterationCount: 'infinite',
};

// Dev only: `?demo=1` reads a stand-in image so later screens are reachable on web.
const DEMO: CapturedImage = { uri: '', width: 0, height: 0, source: 'library' };

export default function Reading() {
  const { demo } = useLocalSearchParams<{ demo?: string }>();
  const { dispatch } = useDraft();
  const copy = useCopy();
  const t = copy.reading;
  const [img] = useState(() => peekPendingImage() ?? (__DEV__ && demo ? DEMO : null));
  const job = useRef<Promise<ReadResult> | null>(null);

  useEffect(() => {
    if (!img) {
      router.replace('/check/scan');
      return;
    }
    clearPendingImage(img);
    let live = true;
    // Guards against the dev double-mount reading the image twice.
    job.current ??= readQuote(img)
      .catch((): ReadResult => ({ kind: 'unreadable', reason: 'engine-error' }))
      .finally(() => release(img));
    job.current.then((res) => {
      if (!live) return;
      if (res.kind === 'lines') {
        dispatch({ type: 'scanned', lines: res.lines, quotedTotal: res.quotedTotal, shopName: res.shopName });
        router.replace('/check/lines');
      } else {
        router.replace({ pathname: '/check/couldnt-read', params: { reason: res.reason } });
      }
    });
    return () => {
      live = false;
    };
  }, [img, dispatch]);

  return (
    <Screen header={<Header title={t.title} subtitle={t.subtitle} />} footer={<SecondaryButton label={copy.common.cancel} onPress={() => router.back()} />}>
      <View className="h-32.5 overflow-hidden rounded-[28px] border-t-4 border-ink bg-surface shadow-soft">
        {img?.uri ? (
          <StyledImage source={{ uri: img.uri }} contentFit="cover" contentPosition="top" className="size-full" />
        ) : (
          <View className="mx-3.5 mt-3.5">
            <QuotePaper head={PAPER_HEAD} rows={PAPER_ROWS.slice(0, 4)} compact tilt={0} />
          </View>
        )}
        <Animated.View pointerEvents="none" style={[{ position: 'absolute', left: 0, right: 0, height: 3 }, SWEEP]}>
          <View className="flex-1 bg-linear-to-r/srgb from-transparent via-ink to-transparent" />
        </Animated.View>
      </View>
      <Text variant="headline" className="mt-5">
        {t.headline}
      </Text>
      <Text variant="small" color="ink-soft" className="mt-1.5 !text-[14px]">
        {t.body}
      </Text>
      <Card className="mt-4 !rounded-[28px] !py-1">
        {SKELETON_ROWS.map((i) => (
          <View key={i}>
            {i > 0 ? <Divider /> : null}
            <View className="min-h-13 flex-row items-center gap-3">
              <View className="size-6.5 items-center justify-center rounded-full border-[1.5px] border-line">
                {i === 0 ? <ActivityIndicator size="small" colorClassName="accent-ink-soft" className="absolute inset-0" /> : null}
              </View>
              <Animated.View style={[{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 }, PULSE]}>
                <View className="h-2.5 flex-1 rounded-[5px] bg-track" />
                <View className="h-2.5 w-14 rounded-[5px] bg-track" />
              </Animated.View>
            </View>
          </View>
        ))}
      </Card>
    </Screen>
  );
}
