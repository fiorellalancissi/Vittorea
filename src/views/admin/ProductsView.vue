<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAdminStore } from '../../stores/admin'
import Icon from '../../components/Icon.vue'

const route = useRoute()
const adminStore = useAdminStore()

const products = computed(() => adminStore.productsWithBrand)
const brands = computed(() => adminStore.brands.filter(b => b.active))
const lines = computed(() => adminStore.lines.filter(l => l.active))
const mlOptions = computed(() => adminStore.mlOptions.filter(m => m.active))

// Modal
const showModal = ref(false)
const editingProduct = ref(null)

// Form
const form = ref({
  name: '',
  brand: '',
  line: '',
  ml: '',
  costPrice: '',
  salePrice: '',
  customSalePrice: false,
  description: '',
  image: '',
  stock: 0
})

// Autocomplete states
const brandSuggestions = ref([])
const lineSuggestions = ref([])
const mlSuggestions = ref([])
const showBrandSuggestions = ref(false)
const showLineSuggestions = ref(false)
const showMlSuggestions = ref(false)

// Image upload
const imageInputRef = ref(null)
const isDragging = ref(false)

const errors = ref({})

// Calcular precio de venta automático (+40%)
const suggestedSalePrice = computed(() => {
  if (form.value.costPrice && form.value.costPrice > 0) {
    return adminStore.calculateSalePrice(form.value.costPrice)
  }
  return 0
})

// Actualizar precio de venta cuando cambia el costo (si no es custom)
watch(() => form.value.costPrice, (newCost) => {
  if (!form.value.customSalePrice && newCost > 0) {
    form.value.salePrice = adminStore.calculateSalePrice(newCost)
  }
})

// Autocomplete para marca
watch(() => form.value.brand, (value) => {
  if (!value) {
    brandSuggestions.value = []
    showBrandSuggestions.value = false
    return
  }
  
  const filtered = brands.value.filter(b => 
    b.name.toLowerCase().includes(value.toLowerCase())
  )
  brandSuggestions.value = filtered
  showBrandSuggestions.value = filtered.length > 0
})

// Autocomplete para línea
watch(() => form.value.line, (value) => {
  if (!value) {
    lineSuggestions.value = []
    showLineSuggestions.value = false
    return
  }
  
  const filtered = lines.value.filter(l => 
    l.name.toLowerCase().includes(value.toLowerCase())
  )
  lineSuggestions.value = filtered
  showLineSuggestions.value = filtered.length > 0
})

// Autocomplete para ML
watch(() => form.value.ml, (value) => {
  if (!value) {
    mlSuggestions.value = []
    showMlSuggestions.value = false
    return
  }
  
  const filtered = mlOptions.value.filter(m => 
    m.value.toString().includes(value)
  )
  mlSuggestions.value = filtered
  showMlSuggestions.value = filtered.length > 0
})

function openModal(product = null) {
  editingProduct.value = product
  if (product) {
    form.value = { 
      name: product.name,
      brand: product.brand || '',
      line: product.line || '',
      ml: product.ml || '',
      costPrice: product.costPrice,
      salePrice: product.salePrice,
      customSalePrice: product.salePrice !== adminStore.calculateSalePrice(product.costPrice),
      description: product.description || '',
      image: product.image || '',
      stock: product.stock
    }
  } else {
    form.value = {
      name: '',
      brand: '',
      line: '',
      ml: '',
      costPrice: '',
      salePrice: '',
      customSalePrice: false,
      description: '',
      image: '',
      stock: 0
    }
  }
  errors.value = {}
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingProduct.value = null
  showBrandSuggestions.value = false
  showLineSuggestions.value = false
  showMlSuggestions.value = false
}

function selectBrand(brand) {
  form.value.brand = brand.name
  showBrandSuggestions.value = false
}

function selectLine(line) {
  form.value.line = line.name
  showLineSuggestions.value = false
}

function selectMl(ml) {
  form.value.ml = ml.value
  showMlSuggestions.value = false
}

