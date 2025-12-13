<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
    <div class="max-w-7xl mx-auto">
      <h1 class="text-4xl font-bold text-white mb-2 text-center">DAG Shortest Path Visualizer</h1>
      <p class="text-purple-200 text-center mb-6">Visualize shortest paths in Directed Acyclic Graphs</p>
      
      <!-- Weight Editor Modal -->
      <div v-if="showWeightEditor" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div class="bg-slate-800 rounded-xl p-6 max-w-md w-full border border-purple-500/50">
          <h3 class="text-xl font-semibold text-white mb-4">Set Edge Weight</h3>
          <p class="text-purple-200 mb-2">Edge: {{ editingEdge?.from }} → {{ editingEdge?.to }}</p>
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
      
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-2xl border border-white/20">
            <canvas 
              ref="canvasRef" 
              width="800" 
              height="600" 
              class="w-full h-auto bg-slate-800/50 rounded-lg cursor-crosshair"
              @click="handleCanvasClick"
            ></canvas>
          </div>
          
          <div v-if="steps.length > 0" class="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-2xl border border-white/20">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-xl font-semibold text-white">Playback Controls</h3>
              <span class="text-purple-200">Step {{ currentStep + 1 }} / {{ steps.length }}</span>
            </div>
            
            <div class="flex gap-2 mb-4">
              <button @click="currentStep = 0" class="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">⏮</button>
              <button @click="stepBackward" class="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">◀</button>
              <button @click="togglePlayPause" class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors">
                {{ isPlaying ? '⏸ Pause' : '▶ Play' }}
              </button>
              <button @click="stepForward" class="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">▶</button>
              <button @click="currentStep = steps.length - 1" class="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">⏭</button>
            </div>
            
            <!-- Speed Control -->
            <div class="flex items-center gap-3 mb-4">
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
            
            <div class="bg-slate-800/50 rounded-lg p-4">
              <p class="text-white whitespace-pre-wrap">{{ currentStepData?.description }}</p>
            </div>
            
            <div v-if="tableIterations.length > 0" class="mt-4 overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-purple-400">
                    <th class="text-left p-2 text-purple-200">Iteration</th>
                    <th class="text-left p-2 text-purple-200">Edge</th>
                    <th v-for="n in nodes" :key="n.id" class="text-center p-2 text-purple-200">{{ n.label }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(iter, idx) in tableIterations" :key="idx" 
                      :class="['border-b border-slate-600 transition-colors', idx === currentTableIterationIndex ? 'bg-purple-600/40 ring-2 ring-purple-400' : '']">
                    <td class="p-2 text-white">{{ iter.iterationNumber }}</td>
                    <td class="p-2 text-white">{{ iter.description }}</td>
                    <td v-for="n in nodes" :key="n.id" 
                        :class="['text-center p-2', iter.updatedNodes.includes(n.label) ? 'bg-yellow-600/30 text-yellow-200 font-bold ring-2 ring-yellow-400 rounded' : 'text-white']">
                      {{ iter.distances[n.label] === Infinity ? '∞' : iter.distances[n.label] }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <div class="space-y-6">
          <!-- Mode Selection -->
          <div class="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-2xl border border-white/20">
            <h3 class="text-xl font-semibold text-white mb-4">Construction Mode</h3>
            <div class="space-y-3">
              <button @click="toggleMode" :class="[
                'w-full py-3 px-4 rounded-lg font-semibold transition-colors text-lg',
                mode === 'node' ? 'bg-green-600 hover:bg-green-700' : 
                mode === 'edge' ? 'bg-blue-600 hover:bg-blue-700' :
                'bg-yellow-600 hover:bg-yellow-700',
                'text-white'
              ]">
                {{ mode === 'node' ? 'Add Nodes Mode' : 
                   mode === 'edge' ? 'Add Edges Mode' : 
                   'Edit Weights Mode' }}
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
              
              <button @click="generateRandomDAG" class="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors text-lg">
                Generate Random DAG
              </button>
            </div>
          </div>
          
          <!-- Quick Add Node -->
          <div class="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-2xl border border-white/20">
            <h3 class="text-xl font-semibold text-white mb-4">Quick Add Node</h3>
            <div class="space-y-3">
              <div class="flex gap-2">
                <input
                  v-model="newNodeLabel"
                  @keypress.enter="handleAddNodeWithLabel"
                  type="text"
                  placeholder="Node label (optional)"
                  class="flex-1 px-3 py-2 bg-slate-800/50 text-white rounded-lg border-none outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button @click="handleAddNodeWithLabel" class="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg">+</button>
              </div>
              <p class="text-xs text-purple-200">
                Leave empty for auto-generated label, or enter custom label
              </p>
            </div>
          </div>
          
          <!-- Add Edge (Manual Entry) -->
          <div class="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-2xl border border-white/20">
            <h3 class="text-xl font-semibold text-white mb-4">Add Edge (Manual)</h3>
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
                <input v-model="newEdgeWeight" type="number" placeholder="Weight" class="flex-1 px-3 py-2 bg-slate-800/50 text-white rounded-lg border-none outline-none focus:ring-2 focus:ring-purple-500" />
                <button @click="decrementNewWeight" class="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg">-1</button>
                <button @click="incrementNewWeight" class="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg">+1</button>
              </div>
              <button @click="handleAddEdgeManually" class="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold">Add Edge</button>
            </div>
          </div>
          
          <!-- Edge Weight Quick Set -->
          <div class="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-2xl border border-white/20">
            <h3 class="text-xl font-semibold text-white mb-4">Quick Set Edge Weight</h3>
            <div class="space-y-2">
              <select v-model="quickEditEdgeFrom" class="w-full px-3 py-2 bg-slate-800/50 text-white rounded-lg border-none outline-none focus:ring-2 focus:ring-purple-500">
                <option value="">Select Edge</option>
                <option v-for="e in edges" :key="`${e.from}-${e.to}`" :value="`${e.from}|${e.to}`">
                  {{ e.from }} → {{ e.to }} (Current: {{ e.weight }})
                </option>
              </select>
              <div class="flex gap-2">
                <input v-model="quickEditWeight" type="number" placeholder="New weight" class="flex-1 px-3 py-2 bg-slate-800/50 text-white rounded-lg border-none outline-none focus:ring-2 focus:ring-purple-500" />
                <button @click="updateQuickWeight" class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold">Set</button>
              </div>
            </div>
          </div>
          
          <!-- Algorithm Settings -->
          <div class="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-2xl border border-white/20">
            <h3 class="text-xl font-semibold text-white mb-4">Algorithm Settings</h3>
            <div class="space-y-3">
              <div>
                <label class="block text-purple-200 mb-1">Source Node</label>
                <select v-model="sourceNode" class="w-full px-3 py-2 bg-slate-800/50 text-white rounded-lg border-none outline-none focus:ring-2 focus:ring-purple-500">
                  <option value="">Select source</option>
                  <option v-for="n in nodes" :key="n.id" :value="n.label">{{ n.label }}</option>
                </select>
              </div>
              <div>
                <label class="block text-purple-200 mb-1">Target Node (Optional)</label>
                <select v-model="targetNode" class="w-full px-3 py-2 bg-slate-800/50 text-white rounded-lg border-none outline-none focus:ring-2 focus:ring-purple-500">
                  <option value="">Select target</option>
                  <option v-for="n in nodes" :key="n.id" :value="n.label">{{ n.label }}</option>
                </select>
              </div>
              <button @click="generateSteps" class="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold text-lg">Run Algorithm</button>
              <button @click="handleReset" class="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-lg">Reset All</button>
            </div>
          </div>
          
          <div v-if="error" class="bg-red-500/20 border border-red-500 rounded-xl p-4">
            <p class="text-red-200 whitespace-pre-wrap">{{ error }}</p>
          </div>
          
          <!-- Instructions -->
          <div class="bg-blue-500/20 border border-blue-500/50 rounded-xl p-4">
            <h3 class="text-lg font-semibold text-blue-200 mb-2">How to Use</h3>
            <ul class="text-blue-100 text-sm space-y-1">
              <li>• <span class="font-bold">Node Mode:</span> Click canvas to place nodes</li>
              <li>• <span class="font-bold">Edge Mode:</span> Click two nodes to connect</li>
              <li>• <span class="font-bold">Weight Mode:</span> Click edge weights to edit</li>
              <li>• Use manual inputs for precise control</li>
              <li>• Random DAG creates a valid topological ordering</li>
              <li>• Run algorithm to visualize shortest paths</li>
            </ul>
          </div>
          
          <div v-if="nodes.length > 0" class="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-2xl border border-white/20">
            <h3 class="text-xl font-semibold text-white mb-4">Nodes ({{ nodes.length }})</h3>
            <div class="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
              <div v-for="n in nodes" :key="n.id" class="flex items-center justify-between bg-slate-800/50 p-2 rounded-lg">
                <span class="text-white font-semibold text-sm">{{ n.label }}</span>
                <button @click="handleDeleteNode(n.id)" class="p-1 text-red-400 hover:text-red-300 text-xs">🗑</button>
              </div>
            </div>
          </div>
          
          <div v-if="edges.length > 0" class="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-2xl border border-white/20">
            <h3 class="text-xl font-semibold text-white mb-4">Edges ({{ edges.length }})</h3>
            <div class="space-y-2 max-h-48 overflow-y-auto">
              <div v-for="(e, idx) in edges" :key="idx" class="flex items-center justify-between bg-slate-800/50 p-2 rounded-lg">
                <span class="text-white text-sm">{{ e.from }} → {{ e.to }} 
                  <span class="text-purple-300 font-bold">({{ e.weight }})</span>
                </span>
                <div class="flex gap-1">
                  <button @click="editEdgeWeight(e)" class="p-1 text-yellow-400 hover:text-yellow-300 text-xs" title="Edit weight">✏️</button>
                  <button @click="handleDeleteEdge(e.from, e.to)" class="p-1 text-red-400 hover:text-red-300 text-xs">🗑</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';

const canvasRef = ref(null);
const nodes = ref([]);
const edges = ref([]);
const sourceNode = ref('');
const targetNode = ref('');
const newNodeLabel = ref('');
const newEdgeFrom = ref('');
const newEdgeTo = ref('');
const newEdgeWeight = ref('1');
const steps = ref([]);
const currentStep = ref(0);
const isPlaying = ref(false);
const speed = ref(1000);
const error = ref('');
const mode = ref('node'); // 'node', 'edge', or 'weight'
const selectedNode = ref(null);
const nodeCounter = ref(0);

// Weight editing
const showWeightEditor = ref(false);
const editingEdge = ref(null);
const tempWeight = ref(1);
const quickEditEdgeFrom = ref('');
const quickEditWeight = ref('1');

const quickWeights = [1, 2, 3, 5, 10, 15, 20, 25];

let playInterval = null;

const STEP_TYPES = {
  INITIALIZE: 'initialize',
  TOPO_SORT: 'topo_sort',
  PROCESS_NODE: 'process_node',
  RELAX_EDGE: 'relax_edge',
  UPDATE_DISTANCE: 'update_distance',
  NO_UPDATE: 'no_update',
  COMPLETE: 'complete'
};

const currentStepData = computed(() => steps.value[currentStep.value]);

const tableIterations = computed(() => {
  const iterations = [];
  const all = steps.value;
  const currentIdx = currentStep.value;
  let iterationCount = 1;
  
  for (let i = 0; i < all.length; i++) {
    const step = all[i];
    
    if (step.type === STEP_TYPES.RELAX_EDGE && step.relaxingEdge) {
      const nextStep = i + 1 < all.length ? all[i + 1] : null;
      
      if (nextStep) {
        const stepIndexToCheck = nextStep.type === STEP_TYPES.UPDATE_DISTANCE ? i + 1 : i;
        
        // Only include iterations up to current step
        if (stepIndexToCheck <= currentIdx) {
          const updatedNodes = [];
          
          if (nextStep.type === STEP_TYPES.UPDATE_DISTANCE) {
            updatedNodes.push(nextStep.relaxingEdge.to);
          }
          
          iterations.push({
            stepIndex: stepIndexToCheck,
            iterationNumber: iterationCount,
            description: `${step.relaxingEdge.from} → ${step.relaxingEdge.to}`,
            distances: nextStep.type === STEP_TYPES.UPDATE_DISTANCE ? { ...nextStep.distances } : { ...step.distances },
            predecessors: nextStep.type === STEP_TYPES.UPDATE_DISTANCE ? { ...nextStep.predecessors } : { ...step.predecessors },
            updatedNodes: updatedNodes
          });
          
          iterationCount++;
        }
      }
    }
  }

  return iterations;
});

const currentTableIterationIndex = computed(() => {
  return tableIterations.value.length - 1;
});

// Modified handleCanvasClick to support weight editing
const handleCanvasClick = (event) => {
  const canvas = canvasRef.value;
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const x = (event.clientX - rect.left) * scaleX;
  const y = (event.clientY - rect.top) * scaleY;
  
  if (mode.value === 'node') {
    addNodeAtPosition(x, y);
  } else if (mode.value === 'edge') {
    handleEdgeClick(x, y);
  } else if (mode.value === 'weight') {
    handleWeightClick(x, y);
  }
};

// NEW: Handle clicking on edge weights
const handleWeightClick = (x, y) => {
  // Find if we clicked on an edge weight
  for (const edge of edges.value) {
    const fromNode = nodes.value.find(n => n.label === edge.from);
    const toNode = nodes.value.find(n => n.label === edge.to);
    if (!fromNode || !toNode) continue;
    
    // Calculate weight label position
    const dx = toNode.x - fromNode.x;
    const dy = toNode.y - fromNode.y;
    const angle = Math.atan2(dy, dx);
    const nodeRadius = 35;
    
    const startX = fromNode.x + (nodeRadius + 5) * Math.cos(angle);
    const startY = fromNode.y + (nodeRadius + 5) * Math.sin(angle);
    const endX = toNode.x - (nodeRadius + 10) * Math.cos(angle);
    const endY = toNode.y - (nodeRadius + 10) * Math.sin(angle);
    
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;
    const labelAngle = Math.atan2(endY - startY, endX - startX);
    const labelX = midX - 25 * Math.sin(labelAngle);
    const labelY = midY + 25 * Math.cos(labelAngle);
    
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
        
        // Check if edge already exists
        const exists = edges.value.some(e => 
          e.from === fromNode.label && e.to === toNode.label
        );
        
        if (!exists) {
          addEdge(fromNode.label, toNode.label, 1); // Default weight of 1
        } else {
          error.value = 'Edge already exists';
          setTimeout(() => error.value = '', 2000);
        }
      }
      selectedNode.value = null;
    }
  }
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

