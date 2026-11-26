import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { formatPeso } from '@/core/money';
import { formatDay, lineName, quoteTitle, quotedSum, totalsByVerdict } from '@/core/quote';
import { lineNote, reasonShort, resultHeadline } from '@/core/verdictCopy';
import type { SavedLine, VerdictKind } from '@/core/types';
import { useCopy, useLocale } from '@/i18n';
import { findModel } from '@/catalog';
import { useQuote, useStore } from '@/store/store';
import { Card, cx, Divider, GlassButton, GlossGradient, Header, Icon, LineRow, Screen, Text, VERDICT } from '@/ui';

const KINDS: VerdictKind[] = ['yes', 'ask', 'no'];

export default function Result() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const quote = useQuote(id);
  const car = useStore((s) => s.cars.find((c) => c.id === quote?.carId));
  const model = findModel(car?.modelId ?? null);
  const copy = useCopy();
  const t = copy.result;
  if (!quote) return <Screen header={<Header title={t.notFound} />} />;

  const totals = totalsByVerdict(quote.lines);
  const quoted = quote.quotedTotal ?? quotedSum(quote);
  const groups = KINDS.map((k) => ({ kind: k, lines: quote.lines.filter((l) => l.verdict.kind === k) })).filter((g) => g.lines.length);

  return (
    <Screen
      scroll
      header={<Header title={quoteTitle(quote, copy.quote)} subtitle={`${quote.shopName ?? t.quote} · ${formatDay(quote.createdAt, copy.quote)}`} />}
    >
      <Text variant="display" className="mt-1">
        {resultHeadline(totals, t)}
      </Text>
      <Text variant="small" color="ink-soft" className="mt-2 !text-[14px]">
        {t.quoted(formatPeso(quoted), model?.name ?? copy.item.yourCar)}
      </Text>

      <View className="mt-4 flex-row gap-2.5">
        {KINDS.map((k) => (
          <Total key={k} kind={k} amount={formatPeso(totals[k])} />
        ))}
      </View>
      <Text variant="small" color="ink-soft" className="mt-3 !text-[12.5px]">
        <Text variant="small" weight="bold" color="optional" className="!text-[12.5px]">
          {copy.verdict.word.ask}
        </Text>
        {t.askMeans}
      </Text>

      <GlassButton label={t.showAdvisor} onPress={() => router.push(`/quote/${id}/advisor`)} className="mt-4" />

      <Card padded={false} className="mt-4 !rounded-[28px] px-4 py-3">
        {groups.map((g, gi) => (
          <View key={g.kind} className={gi > 0 ? 'mt-2' : undefined}>
            <View className="flex-row items-center justify-between pt-1.5">
              <Text variant="caption" weight="bold" color={VERDICT[g.kind].color}>
                {copy.verdict.word[g.kind]}
              </Text>
              <Text variant="caption" weight="regular" color="ink-soft">
                {reasonShort(g.lines[0].verdict, copy.verdict, model?.make ?? '')}
              </Text>
            </View>
            {g.lines.map((l, i) => (
              <Row key={l.id} line={l} first={i === 0} onPress={() => router.push(`/quote/${id}/item/${l.id}`)} />
            ))}
          </View>
        ))}
      </Card>

      <View className="mb-2 mt-5 items-center">
        <Text variant="caption" weight="regular" color="ink-soft">
          {t.source(quote.lines[0]?.verdict.source?.title.replace(', ', ' · ') ?? t.defaultSource)}
        </Text>
        <Text
          variant="caption"
          weight="bold"
          className="mt-2 underline"
          onPress={() => router.push(`/quote/${id}/report`)}
        >
          {copy.common.reportMistake}
        </Text>
      </View>
    </Screen>
  );
}

function Row({ line, first, onPress }: { line: SavedLine; first: boolean; onPress: () => void }) {
  const t = useCopy().verdict;
  const locale = useLocale();
  return (
    <View>
      {first ? null : <Divider />}
      <LineRow title={lineName(line, locale)} price={line.price} kind={line.verdict.kind} note={lineNote(line, t)} onPress={onPress} />
    </View>
  );
}

function Total({ kind, amount }: { kind: VerdictKind; amount: string }) {
  const t = useCopy().verdict;
  const dark = kind === 'no';
  const c = VERDICT[kind];
  const size = amount.length > 7 ? 15 : 18;
  return (
    <View className={cx('h-28 flex-1 justify-between rounded-md bg-surface p-3', dark ? 'overflow-hidden shadow-toast' : 'shadow-soft')}>
      {dark ? <GlossGradient /> : null}
      <View className={cx('size-5.5 items-center justify-center rounded-full', dark ? 'bg-skip' : c.bg)}>
        <Icon name={kind === 'yes' ? 'check' : kind === 'ask' ? 'question' : 'x'} size={12} colorClassName={dark ? 'accent-panel-ink' : c.accent} stroke={3} />
      </View>
      <View>
        <Text weight="extrabold" color={dark ? 'panel-ink' : 'ink'} className="!leading-6 !tracking-[-0.3px]" style={{ fontSize: size }} numberOfLines={1}>
          {amount}
        </Text>
        <Text variant="small" weight="medium" color={dark ? 'panel-ink' : 'ink'}>
          {t.word[kind]}
        </Text>
      </View>
    </View>
  );
}
