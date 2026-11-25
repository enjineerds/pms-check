import { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { applyKey } from '@/core/keypad';
import { groupDigits } from '@/core/money';
import { duePointKm } from '@/core/service';
import { patchSetup } from '@/store/store';
import { GlassButton, Header, Keypad, Notice, Screen, Text } from '@/ui';

export default function Odometer() {
  const [raw, setRaw] = useState('');
  const km = Number(raw);
  return (
    <>
      <View className="flex-1">
        <Screen
          flushBottom
          header={<Header title="Pick your car" subtitle="Step 3 of 4" />}
          footer={
            <GlassButton
              label="Continue"
              disabled={km <= 0}
              onPress={() => {
                patchSetup({ km });
                router.push('/car/look');
              }}
            />
          }
        >
          <Text variant="display" className="!text-[30px] !leading-[34px]">
            What does your odometer say?
          </Text>
          <View className="mt-5 h-18 flex-row items-center justify-between rounded-pill border-[1.5px] border-ink bg-surface px-6">
            <Text weight="bold" color={raw ? 'ink' : 'ink-faint'} className="!text-[36px] !leading-[44px] !tracking-[-0.5px]">
              {raw ? groupDigits(km) : '0'}
            </Text>
            <Text variant="body" weight="medium" color="ink-soft">
              km
            </Text>
          </View>
          <Text variant="caption" weight="regular" color="ink-soft" className="mt-2.5">
            Look at the dashboard. The nearest 100 km is fine.
          </Text>
          {km > 0 ? (
            <View className="mt-4">
              <Notice tone="green">
                With this we know your next service is at <Text variant="small" weight="bold">{groupDigits(duePointKm(km))} km</Text>.
              </Notice>
            </View>
          ) : null}
        </Screen>
      </View>
      <Keypad onKey={(k) => setRaw((v) => applyKey(v, k, { maxLength: 6 }))} />
    </>
  );
}