const addNodeAtPosition = (x, y, label = '') => {
  const id = `N${nodeCounter.value++}`;
  const defaultLabel = String.fromCharCode(65 + (nodes.value.length % 26));
  const nodeLabel = label || defaultLabel;
  
  if (nodes.value.some(n => n.label === nodeLabel)) {
    error.value = `Node label "${nodeLabel}" already exists`;
    setTimeout(() => error.value = '', 2000);
    return;
  }
  
  nodes.value.push({ 
    id, 
    label: nodeLabel, 
    x, 
    y 
  });
  
  newNodeLabel.value = '';
  resetVisualization();
};

const handleAddNodeWithLabel = () => {
  const label = newNodeLabel.value.trim().toUpperCase();
  const { x, y } = calculateNodePosition(nodes.value.length);
  addNodeAtPosition(x, y, label);
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
    error.value = 'Self-loops not allowed in DAG';
    setTimeout(() => error.value = '', 2000);
    return;
  }
  
  addEdge(from, to, weight);
  newEdgeFrom.value = '';
  newEdgeTo.value = '';
  newEdgeWeight.value = '1';
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
  
  const edge = edges.value.find(e => e.from === from && e.to === to);
  if (edge) {
    edge.weight = weight;
    resetVisualization();
    quickEditEdgeFrom.value = '';
    quickEditWeight.value = '1';
    error.value = `Updated ${from}→${to} weight to ${weight}`;
    setTimeout(() => error.value = '', 2000);
  }
};

