import { createMemoryHistory, createRouter } from "vue-router";

import HelloWorld from "./components/HelloWorld.vue";
import Layout from './components/shared/Layout.vue';

import ComparePage from './components/compare/page.vue';

const routes = [
  {
    path: '/',
    component: Layout,
    children: [
      { path: '', component: ComparePage },
      { path: 'about', component: HelloWorld },
    ]
  }
];

const router = createRouter({
  history: createMemoryHistory(),
  routes
});

export default router;