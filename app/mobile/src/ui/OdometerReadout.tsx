import { View } from 'react-native';
import { groupDigits } from '@/core/money';
import { Text } from './Text';

export function OdometerReadout({ raw }: { raw: string }) {
  return (
    <View className="h-18 flex-row items-center justify-between rounded-pill border-[1.5px] border-ink bg-surface px-6">
      <Text weight="bold" color={raw ? 'ink' : 'ink-faint'} className="!text-[36px] !leading-[44px] !tracking-[-0.5px]">
        {raw ? groupDigits(Number(raw)) : '0'}
      </Text>
      <Text variant="body" weight="medium" color="ink-soft">
        km
      </Text>
    </View>
  );
}
