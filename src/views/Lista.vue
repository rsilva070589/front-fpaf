<template>
 
  <div class="page-container">
    <h1 class="main-title">Lista de Registros</h1>

    <div class="control-card input-group">
      <label for="codProva" class="label-text">Código da Prova:</label>
      <input
        id="codProva"
        v-model="codProva"
        type="text"
        placeholder="Ex: PROVA123"
        class="text-input"
        @keyup.enter="fetchListagem"
      />
      <button @click="fetchListagem" :disabled="loading" class="button primary-button">
        <span v-if="loading">Buscando...</span>
        <span v-else>Buscar Lista</span>
      </button>
    </div>

    <div v-if="loading" class="info-message loading-message">Carregando dados...</div>
    <div v-if="errorMessage" class="info-message error-message">{{ errorMessage }}</div>

    <div v-if="store.listagem.length" class="control-card control-flex-group">
      <div class="control-item">
        <label for="search" class="label-text">Buscar:</label>
        <input
          id="search"
          v-model="searchTerm"
          type="text"
          placeholder="Filtrar por qualquer campo..."
          class="text-input"
        />
      </div>
      <div class="control-item">
        <label for="itemsPerPage" class="label-text">Itens por página:</label>
        <select id="itemsPerPage" v-model.number="itemsPerPage" class="text-input">
          <option :value="5">5</option>
          <option :value="10">10</option>
          <option :value="20">20</option>
          <option :value="50">50</option>
          <option :value="filteredList.length">Todos</option>
        </select>
      </div>
    </div>

    <div v-if="paginatedList.length" class="item-list-container">
      <div class="table-header-desktop grid-table">
        <div class="header-cell">#</div>
        <div class="header-cell col-span-2">WaID</div>
        <div class="header-cell col-span-2">FamilyName</div>
        <div class="header-cell col-span-2">GivenName</div>
        <div class="header-cell">Gender</div>
        <div class="header-cell">Score</div>
        <div class="header-cell">Hits</div>
        <div class="header-cell">Category Rank</div>
        <div class="header-cell">Combate Comfinado</div>
        <div class="header-cell">Ações</div>
      </div>

      <div
        v-for="(item, index) in  paginatedList"
        :key="item.WaID || index"
        class="item-card grid-table"
        :class="index % 2 === 0 ? 'bg-white' : 'bg-gray-50'"
      >
        <div class="item-cell">{{ (currentPage - 1) * itemsPerPage + index + 1 }}</div>
        <div class="item-cell col-span-2">{{ item.WaID }}</div>
        <div class="item-cell col-span-2">
          <input v-if="item.editing" v-model="item.FamilyName" class="edit-input" />
          <span v-else>{{ item.FamilyName }}</span> 
        </div>
        <div class="item-cell col-span-2">
          <input v-if="item.editing" v-model="item.GivenName" class="edit-input" />
          <span v-else>{{ item.GivenName }}</span>
        </div>
        <div class="item-cell">{{ item.Gender }}</div>   
        <div class="item-cell">{{ item.Score }}</div>
        <div class="item-cell">{{ item.Hits }}</div> 
        <div class="item-cell">{{ item.Category_Rank }}</div>
        <div class="item-cell">
          <input
            v-if="item.editing"
            type="checkbox"
            v-model="item.combate"
            class="checkbox-input"
          /> 
          <span v-else>{{ item.combate ? 'SIM'  : 'NAO'}}</span>
        </div>
        <div class="item-cell action-buttons-group">
          <button v-if="!item.editing" @click="editItem(item)" class="button small-button edit-button">Editar</button>
          <button v-if="item.editing" @click="saveItem(item)" class="button small-button save-button">Salvar</button>
          <button v-if="item.editing" @click="cancelEdit(item)" class="button small-button cancel-button">Cancelar</button>
          <button @click="deleteItem(item)" class="button small-button delete-button">Excluir</button>
        </div>
      </div>
    </div>

    <div v-else-if="!loading && !errorMessage && codProva" class="empty-state-card">
      <p class="empty-state-title">Nenhum dado encontrado</p>
      <p>Não há registros para o código de prova "{{ codProva }}".</p>
    </div>

    <div v-else-if="!loading && !errorMessage" class="empty-state-card">
      <p class="empty-state-title">Bem-vindo!</p>
      <p>Por favor, digite um código de prova para buscar a lista e começar.</p>
    </div>

    <div v-if="paginatedList.length" class="pagination-controls">
      <button @click="prevPage" :disabled="currentPage === 1" class="button pagination-button">Anterior</button>
      <span class="pagination-info">Página {{ currentPage }} de {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage === totalPages" class="button pagination-button">Próxima</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue"; // computed é necessário para as computeds locais
import axios from "axios";
import { useStore } from "@/stores/store";

const store = useStore(); // Mantemos o store para acessar baseHttp

const codProva = ref("");
const loading = ref(false);
const errorMessage = ref("");

// Mover listagem e outras variáveis de controle de estado para dentro do componente
store.listagem = []// ESTA É A MUDANÇA CHAVE: listagem agora é um ref local
const currentPage = ref(1);
const itemsPerPage = ref(10);
const searchTerm = ref("");

// Ajuste: filtrando diretamente na lista LOCAL (listagem.value)
const filteredList = computed(() => {
  if (!searchTerm.value) {
    return  store.listagem; // Retorna o array reativo local
  }

  const term = searchTerm.value.toLowerCase();
  return  store.listagem.filter(item =>
    ['WaID', 'FamilyName', 'GivenName', 'DoB', 'Gender', 'Score', 'Hits', 'Category_Rank']
      .some(key => item[key] && String(item[key]).toLowerCase().includes(term))
  );
});

// PaginatedList agora depende da filteredList local
const paginatedList = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return filteredList.value.slice(start, start + itemsPerPage.value);
});

