import { Platform } from 'react-native';
import type { CameraView } from 'expo-camera';
import { Directory, File, Paths } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { isTooDark } from './exposure';
import type { CapturedImage } from './types';

// The only code that creates or deletes quote images (SYSTEM_DESIGN §6).
// On web captures are data/blob URIs, so release and sweep are no-ops.
const isWeb = Platform.OS === 'web';

const folder = () => new Directory(Paths.cache, 'quote-capture');

async function adopt(uri: string): Promise<string> {
  if (isWeb) return uri;
  const dir = folder();
  dir.create({ idempotent: true, intermediates: true });
  const source = new File(uri);
  const dest = new File(dir, `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`);
  try {
    await source.move(dest);
  } catch {
    // The picker can hand back a file we can't move.
    source.copy(dest);
    try {
      source.delete();
    } catch {}
  }
  return dest.uri;
}

export async function takeFromCamera(camera: CameraView | null): Promise<{ image: CapturedImage; tooDark: boolean }> {
  if (!camera) throw new Error('Camera is not ready');
  const photo = await camera.takePictureAsync({ quality: 0.9, exif: true });
  const image: CapturedImage = { uri: await adopt(photo.uri), width: photo.width, height: photo.height, source: 'camera' };
  return { image, tooDark: isTooDark(photo.exif) };
}

export async function pickFromLibrary(): Promise<CapturedImage | null> {
  const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: false, quality: 1 });
  const asset = result.canceled ? null : result.assets[0];
  if (!asset) return null;
  return { uri: await adopt(asset.uri), width: asset.width, height: asset.height, source: 'library' };
}

export async function release(img: CapturedImage): Promise<void> {
  if (isWeb || !img.uri) return;
  try {
    const file = new File(img.uri);
    if (file.exists) file.delete();
  } catch {}
}

/** Run once at launch to clear what a crash left behind. */
export async function sweepCaptures(): Promise<void> {
  if (isWeb) return;
  try {
    const dir = folder();
    if (dir.exists) dir.delete();
  } catch {}
}
