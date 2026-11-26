import { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { deliveryYears, monthsIn, splitYearMonth, yearMonth } from '@/core/delivery';
import { modelFor } from '@/catalog';
import { useCopy } from '@/i18n';
import { patchSetup, useStore } from '@/store/store';
import { Chip, GlassButton, Header, Screen, Text } from '@/ui';

export default function Delivered() {
  const setup = useStore((s) => s.setup);
  const model = modelFor(setup.modelId);
  const copy = useCopy();
  const t = copy.carDelivered;
  const now = new Date();
  const years = deliveryYears(setup.year, now);
  const picked = setup.deliveredOn ? splitYearMonth(setup.deliveredOn) : null;
  const [year, setYear] = useState(picked?.year ?? (years.includes(setup.year) ? setup.year : years[0]));
  const [month, setMonth] = useState<number | null>(picked?.month ?? null);
  const months = copy.quote.months.slice(0, monthsIn(year, now));

  return (
    <Screen
      scroll
      header={<Header title={copy.car.title} subtitle={copy.car.stepOf(3, `${model.make} ${model.name}`)} />}
      footer={
        <GlassButton
          label={copy.common.continue}
          disabled={month === null}
          onPress={() => {
            if (month === null) return;
            patchSetup({ deliveredOn: yearMonth(year, month) });
            router.push('/car/odometer');
          }}
        />
      }
    >
      <Text variant="headline">{t.question}</Text>
      <Label>{t.year}</Label>
      <View className="flex-row flex-wrap gap-2.5">
        {years.map((y) => (
          <Chip
            key={y}
            label={String(y)}
            selected={y === year}
            onPress={() => {
              setYear(y);
              if (month !== null && month > monthsIn(y, now)) setMonth(null);
            }}
          />
        ))}
      </View>
      <Label>{t.month}</Label>
      <View className="flex-row flex-wrap gap-2.5">
        {months.map((label, i) => (
          <Chip key={label} label={label} selected={month === i + 1} onPress={() => setMonth(i + 1)} />
        ))}
      </View>
      <Text variant="caption" weight="regular" color="ink-soft" className="mt-4">
        {t.hint}
      </Text>
    </Screen>
  );
}

const Label = ({ children }: { children: string }) => (
  <Text variant="caption" weight="bold" className="mb-2.5 mt-5 !text-[13px]">
    {children}
  </Text>
);
