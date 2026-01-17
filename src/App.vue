<script setup>
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
import CartDrawer from './components/CartDrawer.vue'
import WhatsAppButton from './components/WhatsAppButton.vue'
</script>

<template>
  <div class="app">
    <Header />
    <main class="main-content">
      <router-view />
    </main>
    <Footer />
    <CartDrawer />
    <WhatsAppButton />
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding-top: 80px;
}
</style>
