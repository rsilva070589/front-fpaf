// stores/store.js
import { defineStore } from 'pinia';

export const useStore = defineStore('store', {
  state: () => ({
    navbar: [
      { cod: 1, descricao: 'Início' },
      { cod: 2, descricao: 'Notas' },
      { cod: 3, descricao: 'Relatórios' },
      { cod: 4, descricao: 'Configurações' }
    ],
    menuAtual: 1 // default view: 'Início'
  }),
  actions: {
    setMenu(cod) {
      this.menuAtual = cod;
    }
  }
});
