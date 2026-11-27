import { useState } from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { lineName, quoteTitle } from '@/core/quote';
import { uuid } from '@/core/uuid';
import { useCopy, useLocale } from '@/i18n';
import { APP_VERSION, buildReport, NOTE_MAX, queueReport, REPORT_REASONS } from '@/outbox';
import { useQuote, useStore } from '@/store/store';
import { Field, GlassButton, Header, Notice, RadioRow, Screen, SecondaryButton, Text } from '@/ui';

export default function Report() {
  const { id, lineId } = useLocalSearchParams<{ id: string; lineId?: string }>();
  const quote = useQuote(id);
  const car = useStore((s) => s.cars.find((c) => c.id === quote?.carId));
  const [reportId] = useState(uuid);
  const copy = useCopy();
  const locale = useLocale();
  const t = copy.report;
  const [reason, setReason] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [sent, setSent] = useState(false);
  const line = quote?.lines.find((l) => l.id === lineId);
  const send = () => {
    if (!quote || reason === null) return;
    queueReport(buildReport({ id: reportId, reason: REPORT_REASONS[reason], note, quote, car, line, locale, appVersion: APP_VERSION, now: new Date() }));
    setSent(true);
  };
  const subtitle = quote ? `${line ? lineName(line, locale) : t.thisQuote} · ${quoteTitle(quote, copy.quote)}` : undefined;

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
      footer={<GlassButton label={t.send} disabled={reason === null || !quote} onPress={send} />}
    >
      <Text variant="headline" className="mt-1">
        {t.question}
      </Text>
      <View className="mt-5 gap-2.5">
        {t.reasons.map((r, i) => (
          <RadioRow key={r} label={r} selected={reason === i} onPress={() => setReason(i)} />
        ))}
      </View>
      <Field value={note} onChangeText={setNote} placeholder={t.note} maxLength={NOTE_MAX} multiline className="mt-3" />
      <Text variant="caption" weight="regular" color="ink-soft" className="mt-3.5">
        {t.footnote}
      </Text>
    </Screen>
  );
}