const addEdge = (from, to, weight = 1) => {
  if (edges.value.some(e => e.from === from && e.to === to)) {
    error.value = 'Edge already exists';
    setTimeout(() => error.value = '', 2000);
    return;
  }
  
  edges.value.push({ from, to, weight });
  resetVisualization();
};

const generateRandomDAG = () => {
  nodes.value = [];
  edges.value = [];
  sourceNode.value = '';
  targetNode.value = '';
  nodeCounter.value = 0;
  
  const canvas = canvasRef.value;
  const numNodes = 6 + Math.floor(Math.random() * 3); // 6-8 nodes
  const padding = 100;
  
  for (let i = 0; i < numNodes; i++) {
    const angle = (i * 2 * Math.PI) / numNodes;
    const radius = Math.min(canvas.width, canvas.height) / 2 - padding;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const x = centerX + radius * 0.7 * Math.cos(angle);
    const y = centerY + radius * 0.7 * Math.sin(angle);
    
    const id = `N${nodeCounter.value++}`;
    const label = String.fromCharCode(65 + i);
    nodes.value.push({ id, label, x, y });
  }
  
  const numEdges = Math.floor(numNodes * 1.5);
  const addedEdges = new Set();
  let attempts = 0;
  const maxAttempts = numEdges * 3;
  
  while (addedEdges.size < numEdges && attempts < maxAttempts) {
    attempts++;
    const fromIdx = Math.floor(Math.random() * (numNodes - 1));
    const toIdx = fromIdx + 1 + Math.floor(Math.random() * (numNodes - fromIdx - 1));
    
    const edgeKey = `${fromIdx}-${toIdx}`;
    
    if (!addedEdges.has(edgeKey)) {
      addedEdges.add(edgeKey);
      const weight = Math.floor(Math.random() * 10) + 1; // Random weight 1-10
      edges.value.push({
        from: nodes.value[fromIdx].label,
        to: nodes.value[toIdx].label,
        weight: weight
      });
    }
  }
  
  sourceNode.value = nodes.value[0].label;
  
  resetVisualization();
  error.value = '';
};

