import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { toastText } from '@/core/draft';
import { draftToQuote } from '@/core/saveDraft';
import { CATALOG } from '@/catalog';
import { formatPeso } from '@/core/money';
import type { Centavos } from '@/core/types';
import { draftTotal, isResolved, totalCheck } from '@/core/quote';
import { DraftRow, rowTone } from '@/features/DraftRow';
import { EditLineSheet } from '@/features/EditLineSheet';
import { useCopy } from '@/i18n';
import { addQuote, currentCar, useStore } from '@/store/store';
import { useDraft } from '@/store/draft';
import { Card, Divider, GlassButton, Header, Notice, Screen, SecondaryButton, Text, Toast } from '@/ui';

export default function Lines() {
  const { draft, dispatch, visit } = useDraft();
  const t = useCopy().lines;
  const car = useStore(currentCar);
  const [editId, setEditId] = useState<string | null>(null);
  const { lines, quotedTotal, edited, marks, toast, carriedOn } = draft;

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => dispatch({ type: 'dismissToast' }), 4000);
    return () => clearTimeout(id);
  }, [toast, dispatch]);

  const total = draftTotal(lines);
  const sums = totalCheck([total], quotedTotal);
  const matches = sums.kind === 'match';
  const gap = sums.kind === 'mismatch' ? sums.missing : null;
  const mismatch = !edited && !carriedOn && gap !== null && lines.length > 0;
  const editing = lines.find((l) => l.id === editId) ?? null;

  const check = () => {
    const open = lines.find((l) => !isResolved(l));
    if (open) return setEditId(open.id);
    if (!car) return;
    if (!visit) return router.replace('/check/visit');
    const q = draftToQuote(draft, visit, car, CATALOG, new Date());
    addQuote(q);
    router.dismissTo('/');
    router.push(`/quote/${q.id}`);
  };

  const subtitle = !edited ? t.tapToFix : matches ? t.matchesNow(formatPeso(total)) : t.totalNow(formatPeso(total));

  const goAdd = () => router.push('/check/add');

  return (
    <Screen
      scroll
      overlay={
        <EditLineSheet
          line={editing}
          onClose={() => setEditId(null)}
          onSave={(patch) => {
            if (editId) dispatch({ type: 'update', id: editId, patch });
            setEditId(null);
          }}
          onDelete={() => {
            if (editId) dispatch({ type: 'delete', id: editId });
            setEditId(null);
          }}
        />
      }
      header={<Header title={t.title} subtitle={t.subtitle} />}
      footer={
        <>
          {toast ? <Toast message={toastText(toast, t)} onUndo={draft.undo ? () => dispatch({ type: 'undo' }) : undefined} /> : null}
          {mismatch ? (
            <>
              <GlassButton label={t.addMissing} onPress={goAdd} />
              <SecondaryButton label={t.carryOn} onPress={() => dispatch({ type: 'carryOn' })} />
            </>
          ) : (
            <>
              <GlassButton label={t.looksRight} disabled={lines.length === 0} onPress={check} />
              <SecondaryButton label={t.addMissing} onPress={goAdd} />
            </>
          )}
        </>
      }
    >
      <Text variant="headline" className="mt-1">
        {lines.length === 0 ? t.none : t.found(lines.length)}
      </Text>
      <Text variant="small" color="ink-soft" className="mt-1.5 !text-[14px] !leading-5">
        {lines.length === 0 ? t.noneBody : subtitle}
      </Text>
      {lines.length > 0 ? (
        <Card padded={false} className="mt-4 !rounded-[28px] p-2">
          {lines.map((l, i) => {
            const prev = lines[i - 1];
            const plain = prev && !rowTone(prev, marks[prev.id]) && !rowTone(l, marks[l.id]);
            return (
              <View key={l.id}>
                {plain ? <Divider className="mx-3" /> : i > 0 ? <View className="h-1" /> : null}
                <DraftRow line={l} mark={marks[l.id]} onPress={() => setEditId(l.id)} />
              </View>
            );
          })}
        </Card>
      ) : null}
      {!edited && quotedTotal !== null && lines.length > 0 ? (
        <View className="mt-4">
          {matches ? (
            <Notice tone="green">
              <Text variant="small" weight="bold">
                {t.addsUp(formatPeso(total))}
              </Text>
              {t.matches}
            </Notice>
          ) : mismatch ? (
            <Notice tone="amber">
              <Text variant="small" weight="bold">
                {t.addsUpBut(formatPeso(total), formatPeso(quotedTotal))}
              </Text>
              {t.missing(formatPeso(Math.abs(gap ?? 0) as Centavos))}
            </Notice>
          ) : null}
        </View>
      ) : null}
    </Screen>
  );
}
