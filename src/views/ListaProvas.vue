<template>  
 
 <div
  v-if="store.listaSelecionada == null"
  style="display: flex; justify-content: center; align-items: flex-start; width: 100%; margin-top: 20px;"
>
  <div style="max-width: 1200px; width: 100%;">
    <div style="font-size: 25px; text-align: center; margin-bottom: 20px;">Lista de Provas</div>

    <!-- Grid com 4 colunas: BAREBOW | COMPOSTO | RECURVO | PARAOLÍMPICO -->
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px;">

      <!-- Componente reutilizável para cada grupo -->
      <div v-for="(grupo, nomeGrupo) in {
        'BAREBOW': provasBarebow,
        'COMPOSTO': provasComposto,
        'RECURVO': provasRecurvo,
        'PARAOLÍMPICO': provasParaolimpico
      }" :key="nomeGrupo">
        <h3 style="text-align: center;">{{ nomeGrupo }}</h3>
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div 
            v-for="prova in grupo" 
            :key="prova"
            @click="store.listaSelecionada = prova"
            style="border: 1px solid #ddd; padding: 10px; text-align: center; text-decoration: underline; cursor: pointer;"
          >
            {{ prova }}
          </div>
        </div>
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

const store = useStore();
store.listaSelecionada = null;

const getDistinctProvasPorTipo = (tipo) => {
  return [...new Set(
    store.participantes
      .filter(p => p.prova?.toUpperCase().includes(tipo))
      .map(p => p.prova)
  )].sort((a, b) => a.localeCompare(b));
};

// Provas por tipo
const provasBarebow = computed(() => getDistinctProvasPorTipo("BAREBOW"));
const provasComposto = computed(() => getDistinctProvasPorTipo("COMPOSTO"));
const provasRecurvo = computed(() => getDistinctProvasPorTipo("RECURVO"));

// Provas que NÃO são Barebow, Composto nem Recurvo
const provasParaolimpico = computed(() => {
  const conhecidos = [...provasBarebow.value, ...provasComposto.value, ...provasRecurvo.value];
  const todasProvas = store.participantes.map(p => p.prova);
  const unicas = [...new Set(todasProvas)];
  return unicas
    .filter(p => !conhecidos.includes(p))
    .sort((a, b) => a.localeCompare(b));
});
 
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

