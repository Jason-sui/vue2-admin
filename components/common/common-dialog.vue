<template>
  <el-dialog custom-class="common-dialog" :title="title" :append-to-body="append_to_body" :visible="visible"
    v-bind="$attrs" @close="close" :center='center' :show-close='show_close'>
    <div class="w-100 h-100 flex-c">
      <slot></slot>
    </div>
    <div slot="footer" v-if="show_footer" class="dialog-footer">
      <el-button @click="close">取 消</el-button>
      <el-button type="primary" @click="confirm">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  props: {
    visible: {
      type: Boolean,
      required: () => true
    },
    height: {
      type: String,
      default: () => ''
    },
    title: {
      type: String,
      default: () => ''
    },
    center: {
      type: Boolean,
      required: () => false
    },
    show_close: {
      type: Boolean,
      default: () => true
    },
    show_footer: {
      type: Boolean,
      default: () => true
    },
    append_to_body: {
      type: Boolean,
      default: () => false
    },
  },
  data() {
    return {

    }
  },
  methods: {
    close() {
      this.$emit('update:visible', false)
      this.$emit('close')
    },
    confirm() {
      this.$emit('update:visible', false)
      this.$emit('confirm')
    }
  }
}
</script>

<style  scoped>
.common-dialog .el-dialog__body {
  height: 60vh;
  overflow: hidden;
}
</style>
