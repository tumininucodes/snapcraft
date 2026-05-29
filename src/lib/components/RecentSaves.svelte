<script lang="ts">
  import { type ScreenshotEditor } from '../editor.svelte';
  import { History, Trash2, Calendar, Layout } from '@lucide/svelte';

  let { editor } = $props<{ editor: ScreenshotEditor }>();

  function formatTime(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }
</script>

<div class="space-y-4">
  <div class="flex items-center gap-2 mb-2">
    <History size={16} class="text-brand-500 dark:text-brand-400" />
    <h3 class="text-xs font-semibold tracking-wider text-neutral-500 dark:text-neutral-400 uppercase font-sans">
      Recent Designs
    </h3>
  </div>

  {#if editor.savedDesigns.length === 0}
    <div class="rounded-xl border border-neutral-200 dark:border-white/5 bg-neutral-100/40 dark:bg-neutral-900/40 p-4 text-center select-none">
      <Layout size={24} class="mx-auto mb-2 text-neutral-400 dark:text-neutral-600 opacity-60" />
      <p class="text-xs text-neutral-600 dark:text-neutral-500 font-sans">
        Saved designs will appear here. Press "Save Design" under the Export tab.
      </p>
    </div>
  {:else}
    <div class="space-y-2 max-h-72 overflow-y-auto pr-1">
      {#each editor.savedDesigns as design (design.id)}
        <div
          class="group relative flex items-center gap-3 p-2 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 hover:border-brand-500/30 transition-all select-none w-full"
        >
          <!-- Small screenshot preview thumbnail -->
          <button
            class="flex-1 flex items-center gap-3 text-left cursor-pointer"
            onclick={() => editor.loadFromHistory(design)}
          >
            <div class="w-12 h-8 rounded border border-neutral-200 dark:border-white/10 overflow-hidden bg-neutral-100 dark:bg-black/40 flex-shrink-0 flex items-center justify-center">
              <img 
                src={design.screenshotUrl} 
                alt="history design thumbnail" 
                class="w-full h-auto max-h-full object-contain"
              />
            </div>
            
            <div class="min-w-0">
              <h4 class="text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate font-sans group-hover:text-brand-500 dark:group-hover:text-brand-400 transition-colors">
                {design.name}
              </h4>
              <div class="flex items-center gap-1 mt-0.5 text-[10px] text-neutral-500 dark:text-neutral-400 font-mono">
                <Calendar size={10} />
                <span>{formatTime(design.createdAt)}</span>
              </div>
            </div>
          </button>

          <!-- Delete save button -->
          <button
            class="p-1.5 rounded-md text-neutral-500 hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
            onclick={() => editor.deleteFromHistory(design.id)}
            title="Delete Save"
          >
            <Trash2 size={12} />
          </button>
        </div>
      {/each}
    </div>
  {/if}
</div>
