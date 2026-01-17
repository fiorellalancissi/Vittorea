<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminStore } from '../../stores/admin'
import Icon from '../../components/Icon.vue'

const router = useRouter()
const adminStore = useAdminStore()

const clients = computed(() => adminStore.clients)
const searchQuery = ref('')

// Modal para nuevo cliente
const showModal = ref(false)
const editingClient = ref(null)

// Form
const form = ref({
  nombre: '',
  telefono: '',
  email: '',
  notas_internas: '',
  tags: []
})

const newTag = ref('')
const errors = ref({})

// Filtrar clientes por búsqueda
const filteredClients = computed(() => {
  if (!searchQuery.value.trim()) {
    return clients.value
  }
  
  const query = searchQuery.value.toLowerCase()
  return clients.value.filter(c => 
    c.nombre.toLowerCase().includes(query) ||
    c.telefono.includes(query) ||
    (c.email && c.email.toLowerCase().includes(query))
  )
})

// Obtener estadísticas de cliente
function getClientStats(clientId) {
  const orders = adminStore.getOrdersByClient(clientId)
  const totalSpent = orders.reduce((sum, o) => sum + o.total, 0)
  const totalOrders = orders.length
  
  return { totalSpent, totalOrders }
}

function openModal(client = null) {
  editingClient.value = client
  if (client) {
    form.value = {
      nombre: client.nombre,
      telefono: client.telefono,
      email: client.email || '',
      notas_internas: client.notas_internas || '',
      tags: [...(client.tags || [])]
    }
  } else {
    form.value = {
      nombre: '',
      telefono: '',
      email: '',
      notas_internas: '',
      tags: []
    }
  }
  errors.value = {}
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingClient.value = null
  newTag.value = ''
}

function addTag() {
  if (newTag.value.trim() && !form.value.tags.includes(newTag.value.trim())) {
    form.value.tags.push(newTag.value.trim())
    newTag.value = ''
  }
}

function removeTag(tag) {
  form.value.tags = form.value.tags.filter(t => t !== tag)
}

function validateForm() {
  errors.value = {}
  
  if (!form.value.nombre.trim()) {
    errors.value.nombre = 'El nombre es obligatorio'
  }
  
  if (!form.value.telefono.trim()) {
    errors.value.telefono = 'El teléfono es obligatorio'
  } else if (!/^\d{10}$/.test(form.value.telefono.replace(/\s/g, ''))) {
    errors.value.telefono = 'Ingresá un teléfono válido (10 dígitos)'
  }
  
  return Object.keys(errors.value).length === 0
}

function submitForm() {
  if (!validateForm()) return
  
  if (editingClient.value) {
    adminStore.updateClient(editingClient.value.id, {
      nombre: form.value.nombre,
      telefono: form.value.telefono,
      email: form.value.email,
      notas_internas: form.value.notas_internas,
      tags: form.value.tags
    })
  } else {
    adminStore.addClient({
      nombre: form.value.nombre,
      telefono: form.value.telefono,
      email: form.value.email,
      notas_internas: form.value.notas_internas,
      tags: form.value.tags
    })
  }
  
  closeModal()
}

function deleteClient(id) {
  const orders = adminStore.getOrdersByClient(id)
  if (orders.length > 0) {
    alert(`No se puede eliminar este cliente porque tiene ${orders.length} pedido(s) asociado(s).`)
    return
  }
  
  if (confirm('¿Eliminar este cliente?')) {
    adminStore.deleteClient(id)
  }
}

function viewClient(id) {
  router.push(`/admin/clientes/${id}`)
}

function formatCurrency(value) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0
  }).format(value)
}

function formatDate(dateString) {
  if (!dateString) return 'Sin compras'
  return new Date(dateString).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}
</script>

