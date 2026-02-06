import { toJpeg } from 'html-to-image';
import { THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT, THUMBNAIL_QUALITY } from '@/lib/constants';

const FILTER_SELECTORS = ['.react-flow__minimap', '.react-flow__panel'];

function filterNode(node: HTMLElement): boolean {
  return !FILTER_SELECTORS.some((sel) => node.matches?.(sel));
}

export async function captureThumbnail(
  containerEl: HTMLElement,
): Promise<string | null> {
  try {
    const dataUrl = await toJpeg(containerEl, {
      canvasWidth: THUMBNAIL_WIDTH,
      canvasHeight: THUMBNAIL_HEIGHT,
      quality: THUMBNAIL_QUALITY,
      pixelRatio: 1,
      filter: filterNode,
    });
    return dataUrl;
  } catch {
    return null;
  }
}
