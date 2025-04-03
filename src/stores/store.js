import { ref, computed } from 'vue';
import { defineStore } from 'pinia';

export const useStore = defineStore('main', () => {
  const count = ref(0);
  const doubleCount = computed(() => count.value * 2);
  const baseHttp = ref(
    window.location.hostname === 'localhost' ? 'http://localhost:3123' : 'https://api.mapsis.com.br/apiexpress'
  );

  function increment() {
    count.value++;
  }

  return { count, doubleCount, increment, baseHttp }; // Retornando baseHttp para uso global
});
