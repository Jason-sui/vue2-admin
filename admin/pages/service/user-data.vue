<template>
  <div class="admin-page">
    <common-form :data_list="search_list" :form_data.sync="search_form" :select_data="select_data"
      @submit-form="getData"></common-form>
    <common-table :data="table_data" :props="props">
    </common-table>
  </div>
</template>
 
<script>
module.exports = {
  name: 'user-data',
  components: {
    'common-table': 'url:/admin/components/common/common-table.vue',
    'common-form': 'url:/admin/components/common/common-form.vue',
  },
  data: () => ({
    props: [],
    table_data: [],
    search_list: [
      { label: '开始时间', key: 'start_time', type: 'date' },
      { label: '结束时间', key: 'end_time', type: 'date' },
    ],
    search_form: {
      start_time: null,
      end_time: null
    },
    select_data: {
      // 选择用的数据
    },
    query_data: {
      name: 'contains',
    },
    class_name: '_User',
  }),
  created() {
    this.getData()
  },
  methods: {
    getData(class_name = this.class_name) {
      if (!class_name) return
      let { end_time, start_time } = this.search_form
      if (!end_time) end_time = new Date().getTime()
      lc.run('handleUserData', { start_time, end_time })
        .then(res => {
          console.log(res)
          // 数据结构转换
          let data = res.data
          let item_data = {
            end_time,
            start_time
          }
          let prop_list = []
          for (let key in data) {
            let item = data[key]
            let prop_data = {
              label: item.label
            }
            if (item.data) {
              prop_data.children = item.data.map(children_item => ({ key: `${key}_${children_item.key}`, label: children_item.label, min_width: 100 }))
              item.data.forEach(children_item => {
                item_data[`${key}_${children_item.key}`] = children_item.count
              })
            } else {
              item_data[key] = item.count
              prop_data.key = key
              prop_data.min_width = 200
            }
            prop_list.push(prop_data)
          }
          if (!this.props.length) {
            this.props = [...prop_list,
            { label: '开始时间', key: 'start_time', min_width: 160, filter: 'formateTime' },
            { label: '结束时间', key: 'end_time', min_width: 160, filter: 'formateTime' },]
          }
          this.table_data.push(item_data)
        })
        .catch(err => {
          console.log(err)
        })
    },
  },
}
</script>
 
<style scoped>
.preview-page-container {
  min-width: 395px !important;
  width: 395px !important;
  padding-left: 10px;
  padding-top: 10px;
}

.preview-page {
  width: 385px;
  height: 835px;
}

.image-item {
  height: 300px;
  width: 100%;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}
</style>