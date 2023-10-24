<template>
  <div class="admin-page">
    <common-form>
      <el-form-item label="用户昵称">
        <el-input v-model="user_search_form.nickname" placeholder="请输入用户昵称" @keyup.enter.native="getUser" />
      </el-form-item>
      <el-form-item label="用户手机号">
        <el-input v-model="user_search_form.mobilePhoneNumber" placeholder="请输入用户手机号" @keyup.enter.native="getUser" />
      </el-form-item>
      <el-form-item label="用户id">
        <el-input v-model="user_search_form.objectId" placeholder="请输入用户id" @keyup.enter.native="getUser" />
      </el-form-item>
    </common-form>
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
          <div v-if="point_user_info.vip" class="flex-c ml-half" v-copy-text="point_user_info.objectId">
            <div>会员有效期</div>
            <div class="mt-4">{{ dayjs(point_user_info&&point_user_info.vip_expired_time).format('YYYY/MM/DD') }}</div>
          </div>
          <div class="flex-c ml-half">
            <el-select v-model="equity_time" placeholder="请选择会员卡期限">
              <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
            <el-button class="mt-half" type="primary" @click="submitForm">确定</el-button>
          </div>
        </el-col>
      </template>
      <template v-else>暂无用户</template>
    </el-row>
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
    user_search_form: {
      nickname: '',
      mobilePhoneNumber: '',
      objectId: ''
    },
    equity_time: 604800000,
    options: admin_mock_data.select_data.equity_time,
    point_user_info: {},
  }),
  created() {
  },
  methods: {
    getUser() {
      for (let key in this.user_search_form) {
        if (this.user_search_form[key]) {
          return lc.one('_User', (q) => {
            q = this.$setQuery(q, this.user_search_form, this.query_data)
          })
            .then(res => {
              if (!res) throw { rawMessage: '查无此用户' }
              this.point_user_info = res.toJSON()
              return res
            })
            .catch(err => {
              throw err
            })
        }
      }
      return Promise.resolve()
    },
    submitForm() {
      this.$loading()
      lc.run('handleEquityCardUser', { "equity_card_id": "64b8996f62b8bf26a377df0c", equity_time: this.equity_time, user_id: this.point_user_info.objectId })
        .then(res => {
          this.$toast('更改成功,刷新后查看变更')
          return this.getUser()
        })
        .catch(err => {
          console.log(err)
          this.$alert(err)
        })
        .finally(() => {
          this.$loading().close()
        })
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