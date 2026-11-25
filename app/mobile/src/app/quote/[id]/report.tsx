import { useState } from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { lineName, quoteTitle } from '@/core/quote';
import { useCopy } from '@/i18n';
import { useQuote } from '@/store/store';
import { Field, GlassButton, Header, Notice, RadioRow, Screen, SecondaryButton, Text } from '@/ui';

export default function Report() {
  const { id, lineId } = useLocalSearchParams<{ id: string; lineId?: string }>();
  const quote = useQuote(id);
  const copy = useCopy();
  const t = copy.report;
  const [reason, setReason] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [sent, setSent] = useState(false);
  const line = quote?.lines.find((l) => l.id === lineId);
  const subtitle = quote ? `${line ? lineName(line) : t.thisQuote} · ${quoteTitle(quote, copy.quote)}` : undefined;

  if (sent) {
    return (
      <Screen header={<Header title={copy.common.reportMistake} subtitle={subtitle} />} footer={<SecondaryButton label={copy.common.backToQuote} onPress={() => router.back()} />}>
        <Text variant="headline" className="mt-1">
          {t.thanks}
        </Text>
        <View className="mt-5">
          <Notice tone="green">{t.sentNote}</Notice>
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      scroll
      header={<Header title={copy.common.reportMistake} subtitle={subtitle} />}
      footer={<GlassButton label={t.send} disabled={reason === null} onPress={() => setSent(true)} />}
    >
      <Text variant="headline" className="mt-1">
        {t.question}
      </Text>
      <View className="mt-5 gap-2.5">
        {t.reasons.map((r, i) => (
          <RadioRow key={r} label={r} selected={reason === i} onPress={() => setReason(i)} />
        ))}
      </View>
      <Field value={note} onChangeText={setNote} placeholder={t.note} multiline className="mt-3" />
      <Text variant="caption" weight="regular" color="ink-soft" className="mt-3.5">
        {t.footnote}
      </Text>
    </Screen>
  );
}
