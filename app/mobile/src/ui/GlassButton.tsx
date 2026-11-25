import { Pressable, View } from 'react-native';
import { Text } from './Text';
import { cx } from './cx';

interface Props {
  label: string;
  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  className?: string;
}

export function GlassButton({ label, onPress, onLongPress, disabled, className }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={disabled ? undefined : onPress}
      onLongPress={onLongPress}
      className={cx(
        'h-13 items-center justify-center overflow-hidden rounded-pill',
        !disabled && 'shadow-glass active:scale-99 active:opacity-88',
        className,
      )}
    >
      {disabled ? (
        <View className="absolute inset-0 bg-line" />
      ) : (
        <>
          <View className="absolute inset-0 bg-linear-to-b/srgb from-gloss-top from-0% via-gloss-mid via-55% to-gloss-bottom to-100%" />
          <View className="absolute inset-x-3.5 top-px h-px rounded-[1px] bg-glass-edge" pointerEvents="none" />
        </>
      )}
      <Text variant="body" weight="semibold" color={disabled ? 'ink-faint' : 'panel-ink'} className="text-center">
        {label}
      </Text>
    </Pressable>
  );
}
