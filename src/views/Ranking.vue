<template>
  <button @click="store.listaSelecionada = null">voltar</button>

  <div style="display: flex; justify-content: center; align-items: flex-start; width: 100%;">


    <div style="max-width: 600px; width: 100%; margin-left: -250px;">

    <div style="font-size: 25px;">  Prova: {{ store.listaSelecionada }}</div>
    <table style="width: 100%; border-collapse: collapse; text-align: center;">
      <thead>
        <tr>
          <th>Posição</th>
          <th class="col-atleta">Atleta</th>

          <th>Equipe</th>        
          <th>5 Melhores</th>        
          <th>Total</th>
          <th>1</th>
          <th>2</th>
          <th>3</th>
          <th>4</th>
          <th>5</th>
          <th>6</th>
          <th>7</th>
          <th>8</th>
          
          
        </tr>
      </thead>
      <tbody>
        
        <tr v-for="(participant, index) in participantesOrdenados" :key="participant.ID">

          <td>{{ index+1}}</td>
          <td class="col-atleta">{{ participant.atleta }}</td>

          <td>{{ participant.equipe }}</td> 
          <td>{{participant.topFive}}</td>
          <td>{{ participant.Score1 + participant.Score2 + participant.Score3 + participant.Score4 + participant.Score5 + 
            participant.Score6 + participant.Score7 + participant.Score8
           }}</td>

          <td>{{ participant.Score1 }}</td> 
          <td>{{ participant.Score2 }}</td> 
          <td>{{ participant.Score3 }}</td> 
          <td>{{ participant.Score4 }}</td> 
          <td>{{ participant.Score5 }}</td> 
          <td>{{ participant.Score6 }}</td> 
          <td>{{ participant.Score7 }}</td> 
          <td>{{ participant.Score8 }}</td> 
       
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

  function topFiveSum(participant) {
  const scores = [
    participant.Score1,
    participant.Score2,
    participant.Score3,
    participant.Score4,
    participant.Score5,
    participant.Score6,
    participant.Score7,
    participant.Score8
  ];

  return scores
    .sort((a, b) => b - a)     // Ordena em ordem decrescente
    .slice(0, 5)               // Pega as 5 maiores
    .reduce((acc, val) => acc + val, 0); // Soma
}

const participantesOrdenados = computed(() => {
  // Filtra pela prova selecionada
  const filtrados = store.participantes.filter(p => p.prova === store.listaSelecionada);

  // Ordena com base na soma dos 5 maiores scores
  return filtrados
    .map(p => ({
      ...p,
      topFive: topFiveSum(p)
    }))
    .sort((a, b) => b.topFive - a.topFive) // Ordem decrescente
    .map((p, index) => ({
      ...p,
      Categoria_Rank: index + 1 // Posição (rank)
    }));
});

  
  
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

.col-atleta {
  width: 150px;
  min-width: 150px;
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

  </style>
  