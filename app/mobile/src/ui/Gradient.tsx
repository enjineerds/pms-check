import { LinearGradient } from 'expo-linear-gradient';
import { useCSSVariable, withUniwind } from 'uniwind';

export const Gradient = withUniwind(LinearGradient);

// The angle follows the aspect ratio, which no static class can express.
export function GlossGradient() {
  const [top, mid, end] = useCSSVariable(['--color-gloss-top', '--color-gloss-panel-mid', '--color-gloss-panel-end']) as [string, string, string];
  return <Gradient colors={[top, mid, end]} locations={[0, 0.55, 1]} start={{ x: 0.2, y: 0 }} end={{ x: 0.9, y: 1 }} className="absolute inset-0" />;
}
