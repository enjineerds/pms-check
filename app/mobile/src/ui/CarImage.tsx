import { View } from 'react-native';
import { Image } from 'expo-image';
import { withUniwind } from 'uniwind';
import type { BodyStyle } from '@/core/types';

const StyledImage = withUniwind(Image);

const SOURCES: Record<BodyStyle, number> = {
  sedan: require('../../assets/images/cars/sedan.png'),
  hatchback: require('../../assets/images/cars/hatchback.png'),
  suv: require('../../assets/images/cars/suv.png'),
  mpv: require('../../assets/images/cars/mpv.png'),
  pickup: require('../../assets/images/cars/pickup.png'),
};

interface Props {
  style: BodyStyle;
  height: number;
  /** The photos carry their own studio backdrop, so the edges fade into the `photo-top` theme color. False when the screen already paints a matching backdrop. */
  backdrop?: boolean;
}

export function CarImage({ style, height, backdrop = true }: Props) {
  const image = <StyledImage source={SOURCES[style]} contentFit="cover" className="absolute inset-0" transition={150} accessibilityLabel={`${style} car`} />;
  if (!backdrop) return <View className="w-full" style={{ height }}>{image}</View>;
  return (
    <View className="w-full" style={{ height }}>
      {image}
      <View className="absolute inset-x-0 top-0 h-7 bg-linear-to-b/srgb from-photo-top to-photo-top/0" pointerEvents="none" />
      <View className="absolute inset-x-0 bottom-0 h-7 bg-linear-to-b/srgb from-photo-top/0 to-photo-top" pointerEvents="none" />
      <View className="absolute inset-y-0 left-0 w-7 bg-linear-to-r/srgb from-photo-top to-photo-top/0" pointerEvents="none" />
      <View className="absolute inset-y-0 right-0 w-7 bg-linear-to-r/srgb from-photo-top/0 to-photo-top" pointerEvents="none" />
    </View>
  );
}
