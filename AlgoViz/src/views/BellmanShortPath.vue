<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 lg:p-8">
    <div class="max-w-7xl mx-auto">
      <h1 class="text-3xl lg:text-4xl font-bold text-white mb-2 text-center">
        DAG Shortest Path (Bellman)
      </h1>
      <p class="text-sm lg:text-base text-slate-300 text-center mb-6 lg:mb-8">
        Visualize shortest paths in Directed Acyclic Graphs with topological sorting
      </p>

      <!-- Error Display -->
      <div v-if="error" class="bg-red-500/20 border-2 border-red-500 rounded-xl p-6 mb-4">
        <div class="flex items-start gap-3">
          <div class="text-red-400 text-2xl flex-shrink-0">⚠️</div>
          <div class="flex-1">
            <h3 class="text-lg font-bold text-red-200 mb-2">Error</h3>
            <pre class="text-sm text-red-100 whitespace-pre-wrap font-sans leading-relaxed">{{ error }}</pre>
          </div>
        </div>
      </div>

      <!-- Graph Input Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <!-- Add Node -->
        <div class="bg-white/10 backdrop-blur-lg rounded-xl p-4 lg:p-6 border border-white/20">
          <h2 class="text-lg lg:text-xl font-semibold text-white mb-4">Add Node</h2>
          <div class="flex gap-2">
            <input
              v-model="newNodeName"
              @keypress.enter="handleAddNode"
              placeholder="Node name (A, B, C...)"
              class="flex-1 px-4 py-2 rounded-lg bg-white text-slate-900 placeholder-slate-500 border-2 border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-slate-700 dark:text-white dark:placeholder-slate-400 dark:border-slate-600 dark:focus:ring-purple-400"
            />
            <button
              @click="handleAddNode"
              class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 border border-purple-500 shadow-lg hover:shadow-purple-600/50 active:scale-95"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Add
            </button>
          </div>
          <div class="mt-4 flex flex-wrap gap-2">
            <div v-for="node in nodes" :key="node.name" class="flex items-center gap-2 px-3 py-1.5 bg-white/20 rounded-lg text-white">
              <span class="font-semibold">{{ node.name }}</span>
              <button @click="handleDeleteNode(node.name)" class="text-red-400 hover:text-red-300">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Add Edge -->
        <div class="bg-white/10 backdrop-blur-lg rounded-xl p-4 lg:p-6 border border-white/20">
          <h2 class="text-lg lg:text-xl font-semibold text-white mb-4">Add Edge</h2>
          <div class="grid grid-cols-3 gap-2 mb-2">
            <input
              v-model="newEdgeFrom"
              placeholder="From"
              class="px-3 py-2 rounded-lg bg-white text-slate-900 placeholder-slate-500 border-2 border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-slate-700 dark:text-white dark:placeholder-slate-400 dark:border-slate-600 dark:focus:ring-purple-400"
            />
            <input
              v-model="newEdgeTo"
              placeholder="To"
              class="px-3 py-2 rounded-lg bg-white text-slate-900 placeholder-slate-500 border-2 border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-slate-700 dark:text-white dark:placeholder-slate-400 dark:border-slate-600 dark:focus:ring-purple-400"
            />
            <input
              v-model="newEdgeWeight"
              @keypress.enter="handleAddEdge"
              placeholder="Weight"
              type="number"
              class="px-3 py-2 rounded-lg bg-white text-slate-900 placeholder-slate-500 border-2 border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-slate-700 dark:text-white dark:placeholder-slate-400 dark:border-slate-600 dark:focus:ring-purple-400"
            />
          </div>
          <button
            @click="handleAddEdge"
            class="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors border border-green-500 shadow-lg hover:shadow-green-600/50 active:scale-95"
          >
            Add Edge
          </button>
          <div class="mt-4 space-y-1 max-h-32 overflow-y-auto">
            <div v-for="(edge, i) in edges" :key="i" class="flex items-center justify-between px-3 py-1.5 bg-white/20 rounded-lg text-white text-sm">
              <span>{{ edge.from }} → {{ edge.to }} ({{ edge.weight }})</span>
              <button @click="handleDeleteEdge(edge.from, edge.to)" class="text-red-400 hover:text-red-300">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Source and Target Selection -->
      <div class="bg-white/10 backdrop-blur-lg rounded-xl p-4 lg:p-6 mb-4 border border-white/20">
        <h2 class="text-lg lg:text-xl font-semibold text-white mb-4">Configuration</h2>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">Source Node</label>
            <select
              v-model="sourceNode"
              class="w-full px-4 py-2 rounded-lg bg-white text-slate-900 border-2 border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:focus:ring-purple-400"
            >
              <option value="" class="bg-white text-slate-900 dark:bg-slate-700 dark:text-white">Select source</option>
              <option v-for="node in nodes" :key="node.name" :value="node.name" class="bg-white text-slate-900 dark:bg-slate-700 dark:text-white">
                {{ node.name }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">Target Node (Optional)</label>
            <select
              v-model="targetNode"
              class="w-full px-4 py-2 rounded-lg bg-white text-slate-900 border-2 border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:focus:ring-purple-400"
            >
              <option value="" class="bg-white text-slate-900 dark:bg-slate-700 dark:text-white">All nodes</option>
              <option v-for="node in nodes" :key="node.name" v-show="node.name !== sourceNode" :value="node.name" class="bg-white text-slate-900 dark:bg-slate-700 dark:text-white">
                {{ node.name }}
              </option>
            </select>
          </div>
          <div class="flex items-end gap-2">
            <button
              @click="generateSteps"
              :disabled="nodes.length === 0 || !sourceNode"
              class="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-500 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors border border-green-500 hover:border-green-400 shadow-lg hover:shadow-green-600/50 active:scale-95"
            >
              Run Algorithm
            </button>
            <button
              @click="handleReset"
              class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors border border-red-500 hover:border-red-400 shadow-lg hover:shadow-red-600/50 active:scale-95"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="23 4 23 10 17 10"></polyline>
                <path d="M20.49 15a9 9 0 1 1-2-8.83"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Visualization Canvas -->
      <div class="bg-white/10 backdrop-blur-lg rounded-xl p-4 lg:p-6 mb-4 border border-white/20">
        <h2 class="text-lg lg:text-xl font-semibold text-white mb-4">Graph Visualization</h2>
        <div class="bg-slate-800 rounded-lg overflow-hidden w-full" style="aspect-ratio: 6/5">
          <canvas
            ref="canvasRef"
            width="800"
            height="600"
            class="w-full h-full block"
            style="image-rendering: high-quality"
          />
        </div>
      </div>

      <!-- Step Description and Controls -->
      <div v-if="steps.length > 0" class="bg-white/10 backdrop-blur-lg rounded-xl p-4 lg:p-6 border border-white/20">
        <h2 class="text-lg lg:text-xl font-semibold text-white mb-4">Algorithm Steps</h2>
        
        <div v-if="currentStepData" class="bg-white/20 rounded-lg p-4 mb-4">
          <p class="text-white whitespace-pre-line">{{ currentStepData.description }}</p>
        </div>

        <div class="space-y-4">
          <div class="flex items-center gap-2">
            <button
              @click="stepBackward"
              :disabled="currentStep === 0"
              class="px-4 py-2 bg-slate-600 hover:bg-slate-700 disabled:bg-slate-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors border border-slate-500 hover:border-slate-400 active:scale-95"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="19 20 9 12 19 4 19 20"></polygon>
                <line x1="5" y1="4" x2="5" y2="20"></line>
              </svg>
            </button>
            
            <button
              @click="togglePlayPause"
              class="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 border border-purple-500 shadow-lg hover:shadow-purple-600/50 active:scale-95"
            >
              <svg v-if="!isPlaying" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16"></rect>
                <rect x="14" y="4" width="4" height="16"></rect>
              </svg>
              {{ isPlaying ? 'Pause' : 'Play' }}
            </button>
            
            <button
              @click="stepForward"
              :disabled="currentStep >= steps.length - 1"
              class="px-4 py-2 bg-slate-600 hover:bg-slate-700 disabled:bg-slate-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors border border-slate-500 hover:border-slate-400 active:scale-95"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="5 4 15 12 5 20 5 4"></polygon>
                <line x1="19" y1="4" x2="19" y2="20"></line>
              </svg>
            </button>

            <div class="flex-1 flex items-center gap-2 ml-4">
              <label class="text-white text-sm whitespace-nowrap">Speed:</label>
              <input
                v-model.number="speed"
                type="range"
                min="200"
                max="2000"
                step="200"
                class="flex-1"
              />
              <span class="text-white text-sm min-w-[40px]">
                {{ ((2000 - speed) / 200 + 1).toFixed(0) }}x
              </span>
            </div>
          </div>

          <div class="text-center text-slate-300">
            Step {{ currentStep + 1 }} of {{ steps.length }}
          </div>
        </div>

        <!-- Legend -->
        <div class="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 bg-purple-500 rounded-full"></div>
            <span class="text-sm text-slate-300">Source</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 bg-orange-500 rounded-full"></div>
            <span class="text-sm text-slate-300">Processing</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 bg-green-500 rounded-full"></div>
            <span class="text-sm text-slate-300">In Path</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 bg-blue-500 rounded-full"></div>
            <span class="text-sm text-slate-300">Other</span>
          </div>
        </div>
      </div>

      <!-- Algorithm State Iteration Table -->
      <div v-if="steps.length > 0" class="bg-white/10 backdrop-blur-lg rounded-xl p-4 lg:p-6 border border-white/20">
        <h2 class="text-lg lg:text-xl font-semibold text-white mb-4">Algorithm Progress: Distance from {{ sourceNode }} to Each Node</h2>
        
        <div class="overflow-x-auto">
          <table class="text-xs border-collapse bg-slate-900/30 rounded-lg overflow-hidden">
            <!-- Table Header: Node columns -->
            <thead>
              <tr>
                <th class="px-3 py-2 text-white font-semibold bg-purple-900/50 border border-slate-700 min-w-[80px]">
                  <div class="text-xs">Iteration</div>
                </th>
                <!-- Each node column -->
                <th 
                  v-for="node in nodes"
                  :key="`node-col-${node.name}`"
                  class="px-3 py-2 text-white font-semibold border border-slate-700 text-center min-w-[70px]"
                  :class="node.name === sourceNode ? 'bg-purple-900/50' : 'bg-slate-700/50'"
                >
                  <div style="writing-mode: vertical-rl; transform: rotate(180deg);" class="text-xs whitespace-nowrap">
                    {{ node.name }}
                  </div>
                </th>
              </tr>
            </thead>
            
            <!-- Table Body: Each iteration row -->
            <tbody>
              <!-- Initial state row -->
              <tr class="transition-all duration-300">
                <td class="px-3 py-2 text-white font-semibold bg-purple-900/50 border border-slate-700 text-center">
                  <span class="text-xs font-mono">0</span>
                </td>
                <td 
                  v-for="node in nodes"
                  :key="`init-${node.name}`"
                  class="px-3 py-2 border border-slate-700 text-center transition-all duration-300 bg-slate-800"
                >
                  <span 
                    class="inline-block px-2 py-1 rounded font-mono font-semibold transition-colors duration-300"
                    :class="node.name === sourceNode ? 'bg-purple-600/50 text-purple-300' : 'bg-red-900/50 text-red-300'"
                  >
                    {{ node.name === sourceNode ? '0' : '∞' }}
                  </span>
                </td>
              </tr>
              
              <!-- Each main iteration (processing a node and its successors) -->
              <tr 
                v-for="(iteration, iterIdx) in mainIterations"
                :key="`iter-${iterIdx}`"
                class="transition-all duration-300"
              >
                <!-- Iteration number and node being processed -->
                <td class="px-3 py-2 text-white font-semibold bg-purple-900/50 border border-slate-700 text-center">
                  <div class="text-xs font-mono">{{ iterIdx + 1 }}</div>
                  <div class="text-xs text-slate-300">→ {{ iteration.nodeProcessed }}</div>
                </td>
                
                <!-- Distance for each node after processing -->
                <td 
                  v-for="node in nodes"
                  :key="`${iterIdx}-${node.name}`"
                  class="px-3 py-2 border border-slate-700 text-center transition-all duration-300"
                  :class="currentIterationIndex === iterIdx ? 'bg-green-900/30' : 'bg-slate-800'"
                >
                  <span 
                    class="inline-block px-2 py-1 rounded font-mono font-semibold transition-colors duration-300"
                    :class="{
                      'bg-green-900/50 text-green-300': iteration.distances[node.name] !== Infinity && iteration.distances[node.name] !== undefined,
                      'bg-red-900/50 text-red-300': iteration.distances[node.name] === Infinity,
                      'bg-slate-700 text-slate-400': iteration.distances[node.name] === undefined
                    }"
                  >
                    {{ iteration.distances[node.name] === Infinity ? '∞' : iteration.distances[node.name] ?? '-' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Legend -->
        <div class="text-xs text-slate-400 space-y-1 mt-4">
          <p><span class="text-green-400 font-semibold">Green cells:</span> Distances that were updated in that iteration</p>
          <p><span class="text-red-400 font-semibold">Red cells (∞):</span> Nodes not yet reachable from source</p>
          <p><span class="text-slate-400 font-semibold">Current iteration:</span> Highlighted in green background</p>
          <p><span class="text-purple-400 font-semibold">Row 0:</span> Initial state with source node at distance 0, all others at ∞</p>
          <p><span class="text-purple-400 font-semibold">Rows 1+:</span> Distance state after processing each node and relaxing its successors</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

// Template refs
const canvasRef = ref(null);

// State management
const nodes = ref([]);
const edges = ref([]);
const sourceNode = ref('');
const targetNode = ref('');
const newNodeName = ref('');
const newEdgeFrom = ref('');
const newEdgeTo = ref('');
const newEdgeWeight = ref('');
const steps = ref([]);
const currentStep = ref(0);
const isPlaying = ref(false);
const speed = ref(1000);
const error = ref('');

// Step types
const STEP_TYPES = {
  INITIALIZE: 'initialize',
  TOPO_SORT: 'topo_sort',
  PROCESS_NODE: 'process_node',
  RELAX_EDGE: 'relax_edge',
  UPDATE_DISTANCE: 'update_distance',
  NO_UPDATE: 'no_update',
  COMPLETE: 'complete'
};

// Computed property for current step data
const currentStepData = computed(() => steps.value[currentStep.value]);

// Extract main iterations (PROCESS_NODE steps) from all steps
const mainIterations = computed(() => {
  const iterations = [];
  for (const step of steps.value) {
    if (step.type === STEP_TYPES.PROCESS_NODE) {
      iterations.push({
        nodeProcessed: step.currentNode,
        distances: step.distances,
        predecessors: step.predecessors
      });
    }
  }
  return iterations;
});

// Get current iteration index based on current step
const currentIterationIndex = computed(() => {
  let iterCount = -1;
  for (let i = 0; i <= currentStep.value && i < steps.value.length; i++) {
    if (steps.value[i].type === STEP_TYPES.PROCESS_NODE) {
      iterCount++;
    }
  }
  return iterCount;
});

// Get responsive canvas dimensions
const getCanvasDimensions = () => {
  const canvas = canvasRef.value;
  if (canvas) {
    return { width: canvas.width, height: canvas.height };
  }
  return { width: 800, height: 600 };
};

// Check collision between two nodes and adjust position with improved force calculation
const adjustForCollisions = (newPos, existingNodes, minDistance = 130) => {
  let x = newPos.x;
  let y = newPos.y;
  let maxIterations = 100;
  let iteration = 0;
  
  while (iteration < maxIterations) {
    let collision = false;
    let totalForceX = 0;
    let totalForceY = 0;
    
    for (const node of existingNodes) {
      const dx = x - node.x;
      const dy = y - node.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < minDistance && distance > 0) {
        collision = true;
        // Calculate repulsive force
        const angle = Math.atan2(dy, dx);
        const forceMagnitude = (minDistance - distance) / minDistance;
        totalForceX += Math.cos(angle) * forceMagnitude * 15;
        totalForceY += Math.sin(angle) * forceMagnitude * 15;
      }
    }
    
    if (collision) {
      x += totalForceX;
      y += totalForceY;
    } else {
      break;
    }
    iteration++;
  }
  
  return { x, y };
};

// Calculate optimal layout position to avoid overlaps
const calculateNodePosition = (nodeCount) => {
  const dims = getCanvasDimensions();
  const padding = 100;
  const nodeRadius = 35;
  const minDistance = nodeRadius * 2 + 80; // Increased minimum distance
  
  const centerX = dims.width / 2;
  const centerY = dims.height / 2;
  const maxRadius = Math.min(dims.width, dims.height) / 2 - padding;
  
  let x, y;
  
  if (nodeCount === 0) {
    // First node at center
    x = centerX;
    y = centerY;
  } else if (nodeCount <= 8) {
    // Circle layout for up to 8 nodes - very well spread
    const angle = (nodeCount * 2 * Math.PI) / 8;
    const radius = Math.min(maxRadius * 0.7, 220);
    x = centerX + radius * Math.cos(angle);
    y = centerY + radius * Math.sin(angle);
  } else if (nodeCount <= 16) {
    // Dual circle layout for 9-16 nodes
    const innerCount = 8;
    const isInner = nodeCount <= innerCount;
    const circleIndex = isInner ? nodeCount : (nodeCount - innerCount);
    const maxInCircle = isInner ? innerCount : (nodeCount - innerCount);
    const angle = (circleIndex * 2 * Math.PI) / maxInCircle;
    const radius = isInner ? Math.min(maxRadius * 0.5, 160) : Math.min(maxRadius * 0.75, 240);
    x = centerX + radius * Math.cos(angle);
    y = centerY + radius * Math.sin(angle);
  } else if (nodeCount <= 32) {
    // Triple circle layout for 17-32 nodes
    const layer1Size = 8;
    const layer2Size = 12;
    let circleIndex, angle, radius;
    
    if (nodeCount <= layer1Size) {
      circleIndex = nodeCount;
      angle = (circleIndex * 2 * Math.PI) / layer1Size;
      radius = 140;
    } else if (nodeCount <= layer1Size + layer2Size) {
      circleIndex = nodeCount - layer1Size;
      angle = (circleIndex * 2 * Math.PI) / layer2Size;
      radius = 220;
    } else {
      circleIndex = nodeCount - layer1Size - layer2Size;
      const layer3Size = nodeCount - layer1Size - layer2Size;
      angle = (circleIndex * 2 * Math.PI) / layer3Size;
      radius = 300;
    }
    x = centerX + radius * Math.cos(angle);
    y = centerY + radius * Math.sin(angle);
  } else {
    // Grid layout for 33+ nodes
    const cols = Math.ceil(Math.sqrt(nodeCount * 1.2));
    const rows = Math.ceil(nodeCount / cols);
    const col = nodeCount % cols;
    const row = Math.floor(nodeCount / cols);
    
    const cellWidth = (dims.width - 2 * padding) / cols;
    const cellHeight = (dims.height - 2 * padding) / rows;
    
    x = padding + col * cellWidth + cellWidth / 2 + (Math.random() - 0.5) * cellWidth * 0.2;
    y = padding + row * cellHeight + cellHeight / 2 + (Math.random() - 0.5) * cellHeight * 0.2;
  }
  
  // Ensure nodes stay within canvas bounds
  x = Math.max(padding, Math.min(dims.width - padding, x));
  y = Math.max(padding, Math.min(dims.height - padding, y));
  
  // Adjust for collisions with existing nodes using improved algorithm
  const adjustedPos = adjustForCollisions({ x, y }, nodes.value, minDistance);
  
  // Final boundary check
  adjustedPos.x = Math.max(padding, Math.min(dims.width - padding, adjustedPos.x));
  adjustedPos.y = Math.max(padding, Math.min(dims.height - padding, adjustedPos.y));
  
  return adjustedPos;
};

// Add node with improved distribution
const handleAddNode = () => {
  const name = newNodeName.value.trim().toUpperCase();
  if (!name) return;
  if (nodes.value.some(n => n.name === name)) {
    error.value = 'Node already exists';
    return;
  }
  
  const nodeCount = nodes.value.length;
  const { x, y } = calculateNodePosition(nodeCount);
  
  nodes.value.push({ name, x, y });
  newNodeName.value = '';
  error.value = '';
  resetVisualization();
};

// Add edge
const handleAddEdge = () => {
  const from = newEdgeFrom.value.trim().toUpperCase();
  const to = newEdgeTo.value.trim().toUpperCase();
  const weight = parseFloat(newEdgeWeight.value);
  
  if (!from || !to || isNaN(weight)) {
    error.value = 'Invalid edge data';
    return;
  }
  
  if (!nodes.value.some(n => n.name === from) || !nodes.value.some(n => n.name === to)) {
    error.value = 'Nodes must exist';
    return;
  }
  
  if (from === to) {
    error.value = 'Self-loops not allowed in DAG';
    return;
  }
  
  if (edges.value.some(e => e.from === from && e.to === to)) {
    error.value = 'Edge already exists';
    return;
  }
  
  edges.value.push({ from, to, weight });
  newEdgeFrom.value = '';
  newEdgeTo.value = '';
  newEdgeWeight.value = '';
  error.value = '';
  resetVisualization();
};

// Delete node
const handleDeleteNode = (nodeName) => {
  nodes.value = nodes.value.filter(n => n.name !== nodeName);
  edges.value = edges.value.filter(e => e.from !== nodeName && e.to !== nodeName);
  if (sourceNode.value === nodeName) sourceNode.value = '';
  if (targetNode.value === nodeName) targetNode.value = '';
  resetVisualization();
};

// Delete edge
const handleDeleteEdge = (from, to) => {
  edges.value = edges.value.filter(e => !(e.from === from && e.to === to));
  resetVisualization();
};

// Check if graph has cycle (DFS-based) and detect negative cycles
const detectCycle = () => {
  const visited = new Set();
  const recStack = new Set();
  let cycleEdges = [];
  let cycleFound = false;
  
  const dfs = (node, path = []) => {
    visited.add(node);
    recStack.add(node);
    path.push(node);
    
    const outgoing = edges.value.filter(e => e.from === node);
    for (const edge of outgoing) {
      if (!visited.has(edge.to)) {
        if (dfs(edge.to, [...path])) return true;
      } else if (recStack.has(edge.to)) {
        // Found a cycle - extract it
        const cycleStart = path.indexOf(edge.to);
        const cycle = path.slice(cycleStart);
        cycle.push(edge.to); // complete the cycle
        
        // Calculate cycle weight
        let cycleWeight = 0;
        for (let i = 0; i < cycle.length - 1; i++) {
          const e = edges.value.find(ed => ed.from === cycle[i] && ed.to === cycle[i + 1]);
          if (e) cycleWeight += e.weight;
        }
        
        cycleEdges = cycle;
        cycleFound = true;
        
        return { hasCycle: true, isNegative: cycleWeight < 0, cycle, weight: cycleWeight };
      }
    }
    
    recStack.delete(node);
    return false;
  };
  
  for (const node of nodes.value) {
    if (!visited.has(node.name)) {
      const result = dfs(node.name);
      if (result && result.hasCycle) {
        return result;
      }
    }
  }
  return { hasCycle: false, isNegative: false, cycle: [], weight: 0 };
};

// Topological sort using DFS
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
    if (!visited.has(node.name)) {
      dfs(node.name);
    }
  }
  
  return stack.reverse();
};

