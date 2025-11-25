<template>
  <div class="min-h-screen min-w-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 lg:p-8 overflow-x-hidden">
    <div class="w-full mx-auto">
      <h1 class="text-3xl lg:text-4xl font-bold text-white mb-2 text-center">
        Algorithm Visualizer
      </h1>
      <p class="text-sm lg:text-base text-slate-300 text-center mb-6 lg:mb-8">
        Step-by-step visualization for teaching sorting algorithms
      </p>

      <!-- Algorithm Selection -->
      <div class="bg-white/10 backdrop-blur-lg rounded-xl p-4 lg:p-6 mb-4 lg:mb-6 border border-white/20">
        <h2 class="text-lg lg:text-xl font-semibold text-white mb-3 lg:mb-4">Configuration</h2>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">
              Algorithm
            </label>
            <select
              v-model="selectedAlgorithm"
              class="w-full px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option
                v-for="(config, key) in ALGORITHMS"
                :key="key"
                :value="key"
                class="bg-slate-800"
              >
                {{ config.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">
              Pivot Strategy
            </label>
            <select
              v-model="pivotStrategy"
              class="w-full px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option
                v-for="(label, key) in ALGORITHMS[selectedAlgorithm].pivotStrategies"
                :key="key"
                :value="key"
                class="bg-slate-800"
              >
                {{ label }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Input Section -->
      <div class="bg-white/10 backdrop-blur-lg rounded-xl p-4 lg:p-6 mb-4 lg:mb-6 border border-white/20">
        <h2 class="text-lg lg:text-xl font-semibold text-white mb-3 lg:mb-4">Input Array</h2>
        
        <div class="flex flex-col sm:flex-row gap-2 mb-4">
          <input
            v-model.number="inputValue"
            type="number"
            @keyup.enter="handleAddNumber"
            placeholder="Enter a number"
            class="flex-1 px-3 lg:px-4 py-2 rounded-lg bg-white/20 text-white placeholder-slate-400 border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm lg:text-base"
          />
          <button
            @click="handleAddNumber"
            class="px-4 lg:px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm lg:text-base whitespace-nowrap"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add
          </button>
        </div>

        <div class="flex flex-wrap gap-2 mb-4 max-h-32 overflow-y-auto p-1">
          <div
            v-for="(num, index) in array"
            :key="index"
            class="flex items-center gap-2 px-3 lg:px-4 py-1.5 lg:py-2 bg-white/20 rounded-lg text-white text-sm lg:text-base flex-shrink-0"
          >
            <span class="font-semibold">{{ num }}</span>
            <button
              @click="handleRemoveNumber(index)"
              class="text-red-400 hover:text-red-300 transition-colors flex-shrink-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>

        <div class="flex flex-wrap gap-2">
          <button
            @click="handleStartSort"
            :disabled="array.length === 0"
            class="px-4 lg:px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors text-sm lg:text-base whitespace-nowrap"
          >
            Generate Steps
          </button>
          <button
            @click="handleReset"
            class="px-4 lg:px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 text-sm lg:text-base whitespace-nowrap"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="1 4 1 10 7 10"></polyline>
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
            </svg>
            Reset
          </button>
        </div>
      </div>

      <!-- Visualization Section -->
      <div v-if="steps.length > 0" class="bg-white/10 backdrop-blur-lg rounded-xl p-4 lg:p-6 mb-4 lg:mb-6 border border-white/20">
        <h2 class="text-lg lg:text-xl font-semibold text-white mb-3 lg:mb-4">Visualization</h2>
        
        <!-- Array Display -->
        <div class="w-full overflow-x-auto pb-4">
          <div class="flex justify-center items-end gap-1 lg:gap-2 mb-6 min-h-[180px] lg:min-h-[200px] px-4" style="min-width: 100%;">
            <div
              v-for="(num, index) in displayArray"
              :key="index"
              class="flex flex-col items-center gap-2 transition-all duration-300 flex-shrink-0"
            >
              <div
                :class="getStepColor(index)"
                class="rounded-t-lg transition-all duration-300 flex items-end justify-center text-white font-bold px-2 lg:px-4 shadow-lg text-xs lg:text-base"
                :style="{ height: `${getBarHeight(num)}px`, width: '50px' }"
              >
                {{ num }}
              </div>
              <span class="text-xs text-slate-400">{{ index }}</span>
            </div>
          </div>
        </div>

        <!-- Step Description -->
        <div v-if="currentStepData" class="bg-white/20 rounded-lg p-3 lg:p-4 mb-4">
          <p class="text-white text-center font-medium text-sm lg:text-base">
            {{ currentStepData.description }}
          </p>
        </div>

        <!-- Controls -->
        <div class="space-y-3 lg:space-y-4">
          <div class="flex flex-col lg:flex-row items-stretch lg:items-center gap-2">
            <div class="flex gap-2">
              <button
                @click="handleStepBackward"
                :disabled="currentStep === 0"
                class="flex-1 lg:flex-none px-3 lg:px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm lg:text-base whitespace-nowrap"
              >
                ← Prev
              </button>
              
              <button
                @click="togglePlayPause"
                class="flex-1 lg:flex-none px-4 lg:px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm lg:text-base whitespace-nowrap"
              >
                <svg v-if="isPlaying" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="6" y="4" width="4" height="16"></rect>
                  <rect x="14" y="4" width="4" height="16"></rect>
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
                {{ isPlaying ? 'Pause' : 'Play' }}
              </button>
              
              <button
                @click="handleStepForward"
                :disabled="currentStep >= steps.length - 1"
                class="flex-1 lg:flex-none px-3 lg:px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm lg:text-base whitespace-nowrap"
              >
                Next →
              </button>
            </div>

            <div class="flex flex-1 items-center gap-2 lg:ml-4">
              <label class="text-white text-xs lg:text-sm whitespace-nowrap">Speed:</label>
              <input
                v-model.number="speed"
                type="range"
                min="200"
                max="2000"
                step="200"
                class="flex-1 min-w-0"
              />
              <span class="text-white text-xs lg:text-sm min-w-[40px] text-right">
                {{ (2000 - speed) / 200 + 1 }}x
              </span>
            </div>
          </div>

          <div class="text-center text-slate-300 text-sm lg:text-base">
            Step {{ currentStep + 1 }} of {{ steps.length }}
          </div>
        </div>

        <!-- Legend -->
        <div class="mt-4 lg:mt-6 grid grid-cols-2 lg:grid-cols-6 gap-2 lg:gap-3">
          <div class="flex items-center gap-1.5 lg:gap-2">
            <div class="w-3 h-3 lg:w-4 lg:h-4 bg-cyan-400 rounded flex-shrink-0 border-2 border-cyan-200"></div>
            <span class="text-xs lg:text-sm text-slate-300">Current Range</span>
          </div>
          <div class="flex items-center gap-1.5 lg:gap-2">
            <div class="w-3 h-3 lg:w-4 lg:h-4 bg-gray-600 rounded flex-shrink-0"></div>
            <span class="text-xs lg:text-sm text-slate-300">Outside Range</span>
          </div>
          <div class="flex items-center gap-1.5 lg:gap-2">
            <div class="w-3 h-3 lg:w-4 lg:h-4 bg-orange-500 rounded flex-shrink-0"></div>
            <span class="text-xs lg:text-sm text-slate-300">Candidates</span>
          </div>
          <div class="flex items-center gap-1.5 lg:gap-2">
            <div class="w-3 h-3 lg:w-4 lg:h-4 bg-purple-500 rounded flex-shrink-0"></div>
            <span class="text-xs lg:text-sm text-slate-300">Pivot</span>
          </div>
          <div class="flex items-center gap-1.5 lg:gap-2">
            <div class="w-3 h-3 lg:w-4 lg:h-4 bg-yellow-400 rounded flex-shrink-0"></div>
            <span class="text-xs lg:text-sm text-slate-300">Comparing</span>
          </div>
          <div class="flex items-center gap-1.5 lg:gap-2">
            <div class="w-3 h-3 lg:w-4 lg:h-4 bg-red-500 rounded flex-shrink-0"></div>
            <span class="text-xs lg:text-sm text-slate-300">Swapping</span>
          </div>
          <div class="flex items-center gap-1.5 lg:gap-2">
            <div class="w-3 h-3 lg:w-4 lg:h-4 bg-green-500 rounded flex-shrink-0"></div>
            <span class="text-xs lg:text-sm text-slate-300">Sorted</span>
          </div>
          <div class="flex items-center gap-1.5 lg:gap-2">
            <div class="w-3 h-3 lg:w-4 lg:h-4 bg-blue-400 rounded flex-shrink-0"></div>
            <span class="text-xs lg:text-sm text-slate-300">Unsorted</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue';

// Step types for visualization
const STEP_TYPES = {
  SUBARRAY_HIGHLIGHT: 'subarray_highlight',
  EXAMINING_CANDIDATES: 'examining_candidates',
  SELECT_PIVOT: 'select_pivot',
  COMPARE: 'compare',
  SWAP: 'swap',
  PARTITION: 'partition',
  PARTITION_COMPLETE: 'partition_complete',
  SORTED: 'sorted'
};

// Algorithm configuration - easily extensible
const ALGORITHMS = {
  quicksort: {
    name: 'Quicksort',
    pivotStrategies: {
      last: 'Last Element',
      median: 'Median of Three'
    }
  }
};

// Quicksort implementation with step tracking
class QuicksortVisualizer {
  constructor(array, pivotStrategy = 'last') {
    this.originalArray = [...array];
    this.pivotStrategy = pivotStrategy;
    this.steps = [];
  }

  generateSteps() {
    const arr = [...this.originalArray];
    this.steps = [];
    this.quicksort(arr, 0, arr.length - 1);
    return this.steps;
  }

  selectPivot(arr, low, high) {
    if (this.pivotStrategy === 'median') {
      const mid = Math.floor((low + high) / 2);
      const values = [
        { val: arr[low], idx: low },
        { val: arr[mid], idx: mid },
        { val: arr[high], idx: high }
      ].sort((a, b) => a.val - b.val);
      
      return values[1].idx;
    }
    return high; // last element
  }

  quicksort(arr, low, high) {
    if (low < high) {
      // Show which subarray we're working on
      this.steps.push({
        type: 'SUBARRAY_HIGHLIGHT',
        array: [...arr],
        indices: [],
        subarray: { low, high },
        description: `📍 Divide: Working on subarray from index ${low} to ${high} → [${arr.slice(low, high + 1).join(', ')}]`
      });
      
      const pivotIdx = this.partition(arr, low, high);
      
      // Show the result of partition
      this.steps.push({
        type: 'PARTITION_COMPLETE',
        array: [...arr],
        indices: [pivotIdx],
        subarray: { low, high },
        description: `✓ Partition complete! Pivot ${arr[pivotIdx]} is now at position ${pivotIdx}. Left: [${low}:${pivotIdx-1}], Right: [${pivotIdx+1}:${high}]`
      });
      
      this.quicksort(arr, low, pivotIdx - 1);
      this.quicksort(arr, pivotIdx + 1, high);
    } else if (low === high) {
      this.steps.push({
        type: STEP_TYPES.SORTED,
        array: [...arr],
        indices: [low],
        subarray: { low, high },
        description: `✓ Single element at index ${low} (value: ${arr[low]}) is already sorted`
      });
    }
  }

  partition(arr, low, high) {
    // Show the three candidates for median of three
    if (this.pivotStrategy === 'median' && high - low >= 2) {
      const mid = Math.floor((low + high) / 2);
      this.steps.push({
        type: 'EXAMINING_CANDIDATES',
        array: [...arr],
        indices: [low, mid, high],
        subarray: { low, high },
        description: `Working on subarray [${low}:${high}] - Examining candidates: ${arr[low]} (index ${low}), ${arr[mid]} (index ${mid}), ${arr[high]} (index ${high})`
      });
    }
    
    const pivotIdx = this.selectPivot(arr, low, high);
    
    // Move pivot to end if not already there
    if (pivotIdx !== high) {
      const temp1 = arr[pivotIdx];
      const temp2 = arr[high];
      [arr[pivotIdx], arr[high]] = [arr[high], arr[pivotIdx]];
      this.steps.push({
        type: STEP_TYPES.SWAP,
        array: [...arr],
        indices: [pivotIdx, high],
        description: `Move pivot ${temp1} from index ${pivotIdx} to end (swap with ${temp2})`
      });
    }

    const pivot = arr[high];
    this.steps.push({
      type: STEP_TYPES.SELECT_PIVOT,
      array: [...arr],
      indices: [high],
      subarray: { low, high },
      pivot: pivot,
      description: `Selected pivot: ${pivot} at index ${high} for subarray [${low}:${high}]`
    });

    let i = low - 1;

    for (let j = low; j < high; j++) {
      this.steps.push({
        type: STEP_TYPES.COMPARE,
        array: [...arr],
        indices: [j, high],
        subarray: { low, high },
        description: `Compare ${arr[j]} with pivot ${pivot} → ${arr[j] < pivot ? arr[j] + ' < ' + pivot + ' (move to left partition)' : arr[j] + ' ≥ ' + pivot + ' (stays in right partition)'}`
      });

      if (arr[j] < pivot) {
        i++;
        // Store values BEFORE swap
        const leftValue = arr[i];
        const rightValue = arr[j];
        [arr[i], arr[j]] = [arr[j], arr[i]];
        
        if (i === j) {
          this.steps.push({
            type: STEP_TYPES.SWAP,
            array: [...arr],
            indices: [i, j],
            subarray: { low, high },
            description: `${rightValue} < ${pivot}: Element already at boundary position ${i} (no swap needed)`
          });
        } else {
          this.steps.push({
            type: STEP_TYPES.SWAP,
            array: [...arr],
            indices: [i, j],
            subarray: { low, high },
            description: `${rightValue} < ${pivot}: Swap ${rightValue} (at index ${j}) with ${leftValue} (at boundary index ${i})`
          });
        }
      }
    }

    const finalPivotValue = arr[high];
    const finalSwapValue = arr[i + 1];
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    this.steps.push({
      type: STEP_TYPES.PARTITION,
      array: [...arr],
      indices: [i + 1],
      subarray: { low, high },
      description: `Place pivot ${finalPivotValue} at its final position ${i + 1} (swap with ${finalSwapValue}). Left partition: [${low}:${i}], Right partition: [${i + 2}:${high}]`
    });

    return i + 1;
  }
}

// Reactive state
const inputValue = ref('');
const array = ref([]);
const selectedAlgorithm = ref('quicksort');
const pivotStrategy = ref('last');
const steps = ref([]);
const currentStep = ref(0);
const isPlaying = ref(false);
const speed = ref(1000);
let playInterval = null;

// Computed properties
const currentStepData = computed(() => steps.value[currentStep.value]);
const displayArray = computed(() => 
  currentStepData.value ? currentStepData.value.array : array.value
);

// Methods
const handleAddNumber = () => {
  const num = inputValue.value;
  if (!isNaN(num) && num !== '') {
    array.value.push(Number(num));
    inputValue.value = '';
    resetVisualization();
  }
};

const handleRemoveNumber = (index) => {
  array.value.splice(index, 1);
  resetVisualization();
};

const handleStartSort = () => {
  if (array.value.length === 0) return;
  
  const visualizer = new QuicksortVisualizer(array.value, pivotStrategy.value);
  const generatedSteps = visualizer.generateSteps();
  steps.value = generatedSteps;
  currentStep.value = 0;
};

const resetVisualization = () => {
  steps.value = [];
  currentStep.value = 0;
  isPlaying.value = false;
  if (playInterval) {
    clearInterval(playInterval);
    playInterval = null;
  }
};

const handleReset = () => {
  array.value = [];
  resetVisualization();
};

const togglePlayPause = () => {
  isPlaying.value = !isPlaying.value;
};

const handleStepForward = () => {
  if (currentStep.value < steps.value.length - 1) {
    currentStep.value++;
  }
};

const handleStepBackward = () => {
  if (currentStep.value > 0) {
    currentStep.value--;
  }
};

const getStepColor = (index) => {
  const step = currentStepData.value;
  if (!step) return 'bg-blue-400';
  
  // Check if index is in current subarray being worked on
  const inSubarray = step.subarray && index >= step.subarray.low && index <= step.subarray.high;
  
  switch (step.type) {
    case STEP_TYPES.SUBARRAY_HIGHLIGHT:
      return inSubarray ? 'bg-cyan-400 border-4 border-cyan-200' : 'bg-gray-600';
    case STEP_TYPES.EXAMINING_CANDIDATES:
      if (step.indices.includes(index)) return 'bg-orange-500 border-2 border-orange-300';
      return inSubarray ? 'bg-cyan-300' : 'bg-gray-600';
    case STEP_TYPES.SELECT_PIVOT:
      if (step.indices.includes(index)) return 'bg-purple-500 border-2 border-purple-300';
      return inSubarray ? 'bg-cyan-300' : 'bg-gray-600';
    case STEP_TYPES.COMPARE:
      if (step.indices.includes(index)) return 'bg-yellow-400 border-2 border-yellow-300';
      return inSubarray ? 'bg-cyan-300' : 'bg-gray-600';
    case STEP_TYPES.SWAP:
      if (step.indices.includes(index)) return 'bg-red-500 border-2 border-red-300';
      return inSubarray ? 'bg-cyan-300' : 'bg-gray-600';
    case STEP_TYPES.PARTITION:
      if (step.indices.includes(index)) return 'bg-green-500 border-2 border-green-300';
      return inSubarray ? 'bg-cyan-300' : 'bg-gray-600';
    case STEP_TYPES.PARTITION_COMPLETE:
      if (step.indices.includes(index)) return 'bg-green-500 border-4 border-green-300';
      return inSubarray ? 'bg-cyan-300' : 'bg-gray-600';
    case STEP_TYPES.SORTED:
      return step.indices.includes(index) ? 'bg-green-500' : 'bg-gray-600';
    default:
      return inSubarray ? 'bg-blue-400' : 'bg-gray-600';
  }
};

const getBarHeight = (num) => {
  const maxNum = Math.max(...displayArray.value);
  return (num / maxNum) * 150 + 50;
};

// Watch for play state changes
watch(isPlaying, (newValue) => {
  if (newValue) {
    playInterval = setInterval(() => {
      if (currentStep.value >= steps.value.length - 1) {
        isPlaying.value = false;
        if (playInterval) {
          clearInterval(playInterval);
          playInterval = null;
        }
      } else {
        currentStep.value++;
      }
    }, speed.value);
  } else {
    if (playInterval) {
      clearInterval(playInterval);
      playInterval = null;
    }
  }
});

// Watch for speed changes during play
watch(speed, () => {
  if (isPlaying.value) {
    if (playInterval) {
      clearInterval(playInterval);
    }
    playInterval = setInterval(() => {
      if (currentStep.value >= steps.value.length - 1) {
        isPlaying.value = false;
        if (playInterval) {
          clearInterval(playInterval);
          playInterval = null;
        }
      } else {
        currentStep.value++;
      }
    }, speed.value);
  }
});

// Cleanup on unmount
onUnmounted(() => {
  if (playInterval) {
    clearInterval(playInterval);
  }
});
</script>