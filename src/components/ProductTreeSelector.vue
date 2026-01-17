<script setup>
import { ref, computed } from 'vue'
import { useAdminStore } from '../stores/admin'
import Icon from './Icon.vue'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  multiple: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue'])

const adminStore = useAdminStore()
const searchQuery = ref('')
const expandedBrands = ref({})

// Agrupar productos por marca > línea > modelo
const productTree = computed(() => {
  const products = adminStore.productsWithBrand
  const tree = {}
  
  products.forEach(product => {
    const brandName = product.brand || 'Sin marca'
    const lineName = product.line || 'Sin línea'
    
    if (!tree[brandName]) {
      tree[brandName] = {}
      // Expandir todas las marcas por defecto
      expandedBrands.value[brandName] = true
    }
    if (!tree[brandName][lineName]) {
      tree[brandName][lineName] = []
    }
    tree[brandName][lineName].push(product)
  })
  
  return tree
})

// Filtrar árbol por búsqueda
const filteredTree = computed(() => {
  if (!searchQuery.value) return productTree.value
  
  const query = searchQuery.value.toLowerCase()
  const filtered = {}
  
  Object.entries(productTree.value).forEach(([brand, lines]) => {
    const brandMatches = brand.toLowerCase().includes(query)
    
    Object.entries(lines).forEach(([line, products]) => {
      const lineMatches = line.toLowerCase().includes(query)
      const matchingProducts = products.filter(p => 
        p.name.toLowerCase().includes(query) || brandMatches || lineMatches
      )
      
      if (matchingProducts.length > 0) {
        if (!filtered[brand]) filtered[brand] = {}
        filtered[brand][line] = matchingProducts
      }
    })
  })
  
  return filtered
})

function toggleBrand(brandName) {
  expandedBrands.value[brandName] = !expandedBrands.value[brandName]
}

function isSelected(productId) {
  return props.modelValue.includes(productId)
}

function toggleProduct(productId) {
  const selected = [...props.modelValue]
  const index = selected.indexOf(productId)
  
  if (props.multiple) {
    if (index > -1) {
      selected.splice(index, 1)
    } else {
      selected.push(productId)
    }
  } else {
    emit('update:modelValue', index > -1 ? [] : [productId])
    return
  }
  
  emit('update:modelValue', selected)
}

function selectAll() {
  const allProductIds = Object.values(filteredTree.value)
    .flatMap(lines => Object.values(lines))
    .flatMap(products => products.map(p => p.id))
  emit('update:modelValue', allProductIds)
}

function clearAll() {
  emit('update:modelValue', [])
}
</script>

<template>
  <div class="product-tree-selector">
    <div class="selector-header">
      <div class="search-box">
        <Icon name="tag" :size="16" />
        <input 
          type="text" 
          v-model="searchQuery" 
          class="search-input"
          placeholder="Buscar por marca, línea o modelo..."
        />
      </div>
      <div v-if="multiple" class="selection-actions">
        <button type="button" class="btn-link" @click="selectAll">
          Todos
        </button>
        <button type="button" class="btn-link" @click="clearAll">
          Ninguno
        </button>
      </div>
    </div>

    <div class="tree-container">
      <div 
        v-for="(lines, brandName) in filteredTree" 
        :key="brandName"
        class="brand-node"
      >
        <div 
          class="brand-header"
          @click="toggleBrand(brandName)"
        >
          <Icon 
            :name="expandedBrands[brandName] ? 'arrow-right' : 'arrow-right'" 
            :size="14"
            :style="{ transform: expandedBrands[brandName] ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }"
          />
          <strong>{{ brandName }}</strong>
          <span class="count">({{ Object.values(lines).flat().length }})</span>
        </div>

        <div v-if="expandedBrands[brandName]" class="brand-content">
          <div 
            v-for="(products, lineName) in lines" 
            :key="lineName"
            class="line-node"
          >
            <div class="line-header">
              <Icon name="tag" :size="12" />
              <em>{{ lineName }}</em>
              <span class="count">({{ products.length }})</span>
            </div>

            <div class="products-list">
              <label 
                v-for="product in products" 
                :key="product.id"
                class="product-item"
                :class="{ 'selected': isSelected(product.id) }"
              >
                <input 
                  type="checkbox"
                  :checked="isSelected(product.id)"
                  @change="toggleProduct(product.id)"
                  class="product-checkbox"
                />
                <img 
                  v-if="product.image" 
                  :src="product.image" 
                  :alt="product.name"
                  class="product-thumb"
                />
                <div class="product-info">
                  <span class="product-name">{{ product.name }}</span>
                  <span v-if="product.ml" class="product-ml">{{ product.ml }}</span>
                  <span class="product-stock" :class="{ 'stock-low': product.stock <= 1, 'stock-empty': product.stock === 0 }">
                    Stock: {{ product.stock }}
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div v-if="Object.keys(filteredTree).length === 0" class="empty-state">
        <Icon name="alert" :size="32" />
        <p>No se encontraron productos</p>
      </div>
    </div>

    <div v-if="multiple && modelValue.length > 0" class="selection-summary">
      {{ modelValue.length }} producto{{ modelValue.length !== 1 ? 's' : '' }} seleccionado{{ modelValue.length !== 1 ? 's' : '' }}
    </div>
  </div>
