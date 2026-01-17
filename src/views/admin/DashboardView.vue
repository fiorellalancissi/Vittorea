<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useAdminStore } from '../../stores/admin'
import Icon from '../../components/Icon.vue'

const adminStore = useAdminStore()

const stats = computed(() => adminStore.stats)
const clientMetrics = computed(() => adminStore.clientSatisfactionMetrics)
const recentMovements = computed(() => adminStore.movementsWithProduct.slice(0, 5))
const lowStockProducts = computed(() => 
  adminStore.productsWithBrand.filter(p => p.stock <= 3).slice(0, 5)
)

function formatCurrency(value) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0
  }).format(value)
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <div class="dashboard">
    <h1 class="page-title">Dashboard</h1>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon"><Icon name="bottle" :size="28" /></div>
        <div class="stat-info">
          <span class="stat-number">{{ stats.totalProducts }}</span>
          <span class="stat-label">Productos</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon"><Icon name="package" :size="28" /></div>
        <div class="stat-info">
          <span class="stat-number">{{ stats.totalStock }}</span>
          <span class="stat-label">Unidades en stock</span>
        </div>
      </div>

      <div class="stat-card" :class="{ 'stat-card--warning': stats.lowStockProducts > 0 }">
        <div class="stat-icon"><Icon name="alert" :size="28" /></div>
        <div class="stat-info">
          <span class="stat-number">{{ stats.lowStockProducts }}</span>
          <span class="stat-label">Stock bajo</span>
        </div>
      </div>

      <div class="stat-card stat-card--highlight">
        <div class="stat-icon"><Icon name="money" :size="28" /></div>
        <div class="stat-info">
          <span class="stat-number">{{ formatCurrency(stats.totalValue) }}</span>
          <span class="stat-label">Valor del inventario</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon"><Icon name="box" :size="28" /></div>
        <div class="stat-info">
          <span class="stat-number">{{ stats.totalClients }}</span>
          <span class="stat-label">Clientes registrados</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon"><Icon name="cart" :size="28" /></div>
        <div class="stat-info">
          <span class="stat-number">{{ stats.clientsWithOrders }}</span>
          <span class="stat-label">Clientes con pedidos</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon"><Icon name="refresh" :size="28" /></div>
        <div class="stat-info">
          <span class="stat-number">{{ stats.repeatClients }}</span>
          <span class="stat-label">Clientes recurrentes</span>
        </div>
      </div>

      <div class="stat-card" :class="{ 'stat-card--warning': stats.pendingTransfers > 0 }">
        <div class="stat-icon"><Icon name="clock" :size="28" /></div>
        <div class="stat-info">
          <span class="stat-number">{{ stats.pendingTransfers }}</span>
          <span class="stat-label">Compras por confirmar</span>
        </div>
      </div>

      <div class="stat-card" :class="{ 'stat-card--info': stats.pendingDeliveries > 0 }">
        <div class="stat-icon"><Icon name="truck" :size="28" /></div>
        <div class="stat-info">
          <span class="stat-number">{{ stats.pendingDeliveries }}</span>
          <span class="stat-label">Entregas por hacer</span>
        </div>
      </div>

      <div class="stat-card stat-card--success">
        <div class="stat-icon"><Icon name="trophy" :size="28" /></div>
        <div class="stat-info">
          <span class="stat-number">{{ clientMetrics.satisfactionRate }}%</span>
          <span class="stat-label">Satisfacción positiva</span>
        </div>
      </div>
    </div>

    <div class="dashboard-grid">
      <!-- Movimientos recientes -->
      <section class="dashboard-card">
        <header class="card-header">
          <h2 class="card-title">Movimientos recientes</h2>
          <RouterLink to="/admin/inventario" class="card-link">Ver todos →</RouterLink>
        </header>
        
        <div v-if="recentMovements.length === 0" class="empty-state">
          <p>No hay movimientos registrados</p>
        </div>

        <ul v-else class="movements-list">
          <li v-for="movement in recentMovements" :key="movement.id" class="movement-item">
            <span 
              class="movement-type" 
              :class="movement.type === 'ingreso' ? 'type-in' : 'type-out'"
            >
              {{ movement.type === 'ingreso' ? '+' : '-' }}{{ movement.quantity }}
            </span>
            <div class="movement-info">
              <span class="movement-product">{{ movement.product?.name || 'Producto eliminado' }}</span>
              <span class="movement-reason">{{ movement.reason }}</span>
            </div>
            <span class="movement-date">{{ formatDate(movement.date) }}</span>
          </li>
        </ul>
      </section>

      <!-- Productos con stock bajo -->
      <section class="dashboard-card">
        <header class="card-header">
          <h2 class="card-title">Stock bajo</h2>
          <RouterLink to="/admin/productos" class="card-link">Ver todos →</RouterLink>
        </header>

        <div v-if="lowStockProducts.length === 0" class="empty-state empty-state--success">
          <p><Icon name="check" :size="16" /> Todo el inventario está bien</p>
        </div>

        <ul v-else class="products-list">
          <li v-for="product in lowStockProducts" :key="product.id" class="product-item">
            <img :src="product.image" :alt="product.name" class="product-thumb" />
            <div class="product-info">
              <span class="product-name">{{ product.name }}</span>
              <span class="product-brand">{{ product.brand }}</span>
            </div>
            <span class="product-stock" :class="{ 'out-of-stock': product.stock === 0 }">
              {{ product.stock === 0 ? 'Sin stock' : `${product.stock} uds` }}
            </span>
          </li>
        </ul>
      </section>
    </div>

    <!-- Acciones rápidas -->
    <section class="quick-actions">
      <h2 class="section-title">Acciones rápidas</h2>
      <div class="actions-grid">
        <RouterLink to="/admin/inventario?action=ingreso" class="action-card action-card--primary">
          <span class="action-icon"><Icon name="download" :size="24" /></span>
          <span class="action-label">Registrar ingreso</span>
        </RouterLink>
        <RouterLink to="/admin/inventario?action=egreso" class="action-card action-card--secondary">
          <span class="action-icon"><Icon name="upload" :size="24" /></span>
          <span class="action-label">Registrar egreso</span>
        </RouterLink>
        <RouterLink to="/admin/productos?action=nuevo" class="action-card">
          <span class="action-icon"><Icon name="plus" :size="24" /></span>
          <span class="action-label">Nuevo producto</span>
        </RouterLink>
        <RouterLink to="/admin/clientes" class="action-card">
          <span class="action-icon"><Icon name="box" :size="24" /></span>
          <span class="action-label">Ver clientes</span>
        </RouterLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
