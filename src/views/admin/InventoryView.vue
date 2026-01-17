<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAdminStore } from '../../stores/admin'
import Icon from '../../components/Icon.vue'
import ProductTreeSelector from '../../components/ProductTreeSelector.vue'

const route = useRoute()
const adminStore = useAdminStore()

const movements = computed(() => adminStore.movementsWithProduct)
const products = computed(() => adminStore.productsWithBrand)

// Modal
const showModal = ref(false)
const modalType = ref('ingreso')

// Form
const form = ref({
  productId: '',
  productIds: [],
  quantity: 1,
  reason: '',
  notes: ''
})

const errors = ref({})

const reasonOptions = {
  ingreso: ['Compra de stock', 'Devolución de cliente', 'Ajuste de inventario', 'Otro'],
  egreso: ['Venta', 'Producto dañado', 'Muestra/Regalo', 'Ajuste de inventario', 'Otro']
}

function openModal(type) {
  modalType.value = type
  form.value = {
    productId: '',
    productIds: [],
    quantity: 1,
    reason: reasonOptions[type][0],
    notes: ''
  }
  errors.value = {}
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

function validateForm() {
  errors.value = {}
  
  if (modalType.value === 'ingreso') {
    if (!form.value.productIds || form.value.productIds.length === 0) {
      errors.value.productIds = 'Seleccioná al menos un producto'
    }
  } else {
    if (!form.value.productId) {
      errors.value.productId = 'Seleccioná un producto'
    }
  }
  
  if (!form.value.quantity || form.value.quantity < 1) {
    errors.value.quantity = 'La cantidad debe ser mayor a 0'
  }
  
  // Validar stock disponible en egresos
  if (modalType.value === 'egreso' && form.value.productId) {
    const product = adminStore.getProductById(form.value.productId)
    if (product && form.value.quantity > product.stock) {
      errors.value.quantity = `Stock insuficiente. Disponible: ${product.stock}`
    }
  }
  
  if (!form.value.reason) {
    errors.value.reason = 'Seleccioná un motivo'
  }
  
  if (modalType.value === 'ingreso' && form.value.productIds.length > 0) {
    // Registrar ingreso para múltiples productos
    form.value.productIds.forEach(productId => {
      adminStore.addMovement({
        productId: Number(productId),
        type: 'ingreso',
        quantity: Number(form.value.quantity),
        reason: form.value.reason,
        notes: form.value.notes
      })
    })
  } else {
    // Egreso o ingreso con producto único
    adminStore.addMovement({
      productId: Number(form.value.productId),
      type: modalType.value,
      quantity: Number(form.value.quantity),
      reason: form.value.reason,
      notes: form.value.notes
    })
  }minStore.addMovement({
    productId: Number(form.value.productId),
    type: modalType.value,
    quantity: Number(form.value.quantity),
    reason: form.value.reason,
    notes: form.value.notes
  })
  
  closeModal()
}

function deleteMovement(id) {
  if (confirm('¿Eliminar este movimiento? Se revertirá el cambio de stock.')) {
    adminStore.deleteMovement(id)
  }
}

function confirmTransfer(id) {
  if (confirm('¿Confirmar la transferencia? Esto descontará el stock.')) {
    adminStore.confirmTransfer(id)
  }
}

function confirmDelivery(id) {
  if (confirm('¿Confirmar la entrega? El pedido se marcará como completado.')) {
    adminStore.confirmDelivery(id)
  }
}

function getStatusBadge(status) {
  const badges = {
    pendiente: { text: 'Pendiente', class: 'badge-warning' },
    confirmado: { text: 'Confirmado', class: 'badge-info' },
    entregado: { text: 'Entregado', class: 'badge-success' },
    completado: { text: 'Completado', class: 'badge-success' }
  }
  return badges[status] || badges.completado
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

function formatCurrency(value) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0
  }).format(value)
}

// Abrir modal si viene con action en la URL
onMounted(() => {
  const action = route.query.action
  if (action === 'ingreso' || action === 'egreso') {
    openModal(action)
  }
})
</script>

