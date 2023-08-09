<template>
  <layout />
</template>
 
<script>
export default {
  name: "APP",
  components: {
    'layout': () => importHtmlVue('./components/common/common-admin-layout.vue'),
  }
}
</script>
 
<style scoped>
</style>