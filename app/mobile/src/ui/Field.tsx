import { useState, type ComponentRef, type ReactNode, type Ref } from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';
import { cx } from './cx';

interface Props extends Omit<TextInputProps, 'className' | 'placeholderTextColor'> {
  ref?: Ref<ComponentRef<typeof TextInput>>;
  leading?: ReactNode;
  trailing?: ReactNode;
  /** Classes for the outer shell (margins, width), not the text. */
  className?: string;
}

// The one text field: no outline at rest, an ink outline only while focused.
export function Field({ ref, leading, trailing, className, multiline, onFocus, onBlur, ...input }: Props) {
  const [focused, setFocused] = useState(!!input.autoFocus);
  return (
    <View
      className={cx(
        'flex-row border-[1.5px] bg-surface shadow-soft',
        multiline ? 'min-h-25 rounded-md' : 'h-13 items-center gap-2.5 rounded-pill px-4.5',
        focused ? 'border-ink' : 'border-transparent',
        className,
      )}
    >
      {leading}
      <TextInput
        ref={ref}
        multiline={multiline}
        placeholderTextColorClassName="accent-ink-faint"
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        className={cx(
          'flex-1 text-ink [outline-width:0]',
          multiline
            ? 'self-stretch p-4 font-regular text-[15px] [text-align-vertical:top] web:resize-none web:[line-height:normal]'
            : 'h-full font-medium text-[16px]',
        )}
        {...input}
      />
      {trailing}
    </View>
  );
}