function handleBrandEnter() {
  if (form.value.brand && brandSuggestions.value.length === 0) {
    // Marca nueva, se agregará en submit
    showBrandSuggestions.value = false
  } else if (brandSuggestions.value.length > 0) {
    selectBrand(brandSuggestions.value[0])
  }
}

function handleLineEnter() {
  if (form.value.line && lineSuggestions.value.length === 0) {
    // Línea nueva, se agregará en submit
    showLineSuggestions.value = false
  } else if (lineSuggestions.value.length > 0) {
    selectLine(lineSuggestions.value[0])
  }
}

function handleMlEnter() {
  if (form.value.ml && mlSuggestions.value.length === 0) {
    // ML nuevo, se agregará en submit
    showMlSuggestions.value = false
  } else if (mlSuggestions.value.length > 0) {
    selectMl(mlSuggestions.value[0])
  }
}

function toggleCustomPrice() {
  form.value.customSalePrice = !form.value.customSalePrice
  if (!form.value.customSalePrice) {
    form.value.salePrice = suggestedSalePrice.value
  }
}

function validateForm() {
  errors.value = {}
  
  if (!form.value.name.trim()) {
    errors.value.name = 'El nombre es obligatorio'
  }
  
  if (!form.value.brand.trim()) {
    errors.value.brand = 'La marca es obligatoria'
  }
  
  if (!form.value.costPrice || form.value.costPrice <= 0) {
    errors.value.costPrice = 'El precio de costo debe ser mayor a 0'
  }
  
  if (!form.value.salePrice || form.value.salePrice <= 0) {
    errors.value.salePrice = 'El precio de venta debe ser mayor a 0'
  }
  
  if (form.value.salePrice && form.value.costPrice && form.value.salePrice <= form.value.costPrice) {
    errors.value.salePrice = 'El precio de venta debe ser mayor al costo'
  }
  
  if (form.value.stock < 0) {
    errors.value.stock = 'El stock no puede ser negativo'
  }
  
  return Object.keys(errors.value).length === 0
}

function submitForm() {
  if (!validateForm()) return
  
  // Obtener o crear marca, línea y ml
  const brandId = adminStore.findOrCreateBrand(form.value.brand)
  const lineId = form.value.line ? adminStore.findOrCreateLine(form.value.line) : null
  const mlId = form.value.ml ? adminStore.findOrCreateMl(form.value.ml) : null
  
  const productData = {
    name: form.value.name,
    brandId: Number(brandId),
    lineId: lineId ? Number(lineId) : null,
    mlId: mlId ? Number(mlId) : null,
    costPrice: Number(form.value.costPrice),
    salePrice: Number(form.value.salePrice),
    description: form.value.description,
    image: form.value.image || 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop'
  }

  if (editingProduct.value) {
    adminStore.updateProduct(editingProduct.value.id, productData)
    
    if (editingProduct.value.stock !== form.value.stock) {
      const diff = form.value.stock - editingProduct.value.stock
      adminStore.addMovement({
        productId: editingProduct.value.id,
        type: diff > 0 ? 'ingreso' : 'egreso',
        quantity: Math.abs(diff),
        reason: 'Ajuste de inventario',
        notes: 'Ajuste desde edición de producto'
      })
    }
  } else {
    const newProduct = adminStore.addProduct(productData)
    
    if (form.value.stock > 0) {
      adminStore.addMovement({
        productId: newProduct.id,
        type: 'ingreso',
        quantity: form.value.stock,
        reason: 'Compra de stock',
        notes: 'Stock inicial al crear producto'
      })
    }
  }
  
  closeModal()
}

function deleteProduct(id) {
  if (confirm('¿Eliminar este producto? También se eliminarán sus movimientos de inventario.')) {
    adminStore.deleteProduct(id)
  }
}

function handleImageSelect(event) {
  const file = event.target.files?.[0]
  if (file) {
    processImageFile(file)
  }
}

function handleImagePaste(event) {
  const items = event.clipboardData?.items
  if (!items) return
  
  for (let i = 0; i < items.length; i++) {
    if (items[i].type.indexOf('image') !== -1) {
      const file = items[i].getAsFile()
      if (file) {
        event.preventDefault()
        processImageFile(file)
      }
      break
    }
  }
}

