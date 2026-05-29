<script lang="ts">
  import { ScreenshotEditor } from '$lib/editor.svelte';
  import Canvas from '$lib/components/Canvas.svelte';
  import SettingsPanel from '$lib/components/SettingsPanel.svelte';
  import * as htmlToImage from 'html-to-image';
  import { 
    Upload, 
    Clipboard, 
    Code, 
    BarChart3, 
    Terminal, 
    Laptop, 
    Camera, 
    Trash2, 
    Sparkles, 
    Check,
    AlertCircle,
    Sun,
    Moon
  } from '@lucide/svelte';

  // Instantiate the reactive controller
  const editor = new ScreenshotEditor();

  // Component states
  let isDraggingFile = $state(false);
  let fileInputEl = $state<HTMLInputElement | null>(null);
  let alertMessage = $state<{ type: 'success' | 'error'; text: string } | null>(null);

  // Auto-clear alert after 3 seconds
  function triggerAlert(text: string, type: 'success' | 'error' = 'success') {
    alertMessage = { text, type };
    setTimeout(() => {
      alertMessage = null;
    }, 3500);
  }

  // Handle file select through input
  function handleFileChange(e: Event) {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      editor.loadScreenshot(target.files[0]);
      triggerAlert('Screenshot uploaded successfully!');
    }
  }

  // Handle drag and drop files
  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    isDraggingFile = true;
  }

  function handleDragLeave(e: DragEvent) {
    e.preventDefault();
    isDraggingFile = false;
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    isDraggingFile = false;
    
    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        editor.loadScreenshot(file);
        triggerAlert('Screenshot imported from drop!');
      } else {
        triggerAlert('Please upload an image file.', 'error');
      }
    }
  }

  // Handle paste events (Ctrl + V)
  function handlePaste(e: ClipboardEvent) {
    const items = e.clipboardData?.items;
    if (!items) return;
    
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) {
          editor.loadScreenshot(file);
          triggerAlert('Screenshot pasted from clipboard!');
          return;
        }
      }
    }
  }

  // Trigger HTML to Image Export (Download)
  async function handleDownload() {
    const el = document.getElementById('snapcraft-export-canvas');
    if (!el) {
      triggerAlert('Editor workspace not found!', 'error');
      return;
    }

    // Temporarily clear selection box to avoid drawing handles in the exported image
    editor.selectedAnnotationId = null;
    editor.activeTool = 'none';

    // Wait a brief tick for Svelte to clear selection highlights from DOM
    await new Promise((resolve) => setTimeout(resolve, 80));

    try {
      let dataUrl = '';
      const options = {
        pixelRatio: editor.settings.exportMultiplier,
        quality: editor.settings.exportQuality / 100
      };

      if (editor.settings.exportFormat === 'png') {
        dataUrl = await htmlToImage.toPng(el, options);
      } else if (editor.settings.exportFormat === 'jpeg') {
        dataUrl = await htmlToImage.toJpeg(el, options);
      } else if (editor.settings.exportFormat === 'webp') {
        const blob = await htmlToImage.toBlob(el, { ...options, type: 'image/webp' });
        if (blob) {
          dataUrl = URL.createObjectURL(blob);
        } else {
          throw new Error('WebP blob generation failed');
        }
      }

      const name = editor.screenshotName.split('.')[0] || 'screenshot';
      const filename = `${name}-beautified-${Date.now()}.${editor.settings.exportFormat}`;

      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();
      
      triggerAlert('Screenshot exported successfully!');
    } catch (err) {
      console.error('Export failed', err);
      triggerAlert('Failed to export screenshot. SVG/CSS filters might be unsupported by your browser.', 'error');
    }
  }

  // Trigger copy to clipboard
  async function handleCopyToClipboard() {
    const el = document.getElementById('snapcraft-export-canvas');
    if (!el) {
      triggerAlert('Editor workspace not found!', 'error');
      return;
    }

    editor.selectedAnnotationId = null;
    editor.activeTool = 'none';
    
    await new Promise((resolve) => setTimeout(resolve, 80));

    try {
      const blob = await htmlToImage.toBlob(el, {
        pixelRatio: editor.settings.exportMultiplier
      });

      if (blob) {
        // Modern ClipboardItem writing
        const data = [new ClipboardItem({ [blob.type]: blob })];
        await navigator.clipboard.write(data);
        triggerAlert('Image copied to clipboard!');
      } else {
        throw new Error('Blob generation failed');
      }
    } catch (err) {
      console.error('Clipboard copy failed', err);
      triggerAlert('Could not copy image to clipboard. Try standard download.', 'error');
    }
  }
