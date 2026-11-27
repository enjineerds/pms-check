// Hermes has no crypto.randomUUID; this id only needs to be unique, not secret.
export const uuid = (random: () => number = Math.random): string =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.floor(random() * 16);
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
