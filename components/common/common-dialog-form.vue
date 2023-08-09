<template>
  <el-dialog :title="title" :visible="visible" v-bind="$attrs" :close-on-click-modal="false" @close="close"
    :center='center' :show-close='showClose'>
    <div>
      <slot></slot>
    </div>
  </el-dialog>
</template>

<script>
export default  {
  props: {
    form_data: {
      type: Object,
      required: true,
      default: () => ({})
    },
    rules: {
      type: Object,
      default: () => ({})
    },
    title: {
      type: String,
      required: true,
      default: () => ''
    },
    label_position: {
      type: String,
      default: () => 'left'
    },
    label_width: {
      type: String,
      default: () => ''
    },
    visible: {
      type: Boolean,
      required: () => true
    },
    cancel_button_text: {
      type: String,
      default: () => '取 消'
    },
    confirm_button_text: {
      type: String,
      default: () => '确 定'
    },
    hide_submit: {
      type: Boolean,
      default: () => false
    },
    center: {
      type: Boolean,
      required: () => false
    },
    showClose: {
      type: Boolean,
      default: () => true
    }
  },
  data() {
    return {

    }
  },
  watch: {
    'visible'(val) {
      if (val) {
        this.clearValidate()
      }
    }
  },
  methods: {
    close() {
      this.$emit('close')
    },
    submitForm() {
      this.$refs['ruleForm'].validate(valid => {
        if (valid) {
          this.$emit('submit')
        }
      })
    },
    resetForm() {
      this.$refs['ruleForm'].resetFields()
    },
    clearValidate() {
      this.$nextTick(() => {
        this.$refs['ruleForm'].clearValidate()
      })
    }
  }
}
</script>

<style lang="less" scoped>
/deep/ .el-dialog__body {
  overflow-y: auto;
  padding: 0 20px 0;
  max-height: calc(100% - 230px);
}

/deep/ .el-dialog__footer {
  // padding:30px 0 60px;
  text-align: center;

  .btn1 {
    border: 1px solid #0e85fa;
    color: #0e85fa;
  }

  // .el-button+.el-button {
  //     margin-left: 86px;
  // }
}

.el-button--primary {
  background: #394072 !important;
  // border-radius: 2px !important;
}

.el-button--default {
  border-color: #394072 !important;
  border-radius: 2px !important;
  color: #394072 !important;
}

/deep/ label {
  font-weight: normal;
}

// /deep/ .el-dialog__footer .el-button{
// width: 104px;
// height: 36px;
// font-size: 16px;
// }
/deep/ .el-form-item.is-required:not(.is-no-asterisk)>.el-form-item__label:before {
  font-weight: 600;
  font-size: 18px;
}
</style>
