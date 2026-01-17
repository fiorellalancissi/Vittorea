<script setup>
import { ref, computed, watch } from 'vue'
import { RouterLink, useRouter, useRoute } from 'vue-router'
import { useCartStore } from '../stores/cart'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const route = useRoute()
const cartStore = useCartStore()
const authStore = useAuthStore()

const isMenuOpen = ref(false)
const showLoginModal = ref(false)
const loginForm = ref({ username: '', password: '' })
const loginError = ref('')

const isAdminRoute = computed(() => route.path.startsWith('/admin'))

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
}

function closeMenu() {
  isMenuOpen.value = false
}

function openLogin() {
  loginForm.value = { username: '', password: '' }
  loginError.value = ''
  showLoginModal.value = true
}

function closeLogin() {
  showLoginModal.value = false
}

function handleLogin() {
  const result = authStore.login(loginForm.value.username, loginForm.value.password)
  if (result.success) {
    closeLogin()
    router.push('/admin')
  } else {
    loginError.value = result.error
  }
}

function handleLogout() {
  authStore.logout()
  if (route.path.startsWith('/admin')) {
    router.push('/')
  }
}
</script>

<template>
  <header class="header" :class="{ 'header--admin': isAdminRoute }">
    <div class="header-container">
      <RouterLink to="/" class="logo" @click="closeMenu">
        <span class="logo-text">Vittore</span>
      </RouterLink>

      <nav class="nav" :class="{ 'nav--open': isMenuOpen }">
        <RouterLink to="/" class="nav-link" @click="closeMenu">Inicio</RouterLink>
        <RouterLink to="/#catalogo" class="nav-link" @click="closeMenu">Catálogo</RouterLink>
        <RouterLink 
          v-if="authStore.isAuthenticated" 
          to="/admin" 
          class="nav-link nav-link--admin" 
          @click="closeMenu"
        >
          Gestión
        </RouterLink>
      </nav>

      <div class="header-actions">
        <template v-if="authStore.isAuthenticated">
          <div class="user-menu">
            <span class="user-name">{{ authStore.user }}</span>
            <button class="btn-link" @click="handleLogout">Cerrar sesión</button>
          </div>
        </template>
        <template v-else>
          <button class="login-button" @click="openLogin">
            Iniciar sesión
          </button>
        </template>

        <button 
          v-if="!isAdminRoute"
          class="cart-button" 
          @click="cartStore.toggleCart" 
          aria-label="Abrir carrito"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
          <span v-if="cartStore.totalItems > 0" class="cart-badge">{{ cartStore.totalItems }}</span>
        </button>

        <button class="menu-toggle" @click="toggleMenu" aria-label="Menú">
          <span class="menu-bar"></span>
          <span class="menu-bar"></span>
          <span class="menu-bar"></span>
        </button>
      </div>
    </div>
  </header>

  <Teleport to="body">
    <div v-if="showLoginModal" class="modal-overlay" @click.self="closeLogin">
      <div class="login-modal">
        <button class="modal-close" @click="closeLogin">&times;</button>
        
        <div class="login-header">
          <h2 class="login-title">Iniciar sesión</h2>
          <p class="login-subtitle">Acceso al panel de gestión</p>
        </div>

        <form class="login-form" @submit.prevent="handleLogin">
          <div class="form-group">
            <label class="form-label">Usuario</label>
            <input 
              type="text"
              v-model="loginForm.username"
              class="form-input"
              placeholder="Ingresá tu usuario"
              required
              autocomplete="username"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Contraseña</label>
            <input 
              type="password"
              v-model="loginForm.password"
              class="form-input"
              placeholder="Ingresá tu contraseña"
              required
              autocomplete="current-password"
            />
          </div>

          <p v-if="loginError" class="login-error">{{ loginError }}</p>

          <button type="submit" class="btn btn-primary btn-block">
            Ingresar
          </button>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: var(--header-height);
  background-color: var(--color-background);
  border-bottom: 1px solid var(--color-border);
  z-index: 100;
}

