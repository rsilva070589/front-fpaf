<template>  
 
  <div
   v-if="store.listaSelecionada == null"
   style="display: flex; justify-content: center; align-items: flex-start; width: 100%; margin-top: 20px;"
 >
   <div style="max-width: 1200px; width: 100%;">
     <div style="font-size: 25px; text-align: center; margin-bottom: 20px;">Lista de Provas {{ props.ano }}</div>
 
     <!-- Grid com 4 colunas: BAREBOW | COMPOSTO | RECURVO | PARAOLÍMPICO -->
     <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px;">
 
       <!-- Componente reutilizável para cada grupo -->
       <div v-for="(grupo, nomeGrupo) in {
         'BAREBOWL': provasBarebow,
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
import { useStore } from '@/stores/store';

// ⬇️ Props recebidas
const props = defineProps({
  tipo: String,
  ano: Number
});

const store = useStore();
store.listaSelecionada = null;
store.participantes = ref([]);

const page = ref(1);
const pageSize = 20;
const totalPages = ref(1);

// ✅ Filtra participantes por tipo E ano
const filteredParticipantes = computed(() =>
  store.participantes.filter(p =>
    p.classe === props.tipo 
    &&  p.ano_integracao === props.ano 
  )
);

// ✅ Função para obter provas distintas por tipo de prova
const getDistinctProvasPorTipo = (tipoProva) => {
  return [...new Set(
    filteredParticipantes.value
      .filter(p => p.prova?.toUpperCase().includes(tipoProva.toUpperCase()))
      .map(p => p.prova)
  )].sort((a, b) => a.localeCompare(b));
};

// ✅ Computed para os 4 grupos
const provasBarebow = computed(() => getDistinctProvasPorTipo("BAREBOWL"));
const provasComposto = computed(() => getDistinctProvasPorTipo("COMPOSTO"));
const provasRecurvo = computed(() => getDistinctProvasPorTipo("RECURVO"));

const provasParaolimpico = computed(() => {
  const todos = filteredParticipantes.value.map(p => p.prova?.trim()).filter(Boolean);
  const conhecidos = new Set([
    ...provasBarebow.value,
    ...provasComposto.value,
    ...provasRecurvo.value
  ]);

  return [...new Set(todos)]
    .filter(p => !conhecidos.has(p))
    .sort((a, b) => a.localeCompare(b));
});

// 🔄 Participantes paginados (caso use depois)
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
    const response = await axios.get(`${store.baseHttp}/ranking`);
    store.participantes = response.data;
    totalPages.value = Math.ceil(filteredParticipantes.value.length / pageSize);
  } catch (error) {
    console.error('Erro ao buscar participantes:', error);
  }
};

onMounted(() => {
  console.log('Tipo:', props.tipo, '| Ano:', props.ano);
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
 