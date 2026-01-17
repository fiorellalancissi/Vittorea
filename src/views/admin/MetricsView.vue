<script setup>
import { ref, computed } from 'vue'
import { useAdminStore } from '../../stores/admin'
import Icon from '../../components/Icon.vue'

const adminStore = useAdminStore()

const salesByMonth = computed(() => adminStore.salesByMonth)
const productRanking = computed(() => adminStore.productSalesRanking)
const rotation = computed(() => adminStore.inventoryRotation)
const financial = computed(() => adminStore.financialMetrics)

const reinvestPercent = ref(adminStore.reinvestmentPercent)

function updateReinvestment() {
  adminStore.setReinvestmentPercent(reinvestPercent.value)
}

function formatCurrency(value) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0
  }).format(value)
}

function formatMonth(monthKey) {
  const [year, month] = monthKey.split('-')
  const date = new Date(year, month - 1)
  return date.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
}

// Calcular el valor máximo para el gráfico de barras
const maxSales = computed(() => {
  return Math.max(...salesByMonth.value.map(m => m.totalSales), 1)
})
</script>

<template>
  <div class="metrics-page">
    <h1 class="page-title">Métricas y Reportes</h1>

    <!-- KPIs principales -->
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-icon"><Icon name="money" :size="28" /></div>
        <div class="kpi-content">
          <span class="kpi-value">{{ formatCurrency(financial.totalRevenue) }}</span>
          <span class="kpi-label">Ingresos totales</span>
        </div>
      </div>

      <div class="kpi-card kpi-card--profit">
        <div class="kpi-icon"><Icon name="trending-up" :size="28" /></div>
        <div class="kpi-content">
          <span class="kpi-value">{{ formatCurrency(financial.totalProfit) }}</span>
          <span class="kpi-label">Ganancia total</span>
          <span class="kpi-badge">{{ financial.profitMargin }}% margen</span>
        </div>
      </div>

      <div class="kpi-card">
        <div class="kpi-icon"><Icon name="refresh" :size="28" /></div>
        <div class="kpi-content">
          <span class="kpi-value">{{ rotation }}x</span>
          <span class="kpi-label">Rotación de inventario</span>
        </div>
      </div>

      <div class="kpi-card kpi-card--month">
        <div class="kpi-icon"><Icon name="calendar" :size="28" /></div>
        <div class="kpi-content">
          <span class="kpi-value">{{ formatCurrency(financial.monthlyProfit) }}</span>
          <span class="kpi-label">Ganancia este mes</span>
        </div>
      </div>
    </div>

    <!-- Gráfico de ventas por mes -->
    <section class="metrics-section">
      <h2 class="section-title">Ventas por mes</h2>
      <div class="chart-container">
        <div class="bar-chart">
          <div 
            v-for="month in salesByMonth" 
            :key="month.month" 
            class="bar-item"
          >
            <div class="bar-wrapper">
              <div 
                class="bar" 
                :style="{ height: `${(month.totalSales / maxSales) * 100}%` }"
              >
                <span class="bar-value">{{ formatCurrency(month.totalSales) }}</span>
              </div>
            </div>
            <span class="bar-label">{{ formatMonth(month.month) }}</span>
            <div class="bar-details">
              <span>{{ month.unitsSold }} uds</span>
              <span class="profit-text">+{{ formatCurrency(month.totalProfit) }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div class="two-columns">
      <!-- Productos más/menos vendidos -->
      <section class="metrics-section">
        <h2 class="section-title">Ranking de productos</h2>
        
        <div class="ranking-cards">
          <!-- Más vendido -->
          <div class="ranking-card ranking-card--top" v-if="productRanking.top">
            <div class="ranking-badge"><Icon name="trophy" :size="16" /> Más vendido</div>
            <div class="ranking-product">
              <img 
                v-if="productRanking.top.productImage" 
                :src="productRanking.top.productImage" 
                class="product-thumb"
              />
              <div class="product-info">
                <span class="product-name">{{ productRanking.top.productName }}</span>
                <span class="product-stats">
                  {{ productRanking.top.unitsSold }} unidades vendidas
                </span>
              </div>
            </div>
            <div class="ranking-metrics">
              <div class="metric">
                <span class="metric-label">Ingresos</span>
                <span class="metric-value">{{ formatCurrency(productRanking.top.totalRevenue) }}</span>
              </div>
              <div class="metric">
                <span class="metric-label">Ganancia</span>
                <span class="metric-value profit-text">{{ formatCurrency(productRanking.top.totalProfit) }}</span>
              </div>
            </div>
          </div>

          <!-- Menos vendido -->
          <div class="ranking-card ranking-card--bottom" v-if="productRanking.bottom && productRanking.all.length > 1">
            <div class="ranking-badge"><Icon name="trending-down" :size="16" /> Menos vendido</div>
            <div class="ranking-product">
              <img 
                v-if="productRanking.bottom.productImage" 
                :src="productRanking.bottom.productImage" 
                class="product-thumb"
              />
              <div class="product-info">
                <span class="product-name">{{ productRanking.bottom.productName }}</span>
                <span class="product-stats">
                  {{ productRanking.bottom.unitsSold }} unidades vendidas
                </span>
              </div>
            </div>
            <div class="ranking-metrics">
              <div class="metric">
                <span class="metric-label">Ingresos</span>
                <span class="metric-value">{{ formatCurrency(productRanking.bottom.totalRevenue) }}</span>
              </div>
              <div class="metric">
                <span class="metric-label">Ganancia</span>
                <span class="metric-value profit-text">{{ formatCurrency(productRanking.bottom.totalProfit) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Lista completa -->
        <div class="ranking-list">
          <h3 class="list-title">Todos los productos</h3>
          <table class="ranking-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Producto</th>
                <th>Vendidos</th>
                <th>Ingresos</th>
                <th>Ganancia</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(product, index) in productRanking.all" :key="product.productId">
                <td class="rank-cell">{{ index + 1 }}</td>
                <td>{{ product.productName }}</td>
                <td>{{ product.unitsSold }}</td>
                <td>{{ formatCurrency(product.totalRevenue) }}</td>
                <td class="profit-text">{{ formatCurrency(product.totalProfit) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Reinversión -->
      <section class="metrics-section">
        <h2 class="section-title">Configuración de reinversión</h2>
        
        <div class="reinvest-card">
          <div class="reinvest-header">
            <span class="reinvest-label">% de ganancia a reinvertir</span>
            <div class="reinvest-input-group">
              <input 
                type="number" 
                v-model.number="reinvestPercent"
                min="0"
                max="100"
                class="reinvest-input"
                @change="updateReinvestment"
              />
              <span class="reinvest-suffix">%</span>
            </div>
          </div>

          <div class="reinvest-preview">
            <div class="preview-row">
              <span class="preview-label">Ganancia mensual</span>
              <span class="preview-value">{{ formatCurrency(financial.monthlyProfit) }}</span>
            </div>
            <div class="preview-row preview-row--highlight">
              <span class="preview-label">A reinvertir ({{ reinvestPercent }}%)</span>
              <span class="preview-value">{{ formatCurrency(financial.monthlyReinvestment) }}</span>
            </div>
            <div class="preview-row">
              <span class="preview-label">Disponible</span>
              <span class="preview-value">{{ formatCurrency(financial.monthlyProfit - financial.monthlyReinvestment) }}</span>
            </div>
          </div>

          <p class="reinvest-hint">
            Este porcentaje se usa para calcular cuánto deberías reinvertir en stock cada mes.
          </p>
        </div>

        <!-- Resumen financiero -->
        <div class="finance-summary">
          <h3 class="list-title">Resumen financiero total</h3>
          <div class="summary-grid">
            <div class="summary-item">
              <span class="summary-label">Ingresos por ventas</span>
              <span class="summary-value">{{ formatCurrency(financial.totalRevenue) }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Costo de productos</span>
              <span class="summary-value cost-text">-{{ formatCurrency(financial.totalCost) }}</span>
            </div>
            <div class="summary-item summary-item--total">
              <span class="summary-label">Ganancia neta</span>
              <span class="summary-value profit-text">{{ formatCurrency(financial.totalProfit) }}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.metrics-page {
  padding: var(--space-lg);
}

.page-title {
  font-family: var(--font-heading);
  font-size: 1.75rem;
  font-weight: 400;
  margin-bottom: var(--space-lg);
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--space-md);
  margin-bottom: var(--space-xl);
}

.kpi-card {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-lg);
  background: var(--color-white);
  border-radius: var(--radius-md);
  border-left: 4px solid var(--color-primary);
}

.kpi-card--profit {
  border-left-color: #25D366;
}

.kpi-card--month {
  border-left-color: var(--color-accent);
}

.kpi-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  background: var(--color-background);
  border-radius: var(--radius-md);
  color: var(--color-text);
  flex-shrink: 0;
}

.kpi-card--profit .kpi-icon {
  background: rgba(37, 211, 102, 0.1);
  color: #25D366;
}

.kpi-content {
  display: flex;
  flex-direction: column;
}

.kpi-value {
  font-family: var(--font-heading);
  font-size: 1.5rem;
  font-weight: 500;
  color: var(--color-text);
}

.kpi-label {
  font-size: 0.813rem;
  color: var(--color-muted);
}

.kpi-badge {
  font-size: 0.688rem;
  color: #25D366;
  margin-top: 2px;
}

.metrics-section {
  background: var(--color-white);
  border-radius: var(--radius-md);
  padding: var(--space-lg);
  margin-bottom: var(--space-lg);
}

.section-title {
  font-family: var(--font-heading);
  font-size: 1.125rem;
  font-weight: 500;
  margin: 0 0 var(--space-md);
}

.chart-container {
  overflow-x: auto;
}

.bar-chart {
  display: flex;
  gap: var(--space-md);
  min-width: max-content;
  padding-bottom: var(--space-md);
}

.bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 100px;
}

.bar-wrapper {
  width: 60px;
  height: 150px;
  display: flex;
  align-items: flex-end;
  background: var(--color-background);
  border-radius: var(--radius-sm);
}

.bar {
  width: 100%;
  background: linear-gradient(to top, var(--color-secondary), var(--color-primary));
  border-radius: var(--radius-sm);
  min-height: 20px;
  position: relative;
  transition: height 0.3s ease;
}

.bar-value {
  position: absolute;
  top: -24px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.688rem;
  font-weight: 500;
  white-space: nowrap;
}

.bar-label {
  font-size: 0.75rem;
  color: var(--color-muted);
  margin-top: var(--space-sm);
  text-transform: capitalize;
}

.bar-details {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 0.688rem;
  color: var(--color-muted);
  margin-top: 4px;
}

.two-columns {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: var(--space-lg);
}

.ranking-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
}

.ranking-card {
  padding: var(--space-md);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.ranking-card--top {
  background: linear-gradient(135deg, rgba(37, 211, 102, 0.05), transparent);
  border-color: rgba(37, 211, 102, 0.2);
}

.ranking-card--bottom {
  background: linear-gradient(135deg, rgba(196, 92, 92, 0.05), transparent);
  border-color: rgba(196, 92, 92, 0.2);
}

.ranking-badge {
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: var(--space-sm);
  display: flex;
  align-items: center;
  gap: 6px;
}

.ranking-card--top .ranking-badge {
  color: #25D366;
}

.ranking-card--bottom .ranking-badge {
  color: #c45c5c;
}

.ranking-product {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}

.product-thumb {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: var(--radius-sm);
}

.product-info {
  display: flex;
  flex-direction: column;
}

.product-name {
  font-weight: 500;
}

.product-stats {
  font-size: 0.75rem;
  color: var(--color-muted);
}

.ranking-metrics {
  display: flex;
  gap: var(--space-md);
}

.metric {
  display: flex;
  flex-direction: column;
}

.metric-label {
  font-size: 0.688rem;
  color: var(--color-muted);
}

.metric-value {
  font-weight: 500;
}

.ranking-list {
  border-top: 1px solid var(--color-border);
  padding-top: var(--space-md);
}

.list-title {
  font-size: 0.875rem;
  font-weight: 500;
  margin: 0 0 var(--space-sm);
}

.ranking-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.ranking-table th,
.ranking-table td {
  padding: var(--space-sm);
  text-align: left;
  border-bottom: 1px solid var(--color-border);
}

.ranking-table th {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-muted);
  text-transform: uppercase;
}

.rank-cell {
  font-weight: 600;
  color: var(--color-muted);
}

.profit-text {
  color: #25D366;
}

.cost-text {
  color: #c45c5c;
}

.reinvest-card {
  padding: var(--space-lg);
  background: var(--color-background);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-lg);
}

