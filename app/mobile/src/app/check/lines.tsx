import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { draftToQuote } from '@/core/saveDraft';
import { formatPeso } from '@/core/money';
import type { Centavos } from '@/core/types';
import { draftTotal, isResolved } from '@/core/quote';
import { DraftRow, rowTone } from '@/features/DraftRow';
import { EditLineSheet } from '@/features/EditLineSheet';
import { addQuote, currentCar, useStore } from '@/store/store';
import { useDraft } from '@/store/draft';
import { Card, Divider, GlassButton, Header, Notice, Screen, SecondaryButton, Text, Toast } from '@/ui';

export default function Lines() {
  const { draft, dispatch } = useDraft();
  const car = useStore(currentCar);
  const [editId, setEditId] = useState<string | null>(null);
  const { lines, quotedTotal, edited, marks, toast, carriedOn } = draft;

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => dispatch({ type: 'dismissToast' }), 4000);
    return () => clearTimeout(id);
  }, [toast, dispatch]);

  const total = draftTotal(lines);
  const matches = quotedTotal !== null && total === quotedTotal;
  const mismatch = !edited && !carriedOn && quotedTotal !== null && !matches && lines.length > 0;
  const editing = lines.find((l) => l.id === editId) ?? null;

  const check = () => {
    const open = lines.find((l) => !isResolved(l));
    if (open) return setEditId(open.id);
    if (!car) return;
    const q = draftToQuote(draft, car);
    addQuote(q);
    router.dismissAll();
    router.push(`/quote/${q.id}`);
  };

  const subtitle = !edited
    ? 'Tap a line to fix it. Amber needs a quick look.'
    : matches
      ? `The lines add up to ${formatPeso(total)}. That matches your quote.`
      : `Total now ${formatPeso(total)}.`;

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
      header={<Header title="Check the lines" subtitle="Scanned just now" />}
      footer={
        <>
          {toast ? <Toast message={toast.text} onUndo={draft.undo ? () => dispatch({ type: 'undo' }) : undefined} /> : null}
          {mismatch ? (
            <>
              <GlassButton label="Add a missing line" onPress={goAdd} />
              <SecondaryButton label="Carry on anyway" onPress={() => dispatch({ type: 'carryOn' })} />
            </>
          ) : (
            <>
              <GlassButton label="Looks right, check it" disabled={lines.length === 0} onPress={check} />
              <SecondaryButton label="Add a missing line" onPress={goAdd} />
            </>
          )}
        </>
      }
    >
      <Text variant="headline" className="mt-1">
        {lines.length === 0 ? 'No lines yet.' : `We found ${lines.length} ${lines.length === 1 ? 'line' : 'lines'}.`}
      </Text>
      <Text variant="small" color="ink-soft" className="mt-1.5 !text-[14px] !leading-5">
        {lines.length === 0 ? 'Add what the casa quoted, one line at a time.' : subtitle}
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
                The lines add up to {formatPeso(total)}.{' '}
              </Text>
              That matches the total on your quote.
            </Notice>
          ) : mismatch ? (
            <Notice tone="amber">
              <Text variant="small" weight="bold">
                The lines add up to {formatPeso(total)}, but the quote says {formatPeso(quotedTotal)}.{' '}
              </Text>
              A {formatPeso(Math.abs(quotedTotal - total) as Centavos)} line may be missing.
            </Notice>
          ) : null}
        </View>
      ) : null}
    </Screen>
  );
}
