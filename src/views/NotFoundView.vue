<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="not-found-page">
    <div class="container">
      <div class="not-found-content">
        <span class="error-code">404</span>
        <h1 class="error-title">Página no encontrada</h1>
        <p class="error-message">
          Lo sentimos, la página que buscás no existe o fue movida.
        </p>
        <RouterLink to="/" class="btn btn-primary">
          Volver al inicio
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.not-found-page {
  padding: var(--space-3xl) 0;
  min-height: 70vh;
  display: flex;
  align-items: center;
}

.not-found-content {
  max-width: 480px;
  margin: 0 auto;
  text-align: center;
}

.error-code {
  font-family: var(--font-heading);
  font-size: clamp(4rem, 15vw, 8rem);
  font-weight: 300;
  color: var(--color-primary);
  line-height: 1;
}

.error-title {
  font-family: var(--font-heading);
  font-size: clamp(1.5rem, 4vw, 2rem);
  font-weight: 300;
  margin-bottom: var(--space-md);
}

.error-message {
  color: var(--color-muted);
  margin-bottom: var(--space-xl);
}
</style>
