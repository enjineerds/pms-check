import { useState, type ComponentRef, type Ref } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { Icon } from './Icon';
import { cx } from './cx';

interface Props {
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  autoFocus?: boolean;
  inputRef?: Ref<ComponentRef<typeof TextInput>>;
}

export function SearchField({ value, onChangeText, placeholder, autoFocus, inputRef }: Props) {
  const [focused, setFocused] = useState(!!autoFocus);
  return (
    <View
      className={cx(
        'h-13 flex-row items-center gap-2.5 rounded-pill border-[1.5px] bg-surface px-4.5 shadow-soft',
        focused ? 'border-ink' : 'border-transparent',
      )}
    >
      <Icon name="search" size={18} colorClassName="accent-ink-soft" stroke={2} />
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColorClassName="accent-ink-faint"
        autoFocus={autoFocus}
        autoCorrect={false}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="h-full flex-1 font-medium text-[16px] text-ink [outline-width:0]"
      />
      {value ? (
        <Pressable accessibilityLabel="Clear" onPress={() => onChangeText('')} className="size-[22px] items-center justify-center rounded-full bg-ink-soft">
          <Icon name="clear" size={12} colorClassName="accent-panel-ink" stroke={2.6} />
        </Pressable>
      ) : null}
    </View>
  );
}
