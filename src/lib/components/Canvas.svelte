<script lang="ts">
  import type { ScreenshotEditor } from '../editor.svelte';
  import AnnotationsOverlay from './AnnotationsOverlay.svelte';
  import { Globe, Lock } from '@lucide/svelte';

  let { editor } = $props<{ editor: ScreenshotEditor }>();

  // Computed Shadow style based on ShadowDepth selection
  const shadowStyles = $derived(() => {
    switch (editor.settings.shadowDepth) {
      case 'none':
        return 'box-shadow: none;';
      case 'soft':
        return 'box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.35);';
      case 'medium':
        return 'box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.5), 0 4px 10px -5px rgba(0, 0, 0, 0.2);';
      case 'hard':
        return 'box-shadow: 0 30px 60px -15px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(0, 0, 0, 0.2);';
      case 'double':
        return 'box-shadow: 0 12px 24px -10px rgba(0, 0, 0, 0.4), 0 35px 70px -15px rgba(0, 0, 0, 0.55);';
      case 'glow':
        // Generate soft glow matching the selected color or a default purple
        return 'box-shadow: 0 0 50px -5px rgba(168, 85, 247, 0.35), 0 10px 25px -10px rgba(0, 0, 0, 0.4);';
      default:
        return '';
    }
  });

  // Alignment classes for centering/positioning the mockup in the viewport
  const alignXClass = $derived(() => {
    switch (editor.settings.alignX) {
      case 'left': return 'justify-start';
      case 'right': return 'justify-end';
      default: return 'justify-center';
    }
  });

  const alignYClass = $derived(() => {
    switch (editor.settings.alignY) {
      case 'top': return 'items-start';
      case 'bottom': return 'items-end';
      default: return 'items-center';
    }
  });

  // Dynamic aspect ratio constraint calculation
  const aspectStyle = $derived(() => {
    let ratio = 16 / 9;
    if (editor.settings.aspectRatio === 'auto') {
      if (editor.imageWidth && editor.imageHeight) {
        ratio = editor.imageWidth / editor.imageHeight;
      }
    } else {
      const parts = editor.settings.aspectRatio.split(':').map(Number);
      if (parts[0] && parts[1]) {
        ratio = parts[0] / parts[1];
      }
    }

    const parentRatio = 16 / 9;
    if (ratio > parentRatio) {
      // Bounded by width (landscape orientation)
      return `aspect-ratio: ${ratio}; width: 100%; height: auto; max-width: 100%; max-height: 100%;`;
    } else {
      // Bounded by height (portrait/square orientation)
      return `aspect-ratio: ${ratio}; height: 100%; width: auto; max-width: 100%; max-height: 100%;`;
    }
  });
</script>

