import { useEffect, useState, type ReactNode } from 'react';
import { Animated, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
}

const OFFSCREEN = 700;

/** Slides in on mount. Closing is immediate, which keeps the open state in the parent only. */
export function Sheet({ visible, onClose, children }: Props) {
  return visible ? <SheetBody onClose={onClose}>{children}</SheetBody> : null;
}

function SheetBody({ onClose, children }: Omit<Props, 'visible'>) {
  const insets = useSafeAreaInsets();
  const [t] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.timing(t, { toValue: 1, duration: 240, useNativeDriver: true }).start();
  }, [t]);

  return (
    <View className="absolute inset-0" pointerEvents="box-none">
      <Animated.View className="absolute inset-0 bg-scrim" style={{ opacity: t }}>
        <Pressable className="absolute inset-0" onPress={onClose} accessibilityLabel="Close" />
      </Animated.View>
      <Animated.View
        className="absolute inset-x-0 bottom-0 rounded-t-xl bg-surface px-4 pt-2.5 shadow-sheet"
        style={{ paddingBottom: Math.max(insets.bottom, 16) + 8, transform: [{ translateY: t.interpolate({ inputRange: [0, 1], outputRange: [OFFSCREEN, 0] }) }] }}
      >
        <View className="mb-3.5 h-[5px] w-10 self-center rounded-[3px] bg-line" />
        {children}
      </Animated.View>
    </View>
  );
}