const handleDeleteNode = (nodeId) => {
  const node = nodes.value.find(n => n.id === nodeId);
  if (node) {
    nodes.value = nodes.value.filter(n => n.id !== nodeId);
    edges.value = edges.value.filter(e => e.from !== node.label && e.to !== node.label);
    if (sourceNode.value === node.label) sourceNode.value = '';
    if (targetNode.value === node.label) targetNode.value = '';
  }
  resetVisualization();
};

const handleDeleteEdge = (from, to) => {
  edges.value = edges.value.filter(e => !(e.from === from && e.to === to));
  resetVisualization();
};

const detectCycle = () => {
  const visited = new Set();
  const recStack = new Set();
  
  const dfs = (node, path = []) => {
    visited.add(node);
    recStack.add(node);
    path.push(node);
    
    const outgoing = edges.value.filter(e => e.from === node);
    for (const edge of outgoing) {
      if (!visited.has(edge.to)) {
        const result = dfs(edge.to, [...path]);
        if (result) return result;
      } else if (recStack.has(edge.to)) {
        const cycleStart = path.indexOf(edge.to);
        const cycle = path.slice(cycleStart);
        cycle.push(edge.to);
        
        let cycleWeight = 0;
        for (let i = 0; i < cycle.length - 1; i++) {
          const e = edges.value.find(ed => ed.from === cycle[i] && ed.to === cycle[i + 1]);
          if (e) cycleWeight += e.weight;
        }
        
        return { hasCycle: true, isNegative: cycleWeight < 0, cycle, weight: cycleWeight };
      }
    }
    
    recStack.delete(node);
    return false;
  };
  
  for (const node of nodes.value) {
    if (!visited.has(node.label)) {
      const result = dfs(node.label);
      if (result) return result;
    }
  }
  return { hasCycle: false, isNegative: false, cycle: [], weight: 0 };
};

