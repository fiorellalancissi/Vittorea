<script setup>
import ProductCard from './ProductCard.vue'

defineProps({
  products: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <section class="product-grid-section" id="catalogo">
    <div class="container">
      <header class="grid-header">
        <h2 class="grid-title">Nuestra Selección</h2>
        <p class="grid-subtitle">Perfumes árabes intensos y duraderos</p>
      </header>

      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Cargando catálogo...</p>
      </div>

      <div v-else-if="products.length === 0" class="empty-state">
        <p>No hay productos disponibles en este momento.</p>
      </div>

      <div v-else class="product-grid">
        <ProductCard 
          v-for="product in products" 
          :key="product.id" 
          :product="product" 
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.product-grid-section {
  padding: var(--space-3xl) 0;
}

.grid-header {
  text-align: center;
  margin-bottom: var(--space-2xl);
}

.grid-title {
  font-family: var(--font-heading);
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 300;
  color: var(--color-text);
  margin-bottom: var(--space-xs);
}

.grid-subtitle {
  font-size: 1rem;
  color: var(--color-muted);
  margin: 0;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-lg);
}

.loading-state,
.empty-state {
  text-align: center;
  padding: var(--space-3xl) 0;
  color: var(--color-muted);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto var(--space-md);
  border: 2px solid var(--color-border);
  border-top-color: var(--color-accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .product-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: var(--space-md);
  }
}
</style>
