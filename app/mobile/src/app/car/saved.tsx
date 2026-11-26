import { View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { groupDigits } from '@/core/money';
import { ageMonths, serviceFor } from '@/core/schedule';
import { CATALOG, findModel } from '@/catalog';
import { useCopy } from '@/i18n';
import { currentCar, useStore } from '@/store/store';
import { CarImage, GlassButton, GlassDisc, Icon, Notice, Screen, SecondaryButton, Text } from '@/ui';

export default function CarSaved() {
  const insets = useSafeAreaInsets();
  const car = useStore(currentCar);
  const copy = useCopy();
  const t = copy.carSaved;
  if (!car) return null;
  const model = findModel(car.modelId);
  const km = car.odometer.km;
  const service = serviceFor(car, km, ageMonths(car.deliveredOn, new Date()), CATALOG);
  const due = service.due.km;
  const over = km - due;
  const dueNow = service.reached;
  return (
    <Screen
      footer={
        <>
          <GlassButton
            label={copy.common.checkQuote}
            onPress={() => {
              router.dismissAll();
              router.push('/check/camera');
            }}
          />
          <SecondaryButton label={t.home} onPress={() => router.dismissAll()} />
        </>
      }
    >
      <View style={{ height: insets.top > 20 ? 16 : 32 }} />
      <GlassDisc>
        <Icon name="check" size={26} colorClassName="accent-panel-ink" />
      </GlassDisc>
      <Text variant="display" className="mt-5">
        {t.title(model?.name ?? '')}
      </Text>
      <Text variant="small" color="ink-soft" className="mt-2 !text-[14px] !leading-5">
        {t.body}
      </Text>
      <View className="my-5">
        <CarImage style={car.bodyStyle} height={170} motion="arrive" delay={250} />
      </View>
      <Notice tone={dueNow ? 'amber' : 'green'} icon="clock">
        <Text variant="small" weight="bold">
          {dueNow ? t.dueNow : t.next}
        </Text>
        {t.service(groupDigits(due))}
        {over >= 0 ? t.past(groupDigits(over)) : t.away(groupDigits(-over))}
      </Notice>
    </Screen>
  );
}

