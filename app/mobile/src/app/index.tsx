import { useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { cubicBezier, useReducedMotion, type CSSAnimationProperties } from 'react-native-reanimated';
import { Redirect, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatKm, groupDigits } from '@/core/money';
import type { Car, Locale } from '@/core/types';
import { duePointKm, nextPointKm, progressToNext } from '@/core/service';
import { ServiceRoad } from '@/features/ServiceRoad';
import { SIX_FIGURE_ID } from '@/sample/quotes';
import { findModel, findVariantName, TRANSMISSION_LABEL } from '@/sample/catalog';
import { currentCar, isListed, setLanguage, useStore } from '@/store/store';
import { Card, CarImage, GlassButton, Icon, Segmented, Text } from '@/ui';

// The car drives in and settles on its suspension. Once per launch: Home is the screen people keep returning to.
const ARRIVE: CSSAnimationProperties = {
  animationName: {
    from: { transform: [{ translateX: 32 }, { translateY: 0 }] },
    '78%': { transform: [{ translateX: 0 }, { translateY: 0 }] },
    '88%': { transform: [{ translateX: 0 }, { translateY: 1.5 }] },
    to: { transform: [{ translateX: 0 }, { translateY: 0 }] },
  },
  animationDuration: '700ms',
  animationTimingFunction: cubicBezier(0.16, 1, 0.3, 1),
};
let arrived = false;

// Filipino copy from the Doop frame "V3-1c · Home (Tagalog)". The "checked" count has no frame yet: `nasuri` needs a native read.
const COPY = {
  en: {
    yourCars: 'Your cars',
    due: (km: string) => `Your ${km} km service is due.`,
    pms: 'That’s your PMS, the maker’s scheduled maintenance. Check the casa’s quote before you say yes to anything.',
    inKm: (km: string) => `in ${km} km`,
    afterThis: (km: string) => `After this: ${km} km`,
    pastQuotes: 'Past quotes',
    checked: (n: number) => `${n} checked`,
    cta: 'Check a casa quote',
  },
  fil: {
    yourCars: 'Mga kotse mo',
    due: (km: string) => `Due na ang ${km} km service mo.`,
    pms: 'Ito ang PMS mo, ang naka-iskedyul na maintenance ng gumawa. Suriin ang quote ng casa bago ka umoo sa kahit ano.',
    inKm: (km: string) => `sa ${km} km`,
    afterThis: (km: string) => `Susunod: ${km} km`,
    pastQuotes: 'Mga lumang quote',
    checked: (n: number) => `${n} nasuri`,
    cta: 'Suriin ang quote ng casa',
  },
} satisfies Record<Locale, unknown>;

export default function Home() {
  const language = useStore((s) => s.language);
  const car = useStore(currentCar);
  if (!language) return <Redirect href="/language" />;
  if (!car) return <Redirect href="/car/model" />;
  // A separate component, so a redirecting mount never spends the arrival.
  return <Garage car={car} language={language} />;
}

function Garage({ car, language }: { car: Car; language: Locale }) {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  // Read once on mount, so a re-render mid-drive doesn't cut the animation.
  const [arriving] = useState(() => {
    const first = !arrived;
    arrived = true;
    return first && !reduceMotion;
  });
  const quotes = useStore((s) => s.quotes);
  const t = COPY[language];

  const model = findModel(car.modelId);
  const km = car.odometer.km;
  const due = duePointKm(km);
  const next = nextPointKm(km);
  const checked = quotes.filter(isListed).filter((q) => q.lines.every((l) => l.decision !== 'pending')).length;

  return (
    <View className="flex-1 bg-ground">
      <View className="absolute inset-0 bg-linear-to-b/srgb from-surface from-0% via-photo-top via-19% to-photo-bottom to-47%" />
      <View className="flex-row items-start gap-2 px-4" style={{ paddingTop: insets.top + 12 }}>
        <View className="flex-1">
          <Text variant="lead" weight="bold">
            {model.make} {model.name} {findVariantName(car.variantId)}
          </Text>
          {/* Wrapping pieces, so a narrow phone breaks between facts, never inside "10,240 km". */}
          <View className="flex-row flex-wrap">
            {[`${car.year} · `, `${TRANSMISSION_LABEL[car.transmission]} · `, formatKm(km)].map((part) => (
              <Text key={part} variant="small" color="ink-faint">
                {part}
              </Text>
            ))}
          </View>
        </View>
        <View className="items-end gap-2.5">
          <Pressable
            accessibilityRole="link"
            onPress={() => router.push('/cars')}
            // The text link is ~18pt tall; reach the 44pt / 48dp minimum without moving the layout.
            hitSlop={{ top: 15, bottom: 6, left: 12, right: 12 }}
            className="flex-row items-center gap-1"
          >
            <Text variant="small" weight="bold">
              {t.yourCars}
            </Text>
            <Icon name="chevron-right" size={14} />
          </Pressable>
          <View className="flex-row items-center gap-1.5 rounded-pill bg-glass-wash pl-2.5">
            <Icon name="globe" size={16} colorClassName="accent-ink-soft" stroke={2} />
            <View className="w-[150px]">
              <Segmented
                size="sm"
                value={language}
                onChange={setLanguage}
                options={[
                  { value: 'en', label: 'English' },
                  { value: 'fil', label: 'Filipino' },
                ]}
              />
            </View>
          </View>
        </View>
      </View>

      {/* Clipped: on shorter phones this area is under 230pt, and the photo's own backdrop would paint over the header. */}
      <View className="flex-1 overflow-hidden">
        <Animated.View className="flex-1 justify-center" style={arriving ? ARRIVE : undefined}>
          <CarImage style={car.bodyStyle} height={230} backdrop={false} />
        </Animated.View>
      </View>

      <View className="rounded-t-xl bg-surface px-4 pt-5.5 shadow-panel" style={{ paddingBottom: Math.max(insets.bottom, 12) + 8 }}>
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
              <ServiceRoad progress={progressToNext(km)} animate={arriving} />
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
              // Dev shortcut to the six-figure sample quote; never ships.
              onLongPress={__DEV__ ? () => router.push(`/quote/${SIX_FIGURE_ID}`) : undefined}
            >
              {t.pastQuotes}
            </Text>
          </Card>
        </View>
        <GlassButton label={t.cta} onPress={() => router.push('/check/camera')} />
      </View>
    </View>
  );
}
