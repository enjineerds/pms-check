import { useState } from 'react';
import { Pressable, View } from 'react-native';
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

export default function AddLine() {
  const { draft, dispatch } = useDraft();
  const [q, setQ] = useState('');
  const [item, setItem] = useState<Item | null>(null);
  const [raw, setRaw] = useState('');

  const query = q.trim();
  const results = (query ? SERVICES.filter((s) => s.name.toLowerCase().includes(query.toLowerCase())) : SERVICES.slice(0, 6)).slice(0, 3);
  const asTyped = query && !serviceByName(query);

  if (item) {
    const service = item.serviceId ? findService(item.serviceId) : undefined;
    const amount = parseFloat(raw);
    const add = () => {
      const line: DraftLine = {
        id: `n${Date.now()}`,
        rawText: item.name,
        match: item.serviceId ? { kind: 'confirmed', serviceId: item.serviceId } : { kind: 'none' },
        price: { kind: 'confirmed', value: peso(amount) },
        origin: 'typed',
      };
      dispatch({ type: 'add', line });
      if (draft.lines.length === 0) router.replace('/check/lines');
      else router.back();
    };
    const [whole, frac] = raw.split('.');
    return (
      <>
        <View className="flex-1">
          <Screen
            flushBottom
            header={<Header title="Add a line" subtitle="How much was it?" onBack={() => setItem(null)} />}
            footer={<GlassButton label="Add to my quote" disabled={!(amount > 0)} onPress={add} />}
          >
            <Card className="flex-row items-center !py-3.5">
              <View className="flex-1">
                <Text variant="caption" weight="regular" color="ink-soft">
                  Item
                </Text>
                <Text variant="lead" weight="bold">
                  {item.name}
                </Text>
              </View>
              <Pressable accessibilityRole="button" onPress={() => setItem(null)}>
                <Text variant="small" weight="bold" color="ink-soft">
                  Change
                </Text>
              </Pressable>
            </Card>
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
            {service ? (
              <Text variant="caption" weight="regular" color="ink-soft" className="mt-2.5">
                Sample range for this item: {formatPeso(peso(service.range[0]))} to {formatPeso(peso(service.range[1]))}.
              </Text>
            ) : null}
          </Screen>
        </View>
        <Keypad onKey={(k) => setRaw((v) => applyKey(v, k, { decimal: true, maxLength: 9 }))} />
      </>
    );
  }

  return (
    <Screen header={<Header title="Add a line" subtitle="Pick one or type your own" />}>
      <SearchField value={q} onChangeText={setQ} placeholder="What did the casa quote?" autoFocus />
      <Card padded={false} className="mt-3.5 !rounded-[28px] px-4">
        {results.map((s, i) => (
          <View key={s.id}>
            {i > 0 ? <Divider /> : null}
            <Pressable accessibilityRole="button" onPress={() => setItem({ name: s.name, serviceId: s.id })} className="flex-row items-center gap-3 py-3.5">
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
            <Pressable accessibilityRole="button" onPress={() => setItem({ name: query, serviceId: null })} className="flex-row items-center gap-3 py-3.5">
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
    </Screen>
  );
}
