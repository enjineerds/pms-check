import { View } from 'react-native';
import { router } from 'expo-router';
import type { BodyStyle } from '@/core/types';
import { findModel } from '@/sample/catalog';
import { patchSetup, saveSetupAsCar, useStore } from '@/store/store';
import { CarImage, GlassButton, Header, Screen, Segmented, Text } from '@/ui';

const STYLES: { value: BodyStyle; label: string }[] = [
  { value: 'sedan', label: 'Sedan' },
  { value: 'hatchback', label: 'Hatchback' },
  { value: 'suv', label: 'SUV' },
  { value: 'mpv', label: 'MPV' },
  { value: 'pickup', label: 'Pickup' },
];

export default function CarLook() {
  const setup = useStore((s) => s.setup);
  const model = findModel(setup.modelId);
  return (
    <Screen
      header={<Header title="Pick your car" subtitle={`Step 4 of 4 · ${model.make} ${model.name}`} />}
      footer={
        <GlassButton
          label="Save my car"
          onPress={() => {
            saveSetupAsCar();
            router.replace('/car/saved');
          }}
        />
      }
    >
      <Text variant="display" className="!text-[30px] !leading-[34px]">
        What kind of car is your {model.name}?
      </Text>
      <View className="mt-6">
        <CarImage style={setup.bodyStyle} height={190} />
      </View>
      <Text variant="small" weight="bold" className="mb-2.5 mt-7">
        Body type
      </Text>
      <Segmented size="sm" value={setup.bodyStyle} onChange={(b) => patchSetup({ bodyStyle: b })} options={STYLES} />
      <Text variant="caption" weight="regular" color="ink-soft" className="mt-2.5">
        Picked from your model. Change it if it’s wrong.
      </Text>
    </Screen>
  );
}