<template>
  <div class="inventory-page">
    <header class="page-header">
      <h1 class="page-title">Inventario</h1>
      <div class="header-actions">
        <button class="btn btn-success" @click="openModal('ingreso')">
          <Icon name="download" :size="16" /> Registrar ingreso
        </button>
        <button class="btn btn-danger" @click="openModal('egreso')">
          <Icon name="upload" :size="16" /> Registrar egreso
        </button>
      </div>
    </header>

    <!-- Tabla de movimientos -->
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Tipo</th>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Motivo</th>
            <th>Estado</th>
            <th>Notas</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="movements.length === 0">
            <td colspan="8" class="empty-cell">
              No hay movimientos registrados
            </td>
          </tr>
          <tr v-for="movement in movements" :key="movement.id">
            <td class="cell-date">{{ formatDate(movement.date) }}</td>
            <td>
              <span 
                class="type-badge" 
                :class="movement.type === 'ingreso' ? 'badge-success' : 'badge-danger'"
              >
                {{ movement.type === 'ingreso' ? 'Ingreso' : 'Egreso' }}
              </span>
            </td>
            <td>
              <div class="product-cell">
                <img 
                  v-if="movement.product?.image" 
                  :src="movement.product.image" 
                  :alt="movement.product?.name"
                  class="product-thumb"
                />
                <div class="product-info">
                  <span class="product-name">{{ movement.product?.name || 'Producto eliminado' }}</span>
                  <span class="product-brand">{{ movement.product?.brand }}</span>
                </div>
              </div>
            </td>
            <td class="cell-quantity">
              <span :class="movement.type === 'ingreso' ? 'text-success' : 'text-danger'">
                {{ movement.type === 'ingreso' ? '+' : '-' }}{{ movement.quantity }}
              </span>
            </td>
            <td>{{ movement.reason }}</td>
            <td>
              <span 
                class="type-badge" 
                :class="getStatusBadge(movement.status).class"
              >
                {{ getStatusBadge(movement.status).text }}
              </span>
            </td>
            <td class="cell-notes">{{ movement.notes || '-' }}</td>
            <td class="cell-actions">
              <div class="action-buttons">
                <button 
                  v-if="movement.type === 'egreso' && movement.status === 'pendiente'"
                  class="btn btn-sm btn-warning"
                  @click="confirmTransfer(movement.id)"
                  title="Confirmar transferencia"
                >
                  Confirmar transferencia
                </button>
                <button 
                  v-if="movement.type === 'egreso' && movement.status === 'confirmado'"
                  class="btn btn-sm btn-info"
                  @click="confirmDelivery(movement.id)"
                  title="Confirmar entrega"
                >
                  Confirmar entrega
                </button>
                <button 
                  v-if="movement.status === 'completado' || movement.type === 'ingreso'"
                  class="btn-icon" 
                  @click="deleteMovement(movement.id)" 
                  title="Eliminar"
                >
                  <Icon name="trash" :size="16" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal">
          <header class="modal-header">
            <h2 class="modal-title">
              <Icon :name="modalType === 'ingreso' ? 'download' : 'upload'" :size="20" />
              {{ modalType === 'ingreso' ? 'Registrar ingreso' : 'Registrar egreso' }}
            </h2>
            <button class="modal-close" @click="closeModal">&times;</button>
          </header>

          <form class="modal-body" @submit.prevent="submitMovement">
            <div class="form-group">
              <label class="form-label">Producto *</label>
              
              <!-- Selector múltiple tipo árbol para ingresos -->
              <ProductTreeSelector 
                v-if="modalType === 'ingreso'"
                v-model="form.productIds"
                :multiple="true"
              />
              
              <!-- Selector simple para egresos -->
              <select 
                v-else
                v-model="form.productId" 
                class="form-select"
                :class="{ 'form-input--error': errors.productId }"
              >
                <option value="">Seleccionar producto</option>
                <option 
                  v-for="product in products" 
                  :key="product.id" 
                  :value="product.id"
                >
                  {{ product.name }} - Stock: {{ product.stock }}
                </option>
              </select>
              
              <span v-if="errors.productId" class="form-error">{{ errors.productId }}</span>
              <span v-if="errors.productIds" class="form-error">{{ errors.productIds }}</span>
            </div>

            <div class="form-group">
              <label class="form-label">Cantidad *</label>
              <input 
                type="number" 
                v-model.number="form.quantity"
                min="1"
                class="form-input"
                :class="{ 'form-input--error': errors.quantity }"
              />
              <span v-if="errors.quantity" class="form-error">{{ errors.quantity }}</span>
            </div>

            <div class="form-group">
              <label class="form-label">Motivo *</label>
              <select 
                v-model="form.reason" 
                class="form-select"
                :class="{ 'form-input--error': errors.reason }"
              >
                <option 
                  v-for="reason in reasonOptions[modalType]" 
                  :key="reason" 
                  :value="reason"
                >
                  {{ reason }}
                </option>
              </select>
              <span v-if="errors.reason" class="form-error">{{ errors.reason }}</span>
            </div>

            <div class="form-group">
              <label class="form-label">Notas</label>
              <textarea 
                v-model="form.notes"
                class="form-textarea"
                rows="2"
              ></textarea>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" @click="closeModal">
                Cancelar
              </button>
              <button 
                type="submit" 
                class="btn"
                :class="modalType === 'ingreso' ? 'btn-success' : 'btn-danger'"
              >
                {{ modalType === 'ingreso' ? 'Registrar ingreso' : 'Registrar egreso' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.inventory-page {
  padding: var(--space-lg);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-lg);
  flex-wrap: wrap;
  gap: var(--space-md);
}

.page-title {
  font-family: var(--font-heading);
  font-size: 1.75rem;
  font-weight: 400;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: var(--space-sm);
}

.btn-success,
.btn-danger {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
}

.btn-success {
  background-color: #25D366;
  color: white;
  border-color: #25D366;
}

.btn-success:hover {
  background-color: #1da851;
  border-color: #1da851;
}

.btn-danger {
  background-color: #c45c5c;
  color: white;
  border-color: #c45c5c;
}

.btn-danger:hover {
  background-color: #a94a4a;
  border-color: #a94a4a;
}

.table-container {
  background: var(--color-white);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: var(--space-md);
  text-align: left;
  border-bottom: 1px solid var(--color-border);
}

.data-table th {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-muted);
  background-color: var(--color-background);
}