// Generate algorithm steps
const generateSteps = () => {
  if (nodes.value.length === 0) {
    error.value = 'Add nodes first';
    return;
  }
  
  if (!sourceNode.value || !nodes.value.some(n => n.name === sourceNode.value)) {
    error.value = 'Select a valid source node';
    return;
  }
  
  const cycleInfo = detectCycle();
  
  if (cycleInfo.hasCycle) {
    if (cycleInfo.isNegative) {
      error.value =
        `❌ NEGATIVE CYCLE DETECTED!\n\n` +
        `Cycle: ${cycleInfo.cycle.join(' → ')}\n` +
        `Total weight: ${cycleInfo.weight}\n\n` +
        `The DAG shortest path algorithm (Bellman on DAG) cannot be used on graphs with negative cycles. ` +
        `Negative cycles make shortest paths undefined (you can keep going around the cycle to get infinitely negative distances).\n\n` +
        `💡 To fix this:\n` +
        `• Remove the cycle to make it a DAG, or\n` +
        `• Use Bellman-Ford algorithm which can detect negative cycles (though it still can't find shortest paths when they exist)`;
      return;
    } else {
      error.value =
        `⚠️ CYCLE DETECTED!\n\n` +
        `Cycle: ${cycleInfo.cycle.join(' → ')}\n` +
        `Total weight: ${cycleInfo.weight}\n\n` +
        `The graph contains a cycle, so it's not a DAG (Directed Acyclic Graph). ` +
        `The DAG shortest path algorithm requires the graph to be acyclic.\n\n` +
        `💡 To fix this:\n` +
        `• Remove one or more edges to break the cycle, or\n` +
        `• Use Dijkstra's algorithm (if all weights are non-negative), or\n` +
        `• Use Bellman-Ford algorithm (if you have negative weights)`;
      return;
    }
  }
  
  const newSteps = [];
  const distances = {};
  const predecessors = {};
  
  // Initialize
  nodes.value.forEach(node => {
    distances[node.name] = node.name === sourceNode.value ? 0 : Infinity;
    predecessors[node.name] = null;
  });
  
  newSteps.push({
    type: STEP_TYPES.INITIALIZE,
    distances: { ...distances },
    predecessors: { ...predecessors },
    description: `Initialize: d(${sourceNode.value}) = 0, all others = ∞`,
    currentNode: null,
    relaxingEdge: null
  });
  
  // Topological sort
  const topoOrder = topologicalSort();
  newSteps.push({
    type: STEP_TYPES.TOPO_SORT,
    distances: { ...distances },
    predecessors: { ...predecessors },
    topoOrder: [...topoOrder],
    description: `Topological order: ${topoOrder.join(' → ')}`,
    currentNode: null,
    relaxingEdge: null
  });
  
  // Process each node in topological order
  for (const nodeName of topoOrder) {
    newSteps.push({
      type: STEP_TYPES.PROCESS_NODE,
      distances: { ...distances },
      predecessors: { ...predecessors },
      topoOrder: [...topoOrder],
      currentNode: nodeName,
      description: `Processing node ${nodeName} (d = ${distances[nodeName] === Infinity ? '∞' : distances[nodeName]})`,
      relaxingEdge: null
    });
    
    // Relax all outgoing edges
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
        description: `Relax edge ${edge.from}→${edge.to} (weight ${edge.weight}): d(${edge.to}) = ${oldDist === Infinity ? '∞' : oldDist}, d(${edge.from}) + w = ${distances[nodeName] === Infinity ? '∞' : newDist}`,
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
          description: `✓ Update: d(${edge.to}) = ${newDist}, predecessor = ${nodeName}`,
        });
      } else {
        newSteps.push({
          type: STEP_TYPES.NO_UPDATE,
          distances: { ...distances },
          predecessors: { ...predecessors },
          topoOrder: [...topoOrder],
          currentNode: nodeName,
          relaxingEdge: edge,
          description: `✗ No update: ${oldDist === Infinity ? '∞' : oldDist} ≤ ${distances[nodeName] === Infinity ? '∞' : newDist}`,
        });
      }
    }
  }
  
  // Build path to target if specified
  let pathDescription = 'Final distances: ';
  pathDescription += nodes.value.map(n => 
    `d(${n.name}) = ${distances[n.name] === Infinity ? '∞' : distances[n.name]}`
  ).join(', ');
  
  if (targetNode.value && nodes.value.some(n => n.name === targetNode.value)) {
    const path = [];
    let current = targetNode.value;
    while (current && predecessors[current]) {
      path.unshift(current);
      current = predecessors[current];
    }
    if (current === sourceNode.value) {
      path.unshift(sourceNode.value);
      pathDescription += `\n\nPath from ${sourceNode.value} to ${targetNode.value}: ${path.join(' → ')} (distance: ${distances[targetNode.value]})`;
    }
  }
  
  newSteps.push({
    type: STEP_TYPES.COMPLETE,
    distances: { ...distances },
    predecessors: { ...predecessors },
    topoOrder: [...topoOrder],
    description: pathDescription,
    currentNode: null,
    relaxingEdge: null,
    finalPath: targetNode.value ? reconstructPath(sourceNode.value, targetNode.value, predecessors) : null
  });
  
  steps.value = newSteps;
  currentStep.value = 0;
  error.value = '';
};

