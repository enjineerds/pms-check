import { useState } from 'react';
import { Platform, Pressable, Share, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { formatPeso } from '@/core/money';
import { lineName } from '@/core/quote';
import { itemHeadline, manualSays, sayThis } from '@/core/verdictCopy';
import { CATALOG, findModel, findService } from '@/catalog';
import { ruleFor } from '@/core/schedule';
import { useCopy, useLocale } from '@/i18n';
import { currentCar, setDecision, useQuote, useStore } from '@/store/store';
import { GlossGradient, Header, Icon, Notice, Screen, SecondaryButton, Segmented, Text } from '@/ui';

const DECISIONS = ['accept', 'pending', 'decline'] as const;

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
  const copy = useCopy();
  const locale = useLocale();
  const t = copy.item;
  const line = quote?.lines.find((l) => l.id === lineId);
  if (!quote || !line) return <Screen header={<Header title={t.notFound} />} />;

  const name = lineName(line, locale);
  const carModel = car ? findModel(car.modelId) : undefined;
  const model = carModel?.name ?? t.yourCar;
  const service = line.match.kind === 'none' ? undefined : findService(line.match.serviceId);
  const item = CATALOG.schedules.find((s) => s.id === quote.scheduleId)?.items.find((i) => i.serviceId === service?.id);
  const manual = service ? manualSays(service.kind, item && ruleFor(item, 'severe'), carModel?.make ?? '', t, copy.verdict) : undefined;
  const onlyIf = service?.sayYesOnlyIf?.[locale];
  const say = `“${sayThis(line.verdict, name, quote.visit.point.km, copy.verdict)}”`;
  const copySay = async () => {
    try {
      await copyText(say);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
    }
  };

  return (
    <Screen
      scroll
      header={<Header title={name} subtitle={t.onQuote(formatPeso(line.price))} />}
      footer={
        <>
          <View>
            <Text variant="small" weight="bold" className="mb-1.5">
              {t.decision}
            </Text>
            <Segmented size="sm" value={line.decision} options={DECISIONS.map((value) => ({ value, label: t.decisions[value] }))} onChange={(d) => setDecision(id, line.id, d)} />
          </View>
          <SecondaryButton label={copy.common.backToQuote} onPress={() => router.back()} />
        </>
      }
    >
      <Text variant="headline" className="mt-1">
        {itemHeadline(line.verdict, model, copy.verdict)}
      </Text>

      <View className="mt-5 overflow-hidden rounded-[32px] p-5 shadow-toast">
        <GlossGradient />
        <View className="flex-row items-center justify-between">
          <Text variant="small" weight="bold" color="panel-soft">
            {t.sayThis}
          </Text>
          <Pressable accessibilityRole="button" onPress={copySay} className="h-8 flex-row items-center gap-1.5 rounded-pill bg-panel-line px-3.5">
            <Icon name="copy" size={14} colorClassName="accent-panel-ink" stroke={2} />
            <Text variant="small" weight="bold" color="panel-ink">
              {copied ? t.copied : t.copy}
            </Text>
          </Pressable>
        </View>
        <Text weight="bold" color="panel-ink" className="mt-3.5 !text-[21px] !leading-[29px] !tracking-[-0.4px]">
          {say}
        </Text>
      </View>

      <Heading>{t.manual}</Heading>
      <Text variant="body" weight="regular" color="ink">
        {manual ?? t.noManual}
      </Text>
      <Text variant="caption" weight="regular" color="ink-soft" className="mt-1.5">
        {t.source(line.verdict.source?.title ?? t.sourceNotFound)}
        <Text variant="caption" weight="bold" className="underline" onPress={() => router.push(`/quote/${id}/report?lineId=${line.id}`)}>
          {copy.common.reportMistake}
        </Text>
      </Text>

      <Heading>{t.why}</Heading>
      <Text variant="body" weight="regular">
        {service?.whyOffered?.[locale] ?? t.noWhy}
      </Text>

      {onlyIf ? (
        <View className="mt-4">
          <Notice tone="amber" icon="question">
            <Text variant="small" weight="bold">
              {t.onlyIf}
            </Text>
            {onlyIf}
          </Notice>
        </View>
      ) : null}
    </Screen>
  );
}

const Heading = ({ children }: { children: string }) => (
  <Text variant="small" weight="bold" className="mb-1.5 mt-5">
    {children}
  </Text>
);
