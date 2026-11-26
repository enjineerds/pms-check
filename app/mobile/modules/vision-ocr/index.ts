import { requireNativeModule } from 'expo';

export interface VisionLine {
  text: string;
  confidence: number;
  /** Normalized 0..1, origin top-left. */
  box: { x: number; y: number; width: number; height: number };
}

const Native = requireNativeModule<{
  recognize(uri: string, languageCorrection: boolean): Promise<{ width: number; height: number; lines: VisionLine[] }>;
}>('VisionOcr');

export const recognize = (uri: string, languageCorrection = false) => Native.recognize(uri, languageCorrection);
