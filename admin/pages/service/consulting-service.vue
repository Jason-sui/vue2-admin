<template>
  <div class="admin-page">
    <el-form ref="ruleForm" :inline="true" :model="form" hide-required-asterisk>
      <el-form-item prop="input" label="内容">
        <el-input v-model="form.input" placeholder="内容" maxlength="11" clearable
          @keyup.enter.native="pageChange({ page_num: 1, limit: page_info.limit })"></el-input>
      </el-form-item>
      <el-form-item prop="contact" label="联系方式">
        <el-input v-model="form.contact" placeholder="联系方式" clearable
          @keyup.enter.native="pageChange({ page_num: 1, limit: page_info.limit })"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="pageChange({ page_num: 1, limit: page_info.limit })">查询</el-button>
        <el-button @click="formClear">清空</el-button>
      </el-form-item>
    </el-form>
    <common-table :data="table_data" :props="props" :page_info="page_info" @page-change="pageChange">
      <template #image="{ row }">
        <template v-if="row.image_list && row.image_list.length">
          <el-image v-for="(image, index) in row.image_list" class="image-item" fit="cover" :key="index"
            :src="image.url" :preview-src-list="row.image_list.map(i => i.url)"></el-image>
        </template>
      </template>
      <el-table-column label="操作" min-width="160" fixed="right" align="center">
        <div slot-scope="{ row }">
          <el-button size="mini" type="text" @click.stop="deleteItem(row)">删除</el-button>
        </div>
      </el-table-column>
    </common-table>
  </div>
</template>
 
<script>
module.exports = {
  name: 'consulting-service',
  components: {
    'common-table': 'url:/admin/components/common/common-table.vue',
  },
  data: () => {
    return {
      page_info: {
        page_num: 1,
        limit: 10,
        total: 0
      },
      table_data: [],
      props: [
        { label: '图片', key: 'image', min_width: 200, slot_name: 'image', },
        { label: '内容', key: 'input', min_width: 160, copytext: true, },
        { label: '用户', key: 'user', min_width: 300, user_slot: true, },
        { label: '联系方式', key: 'contact', min_width: 160, },
        { label: '创建时间', key: 'createdAt', min_width: 160, filter: 'formateTime' },
        { label: '更新时间', key: 'updatedAt', min_width: 160, filter: 'formateTime' },
      ],
      form: {
        input: '',
        contact: ''
      },
    }
  },
  created() {
    this.pageChange({ page_num: 1, limit: this.page_info.limit })
  },
  methods: {
    formClear() {
      this.$refs['ruleForm'].resetFields()
      this.form = {
        input: '',
        contact: ''
      }
      this.pageChange({ page_num: 1, limit: this.page_info.limit })
    },
    pageChange(page_info) {
      lc.readTotal('KSComplaint', (q) => {
        for (let key in this.form) {
          if (this.form[key]) {
            q.contains(key, this.form[key])
          }
        }
        q.include('user')
        q.limit(page_info.limit)
        q.skip(page_info.limit * (page_info.page_num - 1))
        q.descending('createdAt')
      })
        .then(res => {
          let { data, count } = res
          this.page_info.total = count
          if (!data.length && this.search_title) throw { rawMessage: '行为名称查询失败' }
          this.table_data = data.map(i => i.toJSON())
        })
        .catch(err => {
          console.log(err)
          this.$alert(err)
        })
    },
    editItem({ row, key }) {
      lc.update('KSComplaint', row.objectId, { [key]: row[key] })
        .then(res => {
          this.pageChange(this.page_info)
          this.$toast('更改成功,刷新后查看变更')
        })
        .catch(err => {
          console.log(err)
          this.$alert(err)
        })
    },
    deleteItem(row) {
      this.$confirm('确认删除？')
        .then(() => {
          lc.delete('KSComplaint', row.objectId)
            .then(() => {
              this.pageChange(this.page_info)
            })
            .catch(err => {
              console.log(err)
              this.$alert(err)
            })
        })
    },
  },
}
</script>

<style scoped>
.image-item {
  height: 80px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}
</style>