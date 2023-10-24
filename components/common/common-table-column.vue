<template>
  <el-table-column :prop="prop.prop || prop.key" :label="prop.label" :sortable="prop.sortable" :width="prop.width"
    :min-width="prop.min_width" :align="prop.align || 'center'" :fixed="prop.fixed" :type="prop.expand?'expand':''">
    <template v-if="prop.children">
      <template v-for="(item) in prop.children">
        <common-table-column :key="item.key" :prop="item"></common-table-column>
      </template>
    </template>
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
      <slot v-if="prop.slot_name" :row="scope.row" :index="scope.$index"></slot>
      <template v-else-if="prop.edit_type">
        <common-edit :row="scope.row" :prop="prop"
          @edit-item="({value,key,id})=>editItem({value,key,id,index:scope.$index,row:scope.row})" />
      </template>
      <template v-else>
        <template v-if="prop.user_slot">
          <div class="flex aic jcsb">
            <el-image v-if="scope.row.user.avatar_url" class="avatar" fit="cover" :src="scope.row.user.avatar_url"
              :preview-src-list="[scope.row.user.avatar_url]">
            </el-image>
            <div>
              <div v-copy-text>{{ scope.row.user.nickname || scope.row.user.username }}</div>
              <div v-copy-text>{{ scope.row.user.objectId}}</div>
            </div>
          </div>
        </template>
        <template v-else-if="prop.copytext">
          <el-tooltip class="item" effect="dark" placement="top">
            <div slot="content" style="white-space: pre-line !important;max-height:60vh;overflow-y: scroll;">
              {{ scope.row[prop.key] | filterValue(prop.filter, prop.filterParams && prop.filterParams.map(i => (i.key && scope.row[i.key]) || i))  }}
            </div>
            <div class="text-overflow3" v-copy-text style="max-width: 100%;">
              {{ scope.row[prop.key] | filterValue(prop.filter, prop.filterParams && prop.filterParams.map(i => (i.key && scope.row[i.key]) || i))  }}
            </div>
          </el-tooltip>
        </template>
        <template v-else>
          {{ scope.row[prop.key] | filterValue(prop.filter, prop.filterParams && prop.filterParams.map(i => (i.key &&
                  scope.row[i.key]) || i))  }}
        </template>
      </template>
    </template>
  </el-table-column>
</template>
 
<script>
let vm
export default {
  name: 'common-table-column',
  components: {
    'common-edit': () => importHtmlVue('./common-edit.vue'),
  },
  filters: {
    /* 过滤器方法,默认返回指定的值和空字符串 */
    /* 传入filter方法名且有指定的方法存在时调用方法将参数传入,第一个参数固定为val */
    filterValue(val, fun, filterParams = []) {
      if (fun && vm[fun]) {
        return vm[fun](val, ...filterParams)
      }
      return val || vm.empty_val
    },
  },
  props: {
    prop: {
      type: Object,
      default: () => { return {} }
    },
    empty_val: {
      type: String,
      default: () => '--'
    },
  },
  data() {
    vm = this
    return {

    }
  },
  methods: {
    editItem({ key = '', index = '', value = '', id = '', row }) {
      this.$emit('edit-item', { value, key, index, id, row })
    },
    // filter方法
    formateTime(val, format = 'YYYY/MM/DD HH:mm') {
      return dayjs(val).format(format)
    },
    formateStringNumberTime(val, format = 'YYYY/MM/DD HH:mm') {
      return dayjs(+val).format(format)
    },
    formateListLabel(val, list, value_key = 'value', label_key = 'label') {
      if (!list.length) return val
      let item = list.find(i => i[value_key] === val)
      if (item) return item[label_key]
      return val
    },
    formatObject(val) {
      return JSON.stringify(val || {}, null, 2)
    },
    getObjectKey(val, key) {
      try {
        return val[key]
      } catch (error) {
        return val
      }
    }
  },
}
</script>
 
<style scoped>
</style>