.empty-cell {
  text-align: center;
  color: var(--color-muted);
  padding: var(--space-xl) !important;
}

.cell-date {
  font-size: 0.813rem;
  color: var(--color-muted);
  white-space: nowrap;
}

.type-badge {
  display: inline-block;
  padding: 4px 8px;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: var(--radius-sm);
}

.badge-success {
  background-color: rgba(37, 211, 102, 0.1);
  color: #25D366;
}

.badge-danger {
  background-color: rgba(196, 92, 92, 0.1);
  color: #c45c5c;
}

.badge-warning {
  background-color: #fff3e0;
  color: #f57c00;
}

.badge-info {
  background-color: #e3f2fd;
  color: #1976d2;
}

.cell-actions {
  white-space: nowrap;
}

.action-buttons {
  display: flex;
  gap: var(--space-xs);
  align-items: center;
}

.btn-warning {
  background-color: #f57c00;
  color: white;
}

.btn-warning:hover {
  background-color: #e65100;
}

.btn-info {
  background-color: #1976d2;
  color: white;
}

.btn-info:hover {
  background-color: #1565c0;
}

.product-cell {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.product-thumb {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: var(--radius-sm);
}

.product-info {
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

.cell-quantity {
  font-weight: 600;
}

.text-success {
  color: #25D366;
}

.text-danger {
  color: #c45c5c;
}

.cell-notes {
  font-size: 0.813rem;
  color: var(--color-muted);
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  max-width: 480px;
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

.form-select {
  width: 100%;
  padding: var(--space-sm);
  font-family: var(--font-body);
  font-size: 1rem;
  color: var(--color-text);
  background-color: var(--color-white);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
}

.form-select:focus {
  outline: none;
  border-color: var(--color-primary);
}

.form-textarea {
  width: 100%;
  padding: var(--space-sm);
  font-family: var(--font-body);
  font-size: 1rem;
  color: var(--color-text);
  background-color: var(--color-white);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  resize: vertical;
}

.form-textarea:focus {
  outline: none;
  border-color: var(--color-primary);
}

.form-input--error {
  border-color: #c45c5c;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-sm);
  margin-top: var(--space-lg);
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
  }

  .header-actions .btn {
    flex: 1;
  }

  .data-table {
    font-size: 0.875rem;
  }

  .data-table th,
  .data-table td {
    padding: var(--space-sm);
  }

  .cell-notes {
    display: none;
  }
}
</style>
