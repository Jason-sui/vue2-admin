<template>
  <div v-if="data_list.length" class="w-100">
    <el-form ref="search_form" class="custom-form" :model="search_form" :inline="inline" :label-position="label_position">
      <template v-for="item in data_list" :key="item.key">
        <el-form-item v-if="item.key && !relation_key[item.key]" :label="item.label">
          <!-- 选择框 -->
          <el-select v-if="item.type === 'select'" v-model="search_form[item.key]" :style="{ 'width': item.width + 'px' }"
            :placeholder="item.placeholder || '请选择'" filterable
            :clearable="item.clearable !== undefined ? item.clearable : true" :multiple="item.multiple"
            :collapse-tags="item.multiple">
            <el-option v-for="option in select_data[item.selectKey || item.key]" :key="option.index"
              :label="option[item.selectLabelKey || 'label']" :value="option[item.selectValueKey || 'value']" />
          </el-select>
          <!-- 输入框 -->
          <el-input v-else-if="item.type === 'input'" v-model="search_form[item.key]"
            :placeholder="item.placeholder || '请输入' + item.label" :maxlength="item.maxlength"
            :clearable="item.clearable !== undefined ? item.clearable : true" :style="{ 'width': item.width + 'px' }"
            @keyup.enter.native="submitForm" />
          <!-- 输入框数字 -->
          <el-input v-else-if="item.type === 'number'" v-model.number="search_form[item.key]"
            :placeholder="item.placeholder || '请输入'" :maxlength="item.maxlength"
            :clearable="item.clearable !== undefined ? item.clearable : true" :style="{ 'width': item.width + 'px' }"
            @keyup.enter.native="submitForm" />
          <!-- 级联选择器 -->
          <el-cascader v-else-if="item.type === 'cascader'" v-model="search_form[item.key]"
            :placeholder="item.placeholder || '请选择'" :options="select_data[item.selectKey || item.key]"
            :props="item.props" clearable />
          <!-- 日期选择框 -->
          <el-date-picker v-else-if="item.type === 'date'" v-model="search_form[item.key]" type="date"
            :placeholder="item.placeholder || '请选择'" value-format="yyyy-MM-dd" />
          <!-- 日期范围选择框 -->
          <el-date-picker v-else-if="item.type === 'dateRange'" v-model="search_form[item.key]" :type="item.dataRangeType"
            range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" format="yyyy-MM-dd HH:mm"
            :default-time="['00:00:00', '23:59:59']" :value-format="item.valueFormat" />
        </el-form-item>
      </template>
      <slot></slot>
      <el-form-item v-if="show_button && inline">
        <el-button type="primary" @click="submitForm">{{ confirm_button_text }}</el-button>
        <el-button @click="resetForm">{{ cancel_button_text }}</el-button>
      </el-form-item>
    </el-form>
    <div v-if="show_button && !inline" class="flex aic jcc">
      <el-button type="primary" @click="submitForm">{{ confirm_button_text }}</el-button>
      <el-button @click="resetForm">{{ cancel_button_text }}</el-button>
    </div>
  </div>
</template>

<script>
export default  {
  props: {
    data_list: {
      type: Array,
      default: () => []
    },
    form_data: {
      type: Object,
      required: true,
      default: () => ({})
    },
    relation_key: {
      type: Object,
      default: () => ({})
    },
    select_data: {
      type: Object,
      default: () => ({})
    },
    label_position: {
      type: String,
      default: () => 'left'
    },
    show_button: {
      type: Boolean,
      default: () => true
    },
    inline: {
      type: Boolean,
      default: () => true
    },
    cancel_button_text: {
      type: [String, Boolean],
      default: () => '清空'
    },
    confirm_button_text: {
      type: String,
      default: () => '查询'
    },
  },
  data() {
    return {
      status: false,
      search_form: {}
    }
  },
  mounted() {
    this.search_form = this.form_data
  },
  methods: {
    submitForm() {
      this.$emit('update:form_data', this.search_form)
      this.$emit('submit-form')
    },
    resetForm() {
      this.data_list.forEach((item) => {
        this.search_form[item.key].value = null
      })
      this.$refs.search_form.resetFields()
      this.$emit('update:form_data', this.search_form)
      this.$emit('submit-form')
    }
  }
}
</script>
<style scoped></style>
