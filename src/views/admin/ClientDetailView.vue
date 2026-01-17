<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAdminStore } from '../../stores/admin'
import Icon from '../../components/Icon.vue'

const route = useRoute()
const router = useRouter()
const adminStore = useAdminStore()

const clientId = computed(() => Number(route.params.id))
const client = computed(() => adminStore.getClientById(clientId.value))
const orders = computed(() => adminStore.getOrdersByClient(clientId.value))
const feedbacks = computed(() => adminStore.getFeedbacksByClient(clientId.value))

// Modal de feedback
const showFeedbackModal = ref(false)
const feedbackOrder = ref(null)

const feedbackForm = ref({
  productId: '',
  nivel_satisfaccion: 'positivo',
  duracion_percibida: 'media',
  intensidad_percibida: 'media',
  volveria_a_comprar: true,
  comentario_libre: ''
})

const errors = ref({})

// Estadísticas del cliente
const clientStats = computed(() => {
  const totalSpent = orders.value.reduce((sum, o) => sum + o.total, 0)
  const totalOrders = orders.value.length
  const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0
  
  // Productos comprados
  const products = {}
  orders.value.forEach(o => {
    if (!products[o.productId]) {
      products[o.productId] = {
        product: o.product,
        quantity: 0
      }
    }
    products[o.productId].quantity += o.quantity
  })
  
  const uniqueProducts = Object.keys(products).length
  const topProduct = Object.values(products).sort((a, b) => b.quantity - a.quantity)[0]
  
  return {
    totalSpent,
    totalOrders,
    avgOrderValue,
    uniqueProducts,
    topProduct: topProduct?.product
  }
})

function openFeedbackModal(order) {
  feedbackOrder.value = order
  feedbackForm.value = {
    productId: order.productId,
    nivel_satisfaccion: 'positivo',
    duracion_percibida: 'media',
    intensidad_percibida: 'media',
    volveria_a_comprar: true,
    comentario_libre: ''
  }
  errors.value = {}
  showFeedbackModal.value = true
}

function closeFeedbackModal() {
  showFeedbackModal.value = false
  feedbackOrder.value = null
}

function submitFeedback() {
  adminStore.addFeedback({
    clientId: clientId.value,
    orderId: feedbackOrder.value.id,
    productId: feedbackForm.value.productId,
    nivel_satisfaccion: feedbackForm.value.nivel_satisfaccion,
    duracion_percibida: feedbackForm.value.duracion_percibida,
    intensidad_percibida: feedbackForm.value.intensidad_percibida,
    volveria_a_comprar: feedbackForm.value.volveria_a_comprar,
    comentario_libre: feedbackForm.value.comentario_libre
  })
  
  closeFeedbackModal()
}

function deleteFeedback(id) {
  if (confirm('¿Eliminar este feedback?')) {
    adminStore.deleteFeedback(id)
  }
}

function getSatisfactionClass(nivel) {
  switch(nivel) {
    case 'positivo': return 'satisfaction-positive'
    case 'neutro': return 'satisfaction-neutral'
    case 'negativo': return 'satisfaction-negative'
    default: return ''
  }
}

function getSatisfactionIcon(nivel) {
  switch(nivel) {
    case 'positivo': return 'check'
    case 'neutro': return 'arrow-right'
    case 'negativo': return 'alert'
    default: return 'arrow-right'
  }
}

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
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function goBack() {
  router.push('/admin/clientes')
}

// Verificar si existe el cliente
if (!client.value) {
  router.push('/admin/clientes')
}
</script>

