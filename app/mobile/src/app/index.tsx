import { useState } from 'react';
import { Pressable, View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { Redirect, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatKm, groupDigits } from '@/core/money';
import type { Car, Locale } from '@/core/types';
import { ageMonths, serviceFor } from '@/core/schedule';
import { CATALOG, findModel, variantLabel } from '@/catalog';
import { copyFor } from '@/i18n';
import { LanguageToggle } from '@/features/LanguageToggle';
import { ServiceRoad } from '@/features/ServiceRoad';
import { SIX_FIGURE_ID } from '@/sample/quotes';
import { currentCar, isListed, useStore } from '@/store/store';
import { CAR_ARRIVE_MS, Card, CarImage, GlassButton, Icon, Text } from '@/ui';

let arrived = false;

const RISE = { duration: 550, easing: Easing.bezier(0.16, 1, 0.3, 1) };

export default function Home() {
  const language = useStore((s) => s.language);
  const car = useStore(currentCar);
  if (!language) return <Redirect href="/language" />;
  if (!car) return <Redirect href="/car/model" />;
  // Separate component, so a redirecting mount never spends the arrival.
  return <Garage car={car} language={language} />;
}

function Garage({ car, language }: { car: Car; language: Locale }) {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  // Read once, so a re-render mid-drive doesn't cut the animation.
  const [arriving] = useState(() => {
    const first = !arrived;
    arrived = true;
    return first && !reduceMotion;
  });
  const quotes = useStore((s) => s.quotes);

  const rise = useSharedValue(arriving ? 0 : 1);
  const panelH = useSharedValue(0);
  const headerH = useSharedValue(0);
  const onPanelLayout = (e: LayoutChangeEvent) => {
    if (!arriving || panelH.get() > 0) return;
    panelH.set(e.nativeEvent.layout.height);
    rise.set(withDelay(CAR_ARRIVE_MS, withTiming(1, RISE)));
  };
  // Centre the car on screen while the panel is below it.
  const stageStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: ((1 - rise.get()) * (panelH.get() - headerH.get())) / 2 }],
  }));
  const panelStyle = useAnimatedStyle(() => ({
    opacity: rise.get() === 1 || panelH.get() > 0 ? 1 : 0,
    transform: [{ translateY: (1 - rise.get()) * panelH.get() }],
  }));
  const copy = copyFor(language);
  const t = copy.home;

  const model = findModel(car.modelId);
  const km = car.odometer.km;
  const service = serviceFor(car, km, ageMonths(car.deliveredOn, new Date()), CATALOG);
  const due = service.due.km;
  const next = service.after.km;
  const checked = quotes.filter(isListed).filter((q) => q.lines.every((l) => l.decision !== 'pending')).length;

  return (
    <View className="flex-1 bg-ground">
      <View className="absolute inset-0 bg-linear-to-b/srgb from-surface from-0% via-photo-top via-19% to-photo-bottom to-47%" />
      <View
        className="flex-row items-start gap-2 px-4"
        style={{ paddingTop: insets.top + 12 }}
        onLayout={(e) => headerH.set(e.nativeEvent.layout.height)}
      >
        <View className="flex-1">
          <Text variant="lead" weight="bold">
            {model?.make} {model?.name} {variantLabel(model, car.variantId)}
          </Text>
          {/* Separate pieces, so narrow phones wrap between facts, never inside one. */}
          <View className="flex-row flex-wrap">
            {[`${car.year} · `, `${copy.transmission[car.transmission]} · `, formatKm(km)].map((part) => (
              <Text key={part} variant="small" color="ink-faint">
                {part}
              </Text>
            ))}
          </View>
        </View>
        <View className="items-end gap-4">
          <Pressable
            accessibilityRole="link"
            onPress={() => router.push('/cars')}
            hitSlop={{ top: 15, bottom: 6, left: 12, right: 12 }}
            className="flex-row items-center gap-1"
          >
            <Text variant="small" weight="bold">
              {t.yourCars}
            </Text>
            <Icon name="chevron-right" size={14} />
          </Pressable>
          <LanguageToggle value={language} />
        </View>
      </View>

      {/* Clipped, so the car can’t paint over the header on short phones. */}
      <Animated.View className="flex-1 overflow-hidden" style={stageStyle}>
        <View className="flex-1 justify-center">
          <CarImage style={car.bodyStyle} height={230} motion={arriving ? 'arrive' : undefined} />
        </View>
      </Animated.View>

      <Animated.View
        className="rounded-t-xl bg-surface px-4 pt-5.5 shadow-panel"
        style={[{ paddingBottom: Math.max(insets.bottom, 12) + 8 }, panelStyle]}
        onLayout={onPanelLayout}
      >
        <Text variant="headline">
          {t.due(groupDigits(due))}
        </Text>
        <Text variant="small" weight="regular" color="ink-soft" className="mt-2 !text-[14px] !leading-5">
          {t.pms}
        </Text>
        <View className="my-4.5 flex-row gap-3">
          <Card padded={false} className="min-h-26 flex-1 justify-between !rounded-[28px] p-4">
            <View className="flex-row items-center justify-between">
              <Icon name="clock" size={22} stroke={2} />
              <Text variant="small" weight="medium">
                {t.inKm(groupDigits(next - km))}
              </Text>
            </View>
            <View className="mt-4">
              <ServiceRoad progress={Math.min(1, Math.max(0, 1 - (next - km) / service.every.km))} animate={arriving} delayMs={CAR_ARRIVE_MS + 250} />
            </View>
            <Text variant="lead" weight="bold" className="mt-2.5">
              {t.afterThis(groupDigits(next))}
            </Text>
          </Card>
          <Card
            padded={false}
            className="min-h-26 flex-1 justify-between !rounded-[28px] p-4"
            accessibilityLabel={`${t.pastQuotes}, ${t.checked(checked)}`}
            onPress={() => router.push('/quotes')}
          >
            <View className="flex-row items-center justify-between">
              <Icon name="receipt" size={22} stroke={2} />
              <Text variant="small" weight="medium">
                {t.checked(checked)}
              </Text>
            </View>
            <Text
              variant="lead"
              weight="bold"
              className="mt-4"
              // Dev only.
              onLongPress={__DEV__ ? () => router.push(`/quote/${SIX_FIGURE_ID}`) : undefined}
            >
              {t.pastQuotes}
            </Text>
          </Card>
        </View>
        <GlassButton label={t.cta} onPress={() => router.push('/check/camera')} />
      </Animated.View>
    </View>
  );
}
