<template>
  <div class="table-box">
    <div class="only-table">
      <el-table class="class-table" stripe :border="true" :height="height" :data="data" :row-key="row_key"
        v-bind="$attrs" v-on="$listeners">
        <el-table-column v-if="selection" type="selection" width="55">
        </el-table-column>
        <template v-for="(prop, index) in props">
          <el-table-column :key="index" :prop="prop.prop || prop.key" :label="prop.label" :sortable="prop.sortable"
            :width="prop.width" :min-width="prop.min_width" :align="prop.align || 'center'" :fixed="prop.fixed">
            <template v-if="prop.label_tooltip">
              <template slot="header">
                <span class="flex aic jcc">
                  <span class="mr-half">
                    {{ prop.label }}
                  </span>
                  <el-tooltip :content="prop.label_tooltip" placement="bottom-start">
                    <span style="display:flex;align-items:center">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M8 1.25C11.7266 1.25 14.75 4.27344 14.75 8C14.75 11.7266 11.7266 14.75 8 14.75C4.27344 14.75 1.25 11.7266 1.25 8C1.25 4.27344 4.27344 1.25 8 1.25ZM8 0.125C3.65469 0.125 0.125 3.65469 0.125 8C0.125 12.3453 3.65469 15.875 8 15.875C12.3453 15.875 15.875 12.3453 15.875 8C15.875 3.65469 12.3453 0.125 8 0.125ZM8.5625 12.5H7.4375V11.375H8.5625V12.5ZM8.75938 8.92812L8.66094 9.0125C8.60469 9.05469 8.5625 9.15313 8.5625 9.2375V10.2641H7.4375V9.2375C7.4375 8.80156 7.63438 8.39375 7.95781 8.12656L8.05625 8.04219C9.04063 7.25469 9.51875 6.84687 9.51875 6.14375C9.51875 5.3 8.84375 4.625 8 4.625C7.12813 4.625 6.48125 5.27187 6.48125 6.14375H5.35625C5.35625 4.66719 6.52344 3.5 8 3.5C9.4625 3.5 10.6438 4.68125 10.6438 6.14375C10.6438 7.42344 9.77188 8.12656 8.75938 8.92812Z"
                          fill="#999999" fill-opacity="0.5" />
                      </svg>
                    </span>
                  </el-tooltip>
                </span>
              </template>
            </template>
            <template v-if="prop.key" slot-scope="scope">
              <slot v-if="prop.slot_name" :name="prop.slot_name" :row="scope.row" :index="scope.$index"></slot>
              <template v-else-if="prop.filter">
                {{ scope.row[prop.key] | filterValue(prop.filter, prop.filterParams && prop.filterParams.map(i => i.key &&
                  scope.row[i.key] || i)) }}
              </template>
              <template v-else-if="prop.edit_type">
                <template v-if="prop.edit_type === 'select'">
                  <el-select v-model="scope.row[prop.key]" @change="editItem({ key: prop.key, index: scope.$index })">
                    <el-option v-for="(item, select_index) in prop.select_list" :key="select_index"
                      :label="item[prop.label_key || 'label']" :value="item[prop.value_key || 'value']"></el-option>
                  </el-select>
                </template>
                <template v-if="prop.edit_type === 'image_url'">
                  <common-upload :url.sync="scope.row[prop.key]"
                    @change="editItem({ key: prop.key, index: scope.$index })"></common-upload>
                </template>
                <template v-if="prop.edit_type === 'input'">
                  <el-input v-model="scope.row[prop.key]" @blur="editItem({ key: prop.key, index: scope.$index })">
                  </el-input>
                </template>
                <template v-if="prop.edit_type === 'textarea'">
                  <el-input v-model="scope.row[prop.key]" type="textarea" :autosize="{ minRows: 1, maxRows: 2 }"
                    @blur="editItem({ key: prop.key, index: scope.$index })"></el-input>
                </template>
                <template v-if="prop.edit_type === 'number'">
                  <el-input v-model.number="scope.row[prop.key]"
                    @blur="editItem({ key: prop.key, index: scope.$index })"></el-input>
                </template>
                <template v-if="prop.edit_type === 'boolean'">
                  <el-switch v-model="scope.row[prop.key]" :active-text="prop.active_text || '是'"
                    :inactive-text="prop.unactive_text || '否'"
                    @change="editItem({ key: prop.key, index: scope.$index })">
                  </el-switch>
                </template>
              </template>
              <template v-else>
                <template v-if="prop.copytext">
                  <el-tooltip class="item" effect="dark" placement="top">
                    <div slot="content" style="white-space: pre-line">
                      {{scope.row[prop.key]}}
                    </div>
                    <div class="text-overflow3" v-copy-text="scope.row[prop.key]" style="max-width: 100%;">
                      {{ scope.row[prop.key] || empty_val }}
                    </div>
                  </el-tooltip>
                </template>
                <template v-else>
                  {{ scope.row[prop.key] || empty_val }}
                </template>
              </template>
            </template>
          </el-table-column>
        </template>
        <slot></slot>
      </el-table>
    </div>
    <div v-if="!all_page && page_info.total" class="only-pagination">
      <common-pagination :page_info="page_info" :page_config="page_config" @page-change="pageChange" />
    </div>
  </div>
</template>
<script>
let vm
module.exports = {
  components: {
    'common-pagination': 'url:./common-pagination.vue',
    'common-upload': 'url:./common-upload.vue',
  },
  filters: {
    /* 过滤器方法,默认返回指定的值和空字符串 */
    /* 传入filter方法名且有指定的方法存在时调用方法将参数传入,第一个参数固定为val */
    filterValue(val, fun, filterParams = []) {
      if (fun && vm[fun]) {
        return vm[fun](val, ...filterParams)
      }
      return val || ''
    },
  },
  props: {
    table_data: {
      type: Array,
      default: () => []
    },
    data: {
      type: Array,
      default: () => []
    },
    props: {
      type: Array,
      default: () => [],
    },
    page_info: {
      type: Object,
      default: () => ({}),
    },
    page_config: {
      type: Object,
      default: () => ({}),
    },
    selection: {
      type: Boolean,
      default: () => false
    },
    all_page: {
      type: Boolean,
      default: () => false,
    },
    empty_val: {
      type: String,
      default: () => '--'
    },
    height: {
      type: String,
      default: '100%',
    },
    row_key: {
      type: String,
      default: () => 'objectId'
    },
  },
  data() {
    vm = this
    return {

    }
  },
  methods: {
    pageChange(obj) {
      this.$emit('page-change', obj)
    },
    // filter方法
    formateTime(val, format = 'YYYY/MM/DD HH:mm') {
      return dayjs(val).format(format)
    },
    editItem({ key = '', index = '' }) {
      let value = this.data[index][key]
      this.$emit('edit-item', { value, key, index })
    }
  },
}
</script>
<style scoped>
.table-box {
  display: flex;
  flex: 1;
  flex-direction: column;
  box-sizing: border-box;
  overflow: hidden;
}

.only-table {
  overflow: hidden;
  flex: 1;
  box-sizing: border-box;
}

.only-pagination {
  text-align: right;
}
</style>
