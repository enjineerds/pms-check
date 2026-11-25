import { Platform } from 'react-native';
import type { CameraView } from 'expo-camera';
import { Directory, File, Paths } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import type { CapturedImage } from './types';

// The only code that creates or deletes quote images (SYSTEM_DESIGN section 6, temp file lifecycle).
// On web there are no files: camera and picker return data or blob URIs, so release and sweep do nothing.
const isWeb = Platform.OS === 'web';

const folder = () => new Directory(Paths.cache, 'quote-capture');

/** Moves a file the camera or picker made into our folder, so the sweep and release cover it. */
async function adopt(uri: string): Promise<string> {
  if (isWeb) return uri;
  const dir = folder();
  dir.create({ idempotent: true, intermediates: true });
  const source = new File(uri);
  const dest = new File(dir, `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`);
  try {
    await source.move(dest);
  } catch {
    // The picker can hand back a file we cannot move. Copy it, then remove the original if we may.
    source.copy(dest);
    try {
      source.delete();
    } catch {}
  }
  return dest.uri;
}

export async function takeFromCamera(camera: CameraView | null): Promise<CapturedImage> {
  if (!camera) throw new Error('Camera is not ready');
  const photo = await camera.takePictureAsync({ quality: 0.9 });
  return { uri: await adopt(photo.uri), width: photo.width, height: photo.height, source: 'camera' };
}

/** Opens the system picker, which needs no photo-library permission. Resolves null when the user cancels. */
export async function pickFromLibrary(): Promise<CapturedImage | null> {
  const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: false, quality: 1 });
  const asset = result.canceled ? null : result.assets[0];
  if (!asset) return null;
  return { uri: await adopt(asset.uri), width: asset.width, height: asset.height, source: 'library' };
}

/** Safe to call twice, or for a file that is already gone. */
export async function release(img: CapturedImage): Promise<void> {
  if (isWeb || !img.uri) return;
  try {
    const file = new File(img.uri);
    if (file.exists) file.delete();
  } catch {}
}

/** Deletes every file in the capture folder. Run once at launch to clear what a crash left behind. */
export async function sweepCaptures(): Promise<void> {
  if (isWeb) return;
  try {
    const dir = folder();
    if (dir.exists) dir.delete();
  } catch {}
}
