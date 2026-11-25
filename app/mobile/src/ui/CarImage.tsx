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
}

export function CarImage({ style, height }: Props) {
  return (
    <View className="w-full" style={{ height }}>
      <StyledImage source={SOURCES[style]} contentFit="contain" className="absolute inset-0" transition={150} accessibilityLabel={`${style} car`} />
    </View>
  );
}
