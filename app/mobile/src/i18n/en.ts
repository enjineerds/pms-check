export const en = {
  home: {
    yourCars: 'Your cars',
    due: (km: string) => `Your ${km} km service is due.`,
    pms: 'That’s your PMS, the maker’s scheduled maintenance. Check the casa’s quote before you say yes to anything.',
    inKm: (km: string) => `in ${km} km`,
    afterThis: (km: string) => `After this: ${km} km`,
    pastQuotes: 'Past quotes',
    checked: (n: number) => `${n} checked`,
    cta: 'Check a casa quote',
  },
};

export type Copy = typeof en;