</template>

<style scoped>
.product-tree-selector {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-white);
  overflow: hidden;
}

.selector-header {
  padding: var(--space-sm);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-background);
}

.search-box {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  background: var(--color-white);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: var(--space-xs) var(--space-sm);
  margin-bottom: var(--space-xs);
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 0.875rem;
}

.selection-actions {
  display: flex;
  gap: var(--space-sm);
  justify-content: flex-end;
}

.btn-link {
  background: none;
  border: none;
  color: var(--color-primary);
  font-size: 0.75rem;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
}

.btn-link:hover {
  color: var(--color-accent);
}

.tree-container {
  max-height: 400px;
  overflow-y: auto;
}

.brand-node {
  border-bottom: 1px solid var(--color-border);
}

.brand-node:last-child {
  border-bottom: none;
}

.brand-header {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-sm);
  cursor: pointer;
  background: var(--color-background);
  font-size: 0.875rem;
}

.brand-header:hover {
  background: var(--color-border);
}

.brand-content {
  padding-left: var(--space-md);
}

.line-node {
  border-top: 1px solid var(--color-border);
  padding: var(--space-xs) 0;
}

.line-header {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-xs) var(--space-sm);
  font-size: 0.813rem;
  color: var(--color-muted);
}

.count {
  font-size: 0.75rem;
  color: var(--color-muted);
  margin-left: auto;
}

.products-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  padding: var(--space-xs) var(--space-sm);
}

.product-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-xs);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background-color 0.15s;
}

.product-item:hover {
  background: var(--color-background);
}

.product-item.selected {
  background: var(--color-primary-light);
}

.product-checkbox {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.product-thumb {
  width: 32px;
  height: 32px;
  object-fit: cover;
  border-radius: var(--radius-sm);
}

.product-info {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  flex: 1;
  font-size: 0.813rem;
}

.product-name {
  font-weight: 500;
}

.product-ml {
  color: var(--color-muted);
  font-size: 0.75rem;
}

.product-stock {
  margin-left: auto;
  font-size: 0.75rem;
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  background: var(--color-success-light);
  color: var(--color-success);
}

.product-stock.stock-low {
  background: var(--color-warning-light);
  color: var(--color-warning);
}

.product-stock.stock-empty {
  background: var(--color-danger-light);
  color: var(--color-danger);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-xl);
  color: var(--color-muted);
}

.empty-state p {
  margin-top: var(--space-sm);
  margin-bottom: 0;
}

.selection-summary {
  padding: var(--space-sm);
  background: var(--color-background);
  border-top: 1px solid var(--color-border);
  font-size: 0.813rem;
  text-align: center;
  color: var(--color-muted);
}
</style>
