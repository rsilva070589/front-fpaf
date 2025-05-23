<template>
  
  <div
  v-if="store.listaSelecionada == null"
  style="display: flex; justify-content: center; align-items: center; width: 100%; margin-top: 20px;">
  <div style="max-width: 900px; width: 100%;">  <!-- Aumentei de 600px para 900px -->
    <div style="font-size: 25px; text-align: center; margin-bottom: 20px;">Lista de Provas: {{props.tipo}}</div>
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

// ⬇️ Prop recebida
const props = defineProps({
  tipo: String
});


const store = useStore()  
store.listaSelecionada = null;
store.participantes = ref([]);
const page = ref(1);
const pageSize = 20;
const totalPages = ref(1);

// Participantes filtrados por tipo (INDOOR / OUTDOOR)
const filteredParticipantes = computed(() =>
  store.participantes.filter(p => p.classe === props.tipo)
);

// Lista distinta de provas do tipo selecionado
const distinctProvas = computed(() => {
  return [...new Set(filteredParticipantes.value.map(p => p.prova))]
    .sort((a, b) => a.localeCompare(b));
});


// Participantes paginados (se usar depois)
const paginatedParticipants = computed(() => {
  const start = (page.value - 1) * pageSize;
  const end = page.value * pageSize;
  return filteredParticipantes.value.slice(start, end);
});

const changePage = (newPage) => {
  if (newPage >= 1 && newPage <= totalPages.value) {
    page.value = newPage;
  }
};

const fetchParticipants = async () => {
  try {
    const response = await axios.get((`${store.baseHttp}/ranking`));
    store.participantes = response.data;
    totalPages.value = Math.ceil(filteredParticipantes.value.length / pageSize);
  } catch (error) {
    console.error('Erro ao buscar participantes:', error);
  }
};

onMounted(() => {
  console.log('Tipo recebido:', props.tipo);
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