const topologicalSort = () => {
  const visited = new Set();
  const stack = [];
  
  const dfs = (node) => {
    visited.add(node);
    const outgoing = edges.value.filter(e => e.from === node);
    for (const edge of outgoing) {
      if (!visited.has(edge.to)) {
        dfs(edge.to);
      }
    }
    stack.push(node);
  };
  
  for (const node of nodes.value) {
    if (!visited.has(node.label)) {
      dfs(node.label);
    }
  }
  
  return stack.reverse();
};

const reconstructPath = (source, target, predecessors) => {
  const path = [];
  let current = target;
  while (current) {
    path.unshift(current);
    current = predecessors[current];
  }
  return path[0] === source ? path : null;
};

const generateSteps = () => {
  if (nodes.value.length === 0) {
    error.value = 'Add nodes first';
    setTimeout(() => error.value = '', 2000);
    return;
  }
  
  if (!sourceNode.value || !nodes.value.some(n => n.label === sourceNode.value)) {
    error.value = 'Select a valid source node';
    setTimeout(() => error.value = '', 2000);
    return;
  }
  
  const cycleInfo = detectCycle();
  
  if (cycleInfo.hasCycle) {
    if (cycleInfo.isNegative) {
      error.value = `❌ NEGATIVE CYCLE DETECTED!\n\nCycle: ${cycleInfo.cycle.join(' → ')}\nTotal weight: ${cycleInfo.weight}\n\nThe DAG shortest path algorithm cannot be used on graphs with negative cycles.`;
    } else {
      error.value = `⚠️ CYCLE DETECTED!\n\nCycle: ${cycleInfo.cycle.join(' → ')}\nTotal weight: ${cycleInfo.weight}\n\nThe graph contains a cycle, so it's not a DAG.`;
    }
    return;
  }
  
  const newSteps = [];
  const distances = {};
  const predecessors = {};
  
  nodes.value.forEach(node => {
    distances[node.label] = node.label === sourceNode.value ? 0 : Infinity;
    predecessors[node.label] = null;
  });
  
  newSteps.push({
    type: STEP_TYPES.INITIALIZE,
    distances: { ...distances },
    predecessors: { ...predecessors },
    description: `Initialize: d(${sourceNode.value}) = 0, all others = ∞`
  });
  
  const topoOrder = topologicalSort();
  newSteps.push({
    type: STEP_TYPES.TOPO_SORT,
    distances: { ...distances },
    predecessors: { ...predecessors },
    topoOrder: [...topoOrder],
    description: `Topological order: ${topoOrder.join(' → ')}`
  });
  
  for (const nodeName of topoOrder) {
    newSteps.push({
      type: STEP_TYPES.PROCESS_NODE,
      distances: { ...distances },
      predecessors: { ...predecessors },
      topoOrder: [...topoOrder],
      currentNode: nodeName,
      description: `Processing node ${nodeName} (d = ${distances[nodeName] === Infinity ? '∞' : distances[nodeName]})`
    });
    
    const outgoing = edges.value.filter(e => e.from === nodeName);
    for (const edge of outgoing) {
      const oldDist = distances[edge.to];
      const newDist = distances[nodeName] + edge.weight;
      
      newSteps.push({
        type: STEP_TYPES.RELAX_EDGE,
        distances: { ...distances },
        predecessors: { ...predecessors },
        topoOrder: [...topoOrder],
        currentNode: nodeName,
        relaxingEdge: edge,
        description: `Relax edge ${edge.from}→${edge.to} (weight ${edge.weight})`
      });
      
      if (distances[nodeName] !== Infinity && newDist < oldDist) {
        distances[edge.to] = newDist;
        predecessors[edge.to] = nodeName;
        
        newSteps.push({
          type: STEP_TYPES.UPDATE_DISTANCE,
          distances: { ...distances },
          predecessors: { ...predecessors },
          topoOrder: [...topoOrder],
          currentNode: nodeName,
          relaxingEdge: edge,
          description: `✓ Update: d(${edge.to}) = ${newDist}`
        });
      } else {
        newSteps.push({
          type: STEP_TYPES.NO_UPDATE,
          distances: { ...distances },
          predecessors: { ...predecessors },
          topoOrder: [...topoOrder],
          currentNode: nodeName,
          relaxingEdge: edge,
          description: `✗ No update`
        });
      }
    }
  }
  
  let pathDescription = 'Algorithm complete!';
  if (targetNode.value && nodes.value.some(n => n.label === targetNode.value)) {
    const path = reconstructPath(sourceNode.value, targetNode.value, predecessors);
    if (path) {
      pathDescription += `\n\nPath: ${path.join(' → ')} (distance: ${distances[targetNode.value]})`;
    }
  }
  
  newSteps.push({
    type: STEP_TYPES.COMPLETE,
    distances: { ...distances },
    predecessors: { ...predecessors },
    topoOrder: [...topoOrder],
    description: pathDescription,
    finalPath: targetNode.value ? reconstructPath(sourceNode.value, targetNode.value, predecessors) : null
  });
  
  steps.value = newSteps;
  currentStep.value = 0;
  error.value = '';
};