const totalPages = computed(() => Math.ceil(filteredList.value.length / itemsPerPage.value));

// O watch ainda é útil para resetar a página quando o filtro ou itens por página mudam
watch([filteredList, itemsPerPage], () => {
  currentPage.value = 1;
});

function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++;
}

function prevPage() {
  if (currentPage.value > 1) currentPage.value--;
}

async function fetchListagem() {
  store.listagem = []; // Limpa a lista local antes de buscar
  if (!codProva.value.trim()) {
    errorMessage.value = "O código da prova é obrigatório!";
    store.listagem = [];
    return;
  }

  loading.value = true;
  errorMessage.value = "";


  try {
    const { data, status } = await axios.get(`${store.baseHttp}/getlistagem`, {
      params: { cod_prova: codProva.value }
    });

    if (status === 304) return;

    if (Array.isArray(data)) {
      // Atribua os dados diretamente à listagem.value local
      store.listagem = data.map(item => ({
        ...item,
        combate: !!item.combate,
        editing: false,
      }));
    } else {
      errorMessage.value = "Resposta inesperada do servidor.";
    }
  } catch (e) {
    errorMessage.value = e.response?.data?.message || e.message || "Erro ao buscar dados.";
  } finally {
    loading.value = false;
  }
}

function editItem(item) {
  item.editing = true;
  item._backup = JSON.parse(JSON.stringify(item));
}

function cancelEdit(item) {
  // Encontre o item original na listagem local e reverter as mudanças
  const originalItemIndex = store.listagem.findIndex(i => i.WaID === item.WaID);
  if (originalItemIndex !== -1) {
    Object.assign(store.listagem[originalItemIndex], item._backup);
    store.listagem[originalItemIndex].editing = false;
    delete store.listagem[originalItemIndex]._backup;
  }
}

