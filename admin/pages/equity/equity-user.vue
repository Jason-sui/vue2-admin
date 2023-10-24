<template>
  <div class="admin-page">
    <common-form :data_list="search_list" :form_data.sync="search_form" :select_data="select_data"
      @submit-form="pageChange({ pageNum: 1, limit: page_info.limit })">
      <el-form-item label="用户昵称">
        <el-input v-model="user_search_form.nickname" placeholder="请输入用户昵称"
          @keyup.enter.native="pageChange({ pageNum: 1, limit: page_info.limit })" />
      </el-form-item>
      <el-form-item label="用户手机号">
        <el-input v-model="user_search_form.mobilePhoneNumber" placeholder="请输入用户手机号"
          @keyup.enter.native="pageChange({ pageNum: 1, limit: page_info.limit })" />
      </el-form-item>
      <el-form-item label="用户id">
        <el-input v-model="user_search_form.objectId" placeholder="请输入用户id"
          @keyup.enter.native="pageChange({ pageNum: 1, limit: page_info.limit })" />
      </el-form-item>
    </common-form>
    <common-table :data="table_data" :props="props" :page_info="page_info" @page-change="pageChange"
      @edit-item="({ value, key, index }) => editItem({ type: 'text_list', value, key, index })">
      <template #equity_card="{ row,index}">
        <el-button size="mini" type="text" @click.stop="openEquityCard({ row,index })">
          {{row.equity_card.name}}
        </el-button>
      </template>
    </common-table>
    <common-dialog :visible.sync="dialog" height="60vh" :show_footer="false">
      <equity-card v-if="dialog" :search_id="equity_card_id"></equity-card>
    </common-dialog>
  </div>
</template>
 
<script>
module.exports = {
  name: 'equity-user',
  components: {
    'common-table': 'url:/admin/components/common/common-table.vue',
    'common-form': 'url:/admin/components/common/common-form.vue',
    'common-dialog': 'url:/admin/components/common/common-dialog.vue',
    'equity-card': 'url:./equity-card.vue',
  },
  data: () => ({
    dialog: false,
    props: [
      { label: '用户', key: 'user', min_width: 300, user_slot: true, },
      { label: '权益卡', key: 'equity_card', min_width: 160, slot_name: 'equity_card' },
      { label: '是否禁用', key: 'disable', min_width: 160, edit_type: 'boolean' },
      { label: '生效时间', key: 'effect_time', min_width: 160, filter: 'formateStringNumberTime', filterParams: ['YYYY/MM/DD HH:mm:ss'] },
      { label: '过期时间', key: 'expired_time', min_width: 160, filter: 'formateStringNumberTime', filterParams: ['YYYY/MM/DD HH:mm:ss'] },
    ],
    table_data: [],
    page_info: {
      page_num: 1,
      limit: 10,
      total: 0
    },
    search_list: [
      { label: '名称', key: 'name', type: 'input' },
    ],
    search_form: {
      name: ''
    },
    select_data: {
      // 选择用的数据
    },
    query_data: {
      name: 'contains',
      nickname: 'contains',
    },
    class_name: 'KSEquityCardUserMap',
    empty_item: {
      // 默认新增的item信息
    },
    equity_card_id: '',
    user_search_form: {
      nickname: '',
      mobilePhoneNumber: '',
      objectId: ''
    }
  }),
  created() {
    this.pageChange(this.page_info)
  },
  methods: {
    async pageChange({ page_num = 1, limit = 10 } = {}, class_name = this.class_name) {
      if (!class_name) return
      this.page_info.page_num = page_num
      this.page_info.limit = limit
      this.$loading()
      let user
      this.getUser()
        .then(res => {
          user = res
          return lc.readTotal(class_name, (q) => {
            q = this.$setQuery(q, this.search_form, this.query_data)
            if (user) q.equalTo('user', user)
            q.include('user')
            q.include('equity_card')
            q.limit(limit)
            q.skip(limit * (page_num - 1))
            q.descending('createdAt')
          })
        })
        .then(res => {
          let { data, count } = res
          this.page_info.total = count
          this.table_data = data.map(i => {
            let item = i.toJSON()
            // 处理数据
            return item
          })
        })
        .catch(err => {
          console.log(err)
          this.$alert(err)
        })
        .finally(() => {
          this.$loading().close()
        })
    },
    addItem({ type, copy_data }) {
      let request
      let class_data = {}
      switch (type) {
        default:
          class_data = {
            class_name: this.class_name,
          }
          if (copy_data && copy_data.objectId) {
            request = lc.run('copyClassData', {
              ...class_data,
              id: copy_data.objectId
            })
          } else {
            // 新增的默认数据
            request = lc.create(class_data.class_name, this.empty_item)
          }
          request
            .then(() => {
              this.pageChange({ page_num: 1, limit: this.page_info.limit })
            })
            .catch(err => {
              console.log(err)
              this.$alert(err)
            })
          break
      }
    },
    editItem({ type, key, index, value }) {
      switch (type) {
        default:
          lc.update(this.class_name, this.table_data[index].objectId, { [key]: value })
            .then(res => {
              this.pageChange(this.page_info)
              this.$toast('更改成功,刷新后查看变更')
            })
            .catch(err => {
              console.log(err)
              this.$alert(err)
            })
          break
      }
    },
    deleteItem({ type, row, index }) {
      this.$confirm('确认删除？')
        .then(() => {
          switch (type) {
            default:
              lc.delete(this.class_name, row.objectId)
                .then(() => {
                  this.pageChange(this.page_info)
                })
                .catch(err => {
                  console.log(err)
                  this.$alert(err)
                })
              break
          }
        })
    },
    openEquityCard({ row, index }) {
      this.equity_card_id = row.equity_card.objectId
      this.dialog = true
    },
    getUser() {
      for (let key in this.user_search_form) {
        if (this.user_search_form[key]) {
          return lc.one('_User', (q) => {
            q = this.$setQuery(q, this.user_search_form, this.query_data)
          })
            .then(res => {
              if (!res) throw { rawMessage: '查无此用户' }
              return res
            })
            .catch(err => {
              throw err
            })
        }
      }
      return Promise.resolve()
    }
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