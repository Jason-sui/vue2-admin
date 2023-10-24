<template>
  <div class="edit-item">
    <template v-if="prop.edit_type === 'select'">
      <div class="flex aic jcc">
        <i v-if="prop.select_icon" :class="`${row[prop.key]} select-icon-label`"></i>
        <el-select v-model="row[prop.key]" :disabled="prop.edit_disabled" filterable default-first-option
          :multiple="prop.select_multiple" @change="editItem({ key: prop.key, id:row[row_key]})">
          <el-option v-for="(item, select_index) in prop.select_list" :key="select_index"
            :label="item[prop.label_key || 'label']" :value="item[prop.value_key || 'value']">
            <template v-if="prop.select_icon">
              <div class="flex aic jcsb">
                <i :class="item[prop.value_key || 'value']"></i>
                <div>{{item[prop.label_key || 'label']}}</div>
              </div>
            </template>
          </el-option>
        </el-select>
      </div>
    </template>
    <template v-if="prop.edit_type === 'image_url'">
      <common-upload :url.sync="row[prop.key]" @change="editItem({ key: prop.key, id:row[row_key]})"></common-upload>
    </template>
    <template v-if="prop.edit_type === 'input'">
      <el-input v-model="row[prop.key]" :readonly="prop.edit_disabled"
        @keyup.native.enter="editItem({ key: prop.key, id:row[row_key]})">
      </el-input>
    </template>
    <template v-if="prop.edit_type === 'textarea'">
      <el-input v-model="row[prop.key]" :readonly="prop.edit_disabled" type="textarea"
        :autosize="{ minRows: 1, maxRows: 2 }" @blur="editItem({ key: prop.key, id:row[row_key]})"></el-input>
    </template>
    <template v-if="prop.edit_type === 'number'">
      <el-input v-model.number="row[prop.key]" :readonly="prop.edit_disabled"
        @keyup.native.enter="editItem({ key: prop.key, id:row[row_key]})"></el-input>
    </template>
    <template v-if="prop.edit_type === 'boolean'">
      <el-switch v-model="row[prop.key]" :disabled="prop.edit_disabled" :active-text="prop.active_text || '是'"
        :inactive-text="prop.unactive_text || '否'" @change="editItem({ key: prop.key, id:row[row_key]})">
      </el-switch>
    </template>
    <template v-if="prop.edit_type === 'day2number'">
      <el-date-picker v-model="row[prop.key]" :disabled="prop.edit_disabled" type="datetime" placeholder="选择日期时间"
        value-format="timestamp" @change="editItem({ key: prop.key, id:row[row_key]})">
      </el-date-picker>
    </template>
    <template v-if="prop.edit_type === 'json'">
      <common-input-json v-model="row[prop.key]"
        @change="(value)=>{editItem({ value,key: prop.key, id:row[row_key]})}"></common-input-json>
    </template>
    <template v-if="prop.edit_type === 'md'">
      <common-md v-model="row[prop.key]"
        @change="(value)=>{editItem({ value,key: prop.key, id:row[row_key]})}"></common-md>
    </template>
    <!-- 需要对_id和_list进行处理进行处理 -->
    <template v-if="prop.edit_type ==='relation'">
      <el-select v-model="row[`${prop.key}_id`]" remote filterable :default-first-option="true"
        :remote-method="(query) => getRelation({ row:row, object_class:prop.object_class,query_key:prop.query_key||'name',search_form:prop.search_form, query_data:prop.query_data||{} , query,key:prop.key })"
        :loading="row.loading"
        @change="(value) => changeRelation({ row:row, value, key: prop.key ,object_class:prop.object_class})">
        <el-option v-for="item in row[`${prop.key}_list`]" :key="item.objectId"
          :label="item[prop.relation_label_key||'name']" :value="item.objectId"></el-option>
      </el-select>
    </template>
  </div>
</template>
<script>
module.exports = {
  name: "common-edit",
  components: {
    'common-upload': 'url:./common-upload.vue',
    'common-input-json': 'url:./common-input-json.vue',
    'common-md': 'url:./common-md.vue',
  },
  props: {
    row_key: {
      type: String,
      default: () => 'objectId'
    },
    edit_type: {
      type: String,
      default: () => 'input'
    },
    prop: {
      type: Object,
      default: () => ({})
    },
    row: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {

    }
  },
  methods: {
    editItem({ key = '', value = '', id = '', }) {
      let edit_value = value || this.row[key]
      this.$emit('edit-item', { value: edit_value, key, id, })
    },
    getRelation({ row = {}, query = '', key = '', object_class = '', query_key = 'name', search_form, query_data } = {}) {
      if (!row) return
      row.loading = true
      lc.readTotal(object_class, (q) => {
        if (search_form) {
          q = this.$setQuery(q, search_form, query_data)
        }
        q.contains(query_key, query)
      })
        .then(res => {
          let { data, count } = res
          row[`${key}_list`] = data.map(i => i.toJSON())
          row.loading = false
        })
        .catch(err => {
          console.log(err)
          this.$alert(err)
          row.loading = false
        })
    },
    changeRelation({ value, key = '', object_class = '' } = {}) {
      let lc_object = lc.createObject(object_class, value)
      this.editItem({ value: lc_object, key, })
    },
  },
}
</script>
<style scoped>
.edit-item {
  display: flex;
  overflow: hidden;
  flex: 1;
  flex-direction: column;
  max-height: 300px;
  height: auto;
}

.edit-item + .edit-item {
  margin-left: 8px;
}

.select-icon-label {
  z-index: 3;
  font-size: 18px;
}
</style>
