<template>
  <button @click="store.listaSelecionada = null">voltar</button>



  <div style="display: flex; justify-content: center; align-items: center; width: 100%; ">
  <div style="max-width: 600px; width: 100%;">
    <div style="font-size: 25px;">  Prova: {{ store.listaSelecionada }}</div>
    <table style="width: 100%; border-collapse: collapse; text-align: center;">
      <thead>
        <tr>
          <th>Posição</th>
          <th>Atleta</th>
          <th>Equipe</th>        
          <th>Score</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="participant in store.participantes.filter(f => f.prova == store.listaSelecionada)" :key="participant.ID">
          <td>{{ participant.posicao }}</td>
          <td>{{ participant.atleta }}</td>
          <td>{{ participant.equipe }}</td> 
          <td>{{ participant.Score }}</td> 
          <td>{{ participant.Total }}</td> 
        </tr>
      </tbody>
    </table>

  
  </div>
</div>

  
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue';
  import axios from 'axios';
  import { useStore } from '@/stores/store'

const store = useStore()  
  
  // Referências reativas
  const participants = ref([]);
  const page = ref(1);
  const pageSize = 20;  // Número de participantes por página
  const totalPages = ref(1);
  
  
  </script>
  
  <style scoped>
  .participant-table {
    font-family: Arial, sans-serif;
    margin: 20px;
    width: 100%;
    overflow-x: auto;
  }
  
 
  .pagination {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }
  
  .pagination button {
    padding: 5px 10px;
    margin: 0 5px;
    cursor: pointer;
  }
  
  .pagination button:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  table {
  width: 100%;
  border-collapse: collapse;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

th, td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

th {
  background-color: #007BFF;
  color: white;
  font-weight: bold;
}

 
 
tr:hover {
  background-color: #ddd;
}

td {
  color: #333;
}

@media (max-width: 768px) {
  th, td {
    padding: 8px;
    font-size: 14px;
  }
}
  </style>
  