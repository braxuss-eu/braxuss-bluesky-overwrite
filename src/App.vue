<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <header>
    <div class="wrapper">
      <h1>Overwrite a Bluesky post</h1>
      <h2>with the content of another one</h2>
    </div>
  </header>

  <RouterView />
  <footer>
    <p>©2024 <a href="https://bsky.app/profile/braxuss.eu" target="_blank">@braxuss</a></p>
  </footer>
</template>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 2rem;
}

header .wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}

@media (width < 600px) {
  header {
    padding: 0.2rem;
  }
}

footer {
  grid-area: footer;
  padding: 0.5rem;
  text-align: center;
}
</style>
