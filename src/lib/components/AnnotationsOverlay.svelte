<script lang="ts">
  import type { ScreenshotEditor } from '../editor.svelte';
  import type { Annotation } from '../types';
  import { Trash2, Move, Type, Check } from '@lucide/svelte';

  let { editor } = $props<{ editor: ScreenshotEditor }>();

  let containerEl = $state<HTMLDivElement | null>(null);
  let isDrawing = $state(false);
  let isDragging = $state(false);
  let dragMode = $state<'move' | 'resize' | 'arrow-end' | null>(null);
  let activeAnnotationId = $state<string | null>(null);
  let startX = $state(0);
  let startY = $state(0);
  let startW = $state(0);
  let startH = $state(0);

  // Content edit state for text annotations
  let editingTextId = $state<string | null>(null);
  let editTextInput = $state('');

  // Mouse coordinate converter to percentage (0 - 100)
  function getRelativeCoords(e: MouseEvent): { x: number; y: number } {
    if (!containerEl) return { x: 0, y: 0 };
    const rect = containerEl.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    return {
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y))
    };
  }

  // Handle pointer down on the overlay (creating new annotations)
  function handleMouseDown(e: MouseEvent) {
    if (editor.activeTool === 'none') {
      // Clear selection if clicking background
      if (e.target === containerEl) {
        editor.selectedAnnotationId = null;
        editingTextId = null;
      }
      return;
    }

    e.preventDefault();
    const coords = getRelativeCoords(e);
    isDrawing = true;

    // Create the annotation
    const newAnn = editor.addAnnotation(editor.activeTool, coords.x, coords.y);
    activeAnnotationId = newAnn.id;

    startX = coords.x;
    startY = coords.y;
  }

  // Handle pointer move on overlay (drawing or dragging existing)
  function handleMouseMove(e: MouseEvent) {
    if (isDrawing && activeAnnotationId) {
      const coords = getRelativeCoords(e);
      const ann = editor.annotations.find(a => a.id === activeAnnotationId);
      if (!ann) return;

      if (ann.type === 'blur' || ann.type === 'rect') {
        const x = Math.min(startX, coords.x);
        const y = Math.min(startY, coords.y);
        const w = Math.abs(startX - coords.x);
        const h = Math.abs(startY - coords.y);
        editor.updateAnnotation(activeAnnotationId, {
          x,
          y,
          width: w,
          height: h
        });
      } else if (ann.type === 'arrow') {
        editor.updateAnnotation(activeAnnotationId, {
          toX: coords.x,
          toY: coords.y
        });
      }
    } else if (isDragging && editor.selectedAnnotationId) {
      const coords = getRelativeCoords(e);
      const ann = editor.selectedAnnotation;
      if (!ann) return;

      if (dragMode === 'move') {
        const dx = coords.x - startX;
        const dy = coords.y - startY;
        
        let newX = ann.x + dx;
        let newY = ann.y + dy;

        // Bound validation
        newX = Math.max(0, Math.min(100 - (ann.width || 0), newX));
        newY = Math.max(0, Math.min(100 - (ann.height || 0), newY));

        editor.updateAnnotation(ann.id, {
          x: newX,
          y: newY
        });

        if (ann.type === 'arrow' && ann.toX !== undefined && ann.toY !== undefined) {
          editor.updateAnnotation(ann.id, {
            toX: Math.max(0, Math.min(100, ann.toX + dx)),
            toY: Math.max(0, Math.min(100, ann.toY + dy))
          });
        }

        startX = coords.x;
        startY = coords.y;
      } else if (dragMode === 'resize') {
        // Resizing bottom right corner
        const dw = coords.x - startX;
        const dh = coords.y - startY;

        editor.updateAnnotation(ann.id, {
          width: Math.max(2, startW + dw),
          height: Math.max(2, startH + dh)
        });
      } else if (dragMode === 'arrow-end') {
        editor.updateAnnotation(ann.id, {
          toX: coords.x,
          toY: coords.y
        });
      }
    }
  }

  // Handle pointer up
  function handleMouseUp() {
    if (isDrawing) {
      isDrawing = false;
      // Reset active tool back to 'none' after drawing one element
      editor.activeTool = 'none';
      
      // If it was text, put it in edit mode immediately
      const ann = editor.annotations.find(a => a.id === activeAnnotationId);
      if (ann && ann.type === 'text') {
        startEditingText(ann);
      }
      activeAnnotationId = null;
    }
    
    isDragging = false;
    dragMode = null;
  }

  // Drag start for existing annotation elements
  function startDragging(e: MouseEvent, ann: Annotation, mode: 'move' | 'resize' | 'arrow-end') {
    e.stopPropagation();
    e.preventDefault();
    editor.selectedAnnotationId = ann.id;
    isDragging = true;
    dragMode = mode;
    
    const coords = getRelativeCoords(e);
    startX = coords.x;
    startY = coords.y;
    startW = ann.width || 0;
    startH = ann.height || 0;
  }

  // Trigger double click to edit text box
  function startEditingText(ann: Annotation) {
    editingTextId = ann.id;
    editTextInput = ann.text || '';
  }

  function saveTextEdit() {
    if (editingTextId) {
      editor.updateAnnotation(editingTextId, { text: editTextInput });
      editingTextId = null;
    }
  }

  // Handle keypress inside input
  function handleTextKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      saveTextEdit();
    } else if (e.key === 'Escape') {
      editingTextId = null;
    }
  }

  // Allow deleting with keys
  $effect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (editingTextId) return; // Do not delete while typing
      if (editor.selectedAnnotationId && (e.key === 'Delete' || e.key === 'Backspace')) {
        editor.deleteAnnotation(editor.selectedAnnotationId);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div 
  bind:this={containerEl}
  class="absolute inset-0 z-30 select-none {editor.activeTool !== 'none' ? 'cursor-crosshair' : 'cursor-default'}"
  onmousedown={handleMouseDown}
  onmousemove={handleMouseMove}
  onmouseup={handleMouseUp}
>
  <!-- Render existing annotations -->
  {#each editor.annotations as a (a.id)}
    {@const isSelected = editor.selectedAnnotationId === a.id}
    
    {#if a.type === 'blur'}
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        class="absolute border border-red-500/30 backdrop-blur-xl group/ann {isSelected ? 'ring-2 ring-brand-500 shadow-lg' : ''}"
        style="left: {a.x}%; top: {a.y}%; width: {a.width}%; height: {a.height}%; backdrop-filter: blur(16px);"
        onmousedown={(e) => startDragging(e, a, 'move')}
      >
        <!-- Overlay checkered pattern to visualize blur area better -->
        <div class="absolute inset-0 bg-neutral-900/10 mix-blend-overlay"></div>

        <!-- Selection handles & Action overlay -->
        {#if isSelected}
          <!-- Delete button -->
          <button 
            class="absolute -top-8 right-0 bg-neutral-900 border border-white/10 rounded-md p-1 shadow-md hover:bg-red-950 text-neutral-300 hover:text-red-400 cursor-pointer"
            onclick={() => editor.deleteAnnotation(a.id)}
          >
            <Trash2 size={14} />
          </button>
          <!-- Drag icon center -->
          <div class="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover/ann:opacity-40 transition-opacity">
            <Move size={16} class="text-white" />
          </div>
          <!-- Resize handle bottom-right -->
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <div 
            class="absolute bottom-0 right-0 w-3.5 h-3.5 bg-brand-500 border border-white rounded-full translate-x-1/2 translate-y-1/2 cursor-se-resize z-50 shadow"
            onmousedown={(e) => startDragging(e, a, 'resize')}
          ></div>
        {/if}
      </div>

    {:else}
      <!-- Render Rectangles -->
      {#if a.type === 'rect'}
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
          class="absolute border-3 group/ann {isSelected ? 'ring-2 ring-brand-500/50 shadow-lg' : ''}"
          style="left: {a.x}%; top: {a.y}%; width: {a.width}%; height: {a.height}%; border-color: {a.color};"
          onmousedown={(e) => startDragging(e, a, 'move')}
        >
          {#if isSelected}
            <button 
              class="absolute -top-8 right-0 bg-neutral-900 border border-white/10 rounded-md p-1 shadow-md hover:bg-red-950 text-neutral-300 hover:text-red-400 cursor-pointer"
              onclick={() => editor.deleteAnnotation(a.id)}
            >
              <Trash2 size={14} />
            </button>
            <div class="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover/ann:opacity-40 transition-opacity">
              <Move size={16} class="text-white" />
            </div>
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div 
              class="absolute bottom-0 right-0 w-3.5 h-3.5 border border-white rounded-full translate-x-1/2 translate-y-1/2 cursor-se-resize z-50 shadow"
              style="background-color: {a.color};"
              onmousedown={(e) => startDragging(e, a, 'resize')}
            ></div>
          {/if}
        </div>
      {/if}

      <!-- Render Text -->
      {#if a.type === 'text'}
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
          class="absolute p-2 rounded-md transition-shadow group/ann cursor-move {isSelected ? 'bg-white/95 dark:bg-neutral-900/90 border border-neutral-200 dark:border-brand-500/50 shadow-xl' : 'hover:bg-black/10 dark:hover:bg-neutral-900/30'}"
          style="left: {a.x}%; top: {a.y}%; transform: translate(-10px, -10px);"
          onmousedown={(e) => startDragging(e, a, 'move')}
          ondblclick={() => startEditingText(a)}
        >
          {#if editingTextId === a.id}
            <div class="flex items-center gap-1.5 min-w-[120px]">
              <input 
                type="text" 
                bind:value={editTextInput} 
                onkeydown={handleTextKeyDown}
                class="bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-white/20 rounded px-1.5 py-0.5 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-brand-500 w-full"
                autoFocus
              />
              <button 
                class="bg-brand-600 rounded p-1 text-white hover:bg-brand-500 cursor-pointer"
                onclick={saveTextEdit}
              >
                <Check size={12} />
              </button>
            </div>
          {:else}
            <span 
              class="font-bold drop-shadow-md select-none block" 
              style="color: {a.color}; font-size: {a.fontSize || 16}px;"
            >
              {a.text}
            </span>
          {/if}

          {#if isSelected && editingTextId !== a.id}
            <div class="absolute -top-7 left-0 flex gap-1">
              <button 
                class="bg-neutral-900 border border-white/10 rounded-md p-1 shadow-md hover:bg-red-950 text-neutral-300 hover:text-red-400 cursor-pointer"
                onclick={() => editor.deleteAnnotation(a.id)}
              >
                <Trash2 size={12} />
              </button>
              <button 
                class="bg-neutral-900 border border-white/10 rounded-md p-1 shadow-md hover:bg-brand-900 text-neutral-300 hover:text-brand-400 cursor-pointer"
                onclick={() => startEditingText(a)}
              >
                <Type size={12} />
              </button>
            </div>
          {/if}
        </div>
      {/if}

      <!-- Render Badge steps -->
      {#if a.type === 'badge'}
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
          class="absolute w-8 h-8 rounded-full flex items-center justify-center font-bold text-white shadow-lg cursor-move transition-transform duration-100 hover:scale-110 active:scale-95 group/ann"
          style="left: {a.x}%; top: {a.y}%; transform: translate(-50%, -50%); background-color: {a.color};"
          onmousedown={(e) => startDragging(e, a, 'move')}
        >
          {a.badgeNumber}

          {#if isSelected}
            <button 
              class="absolute -top-8 bg-neutral-900 border border-white/10 rounded-md p-1 shadow-md hover:bg-red-950 text-neutral-300 hover:text-red-400 cursor-pointer"
              onclick={() => editor.deleteAnnotation(a.id)}
            >
              <Trash2 size={12} />
            </button>
          {/if}
        </div>
      {/if}
    {/if}
  {/each}

  <!-- Render SVG Arrow Overlay -->
  {#if editor.annotations.some(a => a.type === 'arrow')}
    <svg class="absolute inset-0 w-full h-full pointer-events-none z-20">
      <defs>
        <!-- Arrowhead markers -->
        {#each editor.annotations.filter(a => a.type === 'arrow') as a (a.id)}
          <marker
            id="arrowhead-{a.id}"
            markerWidth="10"
            markerHeight="8"
            refX="6"
            refY="4"
            orient="auto"
          >
            <polygon points="0 0, 10 4, 0 8" fill={a.color} />
          </marker>
        {/each}
      </defs>

      {#each editor.annotations.filter(a => a.type === 'arrow') as a (a.id)}
        {@const isSelected = editor.selectedAnnotationId === a.id}
        {@const startXPercent = `${a.x}%`}
        {@const startYPercent = `${a.y}%`}
        {@const endXPercent = `${a.toX ?? a.x + 10}%`}
        {@const endYPercent = `${a.toY ?? a.y + 10}%`}

        <!-- Interactive line for clicking/selection -->
        <line
          x1={startXPercent}
          y1={startYPercent}
          x2={endXPercent}
          y2={endYPercent}
          stroke="transparent"
          stroke-width="16"
          class="cursor-pointer pointer-events-auto"
          onmousedown={(e) => startDragging(e, a, 'move')}
        />

        <!-- Rendered visible line -->
        <line
          x1={startXPercent}
          y1={startYPercent}
          x2={endXPercent}
          y2={endYPercent}
          stroke={a.color}
          stroke-width={isSelected ? 4 : 3}
          marker-end="url(#arrowhead-{a.id})"
        />

        <!-- End points for visual handles -->
        {#if isSelected}
          <!-- Start point selector -->
          <circle
            cx={startXPercent}
            cy={startYPercent}
            r="6"
            fill="#ffffff"
            stroke={a.color}
            stroke-width="2"
            class="pointer-events-auto cursor-move shadow"
            onmousedown={(e) => startDragging(e, a, 'move')}
          />
          <!-- End point handle -->
          <circle
            cx={endXPercent}
            cy={endYPercent}
            r="6"
            fill="#ffffff"
            stroke={a.color}
            stroke-width="2"
            class="pointer-events-auto cursor-crosshair shadow"
            onmousedown={(e) => startDragging(e, a, 'arrow-end')}
          />
        {/if}
      {/each}
    </svg>
    
    <!-- Arrow Action Floating Panel -->
    {#each editor.annotations.filter(a => a.type === 'arrow') as a (a.id)}
      {#if editor.selectedAnnotationId === a.id}
        {@const midX = ((a.x + (a.toX ?? a.x)) / 2)}
        {@const midY = ((a.y + (a.toY ?? a.y)) / 2)}
        <div 
          class="absolute z-50 -translate-x-1/2 -translate-y-1/2"
          style="left: {midX}%; top: {midY}%;"
        >
          <button 
            class="bg-neutral-900 border border-white/10 rounded-md p-1 shadow-md hover:bg-red-950 text-neutral-300 hover:text-red-400 cursor-pointer"
            onclick={() => editor.deleteAnnotation(a.id)}
          >
            <Trash2 size={12} />
          </button>
        </div>
      {/if}
    {/each}
  {/if}
</div>
