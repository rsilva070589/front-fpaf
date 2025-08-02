import { createRouter, createWebHistory } from 'vue-router'
import ListaProvas from '@/views/ListaProvas.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/:tipo/:ano',
      name: 'resultadoComFiltro',
      component: ListaProvas,
      props: true
    },
    {
      path: '/',
      name: 'resultadoPadrao',
      component: ListaProvas,
      props: true
    }
  ],
})

export default router
