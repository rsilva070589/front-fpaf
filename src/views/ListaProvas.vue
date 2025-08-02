<template>
  {{ props }}
 

  <div v-if="store.listaSelecionada == null" class="lista-container">
    <div class="lista-wrapper">
      <h2 class="titulo-lista">Lista de Provas {{ props.ano }}</h2>

      <div class="grid-grupos">
        <div v-for="(grupo, nomeGrupo) in {
          'BAREBOWL': provasBarebow,
          'COMPOSTO': provasComposto,
          'RECURVO': provasRecurvo,
          'PARAOLÍMPICO': provasParaolimpico
        }" :key="nomeGrupo" class="grupo">
          <h3 class="nome-grupo">{{ nomeGrupo }}</h3>
          <div class="lista-provas">
            <div 
              v-for="prova in grupo" 
              :key="prova"
              @click="store.listaSelecionada = prova"
              class="item-prova"
            >
              {{ prova }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-else>
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
  store.participantes = [];
 
  store.baseHttp = 'https://api.mapsis.com.br/apiexpress';

  const page = ref(1);
  const pageSize = 20;
  const totalPages = ref(1);

  // ✅ Filtra participantes por tipo E ano
  const filteredParticipantes = computed(() => {
  const tipo = props.tipo?.toUpperCase();
  const ano = Number(props.ano);

  return (store.participantes || []).filter(p =>
    p.classe?.toUpperCase() === tipo &&
    Number(p.ano_integracao) === ano
  );
});


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


  const fetchParticipants = async () => {
  try {
    const response = await axios.get(`${store.baseHttp}/ranking`);
    store.participantes = response.data;
    console.log('Dados recebidos:', store.participantes); // <-- Adicione isso
    totalPages.value = Math.ceil(filteredParticipantes.value.length / pageSize);
  } catch (error) {
    console.error('Erro ao buscar participantes:', error);
  }
};


onMounted(() => {
  console.log('Tipo da URL:', props.tipo, '| Ano:', props.ano);
  fetchParticipants().then(() => {
    console.log('Filtrados:', filteredParticipantes.value);
    console.log('Barebow:', provasBarebow.value);
    console.log('Composto:', provasComposto.value);
    console.log('Recurvo:', provasRecurvo.value);
    console.log('Paraolímpico:', provasParaolimpico.value);
  });
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

<style scoped>
.lista-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  width: 100%; 
  padding: 0 15px;
  box-sizing: border-box;
}

.lista-wrapper {
  max-width: 1200px;
  width: 100%;
}

.titulo-lista {
  font-size: 2rem;
  text-align: center;
  margin-bottom: 25px;
  font-weight: 700;
  color: #333;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.grid-grupos {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 25px;
}

.grupo {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 15px 20px;
  box-shadow: 0 1px 5px rgb(0 0 0 / 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.nome-grupo {
  margin-bottom: 15px;
  font-size: 1.3rem;
  font-weight: 600;
  color: #555;
  text-transform: uppercase;
  letter-spacing: 1.2px;
}

.lista-provas {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.item-prova {
  padding: 12px 8px;
  border: 1px solid #ddd;
  border-radius: 5px;
  text-align: center;
  color: #02060a;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.3s ease, color 0.3s ease;
  font-weight: 500;
}

.item-prova:hover {
  background-color: #007BFF;
  color: white;
  text-decoration: none;
}
.lista-container {
  background-color: #f5f5f5; /* cinza claro */
  min-height: 100vh; /* garante ocupar toda a altura da tela */
  padding: 20px 15px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  width: 100%;
  box-sizing: border-box;
}

</style>

<style scoped>
.ranking-container {
  max-width: 900px;
  margin: 0 auto;
  background: white;
  padding: 20px 30px;
  border-radius: 8px;
  box-shadow: 0 1px 8px rgb(0 0 0 / 0.1);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #222;
}

.ranking-title {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 15px;
  text-align: center;
  color: #007BFF;
}

.ranking-table {
  width: 100%;
  border-collapse: collapse;
}

.ranking-table th,
.ranking-table td {
  padding: 10px 15px;
  border-bottom: 1px solid #ddd;
  text-align: center;
  font-size: 1rem;
}

.ranking-table thead th {
  background-color: #007BFF;
  color: white;
  font-weight: 600;
  text-transform: uppercase;
}

.ranking-table tbody tr:hover {
  background-color: #f0f8ff;
}

.ranking-table tbody tr:nth-child(even) {
  background-color: #fafafa;
}

/* Se tiver posições/colocação, destaque */
.position {
  font-weight: 700;
  color: #333;
}

/* Se quiser destacar o vencedor */
.winner {
  background-color: #d1e7ff;
  font-weight: 700;
  color: #004085;
}
</style>
