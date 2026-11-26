import { View } from 'react-native';
import { router } from 'expo-router';
import { useCopy } from '@/i18n';
import { modelFor, transmissionsOf } from '@/catalog';
import { patchSetup, useStore } from '@/store/store';
import { Chip, GlassButton, Header, RadioRow, Screen, Segmented, Text } from '@/ui';

export default function PickVariant() {
  const setup = useStore((s) => s.setup);
  const copy = useCopy();
  const t = copy.carVariant;
  const model = modelFor(setup.modelId);
  const selected = setup.variantId ?? model.variants[Math.min(1, model.variants.length - 1)].id;
  const latest = model.years.to;
  const years = [0, 1, 2, 3, 4].map((i) => latest - i);
  const older = setup.year < latest - 4;

  return (
    <Screen
      scroll
      header={<Header title={copy.car.title} subtitle={copy.car.stepOf(2, `${model.make} ${model.name}`)} />}
      footer={
        <GlassButton
          label={copy.common.continue}
          onPress={() => {
            patchSetup({ variantId: selected });
            router.push('/car/delivered');
          }}
        />
      }
    >
      <Text variant="headline">
        {t.question(model.name)}
      </Text>
      <Label>{t.variant}</Label>
      <View className="gap-2.5">
        {model.variants.map((v) => (
          <RadioRow key={v.id} label={v.label} selected={v.id === selected} onPress={() => patchSetup({ variantId: v.id })} />
        ))}
      </View>
      <View className="mt-2.5 flex-row flex-wrap">
        <Text variant="caption" weight="regular" color="ink-soft">
          {t.where}
        </Text>
        <Text variant="caption" weight="bold" className="underline" onPress={() => router.push('/car/not-listed')}>
          {t.notListed}
        </Text>
      </View>
      <Label>{t.year}</Label>
      <View className="flex-row flex-wrap gap-2.5">
        {years.map((y) => (
          <Chip key={y} label={String(y)} selected={!older && setup.year === y} onPress={() => patchSetup({ year: y })} />
        ))}
        <Chip label={t.older} selected={older} onPress={() => patchSetup({ year: latest - 5 })} />
      </View>
      <Label>{t.transmission}</Label>
      <Segmented
        value={setup.transmission}
        onChange={(t) => patchSetup({ transmission: t })}
        options={transmissionsOf(model).map((value) => ({ value, label: copy.transmission[value] }))}
      />
    </Screen>
  );
}

const Label = ({ children }: { children: string }) => (
  <Text variant="caption" weight="bold" className="mb-2.5 mt-5 !text-[13px]">
    {children}
  </Text>
);
