<template>
  <div
    v-if="store.listaSelecionada == null"
    style="display: flex; justify-content: center; align-items: center; width: 100%; margin-top: 20px;">
    <div style="max-width: 600px; width: 100%;">
      <div style="font-size: 25px; text-align: center; margin-bottom: 20px;">Lista de Provas</div>
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; cursor: default;">
        <div 
          v-for="(p, index) in distinctProvas" 
          :key="p" 
          @click="store.listaSelecionada = p"
          style="border: 1px solid #ddd; padding: 10px; text-align: center; text-decoration: underline; transition: all 0.3s ease; cursor: pointer;">
          {{ p }}
        </div>
      </div>
    </div>
  </div>

  <div v-if="store.listaSelecionada != null">
    <Ranking />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import Ranking from './Ranking.vue';
import { useStore } from '@/stores/store'

const store = useStore()  

store.listaSelecionada = null

// Referências reativas
store.participantes = ref([]);
const page = ref(1);
const pageSize = 20;  // Número de participantes por página
const totalPages = ref(1);

// Função para buscar os participantes
const fetchParticipants = async () => {
  try {
    const response = await axios.get((`${store.baseHttp}/ranking`));
    store.participantes = response.data;  // Dados da resposta da API
    totalPages.value = Math.ceil(store.participantes.length / pageSize);
  } catch (error) {
    console.error('Erro ao buscar participantes:', error);
  }
};

// Lista distinta de provas
const distinctProvas = computed(() => [...new Set(store.participantes.map(p => p.prova))]);

// Computed para retornar os participantes paginados
const paginatedParticipants = computed(() => {
  const start = (page.value - 1) * pageSize;
  const end = page.value * pageSize;
  return participants.value.slice(start, end);
});

// Função para alterar a página
const changePage = (newPage) => {
  if (newPage >= 1 && newPage <= totalPages.value) {
    page.value = newPage;
  }
};

// Buscar os participantes ao montar o componente
onMounted(() => {
  fetchParticipants();
});
</script>

<style scoped>
/* Adiciona interatividade ao passar o mouse */
div:hover { 
  text-decoration: none; /* Remove o sublinhado ao passar o mouse */
}

div > div {
  cursor: pointer; /* Muda o cursor para uma mão quando passar sobre os itens da lista */
}

div > div:hover {
 
  text-decoration: none; /* Remove o sublinhado */
}
</style>

