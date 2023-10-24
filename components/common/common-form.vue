<template>
  <div class="w-100">
    <el-form ref="search_form" class="custom-form" :model="search_form" :inline="inline"
      :label-position="label_position">
      <template v-for="item in data_list">
        <el-form-item v-if="item.key && !relation_key[item.key]" :label="item.label">
          <template v-if="['upload','relation',].includes(item.type)">
            <!-- 文件上传 -->
            <el-upload v-if="item.type === 'upload'" :http-request="()=>Promise.resolve()" :accept="item.accept||'*'"
              :before-upload="(file)=>handleFile({file,key:item.key})" :limit="1"
              :before-remove="(file,file_list)=>beforeRemove({file,key:item.key})">
              <el-button type="primary" size="mini">{{item.button_text||'上传文件'}}</el-button>
            </el-upload>
            <!-- 关联搜索 -->
            <common-edit v-if="item.type === 'relation'" :row="search_form" :prop="item" @edit-item="handleItem" />
          </template>
          <template v-else>
            <!-- 选择框 -->
            <el-select v-if="item.type === 'select'" v-model="search_form[item.key]"
              :style="{ 'width': (item.width||'180') + 'px' }" :placeholder="item.placeholder || '请选择'" filterable
              :clearable="item.clearable !== undefined ? item.clearable : true" :multiple="item.multiple"
              :collapse-tags="item.multiple">
              <el-option v-for="option in select_data[item.selectKey || item.key]" :key="option.index"
                :label="option[item.selectLabelKey || 'label']"
                :value="option[item.selectValueKey || 'value']"></el-option>
            </el-select>
            <!-- 输入框 -->
            <el-input v-if="item.type === 'input'" v-model="search_form[item.key]"
              :placeholder="item.placeholder || '请输入' + item.label" :maxlength="item.maxlength"
              :clearable="item.clearable !== undefined ? item.clearable : true"
              :style="{ 'width': (item.width||'180') + 'px' }" @keyup.enter.native="submitForm"></el-input>
            <!-- 输入框数字 -->
            <el-input v-if="item.type === 'number'" v-model.number="search_form[item.key]"
              :placeholder="item.placeholder || '请输入'" :maxlength="item.maxlength"
              :clearable="item.clearable !== undefined ? item.clearable : true"
              :style="{ 'width': (item.width||'180') + 'px' }" @keyup.enter.native="submitForm"></el-input>
            <template v-if="item.type === 'textarea'">
              <el-input v-model="search_form[item.key]" type="textarea" :autosize="{ minRows: 1, maxRows: 2 }"
                :placeholder="item.placeholder || '请输入'" :maxlength="item.maxlength"
                :clearable="item.clearable !== undefined ? item.clearable : true"
                :style="{ 'width': (item.width||'180') + 'px' }"></el-input>
            </template>
            <el-switch v-if="item.type==='switch'" v-model="search_form[item.key]" active-color="#13ce66"
              inactive-color="#ff4949">
            </el-switch>
            <!-- 级联选择器 -->
            <el-cascader v-if="item.type === 'cascader'" v-model="search_form[item.key]"
              :placeholder="item.placeholder || '请选择'" :options="select_data[item.selectKey || item.key]"
              :props="item.props" clearable></el-cascader>
            <!-- 日期选择框 -->
            <el-date-picker v-if="item.type === 'date'" v-model="search_form[item.key]" type="date"
              :placeholder="item.placeholder || '请选择'" :format="item.label_format||'yyyy-MM-dd'"
              :value-format="item.valueFormat||'timestamp'"></el-date-picker>
            <!-- 日期范围选择框 -->
            <el-date-picker v-if="item.type === 'daterange'" v-model="search_form[item.key]"
              :type="item.dataRangeType||'daterange'" range-separator="至" start-placeholder="开始日期"
              end-placeholder="结束日期" :format="item.label_format||'yyyy-MM-dd'" :default-time="['00:00:00', '23:59:59']"
              :value-format="item.valueFormat||'timestamp'"></el-date-picker>
          </template>
        </el-form-item>
      </template>
      <slot></slot>
      <el-form-item v-if="show_button && inline">
        <el-button v-if="confirm_button_text" type="primary" @click="submitForm">{{ confirm_button_text }}</el-button>
        <el-button v-if="cancel_button_text" @click="resetForm">{{ cancel_button_text }}</el-button>
      </el-form-item>
    </el-form>
    <div v-if="show_button && !inline" class="flex aic jcc">
      <el-button v-if="confirm_button_text" type="primary" @click="submitForm">{{ confirm_button_text }}</el-button>
      <el-button v-if="cancel_button_text" @click="resetForm">{{ cancel_button_text }}</el-button>
    </div>
  </div>
</template>

<script>
export default {
  components: {
    'common-edit': () => importHtmlVue('/admin/components/common/common-edit.vue'),
  },
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
    handleItem({ value, key }) {
      this.search_form[key] = value
    },
    handleFile({ file, key }) {
      this.search_form[key] = file ? URL.createObjectURL(file) : ''
    },
    beforeRemove({ key }) {
      this.search_form[key] = ''
    },
    submitForm() {
      this.$emit('update:form_data', this.search_form)
      this.$emit('submit-form')
    },
    resetForm() {
      this.data_list.forEach((item) => {
        if (item.key in this.search_form) this.search_form[item.key] = null
      })
      this.$refs.search_form.resetFields()
      this.$emit('update:form_data', this.search_form)
      this.$emit('submit-form')
    }
  }
}
</script>
<style scoped></style>