.dashboard {
  padding: var(--space-lg);
}

.page-title {
  font-family: var(--font-heading);
  font-size: 1.75rem;
  font-weight: 400;
  margin-bottom: var(--space-lg);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-md);
  margin-bottom: var(--space-xl);
}

.stat-card {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-lg);
  background: var(--color-white);
  border-radius: var(--radius-md);
  border-left: 3px solid var(--color-primary);
}

.stat-card--warning {
  border-left-color: #f57c00;
}

.stat-card--info {
  border-left-color: #1976d2;
}

.stat-card--highlight {
  border-left-color: var(--color-accent);
}

.stat-card--success {
  border-left-color: #25D366;
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: var(--color-background);
  border-radius: var(--radius-md);
  color: var(--color-text);
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-family: var(--font-heading);
  font-size: 1.5rem;
  font-weight: 500;
  color: var(--color-text);
}

.stat-label {
  font-size: 0.813rem;
  color: var(--color-muted);
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: var(--space-lg);
  margin-bottom: var(--space-xl);
}

.dashboard-card {
  background: var(--color-white);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-md) var(--space-lg);
  border-bottom: 1px solid var(--color-border);
}

.card-title {
  font-family: var(--font-heading);
  font-size: 1rem;
  font-weight: 500;
  margin: 0;
}

.card-link {
  font-size: 0.813rem;
  color: var(--color-secondary);
}

.card-link:hover {
  color: var(--color-accent);
}

.empty-state {
  padding: var(--space-xl);
  text-align: center;
  color: var(--color-muted);
}

.empty-state--success {
  color: #25D366;
}

.movements-list,
.products-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.movement-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md) var(--space-lg);
  border-bottom: 1px solid var(--color-border);
}

.movement-item:last-child {
  border-bottom: none;
}

.movement-type {
  font-size: 0.875rem;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  min-width: 50px;
  text-align: center;
}

.type-in {
  background-color: rgba(37, 211, 102, 0.1);
  color: #25D366;
}

.type-out {
  background-color: rgba(196, 92, 92, 0.1);
  color: #c45c5c;
}

.movement-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.movement-product {
  font-size: 0.875rem;
  font-weight: 500;
}

.movement-reason {
  font-size: 0.75rem;
  color: var(--color-muted);
}

.movement-date {
  font-size: 0.75rem;
  color: var(--color-muted);
}

.product-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md) var(--space-lg);
  border-bottom: 1px solid var(--color-border);
}

.product-item:last-child {
  border-bottom: none;
}

.product-thumb {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: var(--radius-sm);
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.product-name {
  font-size: 0.875rem;
  font-weight: 500;
}

.product-brand {
  font-size: 0.75rem;
  color: var(--color-muted);
}

.product-stock {
  font-size: 0.813rem;
  font-weight: 500;
  color: var(--color-accent);
}

.product-stock.out-of-stock {
  color: #c45c5c;
}

.quick-actions {
  margin-top: var(--space-xl);
}

.section-title {
  font-family: var(--font-heading);
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: var(--space-md);
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: var(--space-md);
}

.action-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-lg);
  background: var(--color-white);
  border-radius: var(--radius-md);
  text-decoration: none;
  transition: all var(--transition-base);
  border: 1px solid var(--color-border);
}

.action-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--color-primary);
}

.action-card--primary {
  background-color: rgba(37, 211, 102, 0.05);
  border-color: rgba(37, 211, 102, 0.2);
}

.action-card--secondary {
  background-color: rgba(196, 92, 92, 0.05);
  border-color: rgba(196, 92, 92, 0.2);
}

.action-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: var(--color-background);
  border-radius: var(--radius-md);
  color: var(--color-text);
}

.action-card--primary .action-icon {
  background: rgba(37, 211, 102, 0.1);
  color: #25D366;
}

.action-card--secondary .action-icon {
  background: rgba(196, 92, 92, 0.1);
  color: #c45c5c;
}

.action-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text);
}

@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}
</style>
