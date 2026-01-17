import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  // Credenciales hardcodeadas (en producción usar backend)
  const VALID_USER = 'Fiorella'
  const VALID_PASSWORD = 'Lancissi'

  const user = ref(localStorage.getItem('vittore_user') || null)
  const isAuthenticated = computed(() => !!user.value)

  function login(username, password) {
    if (username === VALID_USER && password === VALID_PASSWORD) {
      user.value = username
      localStorage.setItem('vittore_user', username)
      return { success: true }
    }
    return { success: false, error: 'Usuario o contraseña incorrectos' }
  }

  function logout() {
    user.value = null
    localStorage.removeItem('vittore_user')
  }

  return {
    user,
    isAuthenticated,
    login,
    logout
  }
})
