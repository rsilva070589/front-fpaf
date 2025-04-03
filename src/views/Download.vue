<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
    <div class="bg-white shadow-lg rounded-xl p-6 w-full max-w-md">
      <h1 class="text-lg font-semibold text-gray-700 text-center mb-4">Baixar Arquivo de Prova</h1>
      
      <input v-model="codProva" type="text" placeholder="Digite o código da prova"
        class="w-full border rounded-lg px-4 py-2 mb-4 focus:ring focus:ring-blue-300 outline-none" />

      <button @click="downloadFile" :disabled="downloading"
        class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400">
        {{ downloading ? "Baixando..." : "Baixar XLS" }}
      </button>

      <p v-if="errorMessage" class="text-red-500 text-sm mt-2 text-center">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import * as XLSX from 'xlsx'; // Biblioteca para gerar XLS
import { useStore } from '@/stores/store';
const store = useStore();


const codProva = ref('');
const downloading = ref(false);
const errorMessage = ref('');
 
const downloadFile = async () => {
  if (!codProva.value) {
    errorMessage.value = "O código da prova é obrigatório!";
    return;
  }

  downloading.value = true;
  errorMessage.value = '';

  store.baseHttp
  try {

    const response = await axios.get(`${store.baseHttp}/download?cod_prova=${codProva.value}`);

    
    if (!response.data || response.data.length === 0) {
      throw new Error("Nenhum dado encontrado para esse código de prova.");
    }

    // Criando a planilha XLSX
    const ws = XLSX.utils.json_to_sheet(response.data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Prova");

    // Gerando o arquivo para download
    XLSX.writeFile(wb, `prova_${codProva.value}.xlsx`);

  } catch (error) {
    console.error('Erro ao baixar o arquivo:', error);
    errorMessage.value = 'Erro ao baixar o arquivo!';
  } finally {
    downloading.value = false;
  }
};
</script>





  
  <style scoped>
  .drop-area {
    border: 2px dashed #ccc;
    padding: 20px;
    text-align: center;
    cursor: pointer;
  }
  .dragging {
    background-color: #f0f0f0;
  }
  .progress-bar {
    width: 100%;
    background-color: #f3f3f3;
    border-radius: 5px;
    height: 20px;
    margin-top: 10px;
  }
  .progress {
    height: 100%;
    background-color: #4caf50;
    border-radius: 5px;
  }
  </style>
  