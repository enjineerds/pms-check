import { View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { groupDigits } from '@/core/money';
import { duePointKm, isDueNow } from '@/core/service';
import { findModel } from '@/sample/catalog';
import { currentCar, useStore } from '@/store/store';
import { CarImage, GlassButton, GlassDisc, Icon, Notice, Screen, SecondaryButton, Text } from '@/ui';

export default function CarSaved() {
  const insets = useSafeAreaInsets();
  const car = useStore(currentCar);
  if (!car) return null;
  const model = findModel(car.modelId);
  const km = car.odometer.km;
  const due = duePointKm(km);
  const over = km - due;
  const dueNow = isDueNow(km);
  return (
    <Screen
      footer={
        <>
          <GlassButton
            label="Check a casa quote"
            onPress={() => {
              router.dismissAll();
              router.push('/check/camera');
            }}
          />
          <SecondaryButton label="Go to Home" onPress={() => router.dismissAll()} />
        </>
      }
    >
      <View style={{ height: insets.top > 20 ? 16 : 32 }} />
      <GlassDisc>
        <Icon name="check" size={26} colorClassName="accent-panel-ink" />
      </GlassDisc>
      <Text variant="display" className="mt-5">
        Your {model.name} is saved.
      </Text>
      <Text variant="small" color="ink-soft" className="mt-2 !text-[14px] !leading-5">
        Next time, open the app and check a quote right away.
      </Text>
      <View className="my-5">
        <CarImage style={car.bodyStyle} height={170} />
      </View>
      {/* "Due now" only near or past the point; a fresh car is told what's next, calmly. */}
      <Notice tone={dueNow ? 'amber' : 'green'} icon="clock">
        <Text variant="small" weight="bold">
          {dueNow ? 'Service due now: ' : 'Next service: '}
        </Text>
        your {groupDigits(due)} km service.{' '}
        {over >= 0 ? `You’re ${groupDigits(over)} km past it.` : `You’re ${groupDigits(-over)} km away.`}
      </Notice>
    </Screen>
  );
}

