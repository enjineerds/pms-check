import { Stack } from 'expo-router';
import { QuoteDraftProvider } from '@/store/draft';
import { useCSSVariable } from 'uniwind';

export default function CheckLayout() {
  const ground = useCSSVariable('--color-ground') as string;
  return (
    <QuoteDraftProvider>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: ground } }} />
    </QuoteDraftProvider>
  );
}
