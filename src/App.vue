<template>
  <div class="app-container">
    <!-- Menu de navegação -->
    <div class="navbar">
      <div
        v-for="i in store.navbar"
        :key="i.cod"
        class="menu-item"
        @mouseenter="handleMouseEnter(i.cod)"
        @mouseleave="handleMouseLeave"
      >
        <div @click="store.componente = i.cod">
          {{ i.descricao }}
        </div>

        <!-- Submenu para RESULTADO DE PROVA -->
        <div v-if="i.cod === 2 && showSubmenu" class="submenu">
          <!-- Etapa 1: Escolher tipo -->
          <template v-if="!exibirAnos">
            <div @click="selecionarTipo('INDOOR')">INDOOR</div>
            <div @click="selecionarTipo('OUTDOOR')">OUTDOOR</div>
          </template>

          <!-- Etapa 2: Escolher ano -->
          <template v-else>
            <div
              v-for="ano in anosDisponiveis"
              :key="ano"
              @click="selecionarAno(ano)"
            >
              {{ ano }}
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- Componentes exibidos -->
    <UploadFile v-if="store.componente === 1" />
    <ListaProvas
      v-if="store.componente === 2 && tipoSelecionado && anoSelecionado"
      :tipo="tipoSelecionado"
      :ano="anoSelecionado"
    />
    <Download v-if="store.componente === 3" />
    <Lista v-if="store.componente === 4" />
  </div>
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

store.navbar = [
  { cod: 1, descricao: 'UPLOAD' },
  { cod: 2, descricao: 'RESULTADO DE PROVA' },
  { cod: 3, descricao: 'DOWNLOAD' },
  { cod: 4, descricao: 'LISTA COMBATE' }
];

store.componente = 1;

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

function handleMouseEnter(cod) {
  if (cod === 2) {
    showSubmenu.value = true;
  }
}

function handleMouseLeave() {
  showSubmenu.value = false;
  exibirAnos.value = false;
}

function selecionarTipo(tipo) {
  tipoSelecionado.value = tipo;
  anoSelecionado.value = null;
  exibirAnos.value = true;
}

function selecionarAno(ano) {
  anoSelecionado.value = ano;
  store.componente = 2;
  showSubmenu.value = false;
  exibirAnos.value = false;
}
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
