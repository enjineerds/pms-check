import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { formatKm, groupDigits } from '@/core/money';
import { advisorCard, lineName } from '@/core/quote';
import type { VerdictKind } from '@/core/types';
import { findModel, variantLabel } from '@/catalog';
import { useCopy, useLocale } from '@/i18n';
import { currentCar, useQuote, useStore } from '@/store/store';
import { AdvisorPanel, Header, LineRow, Screen, SecondaryButton, Text, VERDICT } from '@/ui';

export default function Advisor() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const quote = useQuote(id);
  const car = useStore(currentCar);
  const copy = useCopy();
  const locale = useLocale();
  const t = copy.advisor;
  if (!quote) return null;

  const card = advisorCard(quote);
  const model = car ? findModel(car.modelId) : null;
  const sub = model && car ? `${model.make} ${model.name} ${variantLabel(model, car.variantId)} · ${formatKm(quote.visit.odometerKm)}` : undefined;

  return (
    <Screen scroll header={<Header title={t.title} subtitle={sub} />} footer={<SecondaryButton label={copy.common.backToQuote} onPress={() => router.back()} />}>
      <Text variant="display" className="mt-1">
        {t.onlyThese(groupDigits(quote.visit.point.km))}
      </Text>
      <View className="mt-5">
        <AdvisorPanel lines={card.doThese.map((l) => ({ id: l.id, name: lineName(l, locale), price: l.price }))} total={card.willPay} />
      </View>
      <Block title={t.showFirst} kind="ask" lines={card.showFirst} />
      <Block title={t.notToday} kind="no" lines={card.notToday} />
    </Screen>
  );
}

function Block({ title, kind, lines }: { title: string; kind: VerdictKind; lines: Parameters<typeof lineName>[0][] }) {
  const locale = useLocale();
  if (lines.length === 0) return null;
  return (
    <View className="mt-5">
      <Text variant="small" weight="bold" color={VERDICT[kind].color}>
        {title}
      </Text>
      {lines.map((l) => (
        <LineRow key={l.id} title={lineName(l, locale)} price={l.price} kind={kind} />
      ))}
    </View>
  );
}
