<script setup>
import { computed } from 'vue'
import ProductGrid from '../components/ProductGrid.vue'
import { useAdminStore } from '../stores/admin'

const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '5491112345678'

const adminStore = useAdminStore()

// Obtener productos del catálogo (solo con stock > 0)
const products = computed(() => adminStore.catalogProducts)
const loading = computed(() => false) // Ya no hay carga async
</script>

<template>
  <div class="home">
    <!-- Hero Section -->
    <section class="hero">
      <div class="container">
        <div class="hero-content">
          <h1 class="hero-title">Vittore</h1>
          <p class="hero-tagline">La unión entre la experiencia y la intuición</p>
          <div class="hero-divider"></div>
          <p class="hero-description">
            En Vittore creemos que elegir un perfume es una combinación entre experiencia e intuición.
            Seleccionamos perfumes árabes intensos y duraderos y te acompañamos a encontrar el que va con vos.
          </p>
          <a href="#catalogo" class="btn btn-secondary hero-cta">
            Descubrir catálogo
          </a>
        </div>
      </div>
    </section>

    <!-- Product Catalog -->
    <ProductGrid :products="products" :loading="loading" />

  </div>
</template>

<style scoped>
.hero {
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--space-3xl) 0;
  background: linear-gradient(
    180deg, 
    var(--color-white) 0%, 
    var(--color-background) 100%
  );
}

.hero-content {
  max-width: 640px;
  margin: 0 auto;
}

.hero-title {
  font-family: var(--font-heading);
  font-size: clamp(3rem, 8vw, 5rem);
  font-weight: 700;
  letter-spacing: 0.15em;
  color: var(--color-primary);
  margin-bottom: var(--space-sm);
  padding-left: 0.075em;
}

.hero-tagline {
  font-family: var(--font-heading);
  font-size: clamp(1rem, 2.5vw, 1.25rem);
  font-style: italic;
  font-weight: 300;
  color: var(--color-secondary);
  margin-bottom: var(--space-lg);
}

.hero-divider {
  width: 60px;
  height: 1px;
  background-color: var(--color-accent);
  margin: 0 auto var(--space-lg);
}

.hero-description {
  font-size: 1.0625rem;
  line-height: 1.8;
  color: var(--color-muted);
  margin-bottom: var(--space-xl);
}

.hero-cta {
  text-decoration: none;
}

.cta-section {
  padding: var(--space-3xl) 0;
  background-color: var(--color-white);
}

.cta-content {
  max-width: 560px;
  margin: 0 auto;
  text-align: center;
}

.cta-title {
  font-family: var(--font-heading);
  font-size: clamp(1.5rem, 4vw, 2rem);
  font-weight: 300;
  margin-bottom: var(--space-sm);
}

.cta-text {
  color: var(--color-muted);
  margin-bottom: var(--space-lg);
}
</style>
