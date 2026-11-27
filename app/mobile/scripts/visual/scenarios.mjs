// Each scenario is a URL plus the taps (by visible label) that reach one screen state.
// Taps use the first text line of a pressable, which is how a person finds it too.
// A `{ type }` step types into the visible field, and `'back'` is the browser's back.
// `waitText` waits for a label before tapping; `shows` fails the scenario unless the final screen has that text.
// The web build keeps data in memory, so a page load starts empty and every car or quote is built by taps.

const digits = (n) => String(n).split('');

const carSetup = ({ year, delivered, km }) => [
  'English',
  'Honda City',
  ...(year ? [year] : []),
  'Continue',
  ...delivered,
  'Continue',
  ...digits(km),
  'Continue',
  'Save my car',
];

const typed = (query, pick, pesos) => [{ type: query }, pick, ...digits(pesos), 'Add to my quote'];

const typedQuote = (point, lines) => [
  'Check a casa quote',
  point,
  'Continue',
  'Type the lines instead',
  ...lines.flatMap((l, i) => [...(i > 0 ? ['Add a missing line'] : []), ...typed(...l)]),
  'Looks right, check it',
];

const asTyped = (name, pesos) => [name, `Add “${name}” as typed`, pesos];

const CITY_10K = carSetup({ delivered: ['2026', 'Mar'], km: 10240 });
const BAYAN_10K = typedQuote('10,000 km · 12 months', [
  ['Engine oil', 'Engine oil', 1900],
  ['Oil filter', 'Oil filter', 550],
  ['Tire rotation', 'Tire rotation', 600],
  ['Brake inspection', 'Brake inspection', 350],
  ['Cabin air filter', 'Cabin air filter', 750],
  ['Engine flush', 'Engine flush', 1800],
  ['Fuel injector cleaning', 'Fuel injector cleaning', 2200],
]);
const RESULT_10K = [...CITY_10K, ...BAYAN_10K];

const CITY_60K = carSetup({ year: '2022', delivered: ['2022', 'Nov'], km: 60110 });
const BAYAN_60K = typedQuote('60,000 km · 72 months', [
  ['Engine oil', 'Engine oil', 2400],
  ['Oil filter', 'Oil filter', 800],
  ['CVT fluid', 'CVT fluid', 6800],
  ['Spark plugs', 'Spark plugs', 4200],
  ['Brake pads', 'Brake pads', 5400],
  asTyped('Engine top overhaul', 185000),
  asTyped('Underchassis rust-proofing', 28500),
]);
const RESULT_60K = [...CITY_60K, ...BAYAN_60K];

const FIL_RESULT = [...RESULT_10K, 'back', 'Filipino', 'Mga lumang quote', '10,000 km service'];

export const scenarios = [
  { name: 'v3-00-language', url: '/' },
  { name: 'v3-01-home', url: '/', taps: [...CITY_10K, 'Go to Home'], shows: 'Check a casa quote' },
  { name: 'v3-18-allow-camera', url: '/', taps: [...CITY_10K, 'Check a casa quote', '10,000 km · 12 months', 'Continue'], shows: 'Allow camera' },
  // Headless has no camera grant, so "Allow camera" is denied and lands on V3-19. The live scanner is covered by scripts/e2e/camera-web.mjs.
  { name: 'v3-19-camera-off', url: '/', taps: [...CITY_10K, 'Check a casa quote', '10,000 km · 12 months', 'Continue', 'Allow camera'] },
  { name: 'v3-03-check-lines', url: '/check/reading?demo=1', waitText: 'Add a missing line' },
  { name: 'v3-12-edit-line', url: '/check/reading?demo=1', waitText: 'Add a missing line', taps: ['Fix'], shows: 'Save' },
  { name: 'v3-03c-line-updated', url: '/check/reading?demo=1', waitText: 'Add a missing line', taps: ['Yes'], shows: 'Looks right, check it' },
  { name: 'v3-04-result', url: '/', taps: RESULT_10K, shows: 'Show this to the advisor' },
  { name: 'v3-05-item-detail', url: '/', taps: [...RESULT_10K, 'Engine flush'], shows: 'My decision' },
  { name: 'v3-06-advisor', url: '/', taps: [...RESULT_10K, 'Show this to the advisor'], shows: 'Show the advisor' },
  { name: 'v3-21-report', url: '/', taps: [...RESULT_10K, 'Report a mistake'], shows: 'Send report' },
  { name: 'v3-04b-result-six-figure', url: '/', taps: RESULT_60K, shows: 'Show this to the advisor' },
  { name: 'v3-06b-advisor-six-figure', url: '/', taps: [...RESULT_60K, 'Show this to the advisor'], shows: 'Show the advisor' },
  { name: 'v3-07-couldnt-read', url: '/check/couldnt-read' },
  { name: 'v3-13-type-line', url: '/check/add' },
  { name: 'v3-13b-type-line-search', url: '/check/add', taps: [{ type: 'eng' }] },
  { name: 'v3-14-add-price', url: '/check/add', taps: [{ type: 'flush' }, 'Engine flush'], shows: 'Add to my quote' },
  { name: 'v3-16-past-quotes', url: '/', taps: [...RESULT_10K, 'back', 'Past quotes'] },
  { name: 'v3-16b-past-quotes-empty', url: '/quotes?empty=1' },
  { name: 'v3-17-your-cars', url: '/', taps: [...CITY_10K, 'Go to Home', 'Your cars'] },
  { name: 'v3-08-pick-model', url: '/car/model' },
  { name: 'v3-09-variant', url: '/car/model', taps: ['Honda City'] },
  { name: 'v3-22-not-listed', url: '/car/not-listed' },
  { name: 'v3-10-odometer', url: '/car/model', taps: ['Honda City', 'Continue', 'Mar', 'Continue', ...digits(10240)] },
  { name: 'v3-09b-look', url: '/car/model', taps: ['Honda City', 'Continue', 'Mar', 'Continue', ...digits(10240), 'Continue'] },
  { name: 'v3-11-car-saved', url: '/', taps: CITY_10K, shows: 'Go to Home' },
  { name: 'fil-01-home', url: '/', taps: [...CITY_10K, 'Go to Home', 'Filipino'] },
  { name: 'fil-18-allow-camera', url: '/', taps: [...CITY_10K, 'Go to Home', 'Filipino', 'Suriin ang quote ng casa', '10,000 km · 12 buwan', 'Magpatuloy'] },
  { name: 'fil-19-camera-off', url: '/', taps: [...CITY_10K, 'Go to Home', 'Filipino', 'Suriin ang quote ng casa', '10,000 km · 12 buwan', 'Magpatuloy', 'Payagan ang camera'] },
  { name: 'fil-16-past-quotes', url: '/', taps: [...RESULT_10K, 'back', 'Filipino', 'Mga lumang quote'] },
  { name: 'fil-04-result', url: '/', taps: FIL_RESULT, shows: 'Ipakita sa advisor' },
  { name: 'fil-05-item-detail', url: '/', taps: [...FIL_RESULT, 'Engine flush'], shows: 'Desisyon ko' },
  { name: 'fil-06-advisor', url: '/', taps: [...FIL_RESULT, 'Ipakita sa advisor'] },
  { name: 'fil-17-your-cars', url: '/', taps: [...CITY_10K, 'Go to Home', 'Filipino', 'Mga kotse mo'] },
];
