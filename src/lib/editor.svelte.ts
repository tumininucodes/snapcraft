import type { CanvasSettings, Annotation, PresetTemplate, SavedDesign } from './types';

// Predefined beautiful gradients
export const PRESET_GRADIENTS = [
  { name: 'Sunset Glow', value: 'linear-gradient(135deg, #f97316 0%, #ec4899 100%)' },
  { name: 'Ocean Breeze', value: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)' },
  { name: 'Northern Lights', value: 'linear-gradient(135deg, #10b981 0%, #6366f1 100%)' },
  { name: 'Cyberpunk Dream', value: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)' },
  { name: 'Neon Glass', value: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)' },
  { name: 'Deep Space', value: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' },
  { name: 'Golden Hour', value: 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)' },
  { name: 'Midnight Aurora', value: 'linear-gradient(135deg, #09090b 0%, #2e1065 50%, #0c4a6e 100%)' },
  { name: 'Sweet Peach', value: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)' },
  { name: 'Steel Tech', value: 'linear-gradient(135deg, #374151 0%, #111827 100%)' }
];

// Predefined solids
export const PRESET_SOLIDS = [
  { name: 'Midnight Slate', value: '#0f172a' },
  { name: 'Dark Charcoal', value: '#18181b' },
  { name: 'Royal Indigo', value: '#4338ca' },
  { name: 'Emerald Forest', value: '#065f46' },
  { name: 'Vibrant Amethyst', value: '#7c3aed' },
  { name: 'Soft Cream', value: '#fafaf9' },
  { name: 'Crimson Rose', value: '#be123c' },
  { name: 'Pure White', value: '#ffffff' }
];

// Predefined templates matching premium designs from Xnapper and Screenshots.so
export const PRESET_TEMPLATES: PresetTemplate[] = [
  {
    id: 'mac-neon',
    name: 'Mac Neon Glow',
    description: 'Sleek macOS window centered on a high-contrast magenta and purple gradient.',
    settings: {
      bgType: 'gradient',
      bgGradientIndex: 4, // Neon Glass
      bgGradient: PRESET_GRADIENTS[4].value,
      frameStyle: 'macOS-dark',
      padding: 64,
      scale: 85,
      borderRadius: 16,
      shadowDepth: 'glow',
      borderWidth: 1,
      borderColor: '#ffffff',
      borderOpacity: 20,
      tiltX: 0,
      tiltY: 0,
      aspectRatio: 'auto'
    }
  },
  {
    id: 'tilt-isometric',
    name: '3D Isometric',
    description: 'Beautiful isometric 3D tilt with a dark tech theme.',
    settings: {
      bgType: 'gradient',
      bgGradientIndex: 5, // Deep Space
      bgGradient: PRESET_GRADIENTS[5].value,
      frameStyle: 'macOS-dark',
      padding: 80,
      scale: 75,
      borderRadius: 20,
      shadowDepth: 'double',
      borderWidth: 2,
      borderColor: '#38bdf8', // Cyan border
      borderOpacity: 35,
      tiltX: 12,
      tiltY: -15,
      perspective: 1200,
      aspectRatio: '16:9'
    }
  },
  {
    id: 'retro-browser',
    name: 'Retro Browser',
    description: 'Light-mode browser frame with a high-saturation orange sunset gradient.',
    settings: {
      bgType: 'gradient',
      bgGradientIndex: 0, // Sunset Glow
      bgGradient: PRESET_GRADIENTS[0].value,
      frameStyle: 'browser-light',
      padding: 48,
      scale: 90,
      borderRadius: 12,
      shadowDepth: 'hard',
      borderWidth: 1,
      borderColor: '#000000',
      borderOpacity: 100,
      tiltX: 0,
      tiltY: 0,
      aspectRatio: 'auto'
    }
  },
  {
    id: 'glass-avatar',
    name: 'Glass Minimal',
    description: 'Fit-to-size portrait aspect ratio with blurred screenshot background.',
    settings: {
      bgType: 'blur',
      frameStyle: 'none',
      padding: 32,
      scale: 85,
      borderRadius: 24,
      shadowDepth: 'soft',
      borderWidth: 1,
      borderColor: '#ffffff',
      borderOpacity: 30,
      tiltX: 0,
      tiltY: 0,
      aspectRatio: '1:1'
    }
  },
  {
    id: 'windows-terminal',
    name: 'Windows Terminal',
    description: 'Windows terminal mockup set in a dark carbon gradient.',
    settings: {
      bgType: 'gradient',
      bgGradientIndex: 9, // Steel Tech
      bgGradient: PRESET_GRADIENTS[9].value,
      frameStyle: 'windows-dark',
      padding: 56,
      scale: 85,
      borderRadius: 8,
      shadowDepth: 'medium',
      borderWidth: 1,
      borderColor: '#4b5563',
      borderOpacity: 50,
      tiltX: -5,
      tiltY: 8,
      perspective: 1000,
      aspectRatio: 'auto'
    }
  },
  {
    id: 'trans-export',
    name: 'No Background (PNG)',
    description: 'Transparent background for easy overlaying onto other designs.',
    settings: {
      bgType: 'transparent',
      frameStyle: 'macOS-dark',
      padding: 24,
      scale: 90,
      borderRadius: 16,
      shadowDepth: 'medium',
      borderWidth: 1,
      borderColor: '#ffffff',
      borderOpacity: 15,
      tiltX: 0,
      tiltY: 0,
      aspectRatio: 'auto'
    }
  }
];

export class ScreenshotEditor {
  // Svelte 5 state properties
  screenshot = $state<string | null>(null);
  screenshotName = $state<string>('screenshot.png');
  imageWidth = $state<number>(0);
  imageHeight = $state<number>(0);
  theme = $state<'light' | 'dark'>('light');

  // Default Canvas settings
  defaultSettings: CanvasSettings = {
    aspectRatio: 'auto',
    padding: 48,
    scale: 85,
    bgType: 'gradient',
    bgSolid: '#0f172a',
    bgGradient: PRESET_GRADIENTS[4].value, // Neon Glass default
    bgGradientIndex: 4,
    frameStyle: 'macOS-dark',
    borderRadius: 16,
    shadowDepth: 'medium',
    borderWidth: 1,
    borderColor: '#ffffff',
    borderOpacity: 15,
    tiltX: 0,
    tiltY: 0,
    perspective: 1000,
    watermarkEnabled: false,
    watermarkText: 'Created with SnapCraft',
    watermarkOpacity: 40,
    watermarkPosition: 'bottom-right',
    alignX: 'center',
    alignY: 'center',
    exportMultiplier: 2,
    exportFormat: 'png',
    exportQuality: 90
  };

  settings = $state<CanvasSettings>({ ...this.defaultSettings });

  // Annotations
  annotations = $state<Annotation[]>([]);
  selectedAnnotationId = $state<string | null>(null);
  activeTool = $state<'none' | 'blur' | 'text' | 'arrow' | 'rect' | 'badge'>('none');
  nextBadgeNumber = $state<number>(1);
  brushColor = $state<string>('#a855f7'); // default amethyst purple

  // History list from LocalStorage
  savedDesigns = $state<SavedDesign[]>([]);

  constructor() {
    // Try to load history from LocalStorage in client environment
    if (typeof window !== 'undefined') {
      this.loadHistoryFromLocalStorage();
      // Ensure initial theme is synced
      if (this.theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
      }
    }
  }

  // Toggle editor theme
  toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    if (typeof window !== 'undefined') {
      if (this.theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
      }
    }
  }

  // Load screenshot
  loadScreenshot(file: File) {
    this.screenshotName = file.name || 'screenshot.png';
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result && typeof e.target.result === 'string') {
        this.screenshot = e.target.result;
        this.annotations = [];
        this.selectedAnnotationId = null;
        this.nextBadgeNumber = 1;
        
        // Auto-detect size of screenshot
        const img = new Image();
        img.onload = () => {
          this.imageWidth = img.width;
          this.imageHeight = img.height;
        };
        img.src = e.target.result;
      }
    };
    reader.readAsDataURL(file);
  }

  // Load demo screenshot
  loadDemoScreenshot(url: string, name: string = 'demo-screenshot.png') {
    this.screenshot = url;
    this.screenshotName = name;
    this.annotations = [];
    this.selectedAnnotationId = null;
    this.nextBadgeNumber = 1;
    
    const img = new Image();
    img.onload = () => {
      this.imageWidth = img.width;
      this.imageHeight = img.height;
    };
    img.src = url;
  }

  // Clear screenshot
  clearScreenshot() {
    this.screenshot = null;
    this.annotations = [];
    this.selectedAnnotationId = null;
    this.nextBadgeNumber = 1;
  }

  // Reset settings
  resetSettings() {
    this.settings = { ...this.defaultSettings };
  }

  // Apply template preset
  applyPreset(preset: PresetTemplate) {
    this.settings = {
      ...this.settings,
      ...preset.settings
    };
  }

  // Get active annotation
  get selectedAnnotation() {
    return this.annotations.find(a => a.id === this.selectedAnnotationId) || null;
  }

  // Add Annotation
  addAnnotation(type: Annotation['type'], x: number, y: number) {
    const id = crypto.randomUUID();
    let newAnnotation: Annotation = {
      id,
      type,
      x,
      y,
      color: this.brushColor
    };

    if (type === 'blur') {
      newAnnotation.width = 15;
      newAnnotation.height = 10;
    } else if (type === 'rect') {
      newAnnotation.width = 20;
      newAnnotation.height = 15;
    } else if (type === 'text') {
      newAnnotation.text = 'Double click to edit';
      newAnnotation.fontSize = 18;
    } else if (type === 'badge') {
      newAnnotation.badgeNumber = this.nextBadgeNumber;
      this.nextBadgeNumber += 1;
    } else if (type === 'arrow') {
      newAnnotation.toX = x + 10;
      newAnnotation.toY = y + 10;
    }

    this.annotations.push(newAnnotation);
    this.selectedAnnotationId = id;
    return newAnnotation;
  }

  // Update Annotation
  updateAnnotation(id: string, updates: Partial<Annotation>) {
    const idx = this.annotations.findIndex(a => a.id === id);
    if (idx !== -1) {
      this.annotations[idx] = {
        ...this.annotations[idx],
        ...updates
      };
    }
  }

  // Delete Annotation
  deleteAnnotation(id: string) {
    const annotation = this.annotations.find(a => a.id === id);
    if (annotation?.type === 'badge' && annotation.badgeNumber === this.nextBadgeNumber - 1) {
      this.nextBadgeNumber = Math.max(1, this.nextBadgeNumber - 1);
    }
    this.annotations = this.annotations.filter(a => a.id !== id);
    if (this.selectedAnnotationId === id) {
      this.selectedAnnotationId = null;
    }
  }

  // Local storage history
  saveToHistory(canvasName: string = 'Screenshot Design') {
    if (!this.screenshot) return;
    
    const id = crypto.randomUUID();
    const newSave: SavedDesign = {
      id,
      name: canvasName,
      screenshotUrl: this.screenshot,
      settings: JSON.parse(JSON.stringify(this.settings)),
      annotations: JSON.parse(JSON.stringify(this.annotations)),
      createdAt: Date.now()
    };

    // Prepend to history, max 10 entries
    const existing = [newSave, ...this.savedDesigns.filter(item => item.screenshotUrl !== this.screenshot)].slice(0, 10);
    this.savedDesigns = existing;
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('snapcraft_saves', JSON.stringify(this.savedDesigns));
    }
  }

  loadHistoryFromLocalStorage() {
    try {
      const data = localStorage.getItem('snapcraft_saves');
      if (data) {
        this.savedDesigns = JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to load history', e);
    }
  }

  loadFromHistory(design: SavedDesign) {
    this.screenshot = design.screenshotUrl;
    this.settings = { ...this.defaultSettings, ...design.settings };
    this.annotations = JSON.parse(JSON.stringify(design.annotations));
    this.selectedAnnotationId = null;
    
    // Find next badge number from loaded annotations
    const badges = this.annotations.filter(a => a.type === 'badge');
    if (badges.length > 0) {
      this.nextBadgeNumber = Math.max(...badges.map(b => b.badgeNumber || 0)) + 1;
    } else {
      this.nextBadgeNumber = 1;
    }

    const img = new Image();
    img.onload = () => {
      this.imageWidth = img.width;
      this.imageHeight = img.height;
    };
    img.src = design.screenshotUrl;
  }

  deleteFromHistory(id: string) {
    this.savedDesigns = this.savedDesigns.filter(d => d.id !== id);
    if (typeof window !== 'undefined') {
      localStorage.setItem('snapcraft_saves', JSON.stringify(this.savedDesigns));
    }
  }
}
