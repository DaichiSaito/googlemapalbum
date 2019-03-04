<template>
  <div class="text-xs-center">
    <v-progress-circular indeterminate color="primary"></v-progress-circular>
  </div>
</template>

<script>
export default {
  name: "loading"
};
</script>

<style scoped>
.v-progress-circular {
  margin: 1rem;
}
</style>