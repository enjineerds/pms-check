import { exposureValue, isTooDark } from './exposure';

const DARK_ON_DESK = { FNumber: 2.2, ExposureTime: 0.1, ISOSpeedRatings: 3600 };
const FLASH_ON_DESK = { FNumber: 2.2, ExposureTime: 1 / 15, ISOSpeedRatings: 1922 };
const LIT_ROOM = { FNumber: 2.2, ExposureTime: 1 / 50, ISOSpeedRatings: 400 };

describe('exposureValue', () => {
  it('works out the scene light from aperture, shutter and ISO', () => {
    expect(exposureValue(DARK_ON_DESK)).toBeCloseTo(0.43, 1);
    expect(exposureValue(LIT_ROOM)).toBeCloseTo(5.9, 1);
  });

  it('reads the iOS ISO, which comes as a list', () => {
    expect(exposureValue({ ...LIT_ROOM, ISOSpeedRatings: [400] })).toBeCloseTo(5.9, 1);
  });

  it('gives up when a field is missing, so the photo is never blocked on a guess', () => {
    expect(exposureValue({ FNumber: 2.2, ExposureTime: 0.1 })).toBeNull();
    expect(exposureValue(undefined)).toBeNull();
  });
});

describe('isTooDark (#34)', () => {
  it('stops a black frame from a covered or face-down camera', () => {
    expect(isTooDark(DARK_ON_DESK)).toBe(true);
    expect(isTooDark(FLASH_ON_DESK)).toBe(true);
  });

  it('lets an ordinary indoor photo through', () => {
    expect(isTooDark(LIT_ROOM)).toBe(false);
  });

  it('lets a photo through when the exposure is unknown', () => {
    expect(isTooDark({})).toBe(false);
  });
});
