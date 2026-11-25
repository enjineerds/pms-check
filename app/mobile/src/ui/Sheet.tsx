import { useEffect, useEffectEvent, useState, type ReactNode } from 'react';
import { Animated, KeyboardAvoidingView, Platform, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  visible: boolean;
  onClose: () => void;
  /** Fires once the slide-in finishes: the moment to focus a field, so the keyboard never rises mid-slide. */
  onOpen?: () => void;
  children: ReactNode;
}

const OFFSCREEN = 700;

/** Slides in on mount. Closing is immediate, which keeps the open state in the parent only. */
export function Sheet({ visible, onClose, onOpen, children }: Props) {
  return visible ? (
    <SheetBody onClose={onClose} onOpen={onOpen}>
      {children}
    </SheetBody>
  ) : null;
}

function SheetBody({ onClose, onOpen, children }: Omit<Props, 'visible'>) {
  const insets = useSafeAreaInsets();
  const [t] = useState(() => new Animated.Value(0));

  const opened = useEffectEvent(() => onOpen?.());
  useEffect(() => {
    Animated.timing(t, { toValue: 1, duration: 240, useNativeDriver: true }).start(({ finished }) => {
      if (finished) opened();
    });
  }, [t]);

  return (
    // iOS keeps the window size when the keyboard opens, so pad the sheet up above it; Android resizes the window itself.
    // The sheet sits in flow at the bottom (justify-end), since padding never moves an absolutely positioned child.
    <KeyboardAvoidingView className="absolute inset-0 justify-end" pointerEvents="box-none" behavior={Platform.select({ ios: 'padding' })}>
      <Animated.View className="absolute inset-0 bg-scrim" style={{ opacity: t }}>
        <Pressable className="absolute inset-0" onPress={onClose} accessibilityLabel="Close" />
      </Animated.View>
      <Animated.View
        className="rounded-t-xl bg-surface px-4 pt-2.5 shadow-sheet"
        style={{ paddingBottom: Math.max(insets.bottom, 16) + 8, transform: [{ translateY: t.interpolate({ inputRange: [0, 1], outputRange: [OFFSCREEN, 0] }) }] }}
      >
        <View className="mb-3.5 h-[5px] w-10 self-center rounded-[3px] bg-line" />
        {children}
      </Animated.View>
    </KeyboardAvoidingView>
  );
}
