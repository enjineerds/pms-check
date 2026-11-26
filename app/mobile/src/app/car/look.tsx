import { View } from 'react-native';
import { router } from 'expo-router';
import { BODY_STYLES } from '@/core/bodyStyle';
import { useCopy } from '@/i18n';
import { modelFor } from '@/catalog';
import { patchSetup, saveSetupAsCar, useStore } from '@/store/store';
import { CarImage, GlassButton, Header, Screen, Segmented, Text } from '@/ui';

export default function CarLook() {
  const setup = useStore((s) => s.setup);
  const model = modelFor(setup.modelId);
  const copy = useCopy();
  const t = copy.carLook;
  const styles = BODY_STYLES.map((value) => ({ value, label: copy.bodyStyle[value] }));
  return (
    <Screen
      header={<Header title={copy.car.title} subtitle={copy.car.stepOf(5, `${model.make} ${model.name}`)} />}
      footer={
        <GlassButton
          label={t.save}
          onPress={() => {
            saveSetupAsCar();
            router.replace('/car/saved');
          }}
        />
      }
    >
      <Text variant="headline">
        {t.question(model.name)}
      </Text>
      <View className="mt-6">
        <CarImage style={setup.bodyStyle} height={190} motion="swap" />
      </View>
      <Text variant="small" weight="bold" className="mb-2.5 mt-7">
        {t.bodyType}
      </Text>
      <Segmented size="sm" widths="content" value={setup.bodyStyle} onChange={(b) => patchSetup({ bodyStyle: b })} options={styles} />
      <Text variant="caption" weight="regular" color="ink-soft" className="mt-2.5">
        {t.hint}
      </Text>
    </Screen>
  );
}