async function saveItem(item) {
  if (!item.WaID || !codProva.value) {
    errorMessage.value = "WaID e código da prova são obrigatórios!";
    return;
  }

  loading.value = true;
  errorMessage.value = "";

  const payload = {
    WaID: item.WaID,
    cod_prova: codProva.value,
    FamilyName: item.FamilyName,
    GivenName: item.GivenName,
    combate: item.combate
  };

  try {
    const res = await axios.put(`${store.baseHttp}/getlistagem`, payload);
    if (res.status === 200) {
      item.editing = false;
      delete item._backup;
      await fetchListagem(); // Refetch para garantir os dados atualizados
    } else {
      errorMessage.value = res.data?.message || "Erro ao salvar.";
    }
  } catch (e) {
    errorMessage.value = e.response?.data?.error || e.message || "Erro ao salvar.";
  } finally {
    loading.value = false;
  }
}

async function deleteItem(item) {
  if (!confirm("Deseja realmente excluir este item?")) return;
  if (!item.WaID || !codProva.value) {
    errorMessage.value = "WaID e código da prova são obrigatórios!";
    return;
  }

  loading.value = true;
  errorMessage.value = "";

  try {
    const res = await axios.delete(`${store.baseHttp}/getlistagem`, {
      data: { WaID: item.WaID, cod_prova: codProva.value }
    });
    if (res.status === 200 || res.status === 204) {
      // Atualiza a listagem local
      store.listagem = store.listagem.filter(i => i.WaID !== item.WaID);
    } else {
      errorMessage.value = res.data?.message || "Erro ao excluir.";
    }
  } catch (e) {
    errorMessage.value = e.response?.data?.error || e.message || "Erro ao excluir.";
  } finally {
    loading.value = false;
  }
}
</script>



