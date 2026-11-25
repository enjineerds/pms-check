import { View } from 'react-native';
import { router } from 'expo-router';
import { formatKm } from '@/core/money';
import { useCopy } from '@/i18n';
import { findModel, findVariantName } from '@/sample/catalog';
import { setCurrentCar, useStore } from '@/store/store';
import { Card, cx, GlassDisc, Header, Icon, Screen, SecondaryButton, Text } from '@/ui';

export default function Cars() {
  const cars = useStore((s) => s.cars);
  const t = useCopy().cars;
  return (
    <Screen
      header={<Header title={t.title} subtitle={t.saved(cars.length)} />}
      footer={<SecondaryButton label={t.add} onPress={() => router.push('/car/model')} />}
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
                  {findVariantName(c.variantId) || t.variantNotListed} · {formatKm(c.odometer.km)}
                </Text>
              </View>
              {c.isCurrent ? (
                <View className="rounded-pill bg-required-bg px-3 py-[5px]">
                  <Text variant="caption" weight="bold" color="required">
                    {t.current}
                  </Text>
                </View>
              ) : null}
            </Card>
          );
        })}
      </View>
      <Text variant="small" color="ink-soft" className="mx-1 mt-4">
        {t.note}
      </Text>
    </Screen>
  );
}