<template>
  <div class="clients-page">
    <header class="page-header">
      <div class="header-left">
        <h1 class="page-title">Clientes</h1>
        <p class="page-subtitle">{{ filteredClients.length }} cliente{{ filteredClients.length !== 1 ? 's' : '' }}</p>
      </div>
      <button class="btn btn-primary" @click="openModal()">
        <Icon name="plus" :size="16" /> Nuevo cliente
      </button>
    </header>

    <!-- Búsqueda -->
    <div class="search-bar">
      <Icon name="box" :size="18" class="search-icon" />
      <input 
        type="text" 
        v-model="searchQuery"
        placeholder="Buscar por nombre o teléfono..."
        class="search-input"
      />
    </div>

    <!-- Grid de clientes -->
    <div class="clients-grid">
      <div v-if="filteredClients.length === 0" class="empty-state">
        <p v-if="searchQuery">No se encontraron clientes con "{{ searchQuery }}"</p>
        <p v-else>No hay clientes registrados</p>
        <button v-if="!searchQuery" class="btn btn-primary" @click="openModal()">
          Crear primer cliente
        </button>
      </div>

      <div 
        v-for="client in filteredClients" 
        :key="client.id" 
        class="client-card"
        @click="viewClient(client.id)"
      >
        <div class="client-header">
          <div class="client-avatar">
            {{ client.nombre.charAt(0).toUpperCase() }}
          </div>
          <div class="client-info">
            <h3 class="client-name">{{ client.nombre }}</h3>
            <p class="client-phone">{{ client.telefono }}</p>
            <p v-if="client.email" class="client-email">{{ client.email }}</p>
          </div>
        </div>

        <div v-if="client.tags && client.tags.length > 0" class="client-tags">
          <span v-for="tag in client.tags" :key="tag" class="tag">{{ tag }}</span>
        </div>

        <div class="client-stats">
          <div class="stat">
            <Icon name="calendar" :size="14" />
            <span>{{ formatDate(client.fecha_ultima_compra) }}</span>
          </div>
          <div class="stat">
            <Icon name="box" :size="14" />
            <span>{{ getClientStats(client.id).totalOrders }} pedidos</span>
          </div>
          <div class="stat stat-highlight">
            <Icon name="money" :size="14" />
            <span>{{ formatCurrency(getClientStats(client.id).totalSpent) }}</span>
          </div>
        </div>

        <div class="client-actions" @click.stop>
          <button class="btn-icon" @click="openModal(client)" title="Editar">
            <Icon name="edit" :size="16" />
          </button>
          <button 
            class="btn-icon" 
            @click="deleteClient(client.id)" 
            title="Eliminar"
            :disabled="getClientStats(client.id).totalOrders > 0"
          >
            <Icon name="trash" :size="16" />
          </button>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal">
          <header class="modal-header">
            <h2 class="modal-title">
              <Icon :name="editingClient ? 'edit' : 'plus'" :size="20" />
              {{ editingClient ? 'Editar cliente' : 'Nuevo cliente' }}
            </h2>
            <button class="modal-close" @click="closeModal">&times;</button>
          </header>

          <form class="modal-body" @submit.prevent="submitForm">
            <div class="form-group">
              <label class="form-label">Nombre *</label>
              <input 
                type="text"
                v-model="form.nombre"
                class="form-input"
                :class="{ 'form-input--error': errors.nombre }"
                placeholder="Nombre completo"
              />
              <span v-if="errors.nombre" class="form-error">{{ errors.nombre }}</span>
            </div>

            <div class="form-group">
              <label class="form-label">Teléfono *</label>
              <input 
                type="tel"
                v-model="form.telefono"
                class="form-input"
                :class="{ 'form-input--error': errors.telefono }"
                placeholder="1134567890"
              />
              <span v-if="errors.telefono" class="form-error">{{ errors.telefono }}</span>
            </div>

            <div class="form-group">
              <label class="form-label">Email (opcional)</label>
              <input 
                type="email"
                v-model="form.email"
                class="form-input"
                placeholder="cliente@example.com"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Tags</label>
              <div class="tags-input">
                <div v-if="form.tags.length > 0" class="tags-list">
                  <span v-for="tag in form.tags" :key="tag" class="tag tag-removable">
                    {{ tag }}
                    <button type="button" @click="removeTag(tag)" class="tag-remove">&times;</button>
                  </span>
                </div>
                <div class="tag-add-row">
                  <input 
                    type="text"
                    v-model="newTag"
                    @keydown.enter.prevent="addTag"
                    class="form-input form-input-sm"
                    placeholder="dulce, intenso, recompra..."
                  />
                  <button type="button" @click="addTag" class="btn btn-secondary btn-sm">
                    Agregar
                  </button>
                </div>
              </div>
              <small class="form-hint">Presioná Enter o click en Agregar</small>
            </div>

            <div class="form-group">
              <label class="form-label">Notas internas (opcional)</label>
              <textarea 
                v-model="form.notas_internas"
                class="form-textarea"
                rows="3"
                placeholder="Preferencias, observaciones, recordatorios..."
              ></textarea>
            </div>

            <div class="form-actions">
              <button type="button" class="btn btn-outline" @click="closeModal">
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary">
                {{ editingClient ? 'Guardar cambios' : 'Crear cliente' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.clients-page {
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

.header-left {
  flex: 1;
}

.page-title {
  font-family: var(--font-heading);
  font-size: 1.75rem;
  font-weight: 400;
  margin: 0 0 4px;
}

.page-subtitle {
  font-size: 0.875rem;
  color: var(--color-muted);
  margin: 0;
}

.page-header .btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
}

.search-bar {
  position: relative;
  margin-bottom: var(--space-lg);
}

.search-icon {
  position: absolute;
  left: var(--space-md);
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-muted);
}

.search-input {
  width: 100%;
  padding: var(--space-sm) var(--space-md) var(--space-sm) 48px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 0.938rem;
  background: var(--color-white);
  transition: border-color var(--transition-fast);
}

.search-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.clients-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--space-lg);
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: var(--space-xxl);
  background: var(--color-white);
  border-radius: var(--radius-md);
  color: var(--color-muted);
}

