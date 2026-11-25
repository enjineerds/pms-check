import { useState } from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { lineName, quoteTitle } from '@/core/quote';
import { useQuote } from '@/store/store';
import { Field, GlassButton, Header, Notice, RadioRow, Screen, SecondaryButton, Text } from '@/ui';

const REASONS = ['It is in my car’s schedule', 'The price range is off', 'This isn’t my car or variant', 'Something else'];

export default function Report() {
  const { id, lineId } = useLocalSearchParams<{ id: string; lineId?: string }>();
  const quote = useQuote(id);
  const [reason, setReason] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [sent, setSent] = useState(false);
  const line = quote?.lines.find((l) => l.id === lineId);
  const subtitle = quote ? `${line ? lineName(line) : 'This quote'} · ${quoteTitle(quote)}` : undefined;

  if (sent) {
    return (
      <Screen header={<Header title="Report a mistake" subtitle={subtitle} />} footer={<SecondaryButton label="Back to my quote" onPress={() => router.back()} />}>
        <Text variant="display" className="mt-1 !text-[30px] !leading-[34px]">
          Thank you.
        </Text>
        <View className="mt-5">
          <Notice tone="green">We’ll check your report against the manual. Until then, confirm with the advisor.</Notice>
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      scroll
      header={<Header title="Report a mistake" subtitle={subtitle} />}
      footer={<GlassButton label="Send report" disabled={reason === null} onPress={() => setSent(true)} />}
    >
      <Text variant="display" className="mt-1 !text-[30px] !leading-[34px]">
        What looks wrong?
      </Text>
      <View className="mt-5 gap-2.5">
        {REASONS.map((r, i) => (
          <RadioRow key={r} label={r} selected={reason === i} onPress={() => setReason(i)} />
        ))}
      </View>
      <Field value={note} onChangeText={setNote} placeholder="Add a note (optional)" multiline className="mt-3" />
      <Text variant="caption" weight="regular" color="ink-soft" className="mt-3.5">
        We check every report against the manual before changing a verdict. Until then, confirm with the advisor.
      </Text>
    </Screen>
  );
}
