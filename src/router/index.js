import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomeView.vue')
  },
  {
    path: '/producto/:id',
    name: 'ProductDetail',
    component: () => import('../views/ProductDetailView.vue')
  },
  {
    path: '/carrito',
    name: 'Cart',
    component: () => import('../views/CartView.vue')
  },
  {
    path: '/checkout',
    name: 'Checkout',
    component: () => import('../views/CheckoutView.vue')
  },
  {
    path: '/pedido-confirmado',
    name: 'OrderConfirmed',
    component: () => import('../views/OrderConfirmedView.vue')
  },
  {
    path: '/pago-exitoso',
    name: 'PaymentSuccess',
    component: () => import('../views/PaymentSuccessView.vue')
  },
  {
    path: '/pago-error',
    name: 'PaymentError',
    component: () => import('../views/PaymentErrorView.vue')
  },
  // Admin Routes
  {
    path: '/admin',
    component: () => import('../views/admin/AdminLayout.vue'),
    children: [
      {
        path: '',
        name: 'AdminDashboard',
        component: () => import('../views/admin/DashboardView.vue')
      },
      {
        path: 'inventario',
        name: 'AdminInventory',
        component: () => import('../views/admin/InventoryView.vue')
      },
      {
        path: 'productos',
        name: 'AdminProducts',
        component: () => import('../views/admin/ProductsView.vue')
      },
      {
        path: 'clientes',
        name: 'AdminClients',
        component: () => import('../views/admin/ClientsView.vue')
      },
      {
        path: 'clientes/:id',
        name: 'AdminClientDetail',
        component: () => import('../views/admin/ClientDetailView.vue')
      },
      {
        path: 'metricas',
        name: 'AdminMetrics',
        component: () => import('../views/admin/MetricsView.vue')
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFoundView.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

export default router
