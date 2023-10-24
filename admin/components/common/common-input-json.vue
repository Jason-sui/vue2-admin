<template>
  <el-input v-model="json_input" type="textarea" :autosize="{ minRows: 2, maxRows: 5 }" @blur="change"></el-input>
</template>
<script>
module.exports = {
  props: {
    value: {
      type: Object,
      default: () => ({})
    },
  },
  data() {
    return {
      json_input: ''
    }
  },
  watch: {
    value: {
      handler(val) {
        this.setInput(val)
      },
      deep: true
    }
  },
  created() {
    this.setInput(this.value)
  },
  methods: {
    setInput(val = {}) {
      this.json_input = JSON.stringify(val, null, 2)
    },
    change() {
      try {
        let data = JSON.parse(this.json_input)
        this.$emit('input', data)
        this.$emit('change', data)
      } catch (error) {
        console.log(error)
        this.$alert(error)
      }
    }
  },
}
</script>
<style scoped>
</style>
