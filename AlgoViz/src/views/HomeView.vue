<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const algorithms = ref([
  {
    id: 'sorting',
    title: 'Sorting Algorithms',
    description: 'Visualize how different sorting algorithms work step-by-step. Includes Quicksort with multiple pivot strategies.',
    icon: 'M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12',
    color: 'from-blue-500 to-cyan-500',
    route: '/sorting',
    features: ['Quicksort', 'Multiple Pivot Strategies', 'Step-by-step Visualization']
  },
  {
    id: 'shortest-path',
    title: 'Shortest Path',
    description: 'Find the shortest path between two nodes in a graph using various pathfinding algorithms.',
    icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7',
    color: 'from-green-500 to-emerald-500',
    route: '/shortest-path',
    features: ['Dijkstra\'s Algorithm', 'A* Search', 'Interactive Graph']
  },
  {
    id: 'coloring',
    title: 'Graph Coloring',
    description: 'Visualize graph coloring algorithms and understand how to color vertices with minimum colors.',
    icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01',
    color: 'from-purple-500 to-pink-500',
    route: '/coloring',
    features: ['Greedy Coloring', 'Chromatic Number', 'Interactive Graph']
  }
]);

const navigateTo = (route) => {
  router.push(route);
};
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
    <!-- Hero Section -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
      <div class="text-center mb-16">
        <h1 class="text-4xl lg:text-6xl font-bold text-white mb-4 lg:mb-6">
          Algorithm Visualizer
        </h1>
        <p class="text-lg lg:text-xl text-slate-300 max-w-3xl mx-auto">
          Interactive visualizations to understand how algorithms work. 
          Learn through step-by-step demonstrations and hands-on exploration.
        </p>
      </div>

      <!-- Algorithm Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        <div
          v-for="algo in algorithms"
          :key="algo.id"
          class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 lg:p-8 border border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105 cursor-pointer group"
          @click="navigateTo(algo.route)"
        >
          <!-- Icon -->
          <div 
            class="w-16 h-16 lg:w-20 lg:h-20 rounded-xl mb-6 flex items-center justify-center bg-gradient-to-br shadow-lg group-hover:shadow-xl transition-shadow"
            :class="algo.color"
          >
            <svg 
              class="w-8 h-8 lg:w-10 lg:h-10 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                stroke-linecap="round" 
                stroke-linejoin="round" 
                stroke-width="2" 
                :d="algo.icon" 
              />
            </svg>
          </div>

          <!-- Content -->
          <h2 class="text-xl lg:text-2xl font-bold text-white mb-3">
            {{ algo.title }}
          </h2>
          <p class="text-slate-300 mb-6 text-sm lg:text-base leading-relaxed">
            {{ algo.description }}
          </p>

          <!-- Features -->
          <div class="space-y-2 mb-6">
            <div
              v-for="(feature, idx) in algo.features"
              :key="idx"
              class="flex items-center gap-2 text-slate-400 text-sm"
            >
              <svg class="w-4 h-4 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>{{ feature }}</span>
            </div>
          </div>

          <!-- Action Button -->
          <div class="flex items-center justify-between text-white font-medium group-hover:text-purple-300 transition-colors">
            <span>Explore</span>
            <svg class="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Footer Info -->
      <div class="mt-16 lg:mt-20 text-center">
        <div class="bg-white/5 backdrop-blur-lg rounded-xl p-6 lg:p-8 border border-white/10 max-w-4xl mx-auto">
          <h3 class="text-xl lg:text-2xl font-bold text-white mb-4">
            Learn by Doing
          </h3>
          <p class="text-slate-300 text-sm lg:text-base leading-relaxed">
            Each visualizer provides interactive controls to step through algorithms at your own pace. 
            Understand the logic behind each operation with detailed descriptions and color-coded visualizations.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>