const resetVisualization = () => {
  steps.value = [];
  currentStep.value = 0;
  isPlaying.value = false;
  selectedNode.value = null;
  if (playInterval) {
    clearInterval(playInterval);
    playInterval = null;
  }
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

const handleReset = () => {
  nodes.value = [];
  edges.value = [];
  sourceNode.value = '';
  targetNode.value = '';
  nodeCounter.value = 0;
  resetVisualization();
  error.value = '';
  mode.value = 'node';
  showWeightEditor.value = false;
};

const drawCanvas = () => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const stepData = currentStepData.value;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  const shortestPathEdges = new Set();
  if (stepData?.type === STEP_TYPES.COMPLETE && stepData.predecessors) {
    Object.entries(stepData.predecessors).forEach(([node, pred]) => {
      if (pred) shortestPathEdges.add(`${pred}->${node}`);
    });
  }
  
  // Draw edges
  edges.value.forEach(edge => {
    const fromNode = nodes.value.find(n => n.label === edge.from);
    const toNode = nodes.value.find(n => n.label === edge.to);
    if (!fromNode || !toNode) return;
    
    const edgeKey = `${edge.from}->${edge.to}`;
    const isInShortestPath = shortestPathEdges.has(edgeKey);
    const isRelaxing = stepData?.relaxingEdge?.from === edge.from && stepData?.relaxingEdge?.to === edge.to;
    const isInFinalPath = stepData?.finalPath?.includes(edge.from) && 
                          stepData?.finalPath?.includes(edge.to) &&
                          stepData.finalPath.indexOf(edge.to) === stepData.finalPath.indexOf(edge.from) + 1;
    
    const shouldDim = stepData?.type === STEP_TYPES.COMPLETE && !isInShortestPath;
    ctx.globalAlpha = shouldDim ? 0.15 : 1;
    
    const dx = toNode.x - fromNode.x;
    const dy = toNode.y - fromNode.y;
    const angle = Math.atan2(dy, dx);
    
    const nodeRadius = 35;
    const startX = fromNode.x + (nodeRadius + 5) * Math.cos(angle);
    const startY = fromNode.y + (nodeRadius + 5) * Math.sin(angle);
    const endX = toNode.x - (nodeRadius + 10) * Math.cos(angle);
    const endY = toNode.y - (nodeRadius + 10) * Math.sin(angle);
    
    if (isInFinalPath) {
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 5;
    } else if (isRelaxing) {
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 4;
    } else if (isInShortestPath) {
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 3;
    } else {
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
    }
    
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    
    const headlen = 14;
    const arrowAngle = Math.atan2(endY - startY, endX - startX);
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(endX - headlen * Math.cos(arrowAngle - Math.PI / 7), endY - headlen * Math.sin(arrowAngle - Math.PI / 7));
    ctx.lineTo(endX - headlen * Math.cos(arrowAngle + Math.PI / 7), endY - headlen * Math.sin(arrowAngle + Math.PI / 7));
    ctx.closePath();
    ctx.fillStyle = ctx.strokeStyle;
    ctx.fill();
    
    // Calculate weight label position
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;
    const labelAngle = Math.atan2(endY - startY, endX - startX);
    const labelX = midX - 25 * Math.sin(labelAngle);
    const labelY = midY + 25 * Math.cos(labelAngle);
    
    // Draw weight label with highlight if in weight mode
    const isWeightMode = mode.value === 'weight';
    ctx.fillStyle = isInFinalPath ? '#10b981' : isRelaxing ? '#f59e0b' : '#475569';
    
    // Make weight label more prominent in weight mode
    if (isWeightMode) {
      ctx.fillStyle = '#f59e0b'; // Yellow highlight
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(labelX - 20, labelY - 15, 40, 30, 8);
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.roundRect(labelX - 18, labelY - 12, 36, 24, 6);
      ctx.fill();
    }
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(edge.weight, labelX, labelY);
    
    ctx.globalAlpha = 1;
  });
  
  // Draw nodes
  nodes.value.forEach(node => {
    const isSource = node.label === sourceNode.value;
    const isCurrent = stepData?.currentNode === node.label;
    const isInPath = stepData?.finalPath?.includes(node.label);
    const isSelected = selectedNode.value === node.id;
    const distance = stepData?.distances?.[node.label];
    
    ctx.beginPath();
    ctx.arc(node.x, node.y, 35, 0, 2 * Math.PI);
    
    if (isSource) {
      ctx.fillStyle = '#7c3aed';
    } else if (isCurrent) {
      ctx.fillStyle = '#f59e0b';
    } else if (isInPath) {
      ctx.fillStyle = '#10b981';
    } else if (isSelected) {
      ctx.fillStyle = '#22c55e';
    } else {
      ctx.fillStyle = '#475569';
    }
    ctx.fill();
    
    // Draw selection ring
    if (isSelected) {
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 4;
      ctx.stroke();
    }
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node.label, node.x, node.y - 5);
    
    if (distance !== undefined) {
      ctx.font = '12px sans-serif';
      ctx.fillText(distance === Infinity ? '∞' : distance, node.x, node.y + 12);
    }
  });
};

// Watch for changes and redraw canvas
watch([nodes, edges, steps, currentStep, sourceNode, selectedNode, mode], () => {
  drawCanvas();
}, { deep: true });

// Auto-play effect
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