import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { formatPeso } from '@/core/money';
import { formatDay, lineName, quoteTitle, quotedSum, totalsByVerdict } from '@/core/quote';
import { GROUP_TITLE, lineNote, reasonShort, VERDICT_WORD } from '@/core/verdictCopy';
import type { SavedLine, VerdictKind } from '@/core/types';
import { useQuote } from '@/store/store';
import { Card, cx, Divider, GlassButton, GlossGradient, Header, Icon, LineRow, Screen, Text, VERDICT } from '@/ui';

const KINDS: VerdictKind[] = ['yes', 'ask', 'no'];

export default function Result() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const quote = useQuote(id);
  if (!quote) return <Screen header={<Header title="Quote not found" />} />;

  const totals = totalsByVerdict(quote.lines);
  const quoted = quote.quotedTotal ?? quotedSum(quote);
  const groups = KINDS.map((k) => ({ kind: k, lines: quote.lines.filter((l) => l.verdict.kind === k) })).filter((g) => g.lines.length);

  return (
    <Screen
      scroll
      header={<Header title={quoteTitle(quote)} subtitle={`${quote.shopName ?? 'Quote'} · ${formatDay(quote.createdAt)}`} />}
    >
      <Text variant="display" className="mt-1">
        {totals.no > 0 ? `Say no to ${formatPeso(totals.no)} of this quote.` : 'Everything here is in the schedule.'}
      </Text>
      <Text variant="small" color="ink-soft" className="mt-2 !text-[14px]">
        The casa quoted {formatPeso(quoted)} for your Vios.
      </Text>

      <View className="mt-4 flex-row gap-2.5">
        {KINDS.map((k) => (
          <Total key={k} kind={k} amount={formatPeso(totals[k])} />
        ))}
      </View>
      <Text variant="small" color="ink-soft" className="mt-3 !text-[12.5px]">
        <Text variant="small" weight="bold" color="optional" className="!text-[12.5px]">
          Ask first
        </Text>{' '}
        means reasonable, but not required yet. Ask to see it.
      </Text>

      <GlassButton label="Show this to the advisor" onPress={() => router.push(`/quote/${id}/advisor`)} className="mt-4" />

      <Card padded={false} className="mt-4 !rounded-[28px] px-4 py-3">
        {groups.map((g, gi) => (
          <View key={g.kind} className={gi > 0 ? 'mt-2' : undefined}>
            <View className="flex-row items-center justify-between pt-1.5">
              <Text variant="caption" weight="bold" color={VERDICT[g.kind].color}>
                {GROUP_TITLE[g.kind]}
              </Text>
              <Text variant="caption" weight="regular" color="ink-soft">
                {reasonShort(g.lines[0].verdict)}
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
          Source: {quote.lines[0]?.verdict.source?.title.replace(', ', ' · ') ?? 'Vios owner’s manual · 2025'}
        </Text>
        <Text
          variant="caption"
          weight="bold"
          className="mt-2 underline"
          onPress={() => router.push(`/quote/${id}/report`)}
        >
          Report a mistake
        </Text>
      </View>
    </Screen>
  );
}

function Row({ line, first, onPress }: { line: SavedLine; first: boolean; onPress: () => void }) {
  return (
    <View>
      {first ? null : <Divider />}
      <LineRow title={lineName(line)} price={line.price} kind={line.verdict.kind} note={lineNote(line)} onPress={onPress} />
    </View>
  );
}

function Total({ kind, amount }: { kind: VerdictKind; amount: string }) {
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
          {VERDICT_WORD[kind]}
        </Text>
      </View>
    </View>
  );
}
