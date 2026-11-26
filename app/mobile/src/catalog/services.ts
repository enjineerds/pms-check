import type { ServiceId, ServiceItem, ServiceKind } from '@/core/types';

const service = (id: string, kind: ServiceKind, en: string, fil: string, aliases: string[]): ServiceItem => ({
  id: id as ServiceId,
  kind,
  name: { en, fil },
  category: { en: '', fil: '' },
  aliases,
});

// Filipino names need a native read.
export const SERVICES: ServiceItem[] = [
  service('engine-oil', 'scheduled', 'Engine oil', 'Langis ng makina', ['CHANGE OIL', 'ENGINE OIL', 'OIL CHANGE']),
  service('oil-filter', 'scheduled', 'Oil filter', 'Oil filter', ['OIL FILTER', 'OIL FLTR']),
  service('air-cleaner', 'scheduled', 'Engine air filter', 'Air filter ng makina', ['AIR CLEANER', 'AIR FILTER', 'AIR CLEANER ELEMENT']),
  service('valve-clearance', 'scheduled', 'Valve clearance check', 'Pagsuri ng valve clearance', ['VALVE CLEARANCE', 'TAPPET ADJUSTMENT']),
  service('spark-plugs', 'scheduled', 'Spark plugs', 'Spark plugs', ['SPARK PLUG', 'SPARK PLUGS']),
  service('drive-belt', 'scheduled', 'Drive belt check', 'Pagsuri ng drive belt', ['DRIVE BELT', 'FAN BELT']),
  service('coolant', 'scheduled', 'Engine coolant', 'Coolant', ['COOLANT', 'RADIATOR COOLANT', 'ENGINE COOLANT']),
  service('cvt-fluid', 'scheduled', 'CVT fluid', 'CVT fluid', ['CVT FLUID', 'CVTF']),
  service('mt-fluid', 'scheduled', 'Manual transmission fluid', 'Langis ng manual transmission', ['MTF', 'MANUAL TRANSMISSION FLUID', 'GEAR OIL']),
  service('cabin-filter', 'scheduled', 'Cabin air filter', 'Cabin air filter', ['CABIN FILTER', 'DUST AND POLLEN FILTER', 'AC FILTER']),
  service('brake-inspection', 'scheduled', 'Brake inspection', 'Pagsuri ng preno', ['BRAKE INSPECTION', 'BRAKE CLEANING', 'BRAKE CHECK']),
  service('fuel-filter', 'scheduled', 'Fuel filter', 'Fuel filter', ['FUEL FILTER']),
  service('brake-fluid', 'scheduled', 'Brake fluid', 'Brake fluid', ['BRAKE FLUID']),
  service('parking-brake', 'scheduled', 'Parking brake check', 'Pagsuri ng parking brake', ['PARKING BRAKE', 'HAND BRAKE']),
  service('tire-rotation', 'scheduled', 'Tire rotation', 'Tire rotation', ['TIRE ROTATION', 'TYRE ROTATION']),
  service('chassis-inspection', 'scheduled', 'Steering and suspension check', 'Pagsuri ng steering at suspension', ['SUSPENSION CHECK', 'STEERING CHECK']),
  service('lines-inspection', 'scheduled', 'Hoses, fluids and exhaust check', 'Pagsuri ng hose, fluid at exhaust', ['FLUID LEVEL CHECK', 'UNDERCHASSIS CHECK']),
  service('brake-pads', 'wear', 'Brake pads', 'Brake pads', ['BRAKE PAD', 'BRAKE PADS']),
  service('wiper-blades', 'wear', 'Wiper blades', 'Wiper blades', ['WIPER BLADE', 'WIPER BLADES']),
  service('battery', 'wear', 'Battery', 'Baterya', ['BATTERY']),
  service('engine-flush', 'upsell', 'Engine flush', 'Engine flush', ['ENGINE FLUSH', 'ENG FLUSH']),
  service('injector-cleaning', 'upsell', 'Fuel injector cleaning', 'Paglinis ng fuel injector', ['INJECTOR CLEANING', 'FUEL INJECTOR CLEANING']),
];
