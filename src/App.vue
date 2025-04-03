<template>
  <div class="app-container">
    <!-- Menu de navegação -->
    <div class="navbar"> 
      <div v-for="i in store.navbar" :key="i.cod" @click="store.componente = i.cod">
        {{ i.descricao }}
      </div>
    </div>

    <!-- Exibição dos componentes -->
    <UploadFile v-if="store.componente === 1" />
    <ListaProvas v-if="store.componente === 2" />
    <Download v-if="store.componente === 3" />

  </div>
</template>

<script setup>
import { defineAsyncComponent } from 'vue';
import ListaProvas from './views/ListaProvas.vue';
import Download from './views/Download.vue'

import { useStore } from '@/stores/store';




// Lazy loading do componente UploadFile
const UploadFile = defineAsyncComponent(() => import('./views/UploadFile.vue'));

// A store é usada para gerenciar o estado global
const store = useStore();

// Definindo os itens do menu de navegação
store.navbar = [
  { cod: 1, descricao: 'UPLOAD' },
  { cod: 2, descricao: 'INDOOR' },
  { cod: 3, descricao: 'DOWNLOAD' }
];

// Inicializando com o componente 1
store.componente = 1;
</script>


<style scoped>
.app-container {
  font-family: Arial, sans-serif;
}

.navbar {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #333;
  padding: 10px 0;
}

.navbar div {
  background-color: #444;
  color: white;
  padding: 10px 20px;
  margin: 0 10px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.3s ease;
}

.navbar div:hover {
  background-color: #555;
  transform: scale(1.1);
}

.navbar div:active {
  background-color: #666;
}
</style>
