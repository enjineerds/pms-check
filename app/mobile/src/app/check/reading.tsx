import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { release } from '@/ocr/capture';
import { clearPendingImage, peekPendingImage } from '@/ocr/pending';
import { readQuote } from '@/ocr/read';
import type { CapturedImage, ReadResult } from '@/ocr/types';
import { PAPER_ROWS } from '@/sample/paper';
import { useDraft } from '@/store/draft';
import { Card, Divider, Header, QuotePaper, Screen, SecondaryButton, Text } from '@/ui';

const SKELETON_ROWS = [0, 1, 2, 3];

// Dev only: /check/reading?demo=1 reads a stand-in image, so the screens after it stay reachable on web.
const DEMO: CapturedImage = { uri: '', width: 0, height: 0, source: 'library' };

export default function Reading() {
  const { demo } = useLocalSearchParams<{ demo?: string }>();
  const { dispatch } = useDraft();
  const [img] = useState(() => peekPendingImage() ?? (__DEV__ && demo ? DEMO : null));
  const job = useRef<Promise<ReadResult> | null>(null);

  useEffect(() => {
    if (!img) {
      router.replace('/check/scan');
      return;
    }
    clearPendingImage(img);
    let live = true;
    // Started once, so a dev double-mount reads and releases the image a single time.
    job.current ??= readQuote(img)
      .catch((): ReadResult => ({ kind: 'unreadable', reason: 'engine-error' }))
      .finally(() => release(img));
    job.current.then((res) => {
      if (!live) return;
      if (res.kind === 'lines') {
        dispatch({ type: 'scanned', lines: res.lines, quotedTotal: res.quotedTotal, shopName: res.shopName });
        router.replace('/check/lines');
      } else {
        router.replace('/check/couldnt-read');
      }
    });
    return () => {
      live = false;
    };
  }, [img, dispatch]);

  return (
    <Screen header={<Header title="Reading your quote" subtitle="This takes a few seconds" />} footer={<SecondaryButton label="Cancel" onPress={() => router.back()} />}>
      <View className="h-32.5 overflow-hidden rounded-[28px] border-t-4 border-ink bg-surface shadow-soft">
        {img?.uri ? (
          <Image source={{ uri: img.uri }} contentFit="cover" contentPosition="top" className="size-full" />
        ) : (
          <View className="mx-3.5 mt-3.5">
            <QuotePaper rows={PAPER_ROWS.slice(0, 4)} compact tilt={0} />
          </View>
        )}
      </View>
      <Text variant="display" className="mt-5 !text-[30px] !leading-[34px]">
        Reading the lines…
      </Text>
      <Text variant="small" color="ink-soft" className="mt-1.5 !text-[14px]">
        Keep the quote with you. Nothing is saved yet.
      </Text>
      <Card className="mt-4 !rounded-[28px] !py-1">
        {SKELETON_ROWS.map((i) => (
          <View key={i}>
            {i > 0 ? <Divider /> : null}
            <View className="min-h-13 flex-row items-center gap-3">
              <View className="size-6.5 items-center justify-center rounded-full border-[1.5px] border-line">
                {i === 0 ? <ActivityIndicator size="small" colorClassName="accent-ink-soft" className="absolute inset-0" /> : null}
              </View>
              <View className="h-2.5 flex-1 rounded-[5px] bg-track" />
              <View className="h-2.5 w-14 rounded-[5px] bg-track" />
            </View>
          </View>
        ))}
      </Card>
    </Screen>
  );
}
