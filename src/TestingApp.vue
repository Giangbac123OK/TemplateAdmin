<script setup>
  import { ref } from 'vue';

  const name = ref("Dunog Pnahm");
  const status = ref(true);
  const tasks = ["Task #1", "Task #2", "Task #3"];
  const link = ref("https://google.com");

  const DoSomething = () => {
    if (status.value) {
      status.value = false;
    } else {
      status.value = true;
    }
  }
</script>

<template>
  <div style="grid-column: span 2;">
    <h1>Hello {{ name }}!</h1>
    <p v-if="status" style="color: #6B8E23;">{{ name }} is currently online!</p>
    <p v-else style="color: #B22222;">{{ name }} is currently offline!</p>
    <ul style="display: block;">
      <li v-for="(task, index) in tasks" :key="task">{{ task }}</li>
    </ul>
    <a v-bind:href="link" style="color: wheat; text-decoration: none">Let's jump to Google!</a>
    <button v-on:click="DoSomething" style="display: block; width: 100%;border-radius: 15px; outline: unset; border: 1px solid whitesmoke; padding: 10px;">Click me!</button>
  </div>
</template>

<style scoped>

</style>
