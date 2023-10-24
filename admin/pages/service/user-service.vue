<template>
  <div class="admin-page">
    <el-form ref="ruleForm" :inline="true" :model="form" hide-required-asterisk>
      <el-form-item prop="mobilePhoneNumber" label="用户手机号" :rules="[
        { required: !form.nickname, message: '请输入手机号或昵称', trigger: 'change' },
      ]">
        <el-input v-model="form.mobilePhoneNumber" placeholder="用户手机号" maxlength="11" clearable
          @keyup.enter.native="formSubmit"></el-input>
      </el-form-item>
      <el-form-item prop="nickname" label="用户昵称" :rules="[
        { required: !form.mobilePhoneNumber, message: '请输入昵称或手机号', trigger: 'change' },
      ]">
        <el-input v-model="form.nickname" placeholder="昵称" clearable @keyup.enter.native="formSubmit"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="formSubmit">查询</el-button>
        <el-button @click="formClear">清空</el-button>
      </el-form-item>
    </el-form>
    <el-row class="flex aic" style="height: 100px;">
      <template v-if="point_user_info.objectId">
        <el-col class="flex aic" :span="12">
          <el-image class="avatar" fit="cover" :src="point_user_info.avatar_url"
            :preview-src-list="[point_user_info.avatar_url]">
          </el-image>
          <div class="flex-c ml-half" v-copy-text="point_user_info.nickname">
            <div>{{ point_user_info.username }}</div>
            <div class="mt-4">{{ point_user_info.nickname }}</div>
          </div>
          <div class="flex-c ml-half" v-copy-text="point_user_info.integration">
            <div>积分值</div>
            <div class="mt-4">{{ point_user_info.integration }}</div>
          </div>
          <div class="flex-c ml-half" v-copy-text="point_user_info.objectId">
            <div>用户id</div>
            <div class="mt-4">{{ point_user_info.objectId }}</div>
          </div>
        </el-col>
      </template>
      <template v-else>暂无用户</template>
    </el-row>
    <div class="f1 flex-c">
      <div class="flex aic jcsb mb-main">
        <div class="flex">
          <el-input v-model="action_name" class="mr-main" placeholder="行为名称" maxlength="11" clearable
            @keyup.enter.native="pageChange({ page_num: 1, limit: page_info.limit })"></el-input>
          <el-button type="primary" @click="pageChange({ page_num: 1, limit: page_info.limit })">查询</el-button>
        </div>
        <el-button type="primary" @click="addAction">新增积分行为</el-button>
      </div>
      <common-table :data="table_data" :props="props" :page_info="page_info" @page-change="pageChange">
        <el-table-column label="操作" min-width="160" fixed="right" align="center">
          <div slot-scope="{ row }">
            <el-button size="mini" type="text" @click.stop="addIntegration(row)">增加积分</el-button>
            <el-button size="mini" type="text" @click.stop="editAction(row)">编辑</el-button>
          </div>
        </el-table-column>
      </common-table>
    </div>
  </div>
</template>
 
<script>
module.exports = {
  name: 'user-service',
  components: {
    'common-table': 'url:/admin/components/common/common-table.vue'
  },
  data: () => {
    return {
      form: {
        mobilePhoneNumber: '',
        nickname: ''
      },
      action_name: '',
      page_info: {
        page_num: 1,
        limit: 20,
        total: 0
      },
      table_data: [],
      props: [
        { label: '行为名称', key: 'name', min_width: 160, },
        { label: '创建时间', key: 'createdAt', min_width: 160, filter: 'formateTime' },
        { label: '更新时间', key: 'updatedAt', min_width: 160, filter: 'formateTime' },
      ],
      point_user_info: {},
      add_integration: null,
      current_row: {}
    }
  },
  computed: {

  },
  created() {
    this.pageChange({ page_num: 1, limit: this.page_info.limit })
  },
  methods: {
    phoneCheck(phone) {
      return /^[1][0-9]{10}$/.test(phone)
    },
    formClear() {
      this.$refs['ruleForm'].resetFields()
      this.pageChange({ page_num: 1, limit: this.page_info.limit })
    },
    formSubmit() {
      this.$refs['ruleForm'].validate((valid) => {
        if (!valid) return
        if (!this.form.nickname && !this.phoneCheck(this.form.mobilePhoneNumber)) {
          this.$alert('请输入正确的手机号')
          return
        }
        lc.one('_User', (q) => {
          for (let key in this.form) {
            if (this.form[key]) q.equalTo(key, this.form[key])
          }
        })
          .then(res => {
            if (!res) throw { rawMessage: '查无此用户' }
            this.point_user_info = res.toJSON()
          })
          .catch(err => {
            this.$alert(err)
          })
      })
    },
    refreshUser() {
      if (!this.point_user_info.objectId) return
      lc.readItem('_User', (q) => {
        q.equalTo('objectId', this.point_user_info.objectId)
      })
        .then(res => {
          if (!res) throw { rawMessage: '刷新信息失败' }
          this.point_user_info = res.toJSON()
        })
        .catch(err => {
          this.$alert(err)
        })
    },
    pageChange({ page_num = 1, limit = 10 } = {}) {
      this.page_info.page_num = page_num
      this.page_info.limit = limit
      lc.readTotal('AGAction', (q) => {
        if (this.action_name) q.contains('name', this.action_name)
        q.descending('createdAt')
        q.limit(limit)
        q.skip(limit * (page_num - 1))
      })
        .then(res => {
          let { data, count } = res
          this.page_info.total = count
          if (!data.length && this.action_name) throw { rawMessage: '行为名称查询失败' }
          this.table_data = data.map(i => i.toJSON())
        })
        .catch(err => {
          console.log(err)
          this.$alert(err)
        })
    },
    addAction() {
      this.$prompt('请输入行为名称', '新增积分行为', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
      }).then(({ value }) => {
        return lc.create('AGAction', { 'name': value, 'is_custom': true })
      })
        .then(() => {
          this.$toast('新增成功')
        })
        .catch(err => {
          console.log(err)
          err.rawMessage && this.$alert(err)
        })
    },
    editAction(row) {
      this.$prompt('请输入行为名称', '更改行为名称', {
        inputValue: row.name,
        confirmButtonText: '确定',
        cancelButtonText: '取消',
      }).then(({ value }) => {
        if (value !== row.name) return lc.update('AGAction', row.objectId, { 'name': value })
        else return Promise.reject('两次输入相同')
      })
        .then(() => {
          this.$toast('编辑成功')
        })
        .catch(err => {
          err.rawMessage && this.$alert(err)
        })
    },
    addIntegration(row) {
      if (!this.point_user_info.objectId) {
        this.$alert('当前没有用户')
        return
      }
      this.$prompt('请输入积分值', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
      }).then(({ value }) => {
        return AV.Cloud.run('handleUserIntegration', { action_id: row.objectId, integration: +value, point_user_id: this.point_user_info.objectId, remind: row.name })
      })
        .then((res) => {
          if (res.code === 200) {
            this.$toast('积分增加成功')
            this.refreshUser()
          } else {
            throw res.error
          }
        })
        .catch(err => {
          console.log(err)
          err.rawMessage && this.$alert(err)
        })
    },
  },
}
</script>
 
<style scoped>
.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
}
</style>