<template>
  <div v-if="client" class="client-detail-page">
    <!-- Header -->
    <div class="page-header">
      <button class="btn-back" @click="goBack">
        <Icon name="arrow-right" :size="16" style="transform: rotate(180deg)" />
        Volver
      </button>
    </div>

    <!-- Información del cliente -->
    <div class="client-info-card">
      <div class="client-avatar-large">
        {{ client.nombre.charAt(0).toUpperCase() }}
      </div>
      
      <div class="client-main-info">
        <h1 class="client-name-large">{{ client.nombre }}</h1>
        
        <div class="client-contact">
          <div class="contact-item">
            <Icon name="box" :size="16" />
            <span>{{ client.telefono }}</span>
          </div>
          <div v-if="client.email" class="contact-item">
            <Icon name="settings" :size="16" />
            <span>{{ client.email }}</span>
          </div>
          <div class="contact-item">
            <Icon name="calendar" :size="16" />
            <span>Última compra: {{ formatDate(client.fecha_ultima_compra) }}</span>
          </div>
        </div>

        <div v-if="client.tags && client.tags.length > 0" class="client-tags">
          <span v-for="tag in client.tags" :key="tag" class="tag">{{ tag }}</span>
        </div>

        <div v-if="client.notas_internas" class="client-notes">
          <strong>Notas:</strong> {{ client.notas_internas }}
        </div>
      </div>

      <!-- Estadísticas -->
      <div class="client-stats-grid">
        <div class="stat-box">
          <Icon name="box" :size="24" />
          <span class="stat-value">{{ clientStats.totalOrders }}</span>
          <span class="stat-label">Pedidos</span>
        </div>
        <div class="stat-box">
          <Icon name="money" :size="24" />
          <span class="stat-value">{{ formatCurrency(clientStats.totalSpent) }}</span>
          <span class="stat-label">Total gastado</span>
        </div>
        <div class="stat-box">
          <Icon name="bottle" :size="24" />
          <span class="stat-value">{{ clientStats.uniqueProducts }}</span>
          <span class="stat-label">Productos únicos</span>
        </div>
        <div class="stat-box">
          <Icon name="trending-up" :size="24" />
          <span class="stat-value">{{ formatCurrency(clientStats.avgOrderValue) }}</span>
          <span class="stat-label">Ticket promedio</span>
        </div>
      </div>
    </div>

    <div class="content-grid">
      <!-- Historial de pedidos -->
      <section class="section-card">
        <h2 class="section-title">
          <Icon name="package" :size="20" />
          Historial de pedidos
        </h2>

        <div v-if="orders.length === 0" class="empty-section">
          <p>Este cliente aún no tiene pedidos registrados</p>
        </div>

        <div v-else class="orders-list">
          <div v-for="order in orders" :key="order.id" class="order-item">
            <div class="order-header">
              <div class="order-info">
                <span class="order-id">Pedido #{{ order.id }}</span>
                <span class="order-date">{{ formatDate(order.date) }}</span>
              </div>
              <span :class="['order-status', `status-${order.estado}`]">
                {{ order.estado }}
              </span>
            </div>

            <div class="order-product">
              <img 
                v-if="order.product?.image" 
                :src="order.product.image" 
                :alt="order.product.name"
                class="product-img"
              />
              <div class="product-details">
                <span class="product-name">{{ order.product?.name || 'Producto eliminado' }}</span>
                <span class="product-quantity">{{ order.quantity }} unidad{{ order.quantity > 1 ? 'es' : '' }}</span>
              </div>
              <span class="order-total">{{ formatCurrency(order.total) }}</span>
            </div>

            <div class="order-actions">
              <button 
                class="btn btn-sm btn-outline"
                @click="openFeedbackModal(order)"
              >
                <Icon name="settings" :size="14" />
                Agregar feedback
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Feedback registrado -->
      <section class="section-card">
        <h2 class="section-title">
          <Icon name="chart" :size="20" />
          Feedback y preferencias
        </h2>

        <div v-if="feedbacks.length === 0" class="empty-section">
          <p>No hay feedback registrado aún</p>
          <small>Agregá feedback desde los pedidos para trackear preferencias</small>
        </div>

        <div v-else class="feedbacks-list">
          <div v-for="feedback in feedbacks" :key="feedback.id" class="feedback-item">
            <div class="feedback-header">
              <div class="feedback-product">
                <span class="product-name">{{ feedback.product?.name }}</span>
                <span class="feedback-date">{{ formatDate(feedback.fecha) }}</span>
              </div>
              <button 
                class="btn-icon"
                @click="deleteFeedback(feedback.id)"
                title="Eliminar"
              >
                <Icon name="trash" :size="14" />
              </button>
            </div>

            <div class="feedback-metrics">
              <div :class="['metric-badge', getSatisfactionClass(feedback.nivel_satisfaccion)]">
                <Icon :name="getSatisfactionIcon(feedback.nivel_satisfaccion)" :size="14" />
                {{ feedback.nivel_satisfaccion }}
              </div>
              <div class="metric-pill">
                Duración: {{ feedback.duracion_percibida }}
              </div>
              <div class="metric-pill">
                Intensidad: {{ feedback.intensidad_percibida }}
              </div>
              <div v-if="feedback.volveria_a_comprar" class="metric-pill metric-positive">
                Recompraría
              </div>
            </div>

            <p v-if="feedback.comentario_libre" class="feedback-comment">
              "{{ feedback.comentario_libre }}"
            </p>
          </div>
        </div>
      </section>
    </div>

    <!-- Modal de Feedback -->
    <Teleport to="body">
      <div v-if="showFeedbackModal" class="modal-overlay" @click.self="closeFeedbackModal">
        <div class="modal">
          <header class="modal-header">
            <h2 class="modal-title">
              <Icon name="settings" :size="20" />
              Registrar feedback
            </h2>
            <button class="modal-close" @click="closeFeedbackModal">&times;</button>
          </header>

          <form class="modal-body" @submit.prevent="submitFeedback">
            <div class="feedback-order-info">
              <strong>Pedido #{{ feedbackOrder?.id }}</strong>
              <span>{{ feedbackOrder?.product?.name }}</span>
            </div>

            <div class="form-group">
              <label class="form-label">Nivel de satisfacción</label>
              <div class="radio-group">
                <label class="radio-label">
                  <input type="radio" v-model="feedbackForm.nivel_satisfaccion" value="positivo" />
                  <span>Positivo</span>
                </label>
                <label class="radio-label">
                  <input type="radio" v-model="feedbackForm.nivel_satisfaccion" value="neutro" />
                  <span>Neutro</span>
                </label>
                <label class="radio-label">
                  <input type="radio" v-model="feedbackForm.nivel_satisfaccion" value="negativo" />
                  <span>Negativo</span>
                </label>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Duración percibida</label>
                <select v-model="feedbackForm.duracion_percibida" class="form-select">
                  <option value="baja">Baja</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Intensidad percibida</label>
                <select v-model="feedbackForm.intensidad_percibida" class="form-select">
                  <option value="suave">Suave</option>
                  <option value="media">Media</option>
                  <option value="intensa">Intensa</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="feedbackForm.volveria_a_comprar" />
                <span>Volvería a comprar este producto</span>
              </label>
            </div>

            <div class="form-group">
              <label class="form-label">Comentario (opcional)</label>
              <textarea 
                v-model="feedbackForm.comentario_libre"
                class="form-textarea"
                rows="3"
                placeholder="Observaciones, preferencias, detalles..."
              ></textarea>
            </div>

            <div class="form-actions">
              <button type="button" class="btn btn-outline" @click="closeFeedbackModal">
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary">
                Guardar feedback
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.client-detail-page {
  padding: var(--space-lg);
}

