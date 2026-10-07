import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

import type { Painting } from '@/data/paintings';

export type PickedPhoto = {
  uri: string;
  width: number;
  height: number;
  aspect: Painting['aspect'];
};

// Like the website: the longest side at most 1600px, so an upload stays far
// under the 4 MB limit (and Vercel's 4.5 MB). The website re-encodes it again
// and drops all metadata, GPS included.
const LONGEST_SIDE = 1600;

// The website's buckets (components/upload-form.tsx).
function aspectOf(width: number, height: number): Painting['aspect'] {
  const ratio = width / height;
  if (ratio > 1.15) return 'landscape';
  if (ratio < 0.87) return 'portrait';
  return 'square';
}

async function shrink(asset: ImagePicker.ImagePickerAsset): Promise<PickedPhoto> {
  const context = ImageManipulator.manipulate(asset.uri);
  if (Math.max(asset.width, asset.height) > LONGEST_SIDE) {
    context.resize(asset.width >= asset.height ? { width: LONGEST_SIDE } : { height: LONGEST_SIDE });
  }
  const image = await context.renderAsync();
  // JPEG also turns iPhone HEIC photos into something every browser shows.
  const saved = await image.saveAsync({ format: SaveFormat.JPEG, compress: 0.85 });
  return {
    uri: saved.uri,
    width: saved.width,
    height: saved.height,
    aspect: aspectOf(saved.width, saved.height),
  };
}

// The camera or the photo library, then shrunk. The library needs no
// permission (iOS's picker, Android's system photo picker); the camera asks
// once. Null when they back out.
export async function pickPhoto(from: 'camera' | 'library'): Promise<PickedPhoto | 'no-camera' | null> {
  const options: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 1 };
  let result: ImagePicker.ImagePickerResult;
  if (from === 'camera') {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return 'no-camera';
    result = await ImagePicker.launchCameraAsync(options);
  } else {
    result = await ImagePicker.launchImageLibraryAsync(options);
  }
  const asset = result.canceled ? undefined : result.assets[0];
  return asset ? shrink(asset) : null;
}
