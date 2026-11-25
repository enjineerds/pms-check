import { View } from 'react-native';
import { router } from 'expo-router';
import { BODY_STYLE_LABEL, BODY_STYLES } from '@/core/bodyStyle';
import { findModel } from '@/sample/catalog';
import { patchSetup, saveSetupAsCar, useStore } from '@/store/store';
import { CarImage, GlassButton, Header, Screen, Segmented, Text } from '@/ui';

const STYLES = BODY_STYLES.map((value) => ({ value, label: BODY_STYLE_LABEL[value] }));

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
      <Text variant="headline">
        What kind of car is your {model.name}?
      </Text>
      <View className="mt-6">
        <CarImage style={setup.bodyStyle} height={190} motion="swap" />
      </View>
      <Text variant="small" weight="bold" className="mb-2.5 mt-7">
        Body type
      </Text>
      <Segmented size="sm" widths="content" value={setup.bodyStyle} onChange={(b) => patchSetup({ bodyStyle: b })} options={STYLES} />
      <Text variant="caption" weight="regular" color="ink-soft" className="mt-2.5">
        Picked from your model. Change it if it’s wrong.
      </Text>
    </Screen>
  );
}
