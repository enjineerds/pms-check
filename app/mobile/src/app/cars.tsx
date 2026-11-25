import { View } from 'react-native';
import { router } from 'expo-router';
import { formatKm } from '@/core/money';
import { findModel, findVariantName } from '@/sample/catalog';
import { setCurrentCar, useStore } from '@/store/store';
import { Card, cx, GlassDisc, Header, Icon, Screen, SecondaryButton, Text } from '@/ui';

export default function Cars() {
  const cars = useStore((s) => s.cars);
  return (
    <Screen
      header={<Header title="Your cars" subtitle={`${cars.length} saved on this phone`} />}
      footer={<SecondaryButton label="Add another car" onPress={() => router.push('/car/model')} />}
    >
      <View className="gap-3">
        {cars.map((c) => {
          const m = findModel(c.modelId);
          return (
            <Card
              key={c.id}
              padded={false}
              onPress={() => setCurrentCar(c.id)}
              className={cx('flex-row items-center gap-3.5 !rounded-[28px] border-[1.5px] p-3.5', c.isCurrent ? 'border-ink' : 'border-transparent')}
            >
              <GlassDisc size={52} radius={18}>
                <Icon name="car" size={26} colorClassName="accent-panel-ink" stroke={2} />
              </GlassDisc>
              <View className="flex-1">
                <Text variant="lead" weight="bold">
                  {m.make} {m.name}
                </Text>
                <Text variant="small" color="ink-soft">
                  {findVariantName(c.variantId) || 'Variant not listed'} · {formatKm(c.odometer.km)}
                </Text>
              </View>
              {c.isCurrent ? (
                <View className="rounded-pill bg-required-bg px-3 py-[5px]">
                  <Text variant="caption" weight="bold" color="required">
                    Current
                  </Text>
                </View>
              ) : null}
            </Card>
          );
        })}
      </View>
      <Text variant="small" color="ink-soft" className="mx-1 mt-4">
        Each car keeps its own service schedule and its own past quotes.
      </Text>
    </Screen>
  );
}
