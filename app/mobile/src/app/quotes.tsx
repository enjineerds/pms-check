import { Pressable, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { formatPeso } from '@/core/money';
import { formatDay, isChecking, quoteTitle, savedAmount, sum } from '@/core/quote';
import { isListed, useStore } from '@/store/store';
import { Card, cx, Divider, GlassButton, GlossGradient, Header, Icon, Screen, Text } from '@/ui';

export default function Quotes() {
  const all = useStore((s) => s.quotes);
  // `?empty=1` previews the empty state.
  const { empty } = useLocalSearchParams<{ empty?: string }>();
  const quotes = empty ? [] : all.filter(isListed);
  const open = quotes.filter(isChecking);
  const done = quotes.filter((q) => !isChecking(q));
  const saved = sum(done.map(savedAmount));
  const cta = <GlassButton label="Check a casa quote" onPress={() => router.push('/check/camera')} />;

  if (quotes.length === 0) {
    return (
      <Screen header={<Header title="Past quotes" subtitle="Nothing here yet" />} footer={cta}>
        <View className="flex-1 items-center justify-center">
          <View className="size-18 items-center justify-center rounded-full bg-surface shadow-soft">
            <Icon name="receipt" size={26} stroke={2} />
          </View>
          <Text variant="title" className="mt-5">
            No quotes checked yet.
          </Text>
          <Text variant="small" color="ink-soft" className="mt-2 max-w-[260px] text-center">
            Check your first casa quote and it shows up here, with what you saved.
          </Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      scroll
      header={<Header title="Past quotes" subtitle={`${done.length} checked, ${open.length} open`} />}
      footer={cta}
    >
      <View className="gap-1 overflow-hidden rounded-[32px] p-5 shadow-toast">
        <GlossGradient />
        <Text variant="small" weight="semibold" color="panel-ink">
          You’ve saved
        </Text>
        <Text weight="extrabold" color="panel-ink" className="!text-[38px] !leading-[46px] !tracking-[-1px]">
          {formatPeso(saved)}
        </Text>
        <Text variant="small" color="panel-ink">
          by saying no to upsells that weren’t in the schedule.
        </Text>
      </View>
      <Card padded={false} className="mt-4 !rounded-[28px] px-4">
        {quotes.map((q, i) => {
          const checking = isChecking(q);
          return (
            <View key={q.id}>
              {i > 0 ? <Divider /> : null}
              <Pressable accessibilityRole="button" onPress={() => router.push(`/quote/${q.id}`)} className="flex-row items-center gap-3 py-3.5">
                <View className={cx('size-10 items-center justify-center rounded-full', checking ? 'bg-optional-bg' : 'bg-required-bg')}>
                  <Icon name={checking ? 'clock' : 'check'} size={18} colorClassName={checking ? 'accent-optional' : 'accent-required'} stroke={2.2} />
                </View>
                <View className="flex-1">
                  <Text variant="body" weight="bold" numberOfLines={2}>
                    {quoteTitle(q)}
                  </Text>
                  <Text variant="small" color="ink-faint">
                    {q.shopName} · {formatDay(q.createdAt)}
                  </Text>
                </View>
                {checking ? (
                  <Text variant="small" weight="bold" color="optional">
                    Checking
                  </Text>
                ) : (
                  <View className="items-end">
                    <Text variant="caption" color="required">
                      Saved
                    </Text>
                    <Text variant="body" weight="bold" color="required">
                      {formatPeso(savedAmount(q))}
                    </Text>
                  </View>
                )}
                <Icon name="chevron-right" size={16} colorClassName="accent-ink-soft" />
              </Pressable>
            </View>
          );
        })}
      </Card>
    </Screen>
  );
}
