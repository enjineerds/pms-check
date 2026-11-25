import { useRef, useState, type ComponentRef } from 'react';
import { Pressable, View, type TextInput } from 'react-native';
import { router } from 'expo-router';
import { findModel, MODELS, type CatalogModel } from '@/sample/catalog';
import { patchSetup } from '@/store/store';
import { Card, Divider, Header, Icon, Screen, SearchField, Text } from '@/ui';

const variantsLine = (m: CatalogModel) =>
  `${m.variants.map((v) => v.name).join(', ')} · ${m.years[0]} to ${m.years[1]}`;

export default function PickModel() {
  const [q, setQ] = useState('');
  const input = useRef<ComponentRef<typeof TextInput>>(null);
  const list = MODELS.filter((m) => `${m.make} ${m.name}`.toLowerCase().includes(q.trim().toLowerCase()));

  const pick = (id: CatalogModel['id']) => {
    const m = findModel(id);
    patchSetup({ modelId: m.id, variantId: null, bodyStyle: m.bodyStyle, transmission: m.transmissions[0], year: m.years[1] });
    router.push('/car/variant');
  };

  return (
    <Screen scroll header={<Header title="Pick your car" subtitle="Step 1 of 4" />}>
      <Text variant="display" className="!text-[30px] !leading-[34px]">
        Which car do you drive?
      </Text>
      <View className="mt-4">
        <SearchField inputRef={input} value={q} onChangeText={setQ} placeholder="Search your model" />
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
                  {variantsLine(m)}
                </Text>
              </View>
              <Icon name="chevron-right" size={16} colorClassName="accent-ink-soft" />
            </Pressable>
          </View>
        ))}
        {list.length === 0 ? (
          <Text variant="small" color="ink-soft" className="py-5">
            No match for “{q}”.
          </Text>
        ) : null}
      </Card>
      <View className="my-5 flex-row justify-center">
        <Text variant="small" color="ink-soft">
          Don’t see your car?{' '}
        </Text>
        <Pressable accessibilityRole="button" onPress={() => input.current?.focus()}>
          <Text variant="small" weight="bold">
            Type it in
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}
