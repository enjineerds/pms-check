import { useRef, useState, type ComponentRef, type RefObject } from 'react';
import { Pressable, View, type TextInput } from 'react-native';
import type { DraftLine } from '@/core/types';
import { formatPeso, peso } from '@/core/money';
import { priceOf } from '@/core/quote';
import { useCopy } from '@/i18n';
import { serviceByName } from '@/sample/catalog';
import { Field, GlassButton, Icon, Notice, Sheet, Text } from '@/ui';

interface Props {
  line: DraftLine | null;
  onClose: () => void;
  onSave: (patch: Partial<DraftLine>) => void;
  onDelete: () => void;
}

export function EditLineSheet({ line, ...rest }: Props) {
  const nameInput = useRef<ComponentRef<typeof TextInput>>(null);
  return (
    <Sheet visible={!!line} onClose={rest.onClose} onOpen={() => nameInput.current?.focus()}>
      {line ? <EditForm key={line.id} line={line} nameInput={nameInput} {...rest} /> : null}
    </Sheet>
  );
}

function EditForm({
  line,
  nameInput,
  onClose,
  onSave,
  onDelete,
}: Omit<Props, 'line'> & { line: DraftLine; nameInput: RefObject<ComponentRef<typeof TextInput> | null> }) {
  const copy = useCopy();
  const t = copy.editLine;
  const [name, setName] = useState(line.rawText);
  const [price, setPrice] = useState(() => {
    const c = priceOf(line.price);
    return c ? String(c / 100) : '';
  });

  const amount = parseFloat(price);
  const valid = name.trim().length > 0 && amount > 0;
  const known = serviceByName(name);

  const save = () => {
    if (!valid) return;
    onSave({
      rawText: name.trim(),
      price: { kind: 'confirmed', value: peso(amount) },
      match: known ? { kind: 'confirmed', serviceId: known.id } : { kind: 'none' },
    });
  };

  return (
    <>
      <View className="mb-3 flex-row items-center justify-between">
        <Text variant="title" className="!text-[20px] !leading-[26px]">
          {t.title}
        </Text>
        <Pressable accessibilityRole="button" onPress={onClose}>
          <Text variant="small" weight="semibold" color="ink-soft">
            {copy.common.cancel}
          </Text>
        </Pressable>
      </View>
      <Text variant="small" weight="bold" className="mb-2 mt-3">
        {t.quoteSays}
      </Text>
      <Field ref={nameInput} value={name} onChangeText={setName} />
      <Text variant="small" weight="bold" className="mb-2 mt-3">
        {t.price}
      </Text>
      <Field
        value={price}
        onChangeText={(t) => setPrice(t.replace(/[^0-9.]/g, ''))}
        keyboardType="decimal-pad"
        placeholder="0"
        leading={
          <Text variant="body" weight="semibold" className="-mr-1">
            ₱
          </Text>
        }
      />
      <View className="mt-4">
        {known ? (
          <Notice tone="green">{t.known}</Notice>
        ) : (
          <Notice tone="amber">{t.unknown}</Notice>
        )}
      </View>
      <GlassButton label={t.save} disabled={!valid} onPress={save} className="mt-4" />
      <Pressable accessibilityRole="button" onPress={onDelete} className="flex-row items-center justify-center gap-2 py-3.5">
        <Icon name="trash" size={16} colorClassName="accent-skip" stroke={2} />
        <Text variant="small" weight="bold" color="skip">
          {t.delete}
        </Text>
      </Pressable>
    </>
  );
}

export const priceLabel = (l: DraftLine) => {
  const c = priceOf(l.price);
  return c === null ? '—' : formatPeso(c);
};
