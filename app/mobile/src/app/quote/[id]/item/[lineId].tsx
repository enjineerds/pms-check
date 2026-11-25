import { useState } from 'react';
import { Platform, Pressable, Share, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { formatPeso } from '@/core/money';
import { lineName } from '@/core/quote';
import { itemHeadline, sayThis } from '@/core/verdictCopy';
import type { Decision } from '@/core/types';
import { findModel, findService } from '@/sample/catalog';
import { currentCar, setDecision, useQuote, useStore } from '@/store/store';
import { GlassButton, GlossGradient, Header, Icon, Notice, Screen, SecondaryButton, Segmented, Text } from '@/ui';

const DECISIONS: { value: Decision; label: string }[] = [
  { value: 'accept', label: 'I’ll pay' },
  { value: 'pending', label: 'Not yet' },
  { value: 'decline', label: 'Not today' },
];

// No clipboard module in this build, so native falls back to the share sheet.
async function copyText(text: string) {
  if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
    await navigator.clipboard.writeText(text);
    return;
  }
  await Share.share({ message: text });
}

export default function ItemDetail() {
  const { id, lineId } = useLocalSearchParams<{ id: string; lineId: string }>();
  const quote = useQuote(id);
  const car = useStore(currentCar);
  const [copied, setCopied] = useState(false);
  const line = quote?.lines.find((l) => l.id === lineId);
  if (!quote || !line) return <Screen header={<Header title="Item not found" />} />;

  const name = lineName(line);
  const model = car ? findModel(car.modelId).name : 'car';
  const service = line.match.kind === 'none' ? undefined : findService(line.match.serviceId);
  const say = sayThis(line.verdict, name, quote.visit.point.km);
  const copy = async () => {
    try {
      await copyText(`“${say}”`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
    }
  };

  return (
    <Screen
      scroll
      header={<Header title={name} subtitle={`${formatPeso(line.price)} · On your quote`} />}
      footer={
        <>
          <GlassButton label={copied ? 'Copied' : 'Copy what to say'} onPress={copy} />
          <SecondaryButton label="Back to my quote" onPress={() => router.back()} />
        </>
      }
    >
      <Text variant="headline" className="mt-1">
        {itemHeadline(line.verdict, model)}
      </Text>

      <View className="mt-5 overflow-hidden rounded-[32px] p-5 shadow-toast">
        <GlossGradient />
        <View className="flex-row items-center justify-between">
          <Text variant="small" weight="bold" color="panel-soft">
            Say this
          </Text>
          <Pressable accessibilityRole="button" onPress={copy} className="h-8 flex-row items-center gap-1.5 rounded-pill bg-panel-line px-3.5">
            <Icon name="copy" size={14} colorClassName="accent-panel-ink" stroke={2} />
            <Text variant="small" weight="bold" color="panel-ink">
              Copy
            </Text>
          </Pressable>
        </View>
        <Text weight="bold" color="panel-ink" className="mt-3.5 !text-[21px] !leading-[29px] !tracking-[-0.4px]">
          “{say}”
        </Text>
      </View>

      <Heading>What the manual says</Heading>
      <Text variant="body" weight="regular" color="ink">
        {service?.manual ?? 'We could not find this item in the schedule for your car.'}
      </Text>
      <Text variant="caption" weight="regular" color="ink-soft" className="mt-1.5">
        Source: {line.verdict.source?.title.replace(', ', ', ') ?? 'not found'} ·{' '}
        <Text variant="caption" weight="bold" className="underline" onPress={() => router.push(`/quote/${id}/report?lineId=${line.id}`)}>
          Report a mistake
        </Text>
      </Text>

      <Heading>Why they offer it</Heading>
      <Text variant="body" weight="regular">
        {service?.why ?? 'It is not on our list yet. Ask the advisor what it is for and why it is needed now.'}
      </Text>

      {service?.onlyIf ? (
        <View className="mt-4">
          <Notice tone="amber" icon="question">
            <Text variant="small" weight="bold">
              Say yes only if{' '}
            </Text>
            {service.onlyIf.startsWith('they') ? 'they ' + service.onlyIf.slice(5) : service.onlyIf}
          </Notice>
        </View>
      ) : null}

      <Heading>My decision</Heading>
      <Segmented size="sm" value={line.decision} options={DECISIONS} onChange={(d) => setDecision(id, line.id, d)} />
    </Screen>
  );
}

const Heading = ({ children }: { children: string }) => (
  <Text variant="small" weight="bold" className="mb-1.5 mt-5">
    {children}
  </Text>
);
