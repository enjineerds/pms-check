import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { cx } from './cx';

interface Props {
  children: ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
  testID?: string;
  className?: string;
  padded?: boolean;
}

export function Card({ children, onPress, accessibilityLabel, testID, className, padded = true }: Props) {
  const classes = cx('rounded-md bg-surface shadow-soft', padded && 'px-4 py-2', className);
  return onPress ? (
    <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel} testID={testID} onPress={onPress} className={cx(classes, 'active:opacity-85')}>
      {children}
    </Pressable>
  ) : (
    <View className={classes}>{children}</View>
  );
}

export const Tile = Card;

export const Divider = ({ className }: { className?: string }) => <View className={cx('h-px bg-line', className)} />;
