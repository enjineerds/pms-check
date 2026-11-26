import { useRef, useState, type ComponentRef } from 'react';
import { Pressable, View, type TextInput } from 'react-native';
import { router } from 'expo-router';
import { CATALOG, modelFor, transmissionsOf } from '@/catalog';
import type { CarModel } from '@/core/types';
import { useCopy, type Copy } from '@/i18n';
import { patchSetup } from '@/store/store';
import { Card, Divider, Header, Icon, Screen, SearchField, Text } from '@/ui';

const variantsLine = (m: CarModel, t: Copy['carModel']) =>
  `${m.variants.map((v) => v.label).join(', ')} · ${t.years(m.years.from, m.years.to)}`;

export default function PickModel() {
  const copy = useCopy();
  const t = copy.carModel;
  const [q, setQ] = useState('');
  const input = useRef<ComponentRef<typeof TextInput>>(null);
  const list = CATALOG.models.filter((m) => `${m.make} ${m.name}`.toLowerCase().includes(q.trim().toLowerCase()));

  const pick = (id: CarModel['id']) => {
    const m = modelFor(id);
    patchSetup({ modelId: m.id, variantId: null, bodyStyle: m.defaultBodyStyle, transmission: transmissionsOf(m)[0], year: m.years.to });
    router.push('/car/variant');
  };

  return (
    <Screen scroll header={<Header title={copy.car.title} subtitle={copy.car.step(1)} />}>
      <Text variant="headline">
        {t.question}
      </Text>
      <View className="mt-4">
        <SearchField inputRef={input} value={q} onChangeText={setQ} placeholder={t.search} />
      </View>
      <Card padded={false} className="mt-4 !rounded-[28px] px-4">
        {list.map((m, i) => (
          <View key={m.id}>
            {i > 0 ? <Divider /> : null}
            <Pressable accessibilityRole="button" onPress={() => pick(m.id)} className="flex-row items-center gap-3 py-3.5">
              <View className="size-9 items-center justify-center rounded-full border border-line bg-surface">
                <Icon name="car" size={20} stroke={2} />
              </View>
              <View className="flex-1">
                <Text variant="body" weight="bold">
                  {m.make} {m.name}
                </Text>
                <Text variant="caption" weight="regular" color="ink-soft">
                  {variantsLine(m, t)}
                </Text>
              </View>
              <Icon name="chevron-right" size={16} colorClassName="accent-ink-soft" />
            </Pressable>
          </View>
        ))}
        {list.length === 0 ? (
          <Text variant="small" color="ink-soft" className="py-5">
            {t.noMatch(q)}
          </Text>
        ) : null}
      </Card>
      <View className="my-5 flex-row justify-center">
        <Text variant="small" color="ink-soft">
          {t.missing}
        </Text>
        <Pressable accessibilityRole="button" onPress={() => input.current?.focus()}>
          <Text variant="small" weight="bold">
            {t.typeIt}
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}
