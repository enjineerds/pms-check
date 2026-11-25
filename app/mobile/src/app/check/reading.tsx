import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { formatPeso } from '@/core/money';
import { priceOf } from '@/core/quote';
import { PAPER_ROWS } from '@/sample/paper';
import { scannedDraft, type ScanOutcome } from '@/sample/quotes';
import { useDraft } from '@/store/draft';
import { Card, Divider, Header, Icon, QuotePaper, Screen, SecondaryButton, Text } from '@/ui';

const TICK_MS = 330;

export default function Reading() {
  const { outcome = 'ok' } = useLocalSearchParams<{ outcome?: ScanOutcome }>();
  const { dispatch } = useDraft();
  const { lines, quotedTotal } = useMemo(() => scannedDraft(outcome), [outcome]);
  const [done, setDone] = useState(0);

  useEffect(() => {
    // A blurry photo gives up after two lines, as a real read would.
    const target = outcome === 'unreadable' ? 2 : lines.length;
    const id = setInterval(() => setDone((d) => Math.min(d + 1, target)), TICK_MS);
    return () => clearInterval(id);
  }, [outcome, lines.length]);

  useEffect(() => {
    const finished = done >= (outcome === 'unreadable' ? 2 : lines.length);
    if (!finished || done === 0) return;
    const id = setTimeout(() => {
      if (outcome === 'unreadable') {
        router.replace('/check/couldnt-read');
        return;
      }
      dispatch({ type: 'scanned', lines, quotedTotal, shopName: 'Bayan Motors' });
      router.replace('/check/lines');
    }, 450);
    return () => clearTimeout(id);
  }, [done, outcome, lines, quotedTotal, dispatch]);

  return (
    <Screen header={<Header title="Reading your quote" subtitle="This takes a few seconds" />} footer={<SecondaryButton label="Cancel" onPress={() => router.back()} />}>
      <View className="h-32.5 overflow-hidden rounded-[28px] border-t-4 border-ink bg-surface shadow-soft">
        <View className="mx-3.5 mt-3.5">
          <QuotePaper rows={PAPER_ROWS.slice(0, 4)} compact tilt={0} />
        </View>
      </View>
      <Text variant="display" className="mt-5 !text-[30px] !leading-[34px]">
        Reading the lines…
      </Text>
      <Text variant="small" color="ink-soft" className="mt-1.5 !text-[14px]">
        Keep the quote with you. Nothing is saved yet.
      </Text>
      <Card className="mt-4 !rounded-[28px] !py-1">
        {lines.map((l, i) => (
          <View key={l.id}>
            {i > 0 ? <Divider /> : null}
            <View className="min-h-13 flex-row items-center gap-3">
              {i < done ? (
                <View className="size-6.5 items-center justify-center rounded-full bg-required-bg">
                  <Icon name="check" size={13} colorClassName="accent-required" stroke={2.6} />
                </View>
              ) : (
                <View className="size-6.5 items-center justify-center rounded-full border-[1.5px] border-line">
                  {i === done ? <ActivityIndicator size="small" colorClassName="accent-ink-soft" className="absolute inset-0" /> : null}
                </View>
              )}
              {i < done ? (
                <>
                  <Text variant="body" className="flex-1">
                    {l.rawText}
                  </Text>
                  <Text variant="body" weight="bold">
                    {formatPeso(priceOf(l.price)!)}
                  </Text>
                </>
              ) : (
                <>
                  <View className="h-2.5 flex-1 rounded-[5px] bg-track" />
                  <View className="h-2.5 w-14 rounded-[5px] bg-track" />
                </>
              )}
            </View>
          </View>
        ))}
      </Card>
    </Screen>
  );
}
