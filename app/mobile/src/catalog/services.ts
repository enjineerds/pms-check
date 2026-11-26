import type { Localized, ServiceId, ServiceItem, ServiceKind } from '@/core/types';

const FLUIDS = { en: 'Oil and fluids', fil: 'Langis at fluid' };
const FILTERS = { en: 'Filters', fil: 'Filter' };
const ENGINE = { en: 'Engine', fil: 'Makina' };
const BRAKES = { en: 'Brakes', fil: 'Preno' };
const TIRES = { en: 'Tires', fil: 'Gulong' };
const CHECKS = { en: 'Inspections', fil: 'Pagsuri' };
const PARTS = { en: 'Parts', fil: 'Piyesa' };
const ADD_ONS = { en: 'Add-on services', fil: 'Mga dagdag na serbisyo' };

const service = (
  id: string,
  kind: ServiceKind,
  category: Localized,
  en: string,
  fil: string,
  aliases: string[],
  extra: Pick<ServiceItem, 'whyOffered' | 'sayYesOnlyIf'> = {},
): ServiceItem => ({ id: id as ServiceId, kind, name: { en, fil }, category, aliases, ...extra });

// Filipino names need a native read.
export const SERVICES: ServiceItem[] = [
  service('engine-oil', 'scheduled', FLUIDS, 'Engine oil', 'Langis ng makina', ['CHANGE OIL', 'ENGINE OIL', 'OIL CHANGE']),
  service('oil-filter', 'scheduled', FILTERS, 'Oil filter', 'Oil filter', ['OIL FILTER', 'OIL FLTR']),
  service('air-cleaner', 'scheduled', FILTERS, 'Engine air filter', 'Air filter ng makina', ['AIR CLEANER', 'AIR FILTER', 'AIR CLEANER ELEMENT']),
  service('valve-clearance', 'scheduled', ENGINE, 'Valve clearance check', 'Pagsuri ng valve clearance', ['VALVE CLEARANCE', 'TAPPET ADJUSTMENT']),
  service('spark-plugs', 'scheduled', ENGINE, 'Spark plugs', 'Spark plugs', ['SPARK PLUG', 'SPARK PLUGS']),
  service('drive-belt', 'scheduled', ENGINE, 'Drive belt check', 'Pagsuri ng drive belt', ['DRIVE BELT', 'FAN BELT']),
  service('coolant', 'scheduled', FLUIDS, 'Engine coolant', 'Coolant', ['COOLANT', 'RADIATOR COOLANT', 'ENGINE COOLANT']),
  service('cvt-fluid', 'scheduled', FLUIDS, 'CVT fluid', 'CVT fluid', ['CVT FLUID', 'CVTF']),
  service('mt-fluid', 'scheduled', FLUIDS, 'Manual transmission fluid', 'Langis ng manual transmission', ['MTF', 'MANUAL TRANSMISSION FLUID', 'GEAR OIL']),
  service('cabin-filter', 'scheduled', FILTERS, 'Cabin air filter', 'Cabin air filter', ['CABIN FILTER', 'DUST AND POLLEN FILTER', 'AC FILTER']),
  service('brake-inspection', 'scheduled', BRAKES, 'Brake inspection', 'Pagsuri ng preno', ['BRAKE INSPECTION', 'BRAKE CLEANING', 'BRAKE CHECK']),
  service('fuel-filter', 'scheduled', FILTERS, 'Fuel filter', 'Fuel filter', ['FUEL FILTER']),
  service('brake-fluid', 'scheduled', FLUIDS, 'Brake fluid', 'Brake fluid', ['BRAKE FLUID']),
  service('parking-brake', 'scheduled', BRAKES, 'Parking brake check', 'Pagsuri ng parking brake', ['PARKING BRAKE', 'HAND BRAKE']),
  service('tire-rotation', 'scheduled', TIRES, 'Tire rotation', 'Tire rotation', ['TIRE ROTATION', 'TYRE ROTATION']),
  service('chassis-inspection', 'scheduled', CHECKS, 'Steering and suspension check', 'Pagsuri ng steering at suspension', ['SUSPENSION CHECK', 'STEERING CHECK']),
  service('lines-inspection', 'scheduled', CHECKS, 'Hoses, fluids and exhaust check', 'Pagsuri ng hose, fluid at exhaust', ['FLUID LEVEL CHECK', 'UNDERCHASSIS CHECK']),
  service('brake-pads', 'wear', PARTS, 'Brake pads', 'Brake pads', ['BRAKE PAD', 'BRAKE PADS'], {
    sayYesOnlyIf: { en: 'the pads measure thin or the brakes squeal.', fil: 'manipis na ang pads o umiirit ang preno.' },
  }),
  service('wiper-blades', 'wear', PARTS, 'Wiper blades', 'Wiper blades', ['WIPER BLADE', 'WIPER BLADES']),
  service('battery', 'wear', PARTS, 'Battery', 'Baterya', ['BATTERY']),
  service('engine-flush', 'upsell', ADD_ONS, 'Engine flush', 'Engine flush', ['ENGINE FLUSH', 'ENG FLUSH'], {
    whyOffered: {
      en: 'It’s a high-margin add-on. A flush only matters on engines with heavy sludge.',
      fil: 'Malaki ang tubo sa add-on na ito. Mahalaga lang ang flush sa makinang maraming sludge.',
    },
    sayYesOnlyIf: {
      en: 'they show you sludge or the engine is hard to start. Then get a second opinion.',
      fil: 'ipinakita nila ang sludge o mahirap i-start ang makina. Tapos humingi ng second opinion.',
    },
  }),
  service('injector-cleaning', 'upsell', ADD_ONS, 'Fuel injector cleaning', 'Paglinis ng fuel injector', ['INJECTOR CLEANING', 'FUEL INJECTOR CLEANING'], {
    sayYesOnlyIf: { en: 'the engine hesitates or idles rough. Ask for a test first.', fil: 'humihinto-hinto o magaspang ang idle ng makina. Humingi muna ng test.' },
  }),
];
