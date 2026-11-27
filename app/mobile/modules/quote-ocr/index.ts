import { requireOptionalNativeModule } from 'expo';

export interface NativeOcrPage {
  engine: string;
  width: number;
  height: number;
  lines: {
    text: string;
    confidence: number;
    box: { x: number; y: number; width: number; height: number };
  }[];
}

// Null in Expo Go and on web, where the module isn't built in.
export default requireOptionalNativeModule<{
  recognize(uri: string): Promise<NativeOcrPage>;
}>('QuoteOcr');
