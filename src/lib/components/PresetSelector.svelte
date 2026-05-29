<script lang="ts">
  import { type ScreenshotEditor, PRESET_TEMPLATES } from '../editor.svelte';
  import { Sparkles } from '@lucide/svelte';

  let { editor } = $props<{ editor: ScreenshotEditor }>();
</script>

<div class="space-y-4">
  <div class="flex items-center gap-2 mb-2">
    <Sparkles size={16} class="text-brand-500 dark:text-brand-400" />
    <h3 class="text-xs font-semibold tracking-wider text-neutral-500 dark:text-neutral-400 uppercase font-sans">
      Quick Templates
    </h3>
  </div>

  <div class="grid grid-cols-2 gap-2.5">
    {#each PRESET_TEMPLATES as template (template.id)}
      <button
        class="group relative flex flex-col text-left rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 overflow-hidden transition-all duration-300 hover:border-brand-500/40 hover:shadow-lg hover:shadow-brand-500/5 cursor-pointer focus:outline-none"
        onclick={() => editor.applyPreset(template)}
      >
        <!-- Background preview -->
        <div 
          class="w-full h-16 transition-transform duration-300 group-hover:scale-105"
          style="
            {template.settings.bgType === 'solid' ? `background-color: ${template.settings.bgSolid};` : ''}
            {template.settings.bgType === 'gradient' ? `background: ${template.settings.bgGradient};` : ''}
            {template.settings.bgType === 'transparent' ? 'background: #cbd5e1; background-image: radial-gradient(#94a3b8 1px, transparent 1px); background-size: 8px 8px;' : ''}
            {template.settings.bgType === 'blur' ? 'background: linear-gradient(135deg, #1e1b4b 0%, #311042 100%);' : ''}
          "
        >
          <!-- Stylized card thumbnail mock inside background -->
          <div class="absolute inset-0 flex items-center justify-center p-3">
            <div 
              class="w-8/12 h-6 bg-black/60 rounded border border-white/10 flex items-center justify-start px-1"
              style="
                transform: rotateX({template.settings.tiltX || 0}deg) rotateY({template.settings.tiltY || 0}deg) scale(0.9);
                border-radius: {Math.min(4, (template.settings.borderRadius || 16) / 4)}px;
              "
            >
              {#if template.settings.frameStyle?.startsWith('macOS')}
                <div class="flex gap-0.5 scale-75 origin-left">
                  <div class="w-1 h-1 rounded-full bg-red-500"></div>
                  <div class="w-1 h-1 rounded-full bg-yellow-500"></div>
                  <div class="w-1 h-1 rounded-full bg-green-500"></div>
                </div>
              {/if}
            </div>
          </div>
        </div>

        <!-- Info area -->
        <div class="p-2 border-t border-neutral-200 dark:border-white/5 bg-neutral-100/50 dark:bg-neutral-950/80 w-full flex-1">
          <h4 class="text-xs font-semibold text-neutral-800 dark:text-neutral-200 font-sans group-hover:text-brand-500 dark:group-hover:text-brand-400 transition-colors">
            {template.name}
          </h4>
          <p class="text-[10px] text-neutral-500 dark:text-neutral-400 font-sans truncate leading-relaxed mt-0.5">
            {template.description || 'Quick layout config'}
          </p>
        </div>
      </button>
    {/each}
  </div>
</div>
