<script setup>
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { useAdminStore } from '../../stores/admin'
import Icon from '../../components/Icon.vue'

const route = useRoute()
const adminStore = useAdminStore()

const stats = computed(() => adminStore.stats)

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: 'dashboard', exact: true },
  { path: '/admin/metricas', label: 'Métricas', icon: 'chart' },
  { path: '/admin/inventario', label: 'Inventario', icon: 'package' },
  { path: '/admin/productos', label: 'Productos', icon: 'bottle' },
  { path: '/admin/clientes', label: 'Clientes', icon: 'box' }
]

function isActive(item) {
  if (item.exact) {
    return route.path === item.path
  }
  return route.path.startsWith(item.path)
}

function formatCurrency(value) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0
  }).format(value)
}
</script>

<template>
  <div class="admin-layout">
    <aside class="admin-sidebar">
      <div class="sidebar-header">
        <RouterLink to="/" class="sidebar-logo">
          <span class="logo-text">Vittore</span>
          <span class="logo-badge">Admin</span>
        </RouterLink>
      </div>

      <nav class="sidebar-nav">
        <RouterLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :class="{ 'nav-item--active': isActive(item) }"
        >
          <Icon :name="item.icon" :size="18" class="nav-icon" />
          <span class="nav-label">{{ item.label }}</span>
        </RouterLink>
      </nav>

      <div class="sidebar-footer">
        <RouterLink to="/" class="back-to-store">
          ← Volver a la tienda
        </RouterLink>
      </div>
    </aside>

    <main class="admin-main">
      <header class="admin-header">
        <div class="header-stats">
          <div class="stat-item">
            <span class="stat-value">{{ stats.totalProducts }}</span>
            <span class="stat-label">Productos</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ stats.totalStock }}</span>
            <span class="stat-label">Unidades</span>
          </div>
          <div class="stat-item" :class="{ 'stat-warning': stats.lowStockProducts > 0 }">
            <span class="stat-value">{{ stats.lowStockProducts }}</span>
            <span class="stat-label">Stock bajo</span>
          </div>
          <div class="stat-item stat-highlight">
            <span class="stat-value">{{ formatCurrency(stats.totalValue) }}</span>
            <span class="stat-label">Valor total</span>
          </div>
        </div>
      </header>

      <div class="admin-content">
        <RouterView />
      </div>
    </main>
  </div>
</template>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background-color: var(--color-background);
}

.admin-sidebar {
  width: 240px;
  background-color: var(--color-text);
  color: var(--color-white);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 100;
}

.sidebar-header {
  padding: var(--space-lg);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  text-decoration: none;
}

.logo-text {
  font-family: var(--font-heading);
  font-size: 1.25rem;
  font-weight: 400;
  letter-spacing: 0.1em;
  color: var(--color-white);
  text-transform: uppercase;
}

.logo-badge {
  font-size: 0.625rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  padding: 2px 6px;
  background-color: var(--color-accent);
  color: var(--color-text);
  border-radius: 4px;
}

.sidebar-nav {
  flex: 1;
  padding: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.nav-item:hover {
  color: var(--color-white);
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-item--active {
  color: var(--color-white);
  background-color: var(--color-secondary);
}

.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.nav-label {
  font-size: 0.875rem;
  font-weight: 500;
}

.sidebar-footer {
  padding: var(--space-md) var(--space-lg);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.back-to-store {
  font-size: 0.813rem;
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.back-to-store:hover {
  color: var(--color-white);
}

.admin-main {
  flex: 1;
  margin-left: 240px;
  display: flex;
  flex-direction: column;
}

.admin-header {
  background-color: var(--color-white);
  border-bottom: 1px solid var(--color-border);
  padding: var(--space-md) var(--space-lg);
  position: sticky;
  top: 0;
  z-index: 50;
}

.header-stats {
  display: flex;
  gap: var(--space-xl);
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-family: var(--font-heading);
  font-size: 1.25rem;
  font-weight: 500;
  color: var(--color-text);
}

.stat-label {
  font-size: 0.75rem;
  color: var(--color-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-warning .stat-value {
  color: #c45c5c;
}

.stat-highlight .stat-value {
  color: var(--color-accent);
}

.admin-content {
  flex: 1;
}

@media (max-width: 768px) {
  .admin-sidebar {
    width: 60px;
  }

  .sidebar-header {
    padding: var(--space-md);
  }

  .logo-text,
  .logo-badge,
  .nav-label,
  .back-to-store {
    display: none;
  }

  .nav-item {
    justify-content: center;
    padding: var(--space-sm);
  }

  .nav-icon {
    font-size: 1.25rem;
  }

  .admin-main {
    margin-left: 60px;
  }

  .header-stats {
    flex-wrap: wrap;
    gap: var(--space-md);
  }
}
</style>