.reinvest-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-md);
}

.reinvest-label {
  font-weight: 500;
}

.reinvest-input-group {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.reinvest-input {
  width: 70px;
  padding: var(--space-xs);
  font-size: 1rem;
  font-weight: 500;
  text-align: center;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
}

.reinvest-suffix {
  font-weight: 500;
  color: var(--color-muted);
}

.reinvest-preview {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.preview-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
}

.preview-row--highlight {
  padding: var(--space-sm);
  background: var(--color-white);
  border-radius: var(--radius-sm);
  font-weight: 500;
}

.preview-label {
  color: var(--color-muted);
}

.preview-value {
  font-weight: 500;
}

.reinvest-hint {
  font-size: 0.75rem;
  color: var(--color-muted);
  margin: var(--space-md) 0 0;
}

.finance-summary {
  padding: var(--space-lg);
  background: var(--color-background);
  border-radius: var(--radius-md);
}

.summary-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: var(--space-sm) 0;
  border-bottom: 1px solid var(--color-border);
}

.summary-item--total {
  border-bottom: none;
  padding-top: var(--space-md);
  font-size: 1.125rem;
}

.summary-label {
  color: var(--color-muted);
}

.summary-value {
  font-weight: 500;
}

@media (max-width: 768px) {
  .two-columns {
    grid-template-columns: 1fr;
  }

  .ranking-table {
    font-size: 0.75rem;
  }
}
</style>
