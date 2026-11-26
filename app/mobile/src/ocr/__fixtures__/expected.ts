/**
 * What a person reads off one quote photo. The photos stay out of the repo (fixtures/ is local only);
 * `image` is the path under fixtures/quotes/ and `source` is where it was published.
 */
export interface ExpectedQuote {
  image: string;
  source: string | null;
  /** `quote` is one car's estimate or job order. `guide` is a menu or table of many intervals, never parsed as lines. */
  kind: 'quote' | 'guide';
  medium: 'printed' | 'handwritten' | 'screen' | 'message';
  make: string | null;
  model: string | null;
  /** As printed in the header, such as "10K PMS". */
  service: string | null;
  lines: ExpectedLine[];
  /** Pesos, as the quote states it; null when the quote prints no total. */
  total: number | null;
  /** Anything a reader of the photo should know: cropping, glare, a line that can't be read. */
  notes: string[];
}

export interface ExpectedLine {
  text: string;
  /** Pesos; null when the line has no price of its own (included, free, or blank). */
  price: number | null;
  /** True when the photo is too blurred or cut off to be sure of the text or the price. */
  unsure?: boolean;
}
