<script setup>
import { RouterView, useRouter } from 'vue-router'

const router = useRouter();
const home = () => {
    router.push('/');
};
</script>

<template>
  <header>
    <div class="wrapper">
      <h1><img src="/favicon.png" @click="home" style="cursor: pointer;" /> Overwrite a Bluesky post</h1>
      <h2>with the content of another one</h2>
    </div>
  </header>

  <RouterView />
  <footer>
    <p>©2024
      <a href="https://bsky.app/profile/braxuss.eu"
        title="Visit my Bluesky profile"
        target="_blank">
        @braxuss
      </a>
      <a href="https://github.com/braxuss-eu/braxuss-bluesky-overwrite"
        class="i-github"
        title="Get the code at GitHub"
        target="_blank"></a>
    </p>
    <p>
      <template v-if="router.currentRoute.value.name == 'overwrite'">
      <a href="/tos">Terms of service</a> | <a href="/policy">Usage policy</a>
    </template>
    <template v-else-if="router.currentRoute.value.name == 'tos'">
      <a href="/">Home</a> | <a href="/policy">Usage policy</a>
    </template>
    <template v-else-if="router.currentRoute.value.name == 'policy'">
      <a href="/">Home</a> | <a href="/tos">Terms of service</a>
    </template>
    </p>
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
footer a {
  color: light-dark(#333b3c, #efefec);
  text-decoration: underline;
}

a.i-github {
  display: inline-block;
  mask: url("data:image/svg+xml;utf8,%3Csvg viewBox='0 0 16 16' width='1.2em' height='1.2em' xmlns='http://www.w3.org/2000/svg' %3E%3Cpath fill='currentColor' d='M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59c.4.07.55-.17.55-.38c0-.19-.01-.82-.01-1.49c-2.01.37-2.53-.49-2.69-.94c-.09-.23-.48-.94-.82-1.13c-.28-.15-.68-.52-.01-.53c.63-.01 1.08.58 1.23.82c.72 1.21 1.87.87 2.33.66c.07-.52.28-.87.51-1.07c-1.78-.2-3.64-.89-3.64-3.95c0-.87.31-1.59.82-2.15c-.08-.2-.36-1.02.08-2.12c0 0 .67-.21 2.2.82c.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82c.44 1.1.16 1.92.08 2.12c.51.56.82 1.27.82 2.15c0 3.07-1.87 3.75-3.65 3.95c.29.25.54.73.54 1.48c0 1.07-.01 1.93-.01 2.2c0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8'/%3E%3C/svg%3E") no-repeat;
  mask-size: 100% 100%;
  background-color: currentColor;
  color: light-dark(#333b3c, #efefec);
  filter: drop-shadow(silver 0px 0px 5px);
  width: 1rem;
  height: 1rem;
  margin-left: 0.5rem;
  vertical-align: middle;
}
</style>
