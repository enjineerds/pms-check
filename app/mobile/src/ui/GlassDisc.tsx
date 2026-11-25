import type { ReactNode } from 'react';
import { View } from 'react-native';

/** Dark glass badge. The gradient sits behind a z-indexed child because web paints it over siblings. */
export function GlassDisc({ size = 64, radius, children }: { size?: number; radius?: number; children: ReactNode }) {
  return (
    <View className="items-center justify-center overflow-hidden" style={{ width: size, height: size, borderRadius: radius ?? size / 2 }}>
      <View className="absolute inset-0 bg-linear-to-b/srgb from-gloss-top to-gloss-disc" />
      <View className="z-1">{children}</View>
    </View>
  );
}
