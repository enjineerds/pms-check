import { peso } from '@/core/money';
import type { Centavos, DraftLine, ServiceId } from '@/core/types';

const d = (id: string, rawText: string, serviceId: string, pesos: number, price: 'read' | 'unsure' = 'read'): DraftLine => ({
  id,
  rawText,
  match: { kind: 'exact', serviceId: serviceId as ServiceId },
  price: price === 'read' ? { kind: 'read', value: peso(pesos) } : { kind: 'unsure', guess: peso(pesos) },
  origin: 'scanned',
});

export const sampleScan = (): { lines: DraftLine[]; quotedTotal: Centavos } => ({
  quotedTotal: peso(8_150),
  lines: [
    d('l1', 'Change oil', 'engine-oil', 1_900),
    d('l2', 'Oil filter', 'oil-filter', 550),
    d('l3', 'Tire rotation', 'tire-rotation', 600),
    d('l4', 'Brake inspection & cleaning', 'brake-inspection', 350),
    d('l5', 'Cabin air filter', 'cabin-filter', 750, 'unsure'),
    d('l6', 'Engine flush', 'engine-flush', 1_800),
    d('l7', 'Fuel injector cleaning', 'injector-cleaning', 2_200),
  ],
});