<style scoped>
.page-container {
  max-width: 1100px;
  margin: 2rem auto;
  padding: 0 1rem;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

.main-title {
  font-weight: 700;
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  color: #333;
}

.control-card {
  background-color: #fff;
  border-radius: 5px;
  box-shadow: 0 0 8px rgba(0,0,0,0.1);
  padding: 1rem 1.2rem;
  margin-bottom: 1rem;
}

.input-group {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}

.label-text {
  font-weight: 600;
  margin-right: 0.5rem;
  min-width: 130px;
  display: inline-block;
}

.text-input {
  padding: 0.4rem 0.6rem;
  border-radius: 4px;
  border: 1px solid #ccc;
  flex-grow: 1;
  min-width: 160px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.text-input:focus {
  border-color: #007acc;
  outline: none;
}

.button {
  padding: 0.4rem 1rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: background-color 0.3s ease;
  user-select: none;
}

.button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.primary-button {
  background-color: #007acc;
  color: white;
}

.primary-button:hover:not(:disabled) {
  background-color: #005fa3;
}

.info-message {
  text-align: center;
  font-weight: 600;
  margin-bottom: 1rem;
  padding: 0.7rem;
  border-radius: 4px;
}

.loading-message {
  background-color: #eef6fb;
  color: #007acc;
}

.error-message {
  background-color: #ffe6e6;
  color: #d9534f;
}

.control-flex-group {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  justify-content: flex-start;
  margin-bottom: 1rem;
}

.control-item {
  display: flex;
  flex-direction: column;
  min-width: 200px;
}

.item-list-container {
  width: 100%;
  border-radius: 5px;
  border: 1px solid #ddd;
  overflow-x: auto;
  background-color: #fafafa;
}

.grid-table {
  display: grid;
  grid-template-columns:
    40px     /* # */
    80px     /* WaID */
    150px 150px /* FamilyName + GivenName (2 cols cada) */
    90px     /* DoB */
    80px     /* Gender */
    70px     /* Score */
    70px     /* Hits */
    120px    /* Category Rank */
    160px;   /* Ações */
  gap: 0.5rem;
  align-items: center;
  padding: 0.3rem 0.7rem;
  border-bottom: 1px solid #ddd;
}

.col-span-2 {
  grid-column: span 2;
}

.table-header-desktop {
  background-color: #007acc;
  color: white;
  font-weight: 700;
  font-size: 0.9rem;
  text-align: center;
  user-select: none;
  border-radius: 5px 5px 0 0;
}

.item-card {
  font-size: 0.9rem;
  color: #333;
}

.bg-white {
  background-color: white;
}

.bg-gray-50 {
  background-color: #f9f9f9;
}

.item-cell {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mobile-label {
  display: none;
  font-weight: 600;
  margin-right: 0.3rem;
}

.edit-input {
  width: 100%;
  padding: 0.2rem 0.4rem;
  font-size: 0.9rem;
  border: 1px solid #ccc;
  border-radius: 3px;
}

.action-buttons-group {
  display: flex;
  gap: 0.3rem;
  justify-content: center;
}

.small-button {
  font-size: 0.75rem;
  padding: 0.3rem 0.7rem;
  border-radius: 3px;
  min-width: 55px;
}

.edit-button {
  background-color: #6c757d;
  color: white;
}

.edit-button:hover {
  background-color: #5a6268;
}

.save-button {
  background-color: #28a745;
  color: white;
}

.save-button:hover {
  background-color: #218838;
}

.cancel-button {
  background-color: #ffc107;
  color: black;
}

.cancel-button:hover {
  background-color: #e0a800;
}

.delete-button {
  background-color: #dc3545;
  color: white;
}

.delete-button:hover {
  background-color: #c82333;
}

.empty-state-card {
  text-align: center;
  padding: 2rem 1rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  background-color: #fefefe;
  margin-top: 2rem;
}

.empty-state-title {
  font-weight: 700;
  font-size: 1.4rem;
  margin-bottom: 0.6rem;
}

.pagination-controls {
  margin-top: 1.5rem;
  text-align: center;
  user-select: none;
}

.pagination-button {
  margin: 0 1rem;
  padding: 0.4rem 1rem;
  font-weight: 700;
  border-radius: 5px;
  background-color: #007acc;
  color: white;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.pagination-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.pagination-button:not(:disabled):hover {
  background-color: #005fa3;
}

.pagination-info {
  font-weight: 600;
  font-size: 1rem;
  vertical-align: middle;
}

/* Responsividade */
@media (max-width: 900px) {
  .grid-table {
    grid-template-columns: repeat(4, 1fr);
  }

  .col-span-2 {
    grid-column: span 1;
  }

  .table-header-desktop {
    display: none;
  }

  .mobile-label {
    display: inline-block;
  }

  .item-list-container {
    border: none;
    background: none;
  }

  .item-card {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.3rem 0.8rem;
    padding: 1rem 1rem;
    border-bottom: 1px solid #ddd;
  }

  .action-buttons-group {
    grid-column: 1 / -1;
    justify-content: space-around;
    margin-top: 0.8rem;
  }
}

.grid-table {
  display: grid;
  /* Exemplo com 13 colunas. Ajuste as larguras conforme sua necessidade */
  grid-template-columns: 0.5fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1.5fr; /* Exemplo de 13 colunas */
  /* grid-template-columns: repeat(13, minmax(0, 1fr)); */ /* Uma opção mais simples para colunas de largura igual */
  gap: 1rem; /* Espaçamento entre as colunas */
  align-items: center;
}

/* E certifique-se de que cada célula no item-card também use o mesmo padrão */
.item-cell.col-span-2 {
  grid-column: span 2 / span 2;
}

/* E para os botões de ação, você pode querer que eles ocupem a última célula inteira */
.action-buttons-group {
    display: flex;
    flex-wrap: wrap; /* Permite que os botões quebrem linha se não houver espaço */
    gap: 0.5rem; /* Espaçamento entre os botões */
    justify-content: flex-end; /* Alinha os botões à direita */
}
</style>
