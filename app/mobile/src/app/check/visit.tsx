import { useState } from 'react';
import { View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { applyKey } from '@/core/keypad';
import { formatKm, groupDigits } from '@/core/money';
import { ageMonths, cadence, resolveSchedule } from '@/core/schedule';
import type { Km, ServicePoint } from '@/core/types';
import { isFresh, visitChoices } from '@/core/visit';
import { CATALOG } from '@/catalog';
import { useCopy } from '@/i18n';
import { useDraft } from '@/store/draft';
import { currentCar, recordOdometer, useStore } from '@/store/store';
import { GlassButton, Header, Keypad, OdometerReadout, RadioRow, Screen, Text } from '@/ui';

const DAY_MS = 24 * 60 * 60 * 1000;
const samePoint = (a: ServicePoint, b: ServicePoint) => a.km === b.km && a.months === b.months;

export default function ConfirmVisit() {
  const car = useStore(currentCar);
  const { setVisit } = useDraft();
  const copy = useCopy();
  const t = copy.visit;
  const now = new Date();
  const fresh = car ? isFresh(car.odometer.readAt, now) : false;
  const [raw, setRaw] = useState(car && fresh ? String(car.odometer.km) : '');
  const [typed, setTyped] = useState(false);
  const [picked, setPicked] = useState<ServicePoint | null>(null);
  const [editing, setEditing] = useState(!fresh);
  if (!car) return <Redirect href="/" />;

  const km = Number(raw) as Km;
  const every = cadence(resolveSchedule(car, CATALOG).schedule, 'severe');
  const choices = km > 0 ? visitChoices(km, ageMonths(car.deliveredOn, now), every) : null;
  const point = choices && (choices.options.find((p) => picked && samePoint(p, picked)) ?? choices.suggested);
  const daysOld = Math.floor((now.getTime() - Date.parse(car.odometer.readAt)) / DAY_MS);

  return (
    <>
      <View className="flex-1">
        <Screen
          scroll
          flushBottom={editing}
          header={<Header title={t.title} />}
          footer={
            <GlassButton
              label={copy.common.continue}
              disabled={!point}
              onPress={() => {
                if (!point) return;
                if (km !== car.odometer.km || !fresh) recordOdometer(car.id, km);
                setVisit({ point, odometerKm: km });
                router.push('/check/camera');
              }}
            />
          }
        >
          <Text variant="headline">{t.question}</Text>
          <Label>{t.odometer}</Label>
          <OdometerReadout raw={raw} label={t.odometer} editing={editing} onPress={() => setEditing(true)} />
          <Text variant="caption" weight="regular" color="ink-soft" className="mt-2.5">
            {fresh ? t.fresh : t.stale(formatKm(car.odometer.km), daysOld)}
          </Text>
          {choices ? (
            <>
              <Label>{t.service}</Label>
              <View className="gap-2.5">
                {choices.options.map((p) => (
                  <RadioRow
                    key={p.km}
                    label={t.point(groupDigits(p.km), p.months)}
                    selected={!!point && samePoint(p, point)}
                    onPress={() => {
                      setPicked(p);
                      setEditing(false);
                    }}
                  />
                ))}
              </View>
              <Text variant="caption" weight="regular" color="ink-soft" className="mt-2.5">
                {t.hint}
              </Text>
            </>
          ) : null}
        </Screen>
      </View>
      {editing ? (
        <Keypad
          onKey={(k) => {
            setRaw((v) => applyKey(typed ? v : '', k, { maxLength: 6 }));
            setTyped(true);
          }}
        />
      ) : null}
    </>
  );
}

const Label = ({ children }: { children: string }) => (
  <Text variant="caption" weight="bold" className="mb-2.5 mt-5 !text-[13px]">
    {children}
  </Text>
);