.header--admin {
  left: 240px;
}

.header-container {
  max-width: 100%;
  height: 100%;
  margin: 0;
  padding: 0 var(--space-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  text-decoration: none;
}

.logo-text {
  font-family: var(--font-heading);
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: var(--color-primary);
  position: relative;
  display: inline-block;
  padding-left: 0.025em;
}

.nav {
  display: flex;
  gap: var(--space-lg);
}

.nav-link {
  font-size: 0.875rem;
  font-weight: 400;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-muted);
  transition: color var(--transition-fast);
}

.nav-link:hover,
.nav-link.router-link-active {
  color: var(--color-text);
}

.nav-link--admin {
  color: var(--color-accent);
}

.nav-link--admin:hover {
  color: var(--color-secondary);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.login-button {
  font-size: 0.813rem;
  font-weight: 500;
  color: var(--color-secondary);
  background: none;
  border: 1px solid var(--color-border);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.login-button:hover {
  border-color: var(--color-secondary);
  background-color: var(--color-secondary);
  color: var(--color-white);
}

.user-menu {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.user-name {
  font-size: 0.813rem;
  font-weight: 500;
  color: var(--color-text);
}

.btn-link {
  font-size: 0.75rem;
  color: var(--color-muted);
  background: none;
  border: none;
  cursor: pointer;
  text-decoration: underline;
}

.btn-link:hover {
  color: var(--color-text);
}

.cart-button {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: none;
  border: none;
  color: var(--color-text);
  cursor: pointer;
  transition: color var(--transition-fast);
}

.cart-button:hover {
  color: var(--color-accent);
}

.cart-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  font-size: 0.688rem;
  font-weight: 500;
  line-height: 18px;
  text-align: center;
  color: var(--color-white);
  background-color: var(--color-accent);
  border-radius: 9px;
}

.menu-toggle {
  display: none;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  width: 44px;
  height: 44px;
  background: none;
  border: none;
  cursor: pointer;
}

.menu-bar {
  width: 24px;
  height: 2px;
  background-color: var(--color-text);
  transition: transform var(--transition-base);
}

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

.login-modal {
  background: var(--color-white);
  border-radius: var(--radius-lg);
  width: 100%;
  max-width: 400px;
  padding: var(--space-xl);
  position: relative;
}

.modal-close {
  position: absolute;
  top: var(--space-md);
  right: var(--space-md);
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

.login-header {
  text-align: center;
  margin-bottom: var(--space-lg);
}

.login-title {
  font-family: var(--font-heading);
  font-size: 1.5rem;
  font-weight: 400;
  margin: 0 0 var(--space-xs);
}

.login-subtitle {
  font-size: 0.875rem;
  color: var(--color-muted);
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.login-error {
  color: #c45c5c;
  font-size: 0.875rem;
  text-align: center;
  margin: 0;
}

.btn-block {
  width: 100%;
}

@media (max-width: 768px) {
  .header--admin {
    left: 60px;
  }

  .nav {
    position: fixed;
    top: var(--header-height);
    left: 0;
    right: 0;
    flex-direction: column;
    align-items: center;
    gap: 0;
    padding: var(--space-lg) 0;
    background-color: var(--color-background);
    border-bottom: 1px solid var(--color-border);
    transform: translateY(-100%);
    opacity: 0;
    visibility: hidden;
    transition: all var(--transition-base);
  }

  .nav--open {
    transform: translateY(0);
    opacity: 1;
    visibility: visible;
  }

  .nav-link {
    padding: var(--space-sm) var(--space-md);
  }

  .menu-toggle {
    display: flex;
  }

  .user-menu {
    flex-direction: column;
    align-items: flex-end;
    gap: 2px;
  }

  .user-name {
    font-size: 0.75rem;
  }
}
</style>
