import { Pressable, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatKm, groupDigits } from '@/core/money';
import { duePointKm, nextPointKm } from '@/core/service';
import { SIX_FIGURE_ID } from '@/sample/quotes';
import { findModel, findVariantName, TRANSMISSION_LABEL } from '@/sample/catalog';
import { currentCar, isListed, setLanguage, useStore } from '@/store/store';
import { Card, CarImage, GlassButton, Icon, Segmented, Text } from '@/ui';

export default function Home() {
  const insets = useSafeAreaInsets();
  const language = useStore((s) => s.language);
  const car = useStore(currentCar);
  const quotes = useStore((s) => s.quotes);

  if (!language) return <Redirect href="/language" />;
  if (!car) return <Redirect href="/car/model" />;

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
          <Text variant="small" color="ink-faint">
            {car.year} · {TRANSMISSION_LABEL[car.transmission]} · {formatKm(km)}
          </Text>
        </View>
        <View className="items-end gap-2.5">
          <Pressable accessibilityRole="link" onPress={() => router.push('/cars')} className="flex-row items-center gap-1">
            <Text variant="small" weight="bold">
              Your cars
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

      <View className="flex-1 justify-center">
        <CarImage style={car.bodyStyle} height={230} backdrop={false} />
      </View>

      <View className="rounded-t-xl bg-surface px-4 pt-5.5 shadow-panel" style={{ paddingBottom: Math.max(insets.bottom, 12) + 8 }}>
        <Text variant="display" className="!text-[30px] !leading-[34px]">
          Your {groupDigits(due)} km service is due.
        </Text>
        <Text variant="small" weight="regular" color="ink-soft" className="mt-2 !text-[14px] !leading-5">
          That’s your PMS, the maker’s scheduled maintenance. Check the casa’s quote before you say yes to anything.
        </Text>
        <View className="my-4.5 flex-row gap-3">
          <Card padded={false} className="min-h-26 flex-1 justify-between !rounded-[28px] p-4">
            <View className="flex-row items-center justify-between">
              <Icon name="clock" size={22} stroke={2} />
              <Text variant="small" weight="medium">
                in {groupDigits(next - km)} km
              </Text>
            </View>
            <Text variant="lead" weight="bold" className="mt-4">
              After this: {groupDigits(next)} km
            </Text>
          </Card>
          <Card padded={false} className="min-h-26 flex-1 justify-between !rounded-[28px] p-4" onPress={() => router.push('/quotes')}>
            <View className="flex-row items-center justify-between">
              <Icon name="receipt" size={22} stroke={2} />
              <Text variant="small" weight="medium">
                {checked}
              </Text>
            </View>
            <Text
              variant="lead"
              weight="bold"
              className="mt-4"
              onLongPress={() => router.push(`/quote/${SIX_FIGURE_ID}`)}
            >
              Past quotes
            </Text>
          </Card>
        </View>
        <GlassButton label="Check a casa quote" onPress={() => router.push('/check/camera')} />
      </View>
    </View>
  );
}