.page-header {
  margin-bottom: var(--space-lg);
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-sm) var(--space-md);
  background: var(--color-white);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-back:hover {
  border-color: var(--color-primary);
  background: var(--color-background);
}

.client-info-card {
  background: var(--color-white);
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
  margin-bottom: var(--space-lg);
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--space-xl);
  align-items: start;
}

.client-avatar-large {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  color: var(--color-white);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-heading);
  font-size: 2.5rem;
  font-weight: 500;
}

.client-main-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.client-name-large {
  font-family: var(--font-heading);
  font-size: 2rem;
  font-weight: 400;
  margin: 0;
}

.client-contact {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-md);
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  color: var(--color-muted);
}

.client-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  font-size: 0.813rem;
  padding: 6px 12px;
  background-color: var(--color-background);
  color: var(--color-secondary);
  border-radius: 16px;
  font-weight: 500;
}

.client-notes {
  padding: var(--space-md);
  background: var(--color-background);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  line-height: 1.5;
}

.client-stats-grid {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: var(--space-md);
  padding-top: var(--space-lg);
  border-top: 1px solid var(--color-border);
}

.stat-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: var(--space-md);
  background: var(--color-background);
  border-radius: var(--radius-md);
  text-align: center;
}

.stat-box svg {
  color: var(--color-accent);
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

.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: var(--space-lg);
  align-items: start;
}