</script>

<svelte:window onpaste={handlePaste} />

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div 
  class="relative min-h-screen lg:h-screen lg:overflow-hidden transition-colors duration-350 flex flex-col p-4 md:p-6 overflow-x-hidden selection:bg-brand-500/30 select-none {editor.theme === 'dark' ? 'dark text-neutral-100 bg-neutral-950' : 'text-neutral-800 bg-neutral-50'}"
  ondragover={handleDragOver}
  ondragleave={handleDragLeave}
  ondrop={handleDrop}
>
  <!-- Background Glow FX -->
  <div class="absolute top-[-20%] left-[20%] w-[500px] h-[500px] rounded-full bg-brand-600/10 dark:bg-brand-600/10 blur-[120px] pointer-events-none opacity-40 dark:opacity-100"></div>
  <div class="absolute bottom-[-10%] right-[10%] w-[400px] h-[400px] rounded-full bg-blue-600/5 dark:bg-blue-600/5 blur-[100px] pointer-events-none opacity-40 dark:opacity-100"></div>

  <!-- Header Navigation -->
  <header class="flex items-center justify-between mb-6 z-10 border-b border-neutral-200/50 dark:border-white/5 pb-4">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
        <Camera size={20} class="text-white" />
      </div>
      <div>
        <div class="flex items-center gap-1.5">
          <h1 class="text-lg font-black tracking-tight text-neutral-900 dark:text-white font-sans">SnapCraft</h1>
          <span class="text-[9px] bg-brand-500/20 text-brand-600 dark:text-brand-300 border border-brand-500/30 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">v4.0</span>
        </div>
        <p class="text-xs text-neutral-500 dark:text-neutral-400 font-sans leading-normal">
          Craft screenshots that get noticed.
        </p>
      </div>
    </div>

    <!-- Active indicators -->
    <div class="flex items-center gap-2">
      <!-- Theme Toggle Switch -->
      <button
        class="flex items-center justify-center p-2 rounded-lg border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
        onclick={() => editor.toggleTheme()}
        title="Toggle Theme"
      >
        {#if editor.theme === 'dark'}
          <Sun size={15} />
        {:else}
          <Moon size={15} />
        {/if}
      </button>

      {#if editor.screenshot}
        <button
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-950/60 transition-colors cursor-pointer"
          onclick={() => editor.clearScreenshot()}
        >
          <Trash2 size={13} />
          <span class="hidden sm:inline">Clear Workspace</span>
        </button>
      {/if}
    </div>
  </header>

  <!-- Notification Toast Alert -->
  {#if alertMessage}
    <div 
      class="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-2xl transition-all duration-300 animate-float border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-white/10 {alertMessage.type === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}"
    >
      {#if alertMessage.type === 'success'}
        <Check size={16} />
      {:else}
        <AlertCircle size={16} />
      {/if}
      <span class="text-xs font-sans font-semibold text-neutral-800 dark:text-neutral-200">{alertMessage.text}</span>
    </div>
  {/if}

  <!-- File Upload Drag Overlay -->
  {#if isDraggingFile}
    <div class="fixed inset-0 z-50 bg-white/90 dark:bg-neutral-950/80 backdrop-blur-md border-4 border-dashed border-brand-500/50 flex flex-col items-center justify-center p-6 transition-all">
      <div class="w-20 h-20 rounded-3xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mb-4 text-brand-500 dark:text-brand-400 animate-pulse">
        <Upload size={36} />
      </div>
      <h2 class="text-xl font-bold text-neutral-900 dark:text-white font-sans">Drop to Upload</h2>
      <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-1 font-sans">Release your screenshot anywhere to import it</p>
    </div>
  {/if}

  <!-- Main Content Dashboard Grid -->
  <main class="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:items-stretch z-10">
    
    <!-- LEFT & CENTER: Workspace Canvas Area -->
    <div class="lg:col-span-2 flex flex-col justify-between items-stretch min-h-[450px] lg:h-full lg:min-h-0 gap-6">
      
      {#if editor.screenshot}
        <!-- Canvas view container -->
        <div class="flex-1 min-h-0 flex items-center justify-center">
          <Canvas {editor} />
        </div>
        
        <!-- Helpful instructions indicator -->
        <div class="flex items-center gap-2 justify-center px-4 py-2 bg-white dark:bg-neutral-900/40 border border-neutral-200 dark:border-white/5 rounded-xl text-center text-xs text-neutral-600 dark:text-neutral-400 font-sans max-w-lg mx-auto w-full">
          <Sparkles size={12} class="text-brand-500 dark:text-brand-400 flex-shrink-0" />
          <span>
            Tip: You can **draw blurring / texts / badges** using the **Annotate** tab on the sidebar.
          </span>
        </div>
      {:else}
        <!-- Upload / Onboarding Area when workspace is empty -->
        <div class="flex-1 flex flex-col items-center justify-center p-8 bg-white/40 dark:bg-neutral-900/25 border border-neutral-200 dark:border-white/5 rounded-2xl">
          <div class="w-full max-w-lg text-center space-y-6">
            
            <!-- Upload Drag Box -->
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div 
              class="border border-dashed border-neutral-200 dark:border-white/10 hover:border-brand-500/40 bg-white dark:bg-neutral-900/30 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 rounded-2xl p-8 cursor-pointer transition-all duration-300 flex flex-col items-center group/drop"
              onclick={() => fileInputEl?.click()}
            >
              <input 
                type="file" 
                bind:this={fileInputEl} 
                accept="image/*" 
                class="hidden" 
                onchange={handleFileChange}
              />
              <div class="w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-white/5 flex items-center justify-center mb-4 text-neutral-500 dark:text-neutral-400 group-hover/drop:text-brand-500 dark:group-hover/drop:text-brand-400 group-hover/drop:scale-105 transition-all">
                <Upload size={22} />
              </div>
              <h3 class="text-sm font-semibold text-neutral-800 dark:text-neutral-200 font-sans">
                Upload or Paste Screenshot
              </h3>
              <p class="text-xs text-neutral-500 mt-1.5 font-sans leading-normal max-w-[280px]">
                Drag your image here, click to browse, or simply press <kbd class="px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-950 rounded text-[10px] text-neutral-600 dark:text-neutral-400 border border-neutral-250 dark:border-white/5 font-mono">Ctrl + V</kbd> to paste from clipboard.
              </p>
            </div>

            <!-- Demo screenshots row -->
            <div class="space-y-3">
              <span class="text-xs font-bold text-neutral-500 dark:text-neutral-400 tracking-wider uppercase font-sans block">
                Or Test-Drive with a Demo Asset
              </span>
              <div class="grid grid-cols-2 gap-3">
                <button
                  class="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-neutral-900/60 border border-neutral-200 dark:border-white/5 hover:border-brand-500/30 hover:bg-neutral-50 dark:hover:bg-neutral-900 text-left transition-all cursor-pointer group"
                  onclick={() => editor.loadDemoScreenshot('/demo-code.png', 'app-logic.ts')}
                >
                  <div class="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-950 flex items-center justify-center text-brand-500 dark:text-brand-400 flex-shrink-0 group-hover:scale-105 transition-transform">
                    <Code size={18} />
                  </div>
                  <div>
                    <h4 class="text-xs font-bold text-neutral-800 dark:text-neutral-200 font-sans group-hover:text-brand-500 dark:group-hover:text-brand-400 transition-colors">
                      VS Code Editor View
                    </h4>
                    <p class="text-[10px] text-neutral-500 font-sans mt-0.5">
                      TypeScript code layout mockup
                    </p>
                  </div>
                </button>

                <button
                  class="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-neutral-900/60 border border-neutral-200 dark:border-white/5 hover:border-brand-500/30 hover:bg-neutral-50 dark:hover:bg-neutral-900 text-left transition-all cursor-pointer group"
                  onclick={() => editor.loadDemoScreenshot('/demo-dashboard.png', 'revenue-dashboard.png')}
                >
                  <div class="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-950 flex items-center justify-center text-brand-500 dark:text-brand-400 flex-shrink-0 group-hover:scale-105 transition-transform">
                    <BarChart3 size={18} />
                  </div>
                  <div>
                    <h4 class="text-xs font-bold text-neutral-800 dark:text-neutral-200 font-sans group-hover:text-brand-500 dark:group-hover:text-brand-400 transition-colors">
                      SaaS Analytics Charts
                    </h4>
                    <p class="text-[10px] text-neutral-500 font-sans mt-0.5">
                      Business metrics dashboard mock
                    </p>
                  </div>
                </button>
              </div>
            </div>

          </div>
        </div>
      {/if}

    </div>

    <!-- RIGHT: Controls Sidebar settings panel -->
    <div class="lg:col-span-1 lg:h-full lg:min-h-0">
      <SettingsPanel 
        {editor} 
        onDownload={handleDownload} 
        onCopy={handleCopyToClipboard} 
      />
    </div>

  </main>
</div>
