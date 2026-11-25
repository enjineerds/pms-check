import { View } from 'react-native';
import { router } from 'expo-router';
import { findModel, TRANSMISSION_LABEL } from '@/sample/catalog';
import { patchSetup, useStore } from '@/store/store';
import { Chip, GlassButton, Header, RadioRow, Screen, Segmented, Text } from '@/ui';

export default function PickVariant() {
  const setup = useStore((s) => s.setup);
  const model = findModel(setup.modelId);
  const selected = setup.variantId ?? model.variants[Math.min(1, model.variants.length - 1)].id;
  const latest = model.years[1];
  const years = [0, 1, 2, 3, 4].map((i) => latest - i);
  const older = setup.year < latest - 4;

  return (
    <Screen
      scroll
      header={<Header title="Pick your car" subtitle={`Step 2 of 4 · ${model.make} ${model.name}`} />}
      footer={
        <GlassButton
          label="Continue"
          onPress={() => {
            patchSetup({ variantId: selected });
            router.push('/car/odometer');
          }}
        />
      }
    >
      <Text variant="headline">
        Which {model.name} is yours?
      </Text>
      <Label>Variant</Label>
      <View className="gap-2.5">
        {model.variants.map((v) => (
          <RadioRow key={v.id} label={v.name} selected={v.id === selected} onPress={() => patchSetup({ variantId: v.id })} />
        ))}
      </View>
      <View className="mt-2.5 flex-row flex-wrap">
        <Text variant="caption" weight="regular" color="ink-soft">
          It’s on the back of your car, or on your OR/CR.{' '}
        </Text>
        <Text variant="caption" weight="bold" className="underline" onPress={() => router.push('/car/not-listed')}>
          Not listed?
        </Text>
      </View>
      <Label>Year</Label>
      <View className="flex-row flex-wrap gap-2.5">
        {years.map((y) => (
          <Chip key={y} label={String(y)} selected={!older && setup.year === y} onPress={() => patchSetup({ year: y })} />
        ))}
        <Chip label="Older" selected={older} onPress={() => patchSetup({ year: latest - 5 })} />
      </View>
      <Label>Transmission</Label>
      <Segmented
        value={setup.transmission}
        onChange={(t) => patchSetup({ transmission: t })}
        options={model.transmissions.map((t) => ({ value: t, label: TRANSMISSION_LABEL[t] }))}
      />
    </Screen>
  );
}

const Label = ({ children }: { children: string }) => (
  <Text variant="caption" weight="bold" className="mb-2.5 mt-5 !text-[13px]">
    {children}
  </Text>
);
