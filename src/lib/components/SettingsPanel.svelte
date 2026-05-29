<script lang="ts">
  import { type ScreenshotEditor, PRESET_GRADIENTS, PRESET_SOLIDS } from '../editor.svelte';
  import { 
    LayoutGrid, 
    Sliders, 
    Compass, 
    Edit3, 
    Download, 
    ArrowUpRight, 
    Undo, 
    Plus,
    Circle,
    Type,
    ArrowRight,
    Square,
    EyeOff,
    Check,
    Save
  } from '@lucide/svelte';
  import PresetSelector from './PresetSelector.svelte';
  import RecentSaves from './RecentSaves.svelte';

  let { editor, onDownload, onCopy } = $props<{ 
    editor: ScreenshotEditor;
    onDownload: () => void;
    onCopy: () => void;
  }>();

  // Active Sidebar Tab state
  type Tab = 'canvas' | 'style' | 'tilt' | 'annotate' | 'export';
  let activeTab = $state<Tab>('canvas');

  // Input for naming a save design
  let saveDesignName = $state('My Beautified Shot');

  // Annotations support
  const tools = [
    { id: 'blur', name: 'Censor Blur', icon: EyeOff, desc: 'Blur out passwords & emails' },
    { id: 'text', name: 'Callout Text', icon: Type, desc: 'Add customizable overlay text' },
    { id: 'arrow', name: 'Pointer Arrow', icon: ArrowRight, desc: 'Draw guidance arrows' },
    { id: 'rect', name: 'Highlight Box', icon: Square, desc: 'Highlight sections with borders' },
    { id: 'badge', name: 'Step Badge', icon: Circle, desc: 'Add step-by-step indicator dots' }
  ] as const;

  function selectTool(toolId: typeof editor.activeTool) {
    editor.activeTool = editor.activeTool === toolId ? 'none' : toolId;
    editor.selectedAnnotationId = null;
  }

  function handleSaveDesign() {
    editor.saveToHistory(saveDesignName);
    // Flash visual feedback or trigger alert
    alert('Design successfully saved to history!');
  }
</script>

