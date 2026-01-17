<script setup>
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="footer">
    <div class="footer-container">
      <div class="footer-brand">
        <span class="footer-logo">Vittore</span>
        <p class="footer-tagline">La unión entre la experiencia y la intuición</p>
      </div>

      <div class="footer-links">
        <div class="footer-section">
          <h4 class="footer-title">Navegación</h4>
          <RouterLink to="/" class="footer-link">Inicio</RouterLink>
          <RouterLink to="/#catalogo" class="footer-link">Catálogo</RouterLink>
        </div>

        <div class="footer-section">
          <h4 class="footer-title">Contacto</h4>
          <a href="https://wa.me/5491112345678" target="_blank" rel="noopener" class="footer-link">
            WhatsApp
          </a>
          <a href="mailto:hola@vittore.com" class="footer-link">vittoreperfumes@gmail.com</a>
        </div>
      </div>

      <div class="footer-bottom">
        <p class="footer-copy">&copy; {{ currentYear }} Vittore. Todos los derechos reservados.</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background-color: var(--color-white);
  border-top: 1px solid var(--color-border);
  padding: var(--space-md) 0 var(--space-xs);
  margin-top: auto;
}

.footer-container {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0 var(--space-md);
}

.footer-brand {
  text-align: center;
  margin-bottom: var(--space-sm);
}

.footer-logo {
  font-family: var(--font-heading);
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--color-primary);
  padding-left: 0.05em;
}

.footer-tagline {
  font-size: 0.688rem;
  color: var(--color-muted);
  margin-top: var(--space-xs);
  margin-bottom: 0;
  font-style: italic;
}

.footer-links {
  display: flex;
  justify-content: center;
  gap: var(--space-lg);
  margin-bottom: var(--space-sm);
}

.footer-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.footer-title {
  font-family: var(--font-body);
  font-size: 0.688rem;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text);
  margin-bottom: var(--space-xs);
}

.footer-link {
  font-size: 0.813rem;
  color: var(--color-muted);
  transition: color var(--transition-fast);
}

.footer-link:hover {
  color: var(--color-accent);
}

.footer-bottom {
  text-align: center;
  padding-top: var(--space-sm);
  border-top: 1px solid var(--color-border);
}

.footer-copy {
  font-size: 0.75rem;
  color: var(--color-muted);
  margin: 0;
}

@media (max-width: 768px) {
  .footer-links {
    flex-direction: column;
    align-items: center;
    gap: var(--space-md);
  }

  .footer-section {
    align-items: center;
    text-align: center;
  }
}
</style>
