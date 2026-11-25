import type { ComponentRef, Ref } from 'react';
import { Pressable, type TextInput } from 'react-native';
import { useCopy } from '@/i18n';
import { Field } from './Field';
import { Icon } from './Icon';

interface Props {
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  autoFocus?: boolean;
  inputRef?: Ref<ComponentRef<typeof TextInput>>;
}

export function SearchField({ value, onChangeText, placeholder, autoFocus, inputRef }: Props) {
  const t = useCopy().common;
  return (
    <Field
      ref={inputRef}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      autoFocus={autoFocus}
      autoCorrect={false}
      leading={<Icon name="search" size={18} colorClassName="accent-ink-soft" stroke={2} />}
      trailing={
        value ? (
          <Pressable accessibilityLabel={t.clear} onPress={() => onChangeText('')} className="size-[22px] items-center justify-center rounded-full bg-ink-soft">
            <Icon name="clear" size={12} colorClassName="accent-panel-ink" stroke={2.6} />
          </Pressable>
        ) : null
      }
    />
  );
}