<div class="relative w-full max-w-4xl mx-auto aspect-video rounded-xl border border-neutral-200 dark:border-white/5 {editor.theme === 'dark' ? 'bg-checkered' : 'bg-checkered-light'} p-1 overflow-hidden shadow-2xl flex items-center justify-center">
  <!-- Outer viewport with checkered background -->
  
  <!-- The actual rendered element that will be exported -->
  <div
    id="snapcraft-export-canvas"
    class="relative flex transition-all duration-300 select-none overflow-hidden {alignXClass()} {alignYClass()}"
    style="
      {aspectStyle()}
      padding: {editor.settings.padding}px;
      {editor.settings.bgType === 'solid' ? `background-color: ${editor.settings.bgSolid};` : ''}
      {editor.settings.bgType === 'gradient' ? `background: ${editor.settings.bgGradient};` : ''}
      {editor.settings.bgType === 'transparent' ? 'background: transparent;' : ''}
    "
  >
    <!-- Background Blur Fallback -->
    {#if editor.settings.bgType === 'blur' && editor.screenshot}
      <div 
        class="absolute inset-0 bg-cover bg-center scale-110 pointer-events-none transition-all duration-300 filter blur-3xl brightness-[0.6] saturate-125"
        style="background-image: url({editor.screenshot});"
      ></div>
    {/if}

    <!-- Watermark Layer -->
    {#if editor.settings.watermarkEnabled}
      <div 
        class="absolute pointer-events-none text-xs font-semibold font-sans py-2 px-3 rounded bg-black/20 backdrop-blur-sm border border-white/5 select-none transition-opacity"
        style="
          opacity: {editor.settings.watermarkOpacity / 100};
          color: {editor.settings.bgType === 'solid' && editor.settings.bgSolid === '#ffffff' ? '#000000' : '#ffffff'};
          {editor.settings.watermarkPosition === 'bottom-right' ? 'bottom: 16px; right: 16px;' : ''}
          {editor.settings.watermarkPosition === 'bottom-left' ? 'bottom: 16px; left: 16px;' : ''}
          {editor.settings.watermarkPosition === 'top-right' ? 'top: 16px; right: 16px;' : ''}
          {editor.settings.watermarkPosition === 'top-left' ? 'top: 16px; left: 16px;' : ''}
        "
      >
        {editor.settings.watermarkText}
      </div>
    {/if}

    <!-- 3D Perspective Wrapper -->
    <div 
      class="flex items-center justify-center transition-transform duration-300"
      style="
        perspective: {editor.settings.perspective}px;
        width: {editor.settings.scale}%;
        height: 100%;
        transform-style: preserve-3d;
      "
    >
      <!-- The Card carrying the Screenshot and Window Mockup decoration -->
      {#if editor.screenshot}
        <div
          class="relative w-full transition-all duration-300 select-none overflow-visible group"
          style="
            border-radius: {editor.settings.borderRadius}px;
            transform: rotateX({editor.settings.tiltX}deg) rotateY({editor.settings.tiltY}deg);
            transform-style: preserve-3d;
            border: {editor.settings.borderWidth}px solid {editor.settings.borderColor};
            border-color: rgba(
              {parseInt(editor.settings.borderColor.slice(1,3), 16) || 255}, 
              {parseInt(editor.settings.borderColor.slice(3,5), 16) || 255}, 
              {parseInt(editor.settings.borderColor.slice(5,7), 16) || 255}, 
              {editor.settings.borderOpacity / 100}
            );
            {shadowStyles()}
          "
        >
          <!-- Frame Mockup: macOS Window Header -->
          {#if editor.settings.frameStyle.startsWith('macOS')}
            <div 
              class="w-full flex items-center justify-between px-4 py-3 rounded-t-[inherit] select-none border-b border-neutral-200 dark:border-white/5"
              style="
                background-color: {editor.settings.frameStyle === 'macOS-dark' ? 'rgba(24, 24, 27, 0.95)' : 'rgba(255, 255, 255, 0.95)'};
                color: {editor.settings.frameStyle === 'macOS-dark' ? '#f4f4f5' : '#18181b'};
              "
            >
              <!-- Window controls -->
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                <div class="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                <div class="w-3 h-3 rounded-full bg-[#27c93f]"></div>
              </div>
              
              <!-- Mock Window Title / Web address -->
              <div 
                class="flex-1 max-w-sm mx-auto text-center text-xs truncate font-medium opacity-60 font-sans"
              >
                {editor.screenshotName}
              </div>
              <div class="w-12"></div> <!-- Spacer to offset window controls -->
            </div>
          {/if}

          <!-- Frame Mockup: Windows Window Header -->
          {#if editor.settings.frameStyle.startsWith('windows')}
            <div 
              class="w-full flex items-center justify-between px-3 py-2 rounded-t-[inherit] select-none border-b border-neutral-200 dark:border-white/5"
              style="
                background-color: {editor.settings.frameStyle === 'windows-dark' ? '#1f1f23' : '#f3f3f3'};
                color: {editor.settings.frameStyle === 'windows-dark' ? '#ffffff' : '#000000'};
              "
            >
              <div class="text-xs truncate font-medium opacity-70 px-1 font-sans">
                {editor.screenshotName}
              </div>
              
              <!-- Window controls (Min, Max, Close) -->
              <div class="flex items-center gap-4 text-xs font-mono opacity-80">
                <span class="hover:bg-white/10 px-1 cursor-default">─</span>
                <span class="hover:bg-white/10 px-1 cursor-default">❑</span>
                <span class="hover:bg-red-600 hover:text-white px-2 cursor-default font-semibold">✕</span>
              </div>
            </div>
          {/if}

          <!-- Frame Mockup: Browser URL Address Bar -->
          {#if editor.settings.frameStyle.startsWith('browser')}
            <div 
              class="w-full flex flex-col gap-2 p-3 rounded-t-[inherit] select-none border-b border-neutral-200 dark:border-white/5"
              style="
                background-color: {editor.settings.frameStyle === 'browser-dark' ? '#18181b' : '#fafafa'};
                color: {editor.settings.frameStyle === 'browser-dark' ? '#a1a1aa' : '#52525b'};
              "
            >
              <div class="flex items-center justify-between">
                <!-- Mac dots -->
                <div class="flex items-center gap-1.5">
                  <div class="w-2.5 h-2.5 rounded-full bg-neutral-600"></div>
                  <div class="w-2.5 h-2.5 rounded-full bg-neutral-600"></div>
                  <div class="w-2.5 h-2.5 rounded-full bg-neutral-600"></div>
                </div>
                
                <!-- URL Address Input Bar -->
                <div 
                  class="flex-1 mx-6 flex items-center justify-center gap-1.5 px-3 py-1 rounded-md text-xs border border-neutral-200 dark:border-white/5 select-none"
                  style="
                    background-color: {editor.settings.frameStyle === 'browser-dark' ? '#09090b' : '#f4f4f5'};
                  "
                >
                  <Lock size={10} class="opacity-50" />
                  <span class="font-sans opacity-70 select-all truncate">
                    {editor.screenshotName.toLowerCase().replace(/\s+/g, '-')}
                  </span>
                </div>
                
                <div class="w-8"></div>
              </div>
            </div>
          {/if}

          <!-- Screenshot Image & Annotations container -->
          <div class="relative w-full overflow-hidden rounded-b-[inherit] bg-black/40 flex items-center justify-center">
            <img
              src={editor.screenshot}
              alt="Screenshot workspace"
              class="w-full h-auto select-none pointer-events-none"
            />
            
            <!-- Annotations overlay sits on top of image -->
            <AnnotationsOverlay {editor} />
          </div>
        </div>
      {:else}
        <!-- Upload Placeholder Area inside Canvas when no screenshot loaded -->
        <div class="flex flex-col items-center justify-center p-8 bg-white/80 dark:bg-neutral-900/60 backdrop-blur-md rounded-2xl border border-neutral-200 dark:border-white/10 w-9/12 max-w-md shadow-2xl text-center select-none animate-float text-neutral-800 dark:text-white">
          <div class="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mb-4 text-brand-600 dark:text-brand-400">
            <Globe size={28} />
          </div>
          <h3 class="font-semibold text-lg text-neutral-900 dark:text-white mb-2 font-sans">No Image Selected</h3>
          <p class="text-sm text-neutral-550 dark:text-neutral-400 font-sans max-w-[240px]">
            Please upload a screenshot or select a preset template to begin crafting.
          </p>
        </div>
      {/if}
    </div>
  </div>
</div>
