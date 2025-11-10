<template>  
 


  <div
   v-if="store.listaSelecionada == null"
   style="display: flex; justify-content: center; align-items: flex-start; width: 100%; margin-top: 20px;"
 >

   <div style="max-width: 1200px; width: 100%;">
    <button @click="exportAllToExcel" style="cursor: pointer;">
  Exportar Rankings 📊
</button>
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
import { utils, writeFile } from 'xlsx';

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

// ✅ Filtra participantes por tipo e ano
const filteredParticipantes = computed(() =>
  store.participantes.filter(p =>
    p.classe === props.tipo &&
    p.ano_integracao === props.ano
  )
);

// ✅ Função para verificar se a prova deve ser PARAOLÍMPICO
const isParaolimpico = (prova) => {
  if (!prova) return false;
  const upper = prova.toUpperCase();
  // Contém MO ou FO em qualquer posição
  if (upper.includes('MO') || upper.includes('FO')) return true;
  // Não é Barebow, Composto ou Recurvo → também é paraolímpico
  if (!['BAREBOWL', 'COMPOSTO', 'RECURVO'].some(tipo => upper.includes(tipo))) return true;
  return false;
};

// ✅ Função para pegar provas de cada grupo ignorando as paraolímpicas
const getDistinctProvasPorTipo = (tipoProva) => {
  return [...new Set(
    filteredParticipantes.value
      .filter(p => {
        const prova = p.prova?.trim() || "";
        if (isParaolimpico(prova)) return false; // remove paraolímpicas
        return prova.toUpperCase().includes(tipoProva.toUpperCase());
      })
      .map(p => p.prova?.trim())
  )].sort((a, b) => a.localeCompare(b));
};

// ✅ Computed para grupos normais
const provasBarebow = computed(() => getDistinctProvasPorTipo("BAREBOWL"));
const provasComposto = computed(() => getDistinctProvasPorTipo("COMPOSTO"));
const provasRecurvo = computed(() => getDistinctProvasPorTipo("RECURVO"));

// ✅ Computed para PARAOLÍMPICO
const provasParaolimpico = computed(() =>
  [...new Set(
    filteredParticipantes.value
      .map(p => p.prova?.trim())
      .filter(p => isParaolimpico(p))
  )].sort((a, b) => a.localeCompare(b))
);

// 🔄 Paginação
const paginatedParticipants = computed(() => {
  const start = (page.value - 1) * pageSize;
  const end = page.value * pageSize;
  return filteredParticipantes.value.slice(start, end);
});

const changePage = (newPage) => {
  if (newPage >= 1 && newPage <= totalPages.value) page.value = newPage;
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

// Função para exportar todas as provas para Excel
async function exportAllToExcel() {
  if (store.participantes.length === 0) {
    alert("Dados não carregados. Tente novamente.");
    return;
  }

  const grupos = {
    'BAREBOWL': provasBarebow.value,
    'COMPOSTO': provasComposto.value,
    'RECURVO': provasRecurvo.value,
    'PARAOLÍMPICO': provasParaolimpico.value
  };

  const allData = [];
  const header = [
    'Posição', 'Atleta', 'Equipe', '5 Melhores', 'Total', 'Média',
    'Score 1', 'Score 2', 'Score 3', 'Score 4', 'Score 5',
    'Score 6', 'Score 7', 'Score 8'
  ];

  let isFirstProva = true;

  for (const nomeGrupo in grupos) {
    const provasDoGrupo = grupos[nomeGrupo];
    
    for (const nomeProva of provasDoGrupo) {
      if (!isFirstProva) {
        allData.push([]);
        allData.push([]);
        allData.push([]);
      }
      allData.push([`PROVA: ${nomeProva}`]);
      allData.push([]);
      allData.push(header);

      const filtrados = store.participantes.filter(p => p.prova === nomeProva);
      const participantesComCalculos = filtrados
        .map(p => {
          const scores = [
            p.Score1, p.Score2, p.Score3, p.Score4,
            p.Score5, p.Score6, p.Score7, p.Score8
          ];
          const scoresValidos = scores.filter(s => s != null && s !== 0);
          const total = scores.reduce((acc, val) => acc + (val || 0), 0);
          const mediaValida = scoresValidos.length > 0
            ? (scoresValidos.reduce((acc, val) => acc + val, 0) / scoresValidos.length)
            : 0;

          return { ...p, total, topFive: topFiveSum(p), mediaValida };
        })
        .filter(p => p.total > 0);

      const participantesOrdenados = participantesComCalculos
        .sort((a, b) => b.topFive - a.topFive)
        .map((p, index) => [
          index + 1, p.atleta, p.equipe, p.topFive, p.total, p.mediaValida.toFixed(2),
          p.Score1, p.Score2, p.Score3, p.Score4, p.Score5, p.Score6, p.Score7, p.Score8
        ]);
      
      allData.push(...participantesOrdenados);
      isFirstProva = false;
    }
  }

  const worksheet = utils.aoa_to_sheet(allData);
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, 'Ranking Geral');
  writeFile(workbook, `Ranking Geral - ${props.ano}.xlsx`);
}

function topFiveSum(participant) {
  const scores = [
    participant.Score1, participant.Score2, participant.Score3, participant.Score4,
    participant.Score5, participant.Score6, participant.Score7, participant.Score8
  ].filter(s => s != null);
  return scores.sort((a, b) => b - a).slice(0, 5).reduce((acc, val) => acc + val, 0);
}
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
 