// Reconstruct path
const reconstructPath = (source, target, predecessors) => {
  const path = [];
  let current = target;
  while (current) {
    path.unshift(current);
    current = predecessors[current];
  }
  return path[0] === source ? path : null;
};

// Reset visualization
const resetVisualization = () => {
  steps.value = [];
  currentStep.value = 0;
  isPlaying.value = false;
};

// Playback controls
const togglePlayPause = () => isPlaying.value = !isPlaying.value;
const stepForward = () => currentStep.value < steps.value.length - 1 && currentStep.value++;
const stepBackward = () => currentStep.value > 0 && currentStep.value--;
const handleReset = () => {
  nodes.value = [];
  edges.value = [];
  sourceNode.value = '';
  targetNode.value = '';
  resetVisualization();
};

// Auto-play effect
watch([isPlaying, speed, () => steps.value.length], () => {
  let interval;
  if (isPlaying.value && steps.value.length > 0) {
    interval = setInterval(() => {
      if (currentStep.value >= steps.value.length - 1) {
        isPlaying.value = false;
        return;
      }
      currentStep.value++;
    }, speed.value);
  }
  return () => {
    if (interval) clearInterval(interval);
  };
});

// Canvas drawing
watch([nodes, edges, steps, currentStep, sourceNode], () => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const stepData = currentStepData.value;
  
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Determine which edges are part of shortest path tree
  const shortestPathEdges = new Set();
  if (stepData?.type === STEP_TYPES.COMPLETE && stepData.predecessors) {
    Object.entries(stepData.predecessors).forEach(([node, pred]) => {
      if (pred) {
        shortestPathEdges.add(`${pred}->${node}`);
      }
    });
  }
  
  // Draw edges with enhanced styling
  edges.value.forEach(edge => {
    const fromNode = nodes.value.find(n => n.name === edge.from);
    const toNode = nodes.value.find(n => n.name === edge.to);
    if (!fromNode || !toNode) return;
    
    const edgeKey = `${edge.from}->${edge.to}`;
    const isInShortestPath = shortestPathEdges.has(edgeKey);
    const isRelaxing = stepData?.relaxingEdge?.from === edge.from && 
                       stepData?.relaxingEdge?.to === edge.to;
    const isInFinalPath = stepData?.finalPath?.includes(edge.from) && 
                          stepData?.finalPath?.includes(edge.to) &&
                          stepData.finalPath.indexOf(edge.to) === stepData.finalPath.indexOf(edge.from) + 1;
    
    // Hide edges not in shortest path tree when algorithm is complete
    const shouldDim = stepData?.type === STEP_TYPES.COMPLETE && !isInShortestPath;
    
    if (shouldDim) {
      ctx.globalAlpha = 0.15;
    } else {
      ctx.globalAlpha = 1;
    }
    
    // Calculate arrow with adaptive offsets
    const dx = toNode.x - fromNode.x;
    const dy = toNode.y - fromNode.y;
    const angle = Math.atan2(dy, dx);
    const length = Math.sqrt(dx * dx + dy * dy);
    
    // Adaptive offset based on edge length and node radius
    const nodeRadius = 35;
    const arrowHeadSize = 14;
    const minOffset = nodeRadius + 5;
    const maxOffset = Math.max(nodeRadius + 10, Math.min(40, length * 0.15));
    
    const startX = fromNode.x + minOffset * Math.cos(angle);
    const startY = fromNode.y + minOffset * Math.sin(angle);
    const endX = toNode.x - maxOffset * Math.cos(angle);
    const endY = toNode.y - maxOffset * Math.sin(angle);
    
    // Only draw if the line has valid length
    if (Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2) < 5) {
      ctx.globalAlpha = 1;
      return;
    }
    
    // Draw edge shadow for depth
    if (!shouldDim) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
    }
    
    // Edge color and style
    let gradient;
    if (isInFinalPath) {
      gradient = ctx.createLinearGradient(startX, startY, endX, endY);
      gradient.addColorStop(0, '#10b981');
      gradient.addColorStop(1, '#059669');
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 5;
    } else if (isRelaxing) {
      gradient = ctx.createLinearGradient(startX, startY, endX, endY);
      gradient.addColorStop(0, '#f59e0b');
      gradient.addColorStop(1, '#d97706');
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 4;
    } else if (isInShortestPath) {
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 3;
    } else {
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
    }
    
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Draw arrowhead with fill
    const headlen = isInFinalPath ? 18 : isRelaxing ? 16 : 14;
    const arrowAngle = Math.atan2(endY - startY, endX - startX);
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(
      endX - headlen * Math.cos(arrowAngle - Math.PI / 7),
      endY - headlen * Math.sin(arrowAngle - Math.PI / 7)
    );
    ctx.lineTo(
      endX - headlen * Math.cos(arrowAngle + Math.PI / 7),
      endY - headlen * Math.sin(arrowAngle + Math.PI / 7)
    );
    ctx.closePath();
    ctx.fillStyle = ctx.strokeStyle;
    ctx.fill();
    
    // Draw weight label with background
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;
    const labelAngle = Math.atan2(endY - startY, endX - startX);
    const offsetX = -25 * Math.sin(labelAngle);
    const offsetY = 25 * Math.cos(labelAngle);
    
    const labelX = midX + offsetX;
    const labelY = midY + offsetY;
    
    // Weight background
    ctx.fillStyle = isInFinalPath ? '#10b981' : isRelaxing ? '#f59e0b' : isInShortestPath ? '#6366f1' : '#475569';
    ctx.beginPath();
    ctx.roundRect(labelX - 18, labelY - 12, 36, 24, 6);
    ctx.fill();
    
    // Weight text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(edge.weight, labelX, labelY);
    
    ctx.globalAlpha = 1;
  });
  
  // Draw nodes with enhanced styling
  nodes.value.forEach(node => {
    const isSource = node.name === sourceNode.value;
    const isCurrent = stepData?.currentNode === node.name;
    const isInPath = stepData?.finalPath?.includes(node.name);
    const distance = stepData?.distances?.[node.name];
    
    // Node shadow for depth
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
    
    // Outer glow for special states
    if (isCurrent) {
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 20;
    } else if (isInPath) {
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 16;
    }
    
    // Node circle with gradient
    ctx.beginPath();
    ctx.arc(node.x, node.y, 35, 0, 2 * Math.PI);
    
    let gradient = ctx.createRadialGradient(node.x - 10, node.y - 10, 5, node.x, node.y, 35);
    if (isSource) {
      gradient.addColorStop(0, '#a78bfa');
      gradient.addColorStop(1, '#7c3aed');
    } else if (isCurrent) {
      gradient.addColorStop(0, '#fbbf24');
      gradient.addColorStop(1, '#f59e0b');
    } else if (isInPath) {
      gradient.addColorStop(0, '#34d399');
      gradient.addColorStop(1, '#10b981');
    } else {
      gradient.addColorStop(0, '#60a5fa');
      gradient.addColorStop(1, '#2563eb');
    }
    
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Node border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = isCurrent ? 5 : 3;
    ctx.stroke();
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Inner highlight
    ctx.beginPath();
    ctx.arc(node.x - 8, node.y - 8, 8, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fill();
    
    // Node name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node.name, node.x, node.y);
    
    // Distance label with background
    if (stepData && distance !== undefined) {
      const distText = distance === Infinity ? '∞' : distance.toString();
      const labelY = node.y - 52;
      
      // Measure text for background
      ctx.font = 'bold 15px sans-serif';
      const textWidth = ctx.measureText(`d: ${distText}`).width;
      
      // Distance background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.beginPath();
      ctx.roundRect(node.x - textWidth/2 - 8, labelY - 10, textWidth + 16, 20, 10);
      ctx.fill();
      
      // Distance text
      ctx.fillStyle = distance === Infinity ? '#f87171' : '#34d399';
      ctx.fillText(`d: ${distText}`, node.x, labelY);
    }
  });
});
</script>

<style scoped>
/* Component-specific styles */
</style>
