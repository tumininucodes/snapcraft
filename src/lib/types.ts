export type BackgroundType = 'solid' | 'gradient' | 'blur' | 'transparent';

export type FrameStyle = 'none' | 'macOS-light' | 'macOS-dark' | 'windows-light' | 'windows-dark' | 'browser-light' | 'browser-dark';

export type AspectSize = 'auto' | '1:1' | '16:9' | '4:3' | '9:16';

export type ShadowDepth = 'none' | 'soft' | 'medium' | 'hard' | 'double' | 'glow';

export type AnnotationType = 'blur' | 'text' | 'arrow' | 'rect' | 'badge';

export interface Annotation {
  id: string;
  type: AnnotationType;
  x: number; // 0 to 100 relative to image width
  y: number; // 0 to 100 relative to image height
  width?: number; // 0 to 100 relative to image width
  height?: number; // 0 to 100 relative to image height
  text?: string;
  color?: string; // Hex or tailwind color
  fontSize?: number; // Pixels
  badgeNumber?: number; // For step annotations
  toX?: number; // End coordinate for arrows
  toY?: number; // End coordinate for arrows
}

export interface CanvasSettings {
  aspectRatio: AspectSize;
  padding: number; // px (0 to 128)
  scale: number; // % (50 to 100)
  bgType: BackgroundType;
  bgSolid: string;
  bgGradient: string; // CSS value like linear-gradient(135deg, ...)
  bgGradientIndex: number; // index of predefined gradients
  frameStyle: FrameStyle;
  borderRadius: number; // px (0 to 48)
  shadowDepth: ShadowDepth;
  borderWidth: number; // px (0 to 8)
  borderColor: string;
  borderOpacity: number; // 0 to 100
  tiltX: number; // degrees (-30 to 30)
  tiltY: number; // degrees (-30 to 30)
  perspective: number; // px (500 to 2000)
  watermarkEnabled: boolean;
  watermarkText: string;
  watermarkOpacity: number; // 0 to 100
  watermarkPosition: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  alignX: 'left' | 'center' | 'right';
  alignY: 'top' | 'center' | 'bottom';
  exportMultiplier: number; // 1, 2, 3
  exportFormat: 'png' | 'jpeg' | 'webp';
  exportQuality: number; // 0 to 100 (for jpeg/webp)
}

export interface PresetTemplate {
  id: string;
  name: string;
  settings: Partial<CanvasSettings>;
  description?: string;
}

export interface SavedDesign {
  id: string;
  name: string;
  screenshotUrl: string; // base64 / blob URL
  settings: CanvasSettings;
  annotations: Annotation[];
  createdAt: number;
}
