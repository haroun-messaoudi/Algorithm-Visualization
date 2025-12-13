<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 lg:p-6">
    <div class="max-w-7xl mx-auto">
      <h1 class="text-3xl lg:text-4xl font-bold text-white mb-2 text-center">
        Recursive Largest First (RLF)
      </h1>
      <p class="text-sm lg:text-base text-purple-200 text-center mb-6">
        Interactive visualization of graph coloring algorithm
      </p>
      
      <!-- Weight Editor Modal -->
      <div v-if="showWeightEditor" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div class="bg-slate-800 rounded-xl p-6 max-w-md w-full border border-purple-500/50">
          <h3 class="text-xl font-semibold text-white mb-4">Set Edge Weight</h3>
          <p class="text-purple-200 mb-2">Edge: {{ editingEdge?.from }} — {{ editingEdge?.to }}</p>
          <p class="text-sm text-purple-300 mb-4">Current weight: {{ editingEdge?.weight || 1 }}</p>
          
          <div class="space-y-3">
            <div class="flex gap-2">
              <input
                v-model.number="tempWeight"
                type="number"
                placeholder="Enter weight"
                min="1"
                max="100"
                class="flex-1 px-3 py-2 bg-slate-700 text-white rounded-lg border border-purple-500/50 outline-none focus:ring-2 focus:ring-purple-500"
                @keyup.enter="saveEdgeWeight"
              />
              <button @click="incrementWeight" class="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg">+1</button>
              <button @click="decrementWeight" class="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg">-1</button>
            </div>
            
            <div class="grid grid-cols-2 gap-2">
              <button
                v-for="weight in quickWeights"
                :key="weight"
                @click="setQuickWeight(weight)"
                class="py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                {{ weight }}
              </button>
            </div>
            
            <div class="flex gap-2 mt-4">
              <button @click="saveEdgeWeight" class="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold">
                Save
              </button>
              <button @click="cancelWeightEdit" class="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <!-- Canvas Section -->
        <div class="lg:col-span-2 space-y-4 lg:space-y-6">
          <div class="bg-white/10 backdrop-blur-lg rounded-xl p-4 lg:p-6 shadow-2xl border border-white/20">
            <canvas 
              ref="canvasRef" 
              width="800" 
              height="600" 
              class="w-full h-auto bg-slate-800/50 rounded-lg cursor-crosshair"
              @click="handleCanvasClick"
            ></canvas>
          </div>
          
          <!-- Playback Controls -->
          <div v-if="steps.length > 0" class="bg-white/10 backdrop-blur-lg rounded-xl p-4 lg:p-6 shadow-2xl border border-white/20">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg lg:text-xl font-semibold text-white">Playback Controls</h3>
              <span class="text-purple-200 text-sm lg:text-base">Step {{ currentStep + 1 }} / {{ steps.length }}</span>
            </div>
            
            <div class="flex gap-2 mb-4 flex-wrap">
              <button @click="currentStep = 0" class="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">First</button>
              <button @click="stepBackward" class="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">Prev</button>
              <button @click="togglePlayPause" class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors">
                {{ isPlaying ? 'Pause' : 'Play' }}
              </button>
              <button @click="stepForward" class="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">Next</button>
              <button @click="currentStep = steps.length - 1" class="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">Last</button>
            </div>
            
            <div class="bg-slate-800/50 rounded-lg p-3 lg:p-4 mb-4">
              <p class="text-white whitespace-pre-wrap text-sm lg:text-base">{{ currentStepData?.description }}</p>
            </div>

            <!-- Speed Control -->
            <div class="flex items-center gap-3">
              <label class="text-white text-sm whitespace-nowrap">Speed:</label>
              <input
                v-model.number="speed"
                type="range"
                min="500"
                max="3000"
                step="500"
                class="flex-1"
              />
              <span class="text-white text-sm min-w-[40px] text-right">
                {{ (3500 - speed) / 500 }}x
              </span>
            </div>
          </div>

          <!-- Iteration Table -->
          <div v-if="tableIterations.length > 0" class="bg-white/10 backdrop-blur-lg rounded-xl p-4 lg:p-6 shadow-2xl border border-white/20">
            <h3 class="text-lg lg:text-xl font-semibold text-white mb-4">Coloring Progress Table</h3>
            <div class="overflow-x-auto">
              <table class="w-full text-sm border-collapse">
                <thead>
                  <tr class="border-b-2 border-purple-400">
                    <th class="text-left p-2 text-purple-200 font-semibold">Iteration</th>
                    <th class="text-left p-2 text-purple-200 font-semibold">Action</th>
                    <th class="text-left p-2 text-purple-200 font-semibold">Node</th>
                    <th class="text-center p-2 text-purple-200 font-semibold">Color</th>
                    <th class="text-left p-2 text-purple-200 font-semibold">Color Class</th>
                    <th class="text-left p-2 text-purple-200 font-semibold">Prohibited</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(iter, idx) in tableIterations" :key="idx" 
                      :class="['border-b border-slate-600 transition-colors', 
                               idx === currentTableIterationIndex ? 'bg-purple-600/40 ring-2 ring-purple-400' : 'hover:bg-white/5']">
                    <td class="p-2 text-white font-medium">{{ iter.iterationNumber }}</td>
                    <td class="p-2 text-white">{{ iter.action }}</td>
                    <td class="p-2 text-white font-bold">{{ iter.node }}</td>
                    <td class="text-center p-2">
                      <div v-if="iter.color" class="flex justify-center">
                        <div :style="{ backgroundColor: iter.color }" 
                             class="w-6 h-6 rounded-full border-2 border-white shadow-lg"></div>
                      </div>
                      <span v-else class="text-slate-400">—</span>
                    </td>
                    <td class="p-2 text-white">{{ iter.colorClass }}</td>
                    <td class="p-2 text-slate-300">{{ iter.prohibited }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Color Legend -->
          <div v-if="steps.length > 0" class="bg-white/10 backdrop-blur-lg rounded-xl p-4 lg:p-6 shadow-2xl border border-white/20">
            <h3 class="text-lg lg:text-xl font-semibold text-white mb-3">Color Classes</h3>
            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              <div v-for="(color, index) in usedColors" :key="index" class="flex items-center gap-2">
                <div :style="{ backgroundColor: color }" class="w-6 h-6 rounded-full border-2 border-white"></div>
                <span class="text-white text-sm">Color {{ index + 1 }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Controls Section -->
        <div class="space-y-4 lg:space-y-6">
          <!-- Graph Construction -->
          <div class="bg-white/10 backdrop-blur-lg rounded-xl p-4 lg:p-6 shadow-2xl border border-white/20">
            <h3 class="text-lg lg:text-xl font-semibold text-white mb-4">Construction Mode</h3>
            <div class="space-y-3">
              <button @click="toggleMode" :class="[
                'w-full py-2 px-4 rounded-lg font-semibold transition-colors',
                mode === 'node' ? 'bg-green-600 hover:bg-green-700' : 
                mode === 'edge' ? 'bg-blue-600 hover:bg-blue-700' :
                'bg-yellow-600 hover:bg-yellow-700',
                'text-white'
              ]">
                {{ mode === 'node' ? 'Add Nodes' : 
                   mode === 'edge' ? 'Add Edges' : 
                   'Edit Weights' }}
              </button>
              
              <div v-if="mode === 'node'" class="text-sm text-purple-200 bg-green-900/30 p-3 rounded-lg">
                Click anywhere on the canvas to add a node
              </div>
              
              <div v-if="mode === 'edge'" class="text-sm text-purple-200 bg-blue-900/30 p-3 rounded-lg">
                Click two nodes to connect them with an edge
              </div>
              
              <div v-if="mode === 'weight'" class="text-sm text-purple-200 bg-yellow-900/30 p-3 rounded-lg">
                Click on an edge weight to edit it
              </div>
              
              <button @click="generateRandomGraph" class="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors">
                Random Graph
              </button>
            </div>
          </div>
          
          <!-- Manual Edge Addition -->
          <div class="bg-white/10 backdrop-blur-lg rounded-xl p-4 lg:p-6 shadow-2xl border border-white/20">
            <h3 class="text-lg lg:text-xl font-semibold text-white mb-4">Add Edge (Manual)</h3>
            <div class="space-y-2">
              <select v-model="newEdgeFrom" class="w-full px-3 py-2 bg-slate-800/50 text-white rounded-lg border-none outline-none focus:ring-2 focus:ring-purple-500">
                <option value="">From Node</option>
                <option v-for="n in nodes" :key="n.id" :value="n.label">{{ n.label }}</option>
              </select>
              <select v-model="newEdgeTo" class="w-full px-3 py-2 bg-slate-800/50 text-white rounded-lg border-none outline-none focus:ring-2 focus:ring-purple-500">
                <option value="">To Node</option>
                <option v-for="n in nodes" :key="n.id" :value="n.label">{{ n.label }}</option>
              </select>
              <div class="flex gap-2">
                <input v-model="newEdgeWeight" type="number" placeholder="Weight" min="1" class="flex-1 px-3 py-2 bg-slate-800/50 text-white rounded-lg border-none outline-none focus:ring-2 focus:ring-purple-500" />
                <button @click="decrementNewWeight" class="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg">-1</button>
                <button @click="incrementNewWeight" class="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg">+1</button>
              </div>
              <button @click="handleAddEdgeManually" class="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold">Add Edge</button>
            </div>
          </div>
          
          <!-- Quick Weight Edit -->
          <div class="bg-white/10 backdrop-blur-lg rounded-xl p-4 lg:p-6 shadow-2xl border border-white/20">
            <h3 class="text-lg lg:text-xl font-semibold text-white mb-4">Quick Edit Edge Weight</h3>
            <div class="space-y-2">
              <select v-model="quickEditEdgeFrom" class="w-full px-3 py-2 bg-slate-800/50 text-white rounded-lg border-none outline-none focus:ring-2 focus:ring-purple-500">
                <option value="">Select Edge</option>
                <option v-for="e in edges" :key="`${e.from}-${e.to}`" :value="`${e.from}|${e.to}`">
                  {{ e.from }} — {{ e.to }} (Current: {{ e.weight }})
                </option>
              </select>
              <div class="flex gap-2">
                <input v-model="quickEditWeight" type="number" placeholder="New weight" min="1" class="flex-1 px-3 py-2 bg-slate-800/50 text-white rounded-lg border-none outline-none focus:ring-2 focus:ring-purple-500" />
                <button @click="updateQuickWeight" class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold">Set</button>
              </div>
            </div>
          </div>
          
          <!-- Algorithm Settings -->
          <div class="bg-white/10 backdrop-blur-lg rounded-xl p-4 lg:p-6 shadow-2xl border border-white/20">
            <h3 class="text-lg lg:text-xl font-semibold text-white mb-4">Algorithm</h3>
            <div class="space-y-3">
              <button @click="runRLF" :disabled="nodes.length === 0" class="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors">
                Run RLF Algorithm
              </button>
              <button @click="handleReset" class="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors">
                Reset All
              </button>
            </div>
            
            <div v-if="chromaticNumber > 0" class="mt-4 bg-green-900/30 border border-green-500/50 rounded-lg p-3">
              <p class="text-green-200 text-sm font-semibold">
                Chromatic Number: {{ chromaticNumber }} colors
              </p>
            </div>
          </div>
          
          <!-- Error Display -->
          <div v-if="error" class="bg-red-500/20 border border-red-500 rounded-xl p-4">
            <p class="text-red-200 text-sm">{{ error }}</p>
          </div>
          
          <!-- Node List -->
          <div v-if="nodes.length > 0" class="bg-white/10 backdrop-blur-lg rounded-xl p-4 lg:p-6 shadow-2xl border border-white/20">
            <h3 class="text-lg lg:text-xl font-semibold text-white mb-3">Nodes ({{ nodes.length }})</h3>
            <div class="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto">
              <div v-for="n in nodes" :key="n.id" class="flex items-center justify-between bg-slate-800/50 p-2 rounded-lg">
                <span class="text-white font-semibold text-sm">{{ n.label }}</span>
                <button @click="handleDeleteNode(n.id)" class="text-red-400 hover:text-red-300 text-xs">🗑</button>
              </div>
            </div>
          </div>
          
          <!-- Edge List -->
          <div v-if="edges.length > 0" class="bg-white/10 backdrop-blur-lg rounded-xl p-4 lg:p-6 shadow-2xl border border-white/20">
            <h3 class="text-lg lg:text-xl font-semibold text-white mb-3">Edges ({{ edges.length }})</h3>
            <div class="space-y-2 max-h-48 overflow-y-auto">
              <div v-for="(e, idx) in edges" :key="idx" class="flex items-center justify-between bg-slate-800/50 p-2 rounded-lg">
                <span class="text-white text-sm">{{ e.from }} — {{ e.to }} <span class="text-purple-300 font-bold">({{ e.weight }})</span></span>
                <div class="flex gap-1">
                  <button @click="editEdgeWeight(e)" class="text-yellow-400 hover:text-yellow-300 text-xs" title="Edit weight">✏️</button>
                  <button @click="handleDeleteEdge(e.from, e.to)" class="text-red-400 hover:text-red-300 text-xs">🗑</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Instructions -->
          <div class="bg-blue-500/20 border border-blue-500/50 rounded-xl p-4">
            <h3 class="text-lg font-semibold text-blue-200 mb-2">How to Use</h3>
            <ul class="text-blue-100 text-sm space-y-1">
              <li>• <span class="font-bold">Node Mode:</span> Click canvas to add nodes</li>
              <li>• <span class="font-bold">Edge Mode:</span> Click two nodes to connect</li>
              <li>• <span class="font-bold">Weight Mode:</span> Click edge weights to edit</li>
              <li>• Use manual inputs for precise control</li>
              <li>• Run RLF to see the coloring process</li>
              <li>• Use playback controls to step through</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';

// Constants
const COLORS = [
  '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16',
  '#06b6d4', '#a855f7', '#eab308', '#22c55e', '#f43f5e'
];

const STEP_TYPES = {
  INIT: 'init',
  NEW_COLOR_CLASS: 'new_color_class',
  SELECT_MAX_DEGREE: 'select_max_degree',
  COLOR_NODE: 'color_node',
  IDENTIFY_NEIGHBORS: 'identify_neighbors',
  CHECK_CANDIDATE: 'check_candidate',
  ADD_TO_CLASS: 'add_to_class',
  SKIP_CANDIDATE: 'skip_candidate',
  CLASS_COMPLETE: 'class_complete',
  COMPLETE: 'complete'
};

// Reactive state
const canvasRef = ref(null);
const nodes = ref([]);
const edges = ref([]);
const mode = ref('node'); // 'node', 'edge', or 'weight'
const selectedNode = ref(null);
const steps = ref([]);
const currentStep = ref(0);
const isPlaying = ref(false);
const speed = ref(1500);
const error = ref('');
const chromaticNumber = ref(0);
const nodeCounter = ref(0);

// Weight editing
const showWeightEditor = ref(false);
const editingEdge = ref(null);
const tempWeight = ref(1);
const quickEditEdgeFrom = ref('');
const quickEditWeight = ref('1');
const newEdgeFrom = ref('');
const newEdgeTo = ref('');
const newEdgeWeight = ref('1');

const quickWeights = [1, 2, 3, 5, 10, 15, 20, 25];

let playInterval = null;

// Computed
const currentStepData = computed(() => steps.value[currentStep.value]);
const usedColors = computed(() => {
  if (!currentStepData.value?.nodeColors) return [];
  const colorSet = new Set(Object.values(currentStepData.value.nodeColors));
  return Array.from(colorSet);
});

const tableIterations = computed(() => {
  const iterations = [];
  let iterationCount = 1;
  const currentIdx = currentStep.value;
  
  for (let i = 0; i < steps.value.length; i++) {
    const step = steps.value[i];
    
    // Only add rows for coloring actions, and only up to current step
    if ((step.type === STEP_TYPES.COLOR_NODE || step.type === STEP_TYPES.ADD_TO_CLASS) && i <= currentIdx) {
      const action = step.type === STEP_TYPES.COLOR_NODE ? 'Select Max Degree' : 'Add to Class';
      
      iterations.push({
        stepIndex: i,
        iterationNumber: iterationCount++,
        action: action,
        node: step.highlightNode,
        color: step.currentColor,
        colorClass: step.colorClass.join(', '),
        prohibited: step.prohibited.size > 0 ? Array.from(step.prohibited).join(', ') : 'none'
      });
    }
  }
  
  return iterations;
});

const currentTableIterationIndex = computed(() => {
  // Always highlight the last row (most recent addition)
  return tableIterations.value.length - 1;
});

// Methods
const toggleMode = () => {
  if (mode.value === 'node') {
    mode.value = 'edge';
  } else if (mode.value === 'edge') {
    mode.value = 'weight';
  } else {
    mode.value = 'node';
  }
  selectedNode.value = null;
  error.value = '';
};

const handleCanvasClick = (event) => {
  const canvas = canvasRef.value;
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const x = (event.clientX - rect.left) * scaleX;
  const y = (event.clientY - rect.top) * scaleY;
  
  if (mode.value === 'node') {
    addNode(x, y);
  } else if (mode.value === 'edge') {
    handleEdgeClick(x, y);
  } else if (mode.value === 'weight') {
    handleWeightClick(x, y);
  }
};

// NEW: Handle weight clicks
const handleWeightClick = (x, y) => {
  for (const edge of edges.value) {
    const fromNode = nodes.value.find(n => n.label === edge.from);
    const toNode = nodes.value.find(n => n.label === edge.to);
    if (!fromNode || !toNode) continue;
    
    // Calculate weight label position
    const dx = toNode.x - fromNode.x;
    const dy = toNode.y - fromNode.y;
    const angle = Math.atan2(dy, dx);
    const nodeRadius = 30;
    
    const startX = fromNode.x + (nodeRadius + 5) * Math.cos(angle);
    const startY = fromNode.y + (nodeRadius + 5) * Math.sin(angle);
    const endX = toNode.x - (nodeRadius + 10) * Math.cos(angle);
    const endY = toNode.y - (nodeRadius + 10) * Math.sin(angle);
    
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;
    const labelAngle = Math.atan2(endY - startY, endX - startX);
    const labelX = midX - 20 * Math.sin(labelAngle);
    const labelY = midY + 20 * Math.cos(labelAngle);
    
    // Check if click is within weight label bounds
    const dx2 = x - labelX;
    const dy2 = y - labelY;
    const distance = Math.sqrt(dx2 * dx2 + dy2 * dy2);
    
    if (distance < 20) { // Clicked on weight label
      editEdgeWeight(edge);
      return;
    }
  }
  
  error.value = 'Click on an edge weight to edit it';
  setTimeout(() => error.value = '', 2000);
};

// NEW: Open weight editor
const editEdgeWeight = (edge) => {
  editingEdge.value = edge;
  tempWeight.value = edge.weight;
  showWeightEditor.value = true;
  error.value = '';
};

// NEW: Save edited weight
const saveEdgeWeight = () => {
  if (editingEdge.value && tempWeight.value > 0) {
    editingEdge.value.weight = Number(tempWeight.value);
    showWeightEditor.value = false;
    editingEdge.value = null;
    resetVisualization();
  }
};

// NEW: Cancel weight edit
const cancelWeightEdit = () => {
  showWeightEditor.value = false;
  editingEdge.value = null;
};

// NEW: Increment/decrement weight in editor
const incrementWeight = () => {
  tempWeight.value = Number(tempWeight.value) + 1;
};

const decrementWeight = () => {
  if (tempWeight.value > 1) {
    tempWeight.value = Number(tempWeight.value) - 1;
  }
};

// NEW: Set quick weight
const setQuickWeight = (weight) => {
  tempWeight.value = weight;
};

const calculateNodePosition = (nodeCount) => {
  const canvas = canvasRef.value;
  const width = canvas?.width || 800;
  const height = canvas?.height || 600;
  const padding = 100;
  
  const centerX = width / 2;
  const centerY = height / 2;
  const maxRadius = Math.min(width, height) / 2 - padding;
  
  let x, y;
  
  if (nodeCount === 0) {
    x = centerX;
    y = centerY;
  } else if (nodeCount <= 8) {
    const angle = (nodeCount * 2 * Math.PI) / 8;
    const radius = Math.min(maxRadius * 0.7, 220);
    x = centerX + radius * Math.cos(angle);
    y = centerY + radius * Math.sin(angle);
  } else {
    const cols = Math.ceil(Math.sqrt(nodeCount * 1.2));
    const col = nodeCount % cols;
    const row = Math.floor(nodeCount / cols);
    const cellWidth = (width - 2 * padding) / cols;
    const cellHeight = (height - 2 * padding) / Math.ceil(nodeCount / cols);
    
    x = padding + col * cellWidth + cellWidth / 2;
    y = padding + row * cellHeight + cellHeight / 2;
  }
  
  return { x, y };
};

const addNode = (x, y) => {
  // Use calculated position if x, y are provided from manual click
  // Otherwise use the position calculation for better layout
  let posX, posY;
  if (x !== undefined && y !== undefined) {
    posX = x;
    posY = y;
  } else {
    const pos = calculateNodePosition(nodes.value.length);
    posX = pos.x;
    posY = pos.y;
  }
  
  const id = `N${nodeCounter.value++}`;
  const label = String.fromCharCode(65 + (nodes.value.length % 26)); // A, B, C, ...
  nodes.value.push({ id, label, x: posX, y: posY, color: null });
  resetVisualization();
};

const handleEdgeClick = (x, y) => {
  const clickedNode = nodes.value.find(n => {
    const dx = n.x - x;
    const dy = n.y - y;
    return Math.sqrt(dx * dx + dy * dy) < 30;
  });
  
  if (clickedNode) {
    if (!selectedNode.value) {
      selectedNode.value = clickedNode.id;
    } else {
      if (selectedNode.value !== clickedNode.id) {
        const fromNode = nodes.value.find(n => n.id === selectedNode.value);
        const toNode = clickedNode;
        
        // Check if edge already exists (undirected)
        const exists = edges.value.some(e => 
          (e.from === fromNode.label && e.to === toNode.label) ||
          (e.from === toNode.label && e.to === fromNode.label)
        );
        
        if (!exists) {
          addEdgeWithWeight(fromNode.label, toNode.label, 1); // Default weight of 1
        } else {
          error.value = 'Edge already exists';
          setTimeout(() => error.value = '', 2000);
        }
      }
      selectedNode.value = null;
    }
  }
};

// NEW: Helper function to add edge with weight
const addEdgeWithWeight = (from, to, weight = 1) => {
  const fromNode = nodes.value.find(n => n.label === from);
  const toNode = nodes.value.find(n => n.label === to);
  
  edges.value.push({ 
    from: fromNode.label, 
    to: toNode.label,
    fromId: fromNode.id,
    toId: toNode.id,
    weight: weight
  });
  resetVisualization();
};

// NEW: Handle manual edge addition
const handleAddEdgeManually = () => {
  const from = newEdgeFrom.value.trim().toUpperCase();
  const to = newEdgeTo.value.trim().toUpperCase();
  const weight = parseFloat(newEdgeWeight.value) || 1;
  
  if (!from || !to) {
    error.value = 'Select both nodes';
    setTimeout(() => error.value = '', 2000);
    return;
  }
  
  if (!nodes.value.some(n => n.label === from) || !nodes.value.some(n => n.label === to)) {
    error.value = 'Nodes must exist';
    setTimeout(() => error.value = '', 2000);
    return;
  }
  
  if (from === to) {
    error.value = 'Self-loops not allowed';
    setTimeout(() => error.value = '', 2000);
    return;
  }
  
  // Check if edge already exists (undirected)
  const exists = edges.value.some(e => 
    (e.from === from && e.to === to) ||
    (e.from === to && e.to === from)
  );
  
  if (exists) {
    error.value = 'Edge already exists';
    setTimeout(() => error.value = '', 2000);
    return;
  }
  
  addEdgeWithWeight(from, to, weight);
  newEdgeFrom.value = '';
  newEdgeTo.value = '';
  newEdgeWeight.value = '1';
};

// NEW: Helper functions for manual edge weight
const incrementNewWeight = () => {
  newEdgeWeight.value = Number(newEdgeWeight.value || 1) + 1;
};

const decrementNewWeight = () => {
  if (newEdgeWeight.value > 1) {
    newEdgeWeight.value = Number(newEdgeWeight.value) - 1;
  }
};

// NEW: Update weight from quick edit dropdown
const updateQuickWeight = () => {
  const [from, to] = quickEditEdgeFrom.value.split('|');
  const weight = parseFloat(quickEditWeight.value) || 1;
  
  if (!from || !to) {
    error.value = 'Select an edge first';
    setTimeout(() => error.value = '', 2000);
    return;
  }
  
  const edge = edges.value.find(e => 
    (e.from === from && e.to === to) ||
    (e.from === to && e.to === from)
  );
  
  if (edge) {
    edge.weight = weight;
    resetVisualization();
    quickEditEdgeFrom.value = '';
    quickEditWeight.value = '1';
    error.value = `Updated ${from}—${to} weight to ${weight}`;
    setTimeout(() => error.value = '', 2000);
  }
};

const handleDeleteNode = (nodeId) => {
  nodes.value = nodes.value.filter(n => n.id !== nodeId);
  edges.value = edges.value.filter(e => e.fromId !== nodeId && e.toId !== nodeId);
  resetVisualization();
};

const handleDeleteEdge = (from, to) => {
  edges.value = edges.value.filter(e => 
    !((e.from === from && e.to === to) || (e.from === to && e.to === from))
  );
  resetVisualization();
};

const generateRandomGraph = () => {
  nodes.value = [];
  edges.value = [];
  nodeCounter.value = 0;
  
  const canvas = canvasRef.value;
  const numNodes = 6 + Math.floor(Math.random() * 3); // 6-8 nodes
  const padding = 100;
  
  // Create nodes in a circle layout (same as DAG visualizer)
  for (let i = 0; i < numNodes; i++) {
    const angle = (i * 2 * Math.PI) / numNodes;
    const radius = Math.min(canvas.width, canvas.height) / 2 - padding;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const x = centerX + radius * 0.7 * Math.cos(angle);
    const y = centerY + radius * 0.7 * Math.sin(angle);
    
    const id = `N${nodeCounter.value++}`;
    const label = String.fromCharCode(65 + i);
    nodes.value.push({ id, label, x, y, color: null });
  }
  
  // Create random edges with weights (about 1.5x the number of nodes)
  const numEdges = Math.floor(numNodes * 1.5);
  const addedEdges = new Set();
  let attempts = 0;
  const maxAttempts = numEdges * 3;
  
  while (addedEdges.size < numEdges && attempts < maxAttempts) {
    attempts++;
    const fromIdx = Math.floor(Math.random() * numNodes);
    const toIdx = Math.floor(Math.random() * numNodes);
    
    if (fromIdx !== toIdx) {
      const from = nodes.value[fromIdx];
      const to = nodes.value[toIdx];
      const edgeKey = `${Math.min(fromIdx, toIdx)}-${Math.max(fromIdx, toIdx)}`;
      
      if (!addedEdges.has(edgeKey)) {
        addedEdges.add(edgeKey);
        const weight = Math.floor(Math.random() * 10) + 1; // Random weight 1-10
        edges.value.push({ 
          from: from.label, 
          to: to.label,
          fromId: from.id,
          toId: to.id,
          weight: weight
        });
      }
    }
  }
  
  resetVisualization();
};

const getNeighbors = (nodeLabel) => {
  const neighbors = new Set();
  edges.value.forEach(e => {
    if (e.from === nodeLabel) neighbors.add(e.to);
    if (e.to === nodeLabel) neighbors.add(e.from);
  });
  return neighbors;
};

const getDegree = (nodeLabel, uncoloredNodes) => {
  const neighbors = getNeighbors(nodeLabel);
  return Array.from(neighbors).filter(n => uncoloredNodes.has(n)).length;
};

const runRLF = () => {
  if (nodes.value.length === 0) {
    error.value = 'Add nodes first';
    setTimeout(() => error.value = '', 2000);
    return;
  }
  
  const newSteps = [];
  const nodeColors = {};
  const uncolored = new Set(nodes.value.map(n => n.label));
  let colorIndex = 0;
  
  newSteps.push({
    type: STEP_TYPES.INIT,
    nodeColors: { ...nodeColors },
    uncolored: new Set(uncolored),
    colorClass: [],
    prohibited: new Set(),
    description: `Starting RLF algorithm with ${nodes.value.length} nodes\nAll nodes are uncolored: [${Array.from(uncolored).join(', ')}]`
  });
  
  while (uncolored.size > 0) {
    const currentColor = COLORS[colorIndex % COLORS.length];
    const colorClass = [];
    const prohibited = new Set();
    
    newSteps.push({
      type: STEP_TYPES.NEW_COLOR_CLASS,
      nodeColors: { ...nodeColors },
      uncolored: new Set(uncolored),
      currentColor,
      colorClass: [...colorClass],
      prohibited: new Set(prohibited),
      description: `\n🎨 Starting new color class with ${currentColor === COLORS[0] ? 'red' : currentColor === COLORS[1] ? 'blue' : currentColor === COLORS[2] ? 'green' : 'color ' + (colorIndex + 1)}\nRemaining uncolored nodes: [${Array.from(uncolored).join(', ')}]`
    });
    
    // Find node with maximum degree
    let maxNode = null;
    let maxDegree = -1;
    for (const nodeLabel of uncolored) {
      const degree = getDegree(nodeLabel, uncolored);
      if (degree > maxDegree) {
        maxDegree = degree;
        maxNode = nodeLabel;
      }
    }
    
    newSteps.push({
      type: STEP_TYPES.SELECT_MAX_DEGREE,
      nodeColors: { ...nodeColors },
      uncolored: new Set(uncolored),
      currentColor,
      colorClass: [...colorClass],
      prohibited: new Set(prohibited),
      highlightNode: maxNode,
      description: `Select node with maximum degree: ${maxNode} (degree = ${maxDegree})\nThis node has the most connections among uncolored nodes`
    });
    
    // Color the max degree node
    nodeColors[maxNode] = currentColor;
    colorClass.push(maxNode);
    uncolored.delete(maxNode);
    
    // Add its neighbors to prohibited
    const neighbors = getNeighbors(maxNode);
    neighbors.forEach(n => {
      if (uncolored.has(n)) prohibited.add(n);
    });
    
    newSteps.push({
      type: STEP_TYPES.COLOR_NODE,
      nodeColors: { ...nodeColors },
      uncolored: new Set(uncolored),
      currentColor,
      colorClass: [...colorClass],
      prohibited: new Set(prohibited),
      highlightNode: maxNode,
      description: `✓ Color node ${maxNode} with current color\nColor class: [${colorClass.join(', ')}]\nProhibited (neighbors): [${Array.from(prohibited).join(', ') || 'none'}]`
    });
    
    // Iteratively add nodes to this color class
    while (true) {
      const candidates = Array.from(uncolored).filter(n => !prohibited.has(n));
      
      if (candidates.length === 0) break;
      
      // Find candidate with maximum prohibited neighbors
      let bestCandidate = null;
      let maxProhibitedNeighbors = -1;
      
      for (const candidate of candidates) {
        const candidateNeighbors = getNeighbors(candidate);
        const prohibitedCount = Array.from(candidateNeighbors).filter(n => prohibited.has(n)).length;
        
        newSteps.push({
          type: STEP_TYPES.CHECK_CANDIDATE,
          nodeColors: { ...nodeColors },
          uncolored: new Set(uncolored),
          currentColor,
          colorClass: [...colorClass],
          prohibited: new Set(prohibited),
          highlightNode: candidate,
          description: `Checking candidate ${candidate}: has ${prohibitedCount} connections to prohibited set`
        });
        
        if (prohibitedCount > maxProhibitedNeighbors) {
          maxProhibitedNeighbors = prohibitedCount;
          bestCandidate = candidate;
        }
      }
      
      if (bestCandidate) {
        nodeColors[bestCandidate] = currentColor;
        colorClass.push(bestCandidate);
        uncolored.delete(bestCandidate);
        
        const newNeighbors = getNeighbors(bestCandidate);
        newNeighbors.forEach(n => {
          if (uncolored.has(n)) prohibited.add(n);
        });
        
        newSteps.push({
          type: STEP_TYPES.ADD_TO_CLASS,
          nodeColors: { ...nodeColors },
          uncolored: new Set(uncolored),
          currentColor,
          colorClass: [...colorClass],
          prohibited: new Set(prohibited),
          highlightNode: bestCandidate,
          description: `✓ Add ${bestCandidate} to color class (max connections to prohibited: ${maxProhibitedNeighbors})\nColor class: [${colorClass.join(', ')}]\nProhibited: [${Array.from(prohibited).join(', ') || 'none'}]`
        });
      }
    }
    
    newSteps.push({
      type: STEP_TYPES.CLASS_COMPLETE,
      nodeColors: { ...nodeColors },
      uncolored: new Set(uncolored),
      currentColor,
      colorClass: [...colorClass],
      prohibited: new Set(prohibited),
      description: `Color class complete: [${colorClass.join(', ')}]\nNodes colored: ${colorClass.length}\nRemaining uncolored: ${uncolored.size}`
    });
    
    colorIndex++;
  }
  
  chromaticNumber.value = colorIndex;
  
  newSteps.push({
    type: STEP_TYPES.COMPLETE,
    nodeColors: { ...nodeColors },
    uncolored: new Set(uncolored),
    colorClass: [],
    prohibited: new Set(),
    description: `✅ Algorithm Complete!\nChromatic number: ${colorIndex} colors used\nAll nodes have been colored successfully`
  });
  
  steps.value = newSteps;
  currentStep.value = 0;
  error.value = '';
};

const resetVisualization = () => {
  steps.value = [];
  currentStep.value = 0;
  isPlaying.value = false;
  chromaticNumber.value = 0;
  selectedNode.value = null;
  if (playInterval) {
    clearInterval(playInterval);
    playInterval = null;
  }
};

const handleReset = () => {
  nodes.value = [];
  edges.value = [];
  nodeCounter.value = 0;
  selectedNode.value = null;
  resetVisualization();
  error.value = '';
  mode.value = 'node';
  showWeightEditor.value = false;
};

const togglePlayPause = () => {
  isPlaying.value = !isPlaying.value;
};

const stepForward = () => {
  if (currentStep.value < steps.value.length - 1) {
    currentStep.value++;
  }
};

const stepBackward = () => {
  if (currentStep.value > 0) {
    currentStep.value--;
  }
};

const drawCanvas = () => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const step = currentStepData.value;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw edges with weights
  edges.value.forEach(edge => {
    const fromNode = nodes.value.find(n => n.label === edge.from);
    const toNode = nodes.value.find(n => n.label === edge.to);
    if (!fromNode || !toNode) return;
    
    const dx = toNode.x - fromNode.x;
    const dy = toNode.y - fromNode.y;
    const angle = Math.atan2(dy, dx);
    
    const nodeRadius = 30;
    const startX = fromNode.x + (nodeRadius + 5) * Math.cos(angle);
    const startY = fromNode.y + (nodeRadius + 5) * Math.sin(angle);
    const endX = toNode.x - (nodeRadius + 10) * Math.cos(angle);
    const endY = toNode.y - (nodeRadius + 10) * Math.sin(angle);
    
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    
    // Draw arrowhead
    const headlen = 12;
    const arrowAngle = Math.atan2(endY - startY, endX - startX);
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(endX - headlen * Math.cos(arrowAngle - Math.PI / 7), endY - headlen * Math.sin(arrowAngle - Math.PI / 7));
    ctx.lineTo(endX - headlen * Math.cos(arrowAngle + Math.PI / 7), endY - headlen * Math.sin(arrowAngle + Math.PI / 7));
    ctx.closePath();
    ctx.fillStyle = '#64748b';
    ctx.fill();
    
    // Draw edge weight
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;
    const labelAngle = Math.atan2(endY - startY, endX - startX);
    const labelX = midX - 20 * Math.sin(labelAngle);
    const labelY = midY + 20 * Math.cos(labelAngle);
    
    // Background for weight label
    const isWeightMode = mode.value === 'weight';
    if (isWeightMode) {
      ctx.fillStyle = '#f59e0b'; // Yellow highlight for weight mode
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(labelX - 18, labelY - 15, 36, 30, 8);
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(labelX - 15, labelY - 12, 30, 24, 6);
      ctx.fill();
    }
    
    // Weight text
    ctx.fillStyle = isWeightMode ? '#000000' : '#94a3b8';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(edge.weight, labelX, labelY);
  });
  
  // Draw nodes
  nodes.value.forEach(node => {
    const isHighlighted = step?.highlightNode === node.label;
    const isInColorClass = step?.colorClass?.includes(node.label);
    const isProhibited = step?.prohibited?.has(node.label);
    const nodeColor = step?.nodeColors?.[node.label];
    
    ctx.beginPath();
    ctx.arc(node.x, node.y, 30, 0, 2 * Math.PI);
    
    if (nodeColor) {
      ctx.fillStyle = nodeColor;
    } else if (isHighlighted) {
      ctx.fillStyle = '#fbbf24';
    } else if (isInColorClass) {
      ctx.fillStyle = step.currentColor || '#475569';
    } else if (isProhibited) {
      ctx.fillStyle = '#ef4444';
    } else {
      ctx.fillStyle = '#475569';
    }
    ctx.fill();
    
    if (isHighlighted) {
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 4;
      ctx.stroke();
    } else if (selectedNode.value === node.id) {
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node.label, node.x, node.y);
  });
};

// Watchers
watch([nodes, edges, steps, currentStep, selectedNode, mode], () => {
  drawCanvas();
}, { deep: true });

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

watch(speed, () => {
  if (isPlaying.value) {
    if (playInterval) clearInterval(playInterval);
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

onMounted(() => {
  drawCanvas();
});

onUnmounted(() => {
  if (playInterval) clearInterval(playInterval);
});
</script>

<style scoped>
/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: rgba(139, 92, 246, 0.5);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(139, 92, 246, 0.7);
}

/* Range input styling */
input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  cursor: pointer;
}

input[type="range"]::-webkit-slider-track {
  background: rgba(255, 255, 255, 0.1);
  height: 8px;
  border-radius: 4px;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  height: 20px;
  width: 20px;
  background-color: #8b5cf6;
  border-radius: 50%;
  border: 2px solid white;
}

input[type="range"]::-moz-range-track {
  background: rgba(255, 255, 255, 0.1);
  height: 8px;
  border-radius: 4px;
}

input[type="range"]::-moz-range-thumb {
  height: 20px;
  width: 20px;
  background-color: #8b5cf6;
  border-radius: 50%;
  border: 2px solid white;
}

/* Modal animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>