<template>
  <router-view />
</template>


<script setup>
import { ref, defineAsyncComponent } from 'vue';
import ListaProvas from './views/ListaProvas.vue';
import Download from './views/Download.vue';
import Lista from './views/Lista.vue';
import { useStore } from '@/stores/store';

const UploadFile = defineAsyncComponent(() => import('./views/UploadFile.vue'));

const store = useStore();

store.baseHttp = 'https://api.mapsis.com.br/apiexpress';
 
store.componente = 2;

const showSubmenu = ref(false);
const tipoSelecionado = ref(null);
const anoSelecionado = ref(null);
const exibirAnos = ref(false);

// Gera anos de 2024 até o ano atual
const anoInicial = 2025;
const anosDisponiveis = Array.from(
  { length: new Date().getFullYear() - anoInicial + 1 },
  (_, i) => anoInicial + i
);

 
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

.navbar .menu-item {
  position: relative;
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

/* Submenu */
.submenu {
  position: absolute;
  top: 100%;
  left: 0;
  background-color: #444;
  border-radius: 5px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  margin-top: 5px;
}

.submenu div {
  padding: 8px 16px;
  color: white;
  cursor: pointer;
  white-space: nowrap;
}

.submenu div:hover {
  background-color: #555;
}
</style>
<style>
/* Escopo global */
body {
  font-family: 'Roboto', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  margin: 0;
  background: #f5f5f5;
}
</style>
 