import { useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { Easing, FadeIn, Keyframe, SlideOutDown, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { applyKey } from '@/core/keypad';
import { formatPeso, groupDigits, peso } from '@/core/money';
import type { DraftLine, ServiceId } from '@/core/types';
import { SERVICES, serviceByName, findService } from '@/sample/catalog';
import { useDraft } from '@/store/draft';
import { Card, Divider, GlassButton, Header, Icon, Keypad, Screen, SearchField, Text } from '@/ui';

interface Item {
  name: string;
  serviceId: ServiceId | null;
}

const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);

const rise = (delay: number) =>
  new Keyframe({
    0: { opacity: 0, transform: [{ translateY: 14 }] },
    100: { opacity: 1, transform: [{ translateY: 0 }], easing: EASE_OUT },
  })
    .duration(380)
    .delay(delay);

// Waits for the price step to settle and the system keyboard to leave before the keypad rises.
const KEYPAD_DELAY = 420;
const KEYPAD_OUT = SlideOutDown.duration(220).easing(Easing.in(Easing.quad));

export default function AddLine() {
  const { draft, dispatch } = useDraft();
  const [q, setQ] = useState('');
  const [item, setItem] = useState<Item | null>(null);
  const [raw, setRaw] = useState('');
  const [returned, setReturned] = useState(false);
  const insets = useSafeAreaInsets();
  const keypadH = useSharedValue(0);
  const shown = useSharedValue(0);

  const keypadStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - shown.get()) * (keypadH.get() || 1000) }],
  }));
  const footerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - shown.get()) * Math.max(keypadH.get() - insets.bottom, 0) }],
  }));

  const pick = (picked: Item) => {
    shown.set(0);
    shown.set(withDelay(KEYPAD_DELAY, withTiming(1, { duration: 360, easing: EASE_OUT })));
    setItem(picked);
  };

  const change = () => {
    setReturned(true);
    setItem(null);
  };

  const add = (picked: Item) => {
    const line: DraftLine = {
      id: `n${Date.now()}`,
      rawText: picked.name,
      match: picked.serviceId ? { kind: 'confirmed', serviceId: picked.serviceId } : { kind: 'none' },
      price: { kind: 'confirmed', value: peso(parseFloat(raw)) },
      origin: 'typed',
    };
    dispatch({ type: 'add', line });
    if (draft.lines.length === 0) router.replace('/check/lines');
    else router.back();
  };

  return (
    <View className="flex-1">
      <Screen
        flushBottom={!!item}
        header={<Header title="Add a line" subtitle={item ? 'How much was it?' : 'Pick one or type your own'} onBack={item ? change : undefined} />}
        footer={
          item ? (
            <Animated.View style={footerStyle}>
              <Animated.View entering={rise(140)}>
                <GlassButton label="Add to my quote" disabled={!(parseFloat(raw) > 0)} onPress={() => add(item)} />
              </Animated.View>
            </Animated.View>
          ) : undefined
        }
      >
        {item ? <PriceStep item={item} raw={raw} onChange={change} /> : <PickStep q={q} setQ={setQ} onPick={pick} animate={returned} />}
      </Screen>
      {item ? (
        <Animated.View style={keypadStyle} exiting={KEYPAD_OUT} onLayout={(e) => keypadH.set(e.nativeEvent.layout.height)}>
          <Keypad onKey={(k) => setRaw((v) => applyKey(v, k, { decimal: true, maxLength: 9 }))} />
        </Animated.View>
      ) : null}
    </View>
  );
}