.section-card {
  background: var(--color-white);
  border-radius: var(--radius-md);
  padding: var(--space-lg);
}

.section-title {
  font-family: var(--font-heading);
  font-size: 1.125rem;
  font-weight: 500;
  margin: 0 0 var(--space-md);
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.empty-section {
  text-align: center;
  padding: var(--space-xl);
  color: var(--color-muted);
}

.empty-section p {
  margin: 0 0 4px;
}

.empty-section small {
  font-size: 0.813rem;
}

.orders-list,
.feedbacks-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.order-item {
  padding: var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.order-id {
  font-weight: 600;
  font-size: 0.875rem;
}

.order-date {
  font-size: 0.75rem;
  color: var(--color-muted);
}

.order-status {
  font-size: 0.75rem;
  padding: 4px 10px;
  border-radius: 12px;
  font-weight: 600;
  text-transform: capitalize;
}

.status-entregado {
  background: rgba(37, 211, 102, 0.1);
  color: #25D366;
}

.status-pendiente {
  background: rgba(194, 161, 95, 0.1);
  color: var(--color-accent);
}

.order-product {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) 0;
}

.product-img {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: var(--radius-sm);
}

.product-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.product-name {
  font-weight: 500;
  font-size: 0.875rem;
}

.product-quantity {
  font-size: 0.75rem;
  color: var(--color-muted);
}

.order-total {
  font-weight: 600;
  color: var(--color-accent);
}

.order-actions {
  padding-top: var(--space-sm);
  border-top: 1px solid var(--color-border);
}

.feedback-item {
  padding: var(--space-md);
  background: var(--color-background);
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.feedback-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
}

.feedback-product {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.feedback-date {
  font-size: 0.75rem;
  color: var(--color-muted);
}

.feedback-metrics {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.metric-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  padding: 4px 10px;
  border-radius: 12px;
  font-weight: 600;
  text-transform: capitalize;
}

.satisfaction-positive {
  background: rgba(37, 211, 102, 0.1);
  color: #25D366;
}

.satisfaction-neutral {
  background: rgba(194, 161, 95, 0.1);
  color: var(--color-accent);
}

.satisfaction-negative {
  background: rgba(196, 92, 92, 0.1);
  color: #c45c5c;
}

.metric-pill {
  font-size: 0.75rem;
  padding: 4px 10px;
  background: var(--color-white);
  border-radius: 12px;
  text-transform: capitalize;
}

.metric-positive {
  background: rgba(37, 211, 102, 0.1);
  color: #25D366;
}

.feedback-comment {
  font-size: 0.875rem;
  font-style: italic;
  color: var(--color-muted);
  margin: 0;
  padding: var(--space-sm);
  background: var(--color-white);
  border-radius: var(--radius-sm);
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--space-xs);
  opacity: 0.5;
  transition: opacity var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text);
}

.btn-icon:hover {
  opacity: 1;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(46, 42, 38, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--space-md);
}

.modal {
  background: var(--color-white);
  border-radius: var(--radius-lg);
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-lg);
  border-bottom: 1px solid var(--color-border);
}

.modal-title {
  font-family: var(--font-heading);
  font-size: 1.25rem;
  font-weight: 400;
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--color-muted);
  cursor: pointer;
  line-height: 1;
}

.modal-close:hover {
  color: var(--color-text);
}

.modal-body {
  padding: var(--space-lg);
}

.feedback-order-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: var(--space-md);
  background: var(--color-background);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-md);
}

.radio-group {
  display: flex;
  gap: var(--space-md);
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 0.875rem;
}

.radio-label input[type="radio"] {
  cursor: pointer;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  cursor: pointer;
  font-size: 0.875rem;
}

.checkbox-label input[type="checkbox"] {
  cursor: pointer;
  width: 18px;
  height: 18px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-md);
}

@media (max-width: 768px) {
  .client-info-card {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .client-avatar-large {
    margin: 0 auto;
  }
  
  .client-contact {
    flex-direction: column;
    align-items: center;
  }
  
  .content-grid {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