.empty-state p {
  margin-bottom: var(--space-md);
}

.client-card {
  background: var(--color-white);
  border-radius: var(--radius-md);
  padding: var(--space-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  cursor: pointer;
  transition: all var(--transition-base);
  border: 1px solid var(--color-border);
  position: relative;
}

.client-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--color-primary);
}

.client-header {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.client-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  color: var(--color-white);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-heading);
  font-size: 1.5rem;
  font-weight: 500;
  flex-shrink: 0;
}

.client-info {
  flex: 1;
  min-width: 0;
}

.client-name {
  font-family: var(--font-heading);
  font-size: 1.125rem;
  font-weight: 500;
  margin: 0 0 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.client-phone {
  font-size: 0.875rem;
  color: var(--color-muted);
  margin: 0;
  font-family: monospace;
}

.client-email {
  font-size: 0.813rem;
  color: var(--color-muted);
  margin: 2px 0 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.client-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  font-size: 0.75rem;
  padding: 4px 10px;
  background-color: var(--color-background);
  color: var(--color-secondary);
  border-radius: 12px;
  font-weight: 500;
}

.client-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: var(--space-sm);
  border-top: 1px solid var(--color-border);
}

.stat {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.813rem;
  color: var(--color-muted);
}

.stat-highlight {
  color: var(--color-accent);
  font-weight: 600;
}

.client-actions {
  display: flex;
  gap: var(--space-xs);
  padding-top: var(--space-sm);
  border-top: 1px solid var(--color-border);
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

.btn-icon:hover:not(:disabled) {
  opacity: 1;
}

.btn-icon:disabled {
  cursor: not-allowed;
  opacity: 0.25;
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

.tags-input {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag-removable {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding-right: 4px;
}

.tag-remove {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-muted);
  font-size: 1.125rem;
  line-height: 1;
  padding: 0 4px;
  transition: color var(--transition-fast);
}

.tag-remove:hover {
  color: var(--color-text);
}

.tag-add-row {
  display: flex;
  gap: var(--space-sm);
}

.tag-add-row .form-input {
  flex: 1;
}

.form-input-sm {
  padding: 6px var(--space-sm);
  font-size: 0.813rem;
}

.form-hint {
  font-size: 0.75rem;
  color: var(--color-muted);
  margin-top: 4px;
  display: block;
}
</style>