function PriceStep({ item, raw, onChange }: { item: Item; raw: string; onChange: () => void }) {
  const service = item.serviceId ? findService(item.serviceId) : undefined;
  const [whole, frac] = raw.split('.');
  return (
    <>
      <Animated.View entering={rise(0)}>
        <Card className="flex-row items-center !py-3.5">
          <View className="flex-1">
            <Text variant="caption" weight="regular" color="ink-soft">
              Item
            </Text>
            <Text variant="lead" weight="bold">
              {item.name}
            </Text>
          </View>
          <Pressable accessibilityRole="button" onPress={onChange} hitSlop={12} className="active:opacity-60">
            <Text variant="small" weight="bold" color="ink-soft">
              Change
            </Text>
          </Pressable>
        </Card>
      </Animated.View>
      <Animated.View entering={rise(60)}>
        <Text variant="small" weight="bold" className="mb-2.5 mt-5">
          How much did the casa quote?
        </Text>
        <View className="h-20 flex-row items-center gap-2.5 rounded-pill border-[1.5px] border-ink bg-surface px-6 shadow-soft">
          <Text weight="bold" color="ink-soft" className="!text-[40px] !leading-[48px] !tracking-[-0.8px]">
            ₱
          </Text>
          <Text weight="bold" color={raw ? 'ink' : 'ink-faint'} className="!text-[40px] !leading-[48px] !tracking-[-0.8px]">
            {raw ? `${groupDigits(Number(whole))}${frac !== undefined ? `.${frac}` : ''}` : '0'}
          </Text>
        </View>
      </Animated.View>
      {service ? (
        <Animated.View entering={rise(110)}>
          <Text variant="caption" weight="regular" color="ink-soft" className="mt-2.5">
            Sample range for this item: {formatPeso(peso(service.range[0]))} to {formatPeso(peso(service.range[1]))}.
          </Text>
        </Animated.View>
      ) : null}
    </>
  );
}

function PickStep({ q, setQ, onPick, animate }: { q: string; setQ: (v: string) => void; onPick: (item: Item) => void; animate: boolean }) {
  const query = q.trim();
  const results = (query ? SERVICES.filter((s) => s.name.toLowerCase().includes(query.toLowerCase())) : SERVICES.slice(0, 6)).slice(0, 3);
  const asTyped = query && !serviceByName(query);
  // The first visit already has the stack push; only a return from the price step needs its own entrance.
  return (
    <Animated.View entering={animate ? FadeIn.duration(220) : undefined}>
      <SearchField value={q} onChangeText={setQ} placeholder="What did the casa quote?" autoFocus />
      <Card padded={false} className="mt-3.5 !rounded-[28px] px-4">
        {results.map((s, i) => (
          <View key={s.id}>
            {i > 0 ? <Divider /> : null}
            <Pressable
              accessibilityRole="button"
              onPress={() => onPick({ name: s.name, serviceId: s.id })}
              className="flex-row items-center gap-3 py-3.5 active:opacity-60"
            >
              <View className="flex-1">
                <Text variant="body" weight="bold">
                  {s.name}
                </Text>
                <Text variant="small" color="ink-soft">
                  {s.category}
                </Text>
              </View>
              <View className="size-8 items-center justify-center rounded-full border-[1.5px] border-line">
                <Icon name="plus" size={16} stroke={2.2} />
              </View>
            </Pressable>
          </View>
        ))}
        {asTyped ? (
          <>
            {results.length > 0 ? <Divider /> : null}
            <Pressable
              accessibilityRole="button"
              onPress={() => onPick({ name: query, serviceId: null })}
              className="flex-row items-center gap-3 py-3.5 active:opacity-60"
            >
              <View className="size-7 items-center justify-center overflow-hidden rounded-full">
                <View className="absolute inset-0 bg-linear-to-b/srgb from-gloss-top to-gloss-disc" />
                <Icon name="plus" size={14} colorClassName="accent-panel-ink" stroke={2.6} />
              </View>
              <View className="flex-1">
                <Text variant="body" weight="bold">
                  Add “{query}” as typed
                </Text>
                <Text variant="small" color="ink-soft">
                  Not in our list. We’ll still add it.
                </Text>
              </View>
            </Pressable>
          </>
        ) : null}
      </Card>
    </Animated.View>
  );
}
