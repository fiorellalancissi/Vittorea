<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAdminStore } from '../../stores/admin'
import Icon from '../../components/Icon.vue'

const route = useRoute()
const adminStore = useAdminStore()

const brands = computed(() => adminStore.brands)
const products = computed(() => adminStore.products)

// Modal
const showModal = ref(false)
const editingBrand = ref(null)

// Form
const form = ref({
  name: '',
  description: '',
  logo: ''
})

const errors = ref({})

function openModal(brand = null) {
  editingBrand.value = brand
  if (brand) {
    form.value = { ...brand }
  } else {
    form.value = {
      name: '',
      description: '',
      logo: ''
    }
  }
  errors.value = {}
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingBrand.value = null
}

function validateForm() {
  errors.value = {}
  
  if (!form.value.name.trim()) {
    errors.value.name = 'El nombre es obligatorio'
  } else if (form.value.name.length < 2) {
    errors.value.name = 'El nombre debe tener al menos 2 caracteres'
  }
  
  // Verificar nombre único
  const existingBrand = brands.value.find(
    b => b.name.toLowerCase() === form.value.name.toLowerCase() && b.id !== editingBrand.value?.id
  )
  if (existingBrand) {
    errors.value.name = 'Ya existe una marca con ese nombre'
  }
  
  return Object.keys(errors.value).length === 0
}

function submitForm() {
  if (!validateForm()) return
  
  if (editingBrand.value) {
    adminStore.updateBrand(editingBrand.value.id, {
      name: form.value.name,
      description: form.value.description,
      logo: form.value.logo
    })
  } else {
    adminStore.addBrand({
      name: form.value.name,
      description: form.value.description,
      logo: form.value.logo
    })
  }
  
  closeModal()
}

function deleteBrand(id) {
  const brandProducts = products.value.filter(p => p.brandId === id)
  if (brandProducts.length > 0) {
    alert(`No se puede eliminar esta marca porque tiene ${brandProducts.length} producto(s) asociado(s).`)
    return
  }
  
  if (confirm('¿Eliminar esta marca?')) {
    adminStore.deleteBrand(id)
  }
}

function getProductCount(brandId) {
  return products.value.filter(p => p.brandId === brandId).length
}

// Abrir modal si viene con action en la URL
onMounted(() => {
  if (route.query.action === 'nueva') {
    openModal()
  }
})
</script>

<template>
  <div class="brands-page">
    <header class="page-header">
      <h1 class="page-title">Marcas</h1>
      <button class="btn btn-primary" @click="openModal()">
        <Icon name="plus" :size="16" /> Nueva marca
      </button>
    </header>

    <!-- Grid de marcas -->
    <div class="brands-grid">
      <div v-if="brands.length === 0" class="empty-state">
        <p>No hay marcas registradas</p>
        <button class="btn btn-primary" @click="openModal()">
          Crear primera marca
        </button>
      </div>

      <div 
        v-for="brand in brands" 
        :key="brand.id" 
        class="brand-card"
      >
        <div class="brand-header">
          <div class="brand-logo" v-if="brand.logo">
            <img :src="brand.logo" :alt="brand.name" />
          </div>
          <div class="brand-logo brand-logo--placeholder" v-else>
            {{ brand.name.charAt(0) }}
          </div>
          <div class="brand-info">
            <h3 class="brand-name">{{ brand.name }}</h3>
            <p class="brand-products">{{ getProductCount(brand.id) }} productos</p>
          </div>
        </div>
        
        <p v-if="brand.description" class="brand-description">
          {{ brand.description }}
        </p>

        <div class="brand-actions">
          <button class="btn btn-secondary btn-sm" @click="openModal(brand)">
            <Icon name="edit" :size="14" /> Editar
          </button>
          <button 
            class="btn btn-outline btn-sm" 
            @click="deleteBrand(brand.id)"
            :disabled="getProductCount(brand.id) > 0"
            :title="getProductCount(brand.id) > 0 ? 'No se puede eliminar: tiene productos' : 'Eliminar'"
          >
            <Icon name="trash" :size="14" /> Eliminar
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
              <Icon :name="editingBrand ? 'edit' : 'tag'" :size="20" />
              {{ editingBrand ? 'Editar marca' : 'Nueva marca' }}
            </h2>
            <button class="modal-close" @click="closeModal">&times;</button>
          </header>

          <form class="modal-body" @submit.prevent="submitForm">
            <div class="form-group">
              <label class="form-label">Nombre *</label>
              <input 
                type="text"
                v-model="form.name"
                class="form-input"
                :class="{ 'form-input--error': errors.name }"
                placeholder="Ej: Lattafa"
              />
              <span v-if="errors.name" class="form-error">{{ errors.name }}</span>
            </div>

            <div class="form-group">
              <label class="form-label">Descripción (opcional)</label>
              <textarea 
                v-model="form.description"
                class="form-textarea"
                rows="3"
                placeholder="Breve descripción de la marca..."
              ></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">URL del logo (opcional)</label>
              <input 
                type="url"
                v-model="form.logo"
                class="form-input"
                placeholder="https://..."
              />
              <p class="form-hint">Ingresá la URL de una imagen para el logo de la marca</p>
            </div>

            <div v-if="form.logo" class="logo-preview">
              <p class="preview-label">Vista previa:</p>
              <img :src="form.logo" :alt="form.name" class="preview-image" />
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" @click="closeModal">
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary">
                {{ editingBrand ? 'Guardar cambios' : 'Crear marca' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.brands-page {
  max-width: 1200px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-lg);
}

.page-title {
  font-family: var(--font-heading);
  font-size: 1.75rem;
  font-weight: 400;
  margin: 0;
}

.page-header .btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
}

.brands-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
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

.brand-card {
  background: var(--color-white);
  border-radius: var(--radius-md);
  padding: var(--space-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.brand-header {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.brand-logo {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  overflow: hidden;
  flex-shrink: 0;
}

.brand-logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.brand-logo--placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-primary);
  color: var(--color-text);
  font-family: var(--font-heading);
  font-size: 1.25rem;
  font-weight: 500;
}

.brand-info {
  flex: 1;
}

.brand-name {
  font-family: var(--font-heading);
  font-size: 1.125rem;
  font-weight: 500;
  margin: 0 0 4px;
}

.brand-products {
  font-size: 0.813rem;
  color: var(--color-muted);
  margin: 0;
}

.brand-description {
  font-size: 0.875rem;
  color: var(--color-muted);
  margin: 0;
  line-height: 1.5;
}

.brand-actions {
  display: flex;
  gap: var(--space-sm);
  margin-top: auto;
  padding-top: var(--space-md);
  border-top: 1px solid var(--color-border);
}

.brand-actions .btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.btn-sm {
  padding: var(--space-xs) var(--space-sm);
  font-size: 0.813rem;
}

.btn-outline {
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-muted);
}

.btn-outline:hover:not(:disabled) {
  background-color: var(--color-background);
  color: var(--color-text);
}

.btn-outline:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

.form-hint {
  font-size: 0.75rem;
  color: var(--color-muted);
  margin-top: var(--space-xs);
}

.logo-preview {
  padding: var(--space-md);
  background-color: var(--color-background);
  border-radius: var(--radius-md);
}

.preview-label {
  font-size: 0.75rem;
  color: var(--color-muted);
  margin-bottom: var(--space-sm);
}

.preview-image {
  max-width: 100px;
  max-height: 60px;
  object-fit: contain;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-sm);
  margin-top: var(--space-lg);
}
</style>