function handleDragOver(event) {
  event.preventDefault()
  isDragging.value = true
}

function handleDragLeave() {
  isDragging.value = false
}

function handleDrop(event) {
  event.preventDefault()
  isDragging.value = false
  
  const file = event.dataTransfer?.files?.[0]
  if (file && file.type.indexOf('image') !== -1) {
    processImageFile(file)
  }
}

function processImageFile(file) {
  if (!file.type.startsWith('image/')) {
    alert('Por favor seleccioná una imagen válida')
    return
  }
  
  const reader = new FileReader()
  reader.onload = (e) => {
    form.value.image = e.target.result
  }
  reader.readAsDataURL(file)
}

function removeImage() {
  form.value.image = ''
  if (imageInputRef.value) {
    imageInputRef.value.value = ''
  }
}

function formatCurrency(value) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0
  }).format(value)
}

function getStockClass(stock) {
  if (stock === 0) return 'stock-empty'
  if (stock <= 3) return 'stock-low'
  return 'stock-ok'
}

function getMargin(cost, sale) {
  if (!cost || !sale) return 0
  return (((sale - cost) / cost) * 100).toFixed(0)
}

onMounted(() => {
  if (route.query.action === 'nuevo') {
    openModal()
  }
})
</script>

<template>
  <div class="products-page">
    <header class="page-header">
      <h1 class="page-title">Productos</h1>
      <button class="btn btn-primary" @click="openModal()">
        <Icon name="plus" :size="16" /> Nuevo producto
      </button>
    </header>

    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Marca</th>
            <th>Costo</th>
            <th>Venta</th>
            <th>Margen</th>
            <th>Stock</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="products.length === 0">
            <td colspan="7" class="empty-cell">
              <p>No hay productos registrados</p>
              <button class="btn btn-primary btn-sm" @click="openModal()">
                Crear primer producto
              </button>
            </td>
          </tr>
          <tr v-for="product in products" :key="product.id">
            <td>
              <div class="product-cell">
                <img :src="product.image" :alt="product.name" class="product-thumb" />
                <div class="product-info">
                  <span class="product-name">{{ product.name }}</span>
                  <span class="product-description" v-if="product.description">
                    {{ product.description.substring(0, 40) }}{{ product.description.length > 40 ? '...' : '' }}
                  </span>
                </div>
              </div>
            </td>
            <td>
              <span class="brand-badge">{{ product.brand }}</span>
            </td>
            <td class="cell-cost">{{ formatCurrency(product.costPrice) }}</td>
            <td class="cell-price">{{ formatCurrency(product.salePrice) }}</td>
            <td class="cell-margin">
              <span class="margin-badge">+{{ getMargin(product.costPrice, product.salePrice) }}%</span>
            </td>
            <td>
              <span class="stock-badge" :class="getStockClass(product.stock)">
                {{ product.stock === 0 ? 'Sin stock' : `${product.stock} uds` }}
              </span>
            </td>
            <td class="cell-actions">
              <button class="btn-icon" @click="openModal(product)" title="Editar">
                <Icon name="edit" :size="16" />
              </button>
              <button class="btn-icon" @click="deleteProduct(product.id)" title="Eliminar">
                <Icon name="trash" :size="16" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal modal--wide">
          <header class="modal-header">
            <h2 class="modal-title">
              <Icon :name="editingProduct ? 'edit' : 'bottle'" :size="20" />
              {{ editingProduct ? 'Editar producto' : 'Nuevo producto' }}
            </h2>
            <button class="modal-close" @click="closeModal">&times;</button>
          </header>

          <form class="modal-body" @submit.prevent="submitForm">
            <!-- Nombre y marca -->
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Modelo *</label>
                <input 
                  type="text"
                  v-model="form.name"
                  class="form-input"
                  :class="{ 'form-input--error': errors.name }"
                />
                <span v-if="errors.name" class="form-error">{{ errors.name }}</span>
              </div>

              <div class="form-group">
                <label class="form-label">Marca *</label>
                <div class="autocomplete-wrapper">
                  <input 
                    type="text"
                    v-model="form.brand"
                    class="form-input"
                    :class="{ 'form-input--error': errors.brand }"
                    @input="showBrandSuggestions = form.brand.length > 0"
                    @keydown.enter.prevent="handleBrandEnter"
                    @focus="showBrandSuggestions = form.brand && brandSuggestions.length > 0"
                    @blur="setTimeout(() => showBrandSuggestions = false, 200)"
                  />
                  <div v-if="showBrandSuggestions" class="autocomplete-suggestions">
                    <div 
                      v-for="brand in brandSuggestions" 
                      :key="brand.id"
                      class="suggestion-item"
                      @mousedown.prevent="selectBrand(brand)"
                    >
                      {{ brand.name }}
                    </div>
                  </div>
                </div>
                <span v-if="errors.brand" class="form-error">{{ errors.brand }}</span>
              </div>
            </div>

            <!-- Línea y ML -->
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Línea</label>
                <div class="autocomplete-wrapper">
                  <input 
                    type="text"
                    v-model="form.line"
                    class="form-input"
                    @input="showLineSuggestions = form.line.length > 0"
                    @keydown.enter.prevent="handleLineEnter"
                    @focus="showLineSuggestions = form.line && lineSuggestions.length > 0"
                    @blur="setTimeout(() => showLineSuggestions = false, 200)"
                  />
                  <div v-if="showLineSuggestions" class="autocomplete-suggestions">
                    <div 
                      v-for="line in lineSuggestions" 
                      :key="line.id"
                      class="suggestion-item"
                      @mousedown.prevent="selectLine(line)"
                    >
                      {{ line.name }}
                    </div>
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Volumen</label>
                <div class="autocomplete-wrapper">
                  <input 
                    type="text"
                    v-model="form.ml"
                    class="form-input"
                    @input="showMlSuggestions = form.ml.length > 0"
                    @keydown.enter.prevent="handleMlEnter"
                    @focus="showMlSuggestions = form.ml && mlSuggestions.length > 0"
                    @blur="setTimeout(() => showMlSuggestions = false, 200)"
                  />
                  <div v-if="showMlSuggestions" class="autocomplete-suggestions">
                    <div 
                      v-for="ml in mlSuggestions" 
                      :key="ml.id"
                      class="suggestion-item"
                      @mousedown.prevent="selectMl(ml)"
                    >
                      {{ ml.value }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Precios -->
            <div class="price-section">
              <h3 class="price-section-title">Precios</h3>
              
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Precio de costo *</label>
                  <div class="input-with-prefix">
                    <span class="input-prefix">$</span>
                    <input 
                      type="number"
                      v-model.number="form.costPrice"
                      class="form-input form-input--prefixed"
                      :class="{ 'form-input--error': errors.costPrice }"
                      min="0"
                      step="100"
                    />
                  </div>
                  <span v-if="errors.costPrice" class="form-error">{{ errors.costPrice }}</span>
                </div>

                <div class="form-group">
                  <label class="form-label">
                    Precio de venta *
                  </label>
                  <div class="input-with-prefix">
                    <span class="input-prefix">$</span>
                    <input 
                      type="number"
                      v-model.number="form.salePrice"
                      class="form-input form-input--prefixed"
                      :class="{ 'form-input--error': errors.salePrice }"
                      :disabled="!form.customSalePrice"
                      min="0"
                      step="100"
                    />
                  </div>
                  <span v-if="errors.salePrice" class="form-error">{{ errors.salePrice }}</span>
                  <div class="price-mode-toggle">
                    <button 
                      type="button"
                      class="toggle-option"
                      :class="{ active: !form.customSalePrice }"
                      @click="form.customSalePrice = false; form.salePrice = suggestedSalePrice"
                    >
                      Auto
                    </button>
                    <button 
                      type="button"
                      class="toggle-option"
                      :class="{ active: form.customSalePrice }"
                      @click="toggleCustomPrice"
                    >
                      Manual
                    </button>
                  </div>
                  <p v-if="!form.customSalePrice" class="form-hint">
                    +40% sobre el costo
                  </p>
                </div>
              </div>

              <div v-if="form.costPrice && form.salePrice" class="price-preview">
                <div class="preview-item">
                  <span class="preview-label">Ganancia por unidad</span>
                  <span class="preview-value profit-text">{{ formatCurrency(form.salePrice - form.costPrice) }}</span>
                </div>
                <div class="preview-item">
                  <span class="preview-label">Margen</span>
                  <span class="preview-value">{{ getMargin(form.costPrice, form.salePrice) }}%</span>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">
                {{ editingProduct ? 'Stock actual' : 'Stock inicial' }}
              </label>
              <input 
                type="number"
                v-model.number="form.stock"
                class="form-input"
                :class="{ 'form-input--error': errors.stock }"
                min="0"
                style="max-width: 150px;"
              />
              <span v-if="errors.stock" class="form-error">{{ errors.stock }}</span>
            </div>

            <div class="form-group">
              <label class="form-label">Descripción</label>
              <textarea 
                v-model="form.description"
                class="form-textarea"
                rows="3"
              ></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">Imagen del producto</label>
              
              <div 
                class="image-upload-zone"
                :class="{ 'dragging': isDragging }"
                @click="imageInputRef?.click()"
                @paste="handleImagePaste"
                @dragover="handleDragOver"
                @dragleave="handleDragLeave"
                @drop="handleDrop"
                tabindex="0"
              >
                <input 
                  ref="imageInputRef"
                  type="file"
                  accept="image/*"
                  @change="handleImageSelect"
                  style="display: none;"
                />
                
                <div v-if="!form.image" class="upload-placeholder">
                  <Icon name="download" :size="32" />
                  <p class="upload-text">
                    <strong>Click</strong>, <strong>arrastrá</strong> o <strong>pegá</strong> (Ctrl+V) una imagen
                  </p>
                  <p class="upload-hint">PNG, JPG o GIF</p>
                </div>
                
                <div v-else class="upload-preview">
                  <img :src="form.image" :alt="form.name || 'Preview'" class="preview-image" />
                  <button 
                    type="button" 
                    class="remove-image-btn"
                    @click.stop="removeImage"
                  >
                    <Icon name="trash" :size="16" />
                  </button>
                </div>
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" @click="closeModal">
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary">
                {{ editingProduct ? 'Guardar cambios' : 'Crear producto' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.products-page {
  padding: var(--space-lg);
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

.table-container {
  background: var(--color-white);
  border-radius: var(--radius-md);
  overflow: hidden;
  overflow-x: auto;
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
  white-space: nowrap;
}

.empty-cell {
  text-align: center;
  color: var(--color-muted);
  padding: var(--space-xxl) !important;
}

.empty-cell p {
  margin-bottom: var(--space-md);
}

.product-cell {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.product-thumb {
  width: 50px;
  height: 50px;
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

.product-description {
  font-size: 0.75rem;
  color: var(--color-muted);
}

.brand-badge {
  font-size: 0.75rem;
  padding: 4px 8px;
  background-color: var(--color-background);
  border-radius: var(--radius-sm);
  color: var(--color-secondary);
}

.cell-cost {
  color: var(--color-muted);
  font-size: 0.875rem;
}

.cell-price {
  font-weight: 600;
}

.margin-badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 4px 8px;
  background-color: rgba(37, 211, 102, 0.1);
  color: #25D366;
  border-radius: var(--radius-sm);
}

.stock-badge {
  font-size: 0.813rem;
  padding: 4px 8px;
  border-radius: var(--radius-sm);
}

.stock-ok {
  background-color: rgba(37, 211, 102, 0.1);
  color: #25D366;
}

.stock-low {
  background-color: rgba(194, 161, 95, 0.1);
  color: var(--color-accent);
}

.stock-empty {
  background-color: rgba(196, 92, 92, 0.1);
  color: #c45c5c;
}

.cell-actions {
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

/* Marca inline */
.brand-selector {
  display: flex;
  gap: var(--space-sm);
}

.brand-selector .form-select {
  flex: 1;
}

.brand-creator {
  display: flex;
  gap: var(--space-sm);
}

.brand-creator .form-input {
  flex: 1;
}

.brand-creator .btn {
  flex-shrink: 0;
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

.modal--wide {
  max-width: 600px;
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

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-md);
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

.form-hint {
  font-size: 0.75rem;
  color: var(--color-muted);
  margin-top: var(--space-xs);
}

/* Image upload */
.image-upload-zone {
  position: relative;
  min-height: 200px;
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-base);
  background: var(--color-white);
}

.image-upload-zone:hover,
.image-upload-zone:focus {
  border-color: var(--color-primary);
  background: var(--color-background);
}

.image-upload-zone.dragging {
  border-color: var(--color-accent);
  background: rgba(160, 141, 127, 0.05);
}

.upload-placeholder {
  text-align: center;
  padding: var(--space-lg);
}

.upload-text {
  margin: var(--space-sm) 0;
  color: var(--color-text);
}

.upload-text strong {
  color: var(--color-primary);
}

.upload-hint {
  font-size: 0.75rem;
  color: var(--color-muted);
}

.upload-preview {
  position: relative;
  width: 100%;
  max-width: 300px;
  padding: var(--space-md);
}

.preview-image {
  width: 100%;
  height: auto;
  border-radius: var(--radius-md);
  display: block;
}

.remove-image-btn {
  position: absolute;
  top: var(--space-md);
  right: var(--space-md);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.remove-image-btn:hover {
  background: #f44336;
  color: white;
  border-color: #f44336;
}

/* Autocomplete */
.autocomplete-wrapper {
  position: relative;
}

.autocomplete-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--color-white);
  border: 1px solid var(--color-border);
  border-top: none;
  border-radius: 0 0 var(--radius-md) var(--radius-md);
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.suggestion-item {
  padding: var(--space-sm);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.suggestion-item:hover {
  background-color: var(--color-background);
}

/* Price toggle */
.price-mode-toggle {
  display: inline-flex;
  gap: 0;
  margin-top: var(--space-sm);
  margin-bottom: var(--space-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.toggle-option {
  padding: var(--space-xs) var(--space-md);
  background: var(--color-white);
  border: none;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-muted);
  transition: all var(--transition-fast);
}

.toggle-option:first-child {
  border-right: 1px solid var(--color-border);
}

.toggle-option.active {
  background: var(--color-primary);
  color: var(--color-white);
}

.toggle-option:hover:not(.active) {
  background: var(--color-background);
}

/* Price section */
.price-section {
  background: var(--color-background);
  padding: var(--space-md);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-md);
}

.price-section-title {
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0 0 var(--space-md);
}

.input-with-prefix {
  display: flex;
  align-items: stretch;
}

.input-prefix {
  display: flex;
  align-items: center;
  padding: 0 var(--space-sm);
  background: var(--color-border);
  border: 1px solid var(--color-border);
  border-right: none;
  border-radius: var(--radius-md) 0 0 var(--radius-md);
  font-weight: 500;
  color: var(--color-muted);
}

.form-input--prefixed {
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
}

.price-toggle {
  float: right;
  font-size: 0.688rem;
  background: none;
  border: 1px solid var(--color-border);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  color: var(--color-muted);
}

.price-toggle:hover {
  background: var(--color-white);
}

.price-preview {
  display: flex;
  gap: var(--space-lg);
  padding-top: var(--space-md);
  border-top: 1px solid var(--color-border);
  margin-top: var(--space-md);
}

.preview-item {
  display: flex;
  flex-direction: column;
}

.preview-label {
  font-size: 0.75rem;
  color: var(--color-muted);
}

.preview-value {
  font-weight: 600;
}

.profit-text {
  color: #25D366;
}

.image-preview {
  padding: var(--space-md);
  background-color: var(--color-background);
  border-radius: var(--radius-md);
}

.preview-image {
  max-width: 120px;
  max-height: 120px;
  object-fit: contain;
  border-radius: var(--radius-sm);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-sm);
  margin-top: var(--space-lg);
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .data-table {
    font-size: 0.875rem;
  }

  .data-table th,
  .data-table td {
    padding: var(--space-sm);
  }
}
</style>