<div class="w-full flex flex-col h-full bg-white dark:bg-neutral-900/60 backdrop-blur-xl border border-neutral-200/50 dark:border-white/5 rounded-2xl overflow-hidden shadow-2xl transition-colors duration-300">
  <!-- Tab navigation -->
  <div class="grid grid-cols-5 border-b border-neutral-200 dark:border-white/5 bg-neutral-100/40 dark:bg-neutral-950/40 p-1">
    <button
      class="flex flex-col items-center gap-1 py-2 px-1.5 rounded-lg text-center cursor-pointer transition-all {activeTab === 'canvas' ? 'bg-neutral-200/50 dark:bg-neutral-900 text-brand-600 dark:text-brand-400' : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'}"
      onclick={() => activeTab = 'canvas'}
      title="Canvas Size & Background"
    >
      <LayoutGrid size={16} />
      <span class="text-[10px] font-medium font-sans">Canvas</span>
    </button>
    <button
      class="flex flex-col items-center gap-1 py-2 px-1.5 rounded-lg text-center cursor-pointer transition-all {activeTab === 'style' ? 'bg-neutral-200/50 dark:bg-neutral-900 text-brand-600 dark:text-brand-400' : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'}"
      onclick={() => activeTab = 'style'}
      title="Window Frame & Shadow Style"
    >
      <Sliders size={16} />
      <span class="text-[10px] font-medium font-sans">Frame</span>
    </button>
    <button
      class="flex flex-col items-center gap-1 py-2 px-1.5 rounded-lg text-center cursor-pointer transition-all {activeTab === 'tilt' ? 'bg-neutral-200/50 dark:bg-neutral-900 text-brand-600 dark:text-brand-400' : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'}"
      onclick={() => activeTab = 'tilt'}
      title="3D Tilt Rotations"
    >
      <Compass size={16} />
      <span class="text-[10px] font-medium font-sans">3D Space</span>
    </button>
    <button
      class="flex flex-col items-center gap-1 py-2 px-1.5 rounded-lg text-center cursor-pointer transition-all {activeTab === 'annotate' ? 'bg-neutral-200/50 dark:bg-neutral-900 text-brand-600 dark:text-brand-400' : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'}"
      onclick={() => activeTab = 'annotate'}
      title="Mask & Annotate Image"
    >
      <Edit3 size={16} />
      <span class="text-[10px] font-medium font-sans">Annotate</span>
    </button>
    <button
      class="flex flex-col items-center gap-1 py-2 px-1.5 rounded-lg text-center cursor-pointer transition-all {activeTab === 'export' ? 'bg-neutral-200/50 dark:bg-neutral-900 text-brand-600 dark:text-brand-400' : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'}"
      onclick={() => activeTab = 'export'}
      title="Export Settings"
    >
      <Download size={16} />
      <span class="text-[10px] font-medium font-sans">Export</span>
    </button>
  </div>

  <!-- Tab Content (Scrollable) -->
  <div class="flex-1 overflow-y-auto p-4 space-y-6">
    
    <!-- CANVAS TAB -->
    {#if activeTab === 'canvas'}
      <div class="space-y-5">
        <!-- Aspect Ratio -->
        <div class="space-y-2">
          <label class="text-xs font-semibold text-neutral-600 dark:text-neutral-300 font-sans">Canvas Dimensions</label>
          <div class="grid grid-cols-5 gap-1.5 bg-neutral-100 dark:bg-neutral-950 p-1 rounded-lg border border-neutral-200 dark:border-white/5">
            {#each ['auto', '1:1', '16:9', '4:3', '9:16'] as r}
              <button
                class="py-1.5 rounded text-[10px] font-bold font-sans cursor-pointer transition-all uppercase {editor.settings.aspectRatio === r ? 'bg-brand-600 text-white' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'}"
                onclick={() => editor.settings.aspectRatio = r as any}
              >
                {r}
              </button>
            {/each}
          </div>
        </div>

        <!-- Scale Slider -->
        <div class="space-y-2">
          <div class="flex justify-between items-center text-xs font-semibold text-neutral-600 dark:text-neutral-300 font-sans">
            <span>Screenshot Scale</span>
            <span class="font-mono text-neutral-400">{editor.settings.scale}%</span>
          </div>
          <input 
            type="range" min="50" max="100" step="1" 
            bind:value={editor.settings.scale}
            class="w-full accent-brand-500 h-1 bg-neutral-100 dark:bg-neutral-950 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <!-- Padding Slider -->
        <div class="space-y-2">
          <div class="flex justify-between items-center text-xs font-semibold text-neutral-600 dark:text-neutral-300 font-sans">
            <span>Canvas Padding</span>
            <span class="font-mono text-neutral-400">{editor.settings.padding}px</span>
          </div>
          <input 
            type="range" min="0" max="128" step="4" 
            bind:value={editor.settings.padding}
            class="w-full accent-brand-500 h-1 bg-neutral-100 dark:bg-neutral-950 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <!-- Alignment Controls -->
        <div class="space-y-2">
          <label class="text-xs font-semibold text-neutral-600 dark:text-neutral-300 font-sans">Align Position</label>
          <div class="grid grid-cols-2 gap-2">
            <!-- Align X -->
            <div class="flex flex-col gap-1">
              <span class="text-[10px] text-neutral-500 dark:text-neutral-400 font-sans font-medium">Horizontal</span>
              <div class="flex bg-neutral-100 dark:bg-neutral-950 p-0.5 rounded-md border border-neutral-200 dark:border-white/5 gap-0.5">
                {#each ['left', 'center', 'right'] as align}
                  <button
                    class="flex-1 py-1 rounded text-[10px] capitalize font-sans font-bold cursor-pointer transition-all {editor.settings.alignX === align ? 'bg-white text-neutral-900 dark:bg-neutral-800 dark:text-white shadow-sm' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'}"
                    onclick={() => editor.settings.alignX = align as any}
                  >
                    {align}
                  </button>
                {/each}
              </div>
            </div>
            <!-- Align Y -->
            <div class="flex flex-col gap-1">
              <span class="text-[10px] text-neutral-500 dark:text-neutral-400 font-sans font-medium">Vertical</span>
              <div class="flex bg-neutral-100 dark:bg-neutral-950 p-0.5 rounded-md border border-neutral-200 dark:border-white/5 gap-0.5">
                {#each ['top', 'center', 'bottom'] as align}
                  <button
                    class="flex-1 py-1 rounded text-[10px] capitalize font-sans font-bold cursor-pointer transition-all {editor.settings.alignY === align ? 'bg-white text-neutral-900 dark:bg-neutral-800 dark:text-white shadow-sm' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'}"
                    onclick={() => editor.settings.alignY = align as any}
                  >
                    {align}
                  </button>
                {/each}
              </div>
            </div>
          </div>
        </div>

        <hr class="border-neutral-200 dark:border-white/5 my-2" />

        <!-- Background Type -->
        <div class="space-y-3">
          <label class="text-xs font-semibold text-neutral-600 dark:text-neutral-300 font-sans">Background Fill</label>
          <div class="grid grid-cols-4 gap-1 bg-neutral-100 dark:bg-neutral-950 p-1 rounded-lg border border-neutral-200 dark:border-white/5">
            {#each ['gradient', 'solid', 'blur', 'transparent'] as type}
              <button
                class="py-1 rounded text-[10px] font-bold font-sans cursor-pointer transition-all capitalize {editor.settings.bgType === type ? 'bg-brand-600 text-white' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'}"
                onclick={() => editor.settings.bgType = type as any}
              >
                {type}
              </button>
            {/each}
          </div>

          <!-- Gradient Selector -->
          {#if editor.settings.bgType === 'gradient'}
            <div class="space-y-2">
              <span class="text-[10px] text-neutral-400 font-sans font-semibold">Preset Gradients</span>
              <div class="grid grid-cols-5 gap-2">
                {#each PRESET_GRADIENTS as gradient, i}
                  <button
                    class="w-full aspect-square rounded-md border-2 cursor-pointer transition-all hover:scale-105 {editor.settings.bgGradientIndex === i && editor.settings.bgType === 'gradient' ? 'border-brand-500 scale-105 shadow' : 'border-transparent hover:border-neutral-300 dark:hover:border-white/20'}"
                    style="background: {gradient.value};"
                    onclick={() => {
                      editor.settings.bgGradientIndex = i;
                      editor.settings.bgGradient = gradient.value;
                    }}
                    title={gradient.name}
                  ></button>
                {/each}
              </div>
            </div>
          {/if}

          <!-- Solid Selector -->
          {#if editor.settings.bgType === 'solid'}
            <div class="space-y-2">
              <span class="text-[10px] text-neutral-500 dark:text-neutral-400 font-sans font-semibold">Solid Palette</span>
              <div class="grid grid-cols-4 gap-2">
                {#each PRESET_SOLIDS as solid}
                  <button
                    class="w-full h-8 rounded-md border-2 cursor-pointer transition-all hover:scale-105 flex items-center justify-center {editor.settings.bgSolid === solid.value ? 'border-brand-500 scale-105' : 'border-transparent hover:border-neutral-300 dark:hover:border-white/20'}"
                    style="background-color: {solid.value};"
                    onclick={() => editor.settings.bgSolid = solid.value}
                    title={solid.name}
                  >
                    {#if solid.value === '#ffffff'}
                      <div class="w-2 h-2 rounded-full bg-black/80"></div>
                    {/if}
                  </button>
                {/each}
              </div>
              
              <!-- Custom color picker -->
              <div class="flex items-center gap-3 bg-neutral-100 dark:bg-neutral-950 p-2 border border-neutral-200 dark:border-white/5 rounded-lg">
                <input 
                  type="color" 
                  bind:value={editor.settings.bgSolid}
                  class="w-8 h-8 rounded border-0 bg-transparent cursor-pointer p-0"
                />
                <div class="flex-1">
                  <span class="text-[10px] text-neutral-500 dark:text-neutral-400 block font-sans">Custom Hex Color</span>
                  <input 
                    type="text" 
                    bind:value={editor.settings.bgSolid} 
                    class="text-xs font-mono bg-transparent border-0 text-neutral-800 dark:text-white w-full p-0 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          {/if}
        </div>

        <hr class="border-white/5 my-2" />
        
        <!-- Preset Selector component -->
        <PresetSelector {editor} />

        <hr class="border-white/5 my-2" />

        <!-- Recent Saves component -->
        <RecentSaves {editor} />
      </div>
    {/if}


    <!-- STYLE & FRAME TAB -->
    {#if activeTab === 'style'}
      <div class="space-y-5">
        <!-- Window Mockup -->
        <div class="space-y-2.5">
          <label class="text-xs font-semibold text-neutral-600 dark:text-neutral-300 font-sans">Window Mockup Frame</label>
          <div class="grid grid-cols-2 gap-2">
            {#each [
              { id: 'none', label: 'None (Simple Card)' },
              { id: 'macOS-dark', label: 'macOS (Dark)' },
              { id: 'macOS-light', label: 'macOS (Light)' },
              { id: 'windows-dark', label: 'Windows (Dark)' },
              { id: 'windows-light', label: 'Windows (Light)' },
              { id: 'browser-dark', label: 'Browser (Dark)' },
              { id: 'browser-light', label: 'Browser (Light)' }
            ] as f}
              <button
                class="py-2.5 px-2 rounded-lg text-xs text-left cursor-pointer border font-sans font-medium transition-all {editor.settings.frameStyle === f.id ? 'bg-brand-600/10 border-brand-500 text-brand-600 dark:text-brand-400' : 'bg-neutral-100 dark:bg-neutral-950 border-neutral-200 dark:border-white/5 text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-white'}"
                onclick={() => editor.settings.frameStyle = f.id as any}
              >
                {f.label}
              </button>
            {/each}
          </div>
        </div>

        <hr class="border-neutral-200 dark:border-white/5 my-1" />

        <!-- Border Radius Slider -->
        <div class="space-y-2">
          <div class="flex justify-between items-center text-xs font-semibold text-neutral-600 dark:text-neutral-300 font-sans">
            <span>Corner Rounding</span>
            <span class="font-mono text-neutral-400">{editor.settings.borderRadius}px</span>
          </div>
          <input 
            type="range" min="0" max="48" step="2" 
            bind:value={editor.settings.borderRadius}
            class="w-full accent-brand-500 h-1 bg-neutral-100 dark:bg-neutral-950 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <!-- Box Shadows Options -->
        <div class="space-y-2">
          <label class="text-xs font-semibold text-neutral-600 dark:text-neutral-300 font-sans">Shadow Effects</label>
          <div class="grid grid-cols-3 gap-1.5 bg-neutral-100 dark:bg-neutral-950 p-1 rounded-lg border border-neutral-200 dark:border-white/5">
            {#each ['none', 'soft', 'medium', 'hard', 'double', 'glow'] as s}
              <button
                class="py-1.5 rounded text-[10px] font-bold font-sans cursor-pointer transition-all capitalize {editor.settings.shadowDepth === s ? 'bg-brand-600 text-white' : 'text-neutral-550 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'}"
                onclick={() => editor.settings.shadowDepth = s as any}
              >
                {s}
              </button>
            {/each}
          </div>
        </div>

        <hr class="border-neutral-200 dark:border-white/5 my-1" />

        <!-- Inset Border Settings -->
        <div class="space-y-4">
          <label class="text-xs font-semibold text-neutral-600 dark:text-neutral-300 font-sans">Card Border Overlay</label>
          
          <!-- Border Width -->
          <div class="space-y-1.5">
            <div class="flex justify-between items-center text-[10px] text-neutral-500 dark:text-neutral-400 font-medium font-sans">
              <span>Border Width</span>
              <span class="font-mono">{editor.settings.borderWidth}px</span>
            </div>
            <input 
              type="range" min="0" max="8" step="1" 
              bind:value={editor.settings.borderWidth}
              class="w-full accent-brand-500 h-1 bg-neutral-100 dark:bg-neutral-950 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <!-- Border Opacity -->
          <div class="space-y-1.5">
            <div class="flex justify-between items-center text-[10px] text-neutral-550 dark:text-neutral-400 font-medium font-sans">
              <span>Border Opacity</span>
              <span class="font-mono">{editor.settings.borderOpacity}%</span>
            </div>
            <input 
              type="range" min="0" max="100" step="5" 
              bind:value={editor.settings.borderOpacity}
              class="w-full accent-brand-500 h-1 bg-neutral-100 dark:bg-neutral-950 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <!-- Border Color picker -->
          <div class="flex items-center gap-3 bg-neutral-100 dark:bg-neutral-950 p-2 border border-neutral-200 dark:border-white/5 rounded-lg">
            <input 
              type="color" 
              bind:value={editor.settings.borderColor}
              class="w-8 h-8 rounded border-0 bg-transparent cursor-pointer p-0"
            />
            <div class="flex-1">
              <span class="text-[10px] text-neutral-500 dark:text-neutral-400 block font-sans">Border Color</span>
              <input 
                type="text" 
                bind:value={editor.settings.borderColor} 
                class="text-xs font-mono bg-transparent border-0 text-neutral-800 dark:text-white w-full p-0 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    {/if}


    <!-- 3D & PERSPECTIVE TAB -->
    {#if activeTab === 'tilt'}
      <div class="space-y-5">
        <div class="flex justify-between items-center">
          <label class="text-xs font-semibold text-neutral-600 dark:text-neutral-300 font-sans">3D Space Tilt</label>
          
          <!-- Reset buttons -->
          <button
            class="flex items-center gap-1 text-[10px] font-bold text-neutral-500 dark:text-neutral-400 hover:text-neutral-850 dark:hover:text-white bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-white/5 px-2 py-1 rounded cursor-pointer"
            onclick={() => {
              editor.settings.tiltX = 0;
              editor.settings.tiltY = 0;
            }}
          >
            <Undo size={10} />
            <span>Reset Angles</span>
          </button>
        </div>

        <p class="text-[10px] text-neutral-400 leading-relaxed font-sans">
          Give your screenshot a modern, isometric mockup look by tilting it along its X and Y axes. Works best with 16:9 canvas dimensions.
        </p>

        <!-- Tilt X Slider -->
        <div class="space-y-2">
          <div class="flex justify-between items-center text-xs font-semibold text-neutral-600 dark:text-neutral-300 font-sans">
            <span>X-Axis Rotation (Pitch)</span>
            <span class="font-mono text-neutral-400">{editor.settings.tiltX}°</span>
          </div>
          <input 
            type="range" min="-30" max="30" step="1" 
            bind:value={editor.settings.tiltX}
            class="w-full accent-brand-500 h-1 bg-neutral-100 dark:bg-neutral-950 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <!-- Tilt Y Slider -->
        <div class="space-y-2">
          <div class="flex justify-between items-center text-xs font-semibold text-neutral-600 dark:text-neutral-300 font-sans">
            <span>Y-Axis Rotation (Yaw)</span>
            <span class="font-mono text-neutral-400">{editor.settings.tiltY}°</span>
          </div>
          <input 
            type="range" min="-30" max="30" step="1" 
            bind:value={editor.settings.tiltY}
            class="w-full accent-brand-500 h-1 bg-neutral-100 dark:bg-neutral-950 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <!-- Perspective Slider -->
        <div class="space-y-2">
          <div class="flex justify-between items-center text-xs font-semibold text-neutral-600 dark:text-neutral-300 font-sans">
            <span>3D Camera Depth</span>
            <span class="font-mono text-neutral-400">{editor.settings.perspective}px</span>
          </div>
          <input 
            type="range" min="500" max="2000" step="50" 
            bind:value={editor.settings.perspective}
            class="w-full accent-brand-500 h-1 bg-neutral-100 dark:bg-neutral-950 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>
    {/if}


    <!-- ANNOTATIONS TAB -->
    {#if activeTab === 'annotate'}
      <div class="space-y-5">
        <label class="text-xs font-semibold text-neutral-600 dark:text-neutral-300 font-sans block">Annotation Tools</label>
        
        <p class="text-[10px] text-neutral-400 leading-relaxed font-sans">
          Select a tool below, then **click and drag** directly on the screenshot image to draw. Select an annotation to resize, edit or delete it.
        </p>

        <!-- Tools grid -->
        <div class="space-y-2">
          {#each tools as tool}
            {@const isActive = editor.activeTool === tool.id}
            <button
              class="w-full flex items-start gap-3 p-3 rounded-lg border text-left cursor-pointer transition-all {isActive ? 'bg-brand-600/10 border-brand-500 text-brand-600 dark:text-brand-400 shadow-md shadow-brand-500/5' : 'bg-neutral-100 dark:bg-neutral-950 border-neutral-200 dark:border-white/5 text-neutral-600 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-white/10'}"
              onclick={() => selectTool(tool.id)}
            >
              <div class="p-1.5 rounded-md {isActive ? 'bg-brand-600 text-white' : 'bg-neutral-200 text-neutral-500 dark:bg-neutral-950 dark:text-neutral-400'} mt-0.5">
                <tool.icon size={16} />
              </div>
              <div class="min-w-0">
                <span class="text-xs font-bold font-sans block {isActive ? 'text-brand-600 dark:text-brand-400' : 'text-neutral-800 dark:text-neutral-200'}">
                  {tool.name}
                </span>
                <span class="text-[10px] text-neutral-500 dark:text-neutral-400 font-sans block truncate leading-normal">
                  {tool.desc}
                </span>
              </div>
            </button>
          {/each}
        </div>

        <hr class="border-neutral-200 dark:border-white/5 my-1" />

        <!-- Annotation color brush picker -->
        <div class="space-y-2.5">
          <span class="text-[10px] text-neutral-400 font-sans font-semibold">Annotation Color</span>
          <div class="flex items-center gap-2">
            {#each ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#ffffff'] as c}
              <button
                class="w-6 h-6 rounded-full border cursor-pointer hover:scale-110 transition-transform {editor.brushColor === c ? 'border-white scale-110' : 'border-transparent'}"
                style="background-color: {c};"
                onclick={() => {
                  editor.brushColor = c;
                  // If something is selected, change its color too!
                  if (editor.selectedAnnotationId) {
                    editor.updateAnnotation(editor.selectedAnnotationId, { color: c });
                  }
                }}
              ></button>
            {/each}
            
            <!-- Color picker input -->
            <input 
              type="color" 
              bind:value={editor.brushColor}
              class="w-6 h-6 rounded-full border border-neutral-700 bg-transparent cursor-pointer p-0"
              oninput={() => {
                if (editor.selectedAnnotationId) {
                  editor.updateAnnotation(editor.selectedAnnotationId, { color: editor.brushColor });
                }
              }}
            />
          </div>
        </div>
      </div>
    {/if}


    <!-- EXPORT TAB -->
    {#if activeTab === 'export'}
      <div class="space-y-5">
        <!-- Watermark settings -->
        <div class="space-y-4 bg-neutral-100 dark:bg-neutral-950/60 border border-neutral-200 dark:border-white/5 p-3 rounded-xl">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-neutral-600 dark:text-neutral-300 font-sans">Branding Watermark</span>
            <input 
              type="checkbox" 
              bind:checked={editor.settings.watermarkEnabled}
              class="accent-brand-500 w-4 h-4 cursor-pointer"
            />
          </div>
          
          {#if editor.settings.watermarkEnabled}
            <div class="space-y-3 pt-1">
              <!-- Watermark text -->
              <div class="space-y-1">
                <span class="text-[10px] text-neutral-500 dark:text-neutral-400 font-sans font-medium">Text</span>
                <input 
                  type="text" 
                  bind:value={editor.settings.watermarkText}
                  class="w-full text-xs bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-white/10 rounded px-2.5 py-1.5 focus:outline-none focus:border-brand-500 text-neutral-800 dark:text-white"
                />
              </div>

              <!-- Watermark position -->
              <div class="space-y-1">
                <span class="text-[10px] text-neutral-500 dark:text-neutral-400 font-sans font-medium">Position</span>
                <select 
                  bind:value={editor.settings.watermarkPosition}
                  class="w-full text-xs bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-white/10 rounded px-2 py-1.5 focus:outline-none focus:border-brand-500 text-neutral-800 dark:text-neutral-200"
                >
                  <option value="bottom-right">Bottom Right</option>
                  <option value="bottom-left">Bottom Left</option>
                  <option value="top-right">Top Right</option>
                  <option value="top-left">Top Left</option>
                </select>
              </div>

              <!-- Watermark opacity -->
              <div class="space-y-1">
                <div class="flex justify-between items-center text-[10px] text-neutral-550 dark:text-neutral-400 font-sans font-medium">
                  <span>Opacity</span>
                  <span>{editor.settings.watermarkOpacity}%</span>
                </div>
                <input 
                  type="range" min="10" max="100" step="5" 
                  bind:value={editor.settings.watermarkOpacity}
                  class="w-full accent-brand-500 h-1 bg-neutral-100 dark:bg-neutral-950 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          {/if}
        </div>

        <hr class="border-neutral-200 dark:border-white/5 my-1" />

        <!-- Export settings -->
        <div class="space-y-4">
          <label class="text-xs font-semibold text-neutral-600 dark:text-neutral-300 font-sans">Format & Resolution</label>

          <!-- Export Multiplier -->
          <div class="space-y-1.5">
            <span class="text-[10px] text-neutral-400 font-medium font-sans block">Resolution (Crispness multiplier)</span>
            <div class="grid grid-cols-3 gap-1 bg-neutral-100 dark:bg-neutral-950 p-0.5 rounded-lg border border-neutral-200 dark:border-white/5">
              {#each [1, 2, 3] as mult}
                <button
                  class="py-1 rounded text-xs font-bold font-mono cursor-pointer transition-all {editor.settings.exportMultiplier === mult ? 'bg-white text-neutral-900 dark:bg-neutral-800 dark:text-white shadow-sm' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'}"
                  onclick={() => editor.settings.exportMultiplier = mult}
                >
                  {mult}x
                </button>
              {/each}
            </div>
          </div>

          <!-- Format selection -->
          <div class="space-y-1.5">
            <span class="text-[10px] text-neutral-550 dark:text-neutral-400 font-medium font-sans block">File Format</span>
            <div class="grid grid-cols-3 gap-1 bg-neutral-100 dark:bg-neutral-950 p-0.5 rounded-lg border border-neutral-200 dark:border-white/5">
              {#each ['png', 'jpeg', 'webp'] as fmt}
                <button
                  class="py-1 rounded text-xs font-bold font-sans cursor-pointer transition-all uppercase {editor.settings.exportFormat === fmt ? 'bg-white text-neutral-900 dark:bg-neutral-800 dark:text-white shadow-sm' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'}"
                  onclick={() => editor.settings.exportFormat = fmt as any}
                >
                  {fmt}
                </button>
              {/each}
            </div>
          </div>

          <!-- JPEG/WebP quality slider -->
          {#if editor.settings.exportFormat !== 'png'}
            <div class="space-y-2">
              <div class="flex justify-between items-center text-[10px] text-neutral-400 font-medium font-sans">
                <span>Compression Quality</span>
                <span class="font-mono">{editor.settings.exportQuality}%</span>
              </div>
              <input 
                type="range" min="30" max="100" step="5" 
                bind:value={editor.settings.exportQuality}
                class="w-full accent-brand-500 h-1 bg-neutral-100 dark:bg-neutral-950 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          {/if}
        </div>

        <hr class="border-neutral-200 dark:border-white/5 my-1" />

        <!-- Design History Saving -->
        <div class="space-y-3 bg-neutral-100 dark:bg-neutral-950/40 border border-neutral-200 dark:border-white/5 p-3 rounded-xl">
          <span class="text-xs font-semibold text-neutral-600 dark:text-neutral-300 font-sans block">Save Design Configuration</span>
          <div class="flex items-center gap-2">
            <input 
              type="text" 
              bind:value={saveDesignName}
              placeholder="e.g. Purple macOS gradient"
              class="flex-1 text-xs bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-white/10 rounded px-2.5 py-1.5 focus:outline-none focus:border-brand-500 text-neutral-800 dark:text-white"
            />
            <button 
              class="bg-neutral-800 border border-neutral-200 dark:border-white/5 hover:bg-neutral-750 rounded p-1.5 text-neutral-200 hover:text-white cursor-pointer"
              onclick={handleSaveDesign}
              title="Save Config"
            >
              <Save size={16} />
            </button>
          </div>
        </div>
      </div>
    {/if}

  </div>

  <!-- Bottom Trigger Actions (Download & Copy to Clipboard) -->
  <div class="p-4 border-t border-neutral-200 dark:border-white/5 bg-neutral-50 dark:bg-neutral-100 dark:bg-neutral-950/80 flex flex-col gap-2">
    {#if editor.screenshot}
      <button
        class="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 font-bold text-sm text-white shadow-lg shadow-brand-600/10 active:scale-98 transition-all cursor-pointer font-sans"
        onclick={onDownload}
      >
        <Download size={16} />
        <span>Download {editor.settings.exportFormat.toUpperCase()}</span>
      </button>

      <button
        class="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-neutral-200 hover:bg-neutral-350 text-neutral-800 dark:bg-neutral-800 dark:hover:bg-neutral-750 dark:text-neutral-200 border border-neutral-350 dark:border-white/5 hover:text-neutral-950 dark:hover:text-white transition-all cursor-pointer font-sans"
        onclick={onCopy}
      >
        <ArrowUpRight size={14} />
        <span>Copy to Clipboard</span>
      </button>
    {:else}
      <button
        disabled
        class="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-neutral-200 dark:bg-neutral-850 text-neutral-400 dark:text-neutral-500 font-bold text-sm select-none opacity-50 cursor-not-allowed font-sans"
      >
        <Download size={16} />
        <span>Download Image</span>
      </button>
    {/if}
  </div>
</div>
