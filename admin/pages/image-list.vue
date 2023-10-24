<template>
  <div class="admin-page">
    <div class="flex aic jcsb mb-main">
      <div class="flex">
        <el-input v-model="search_title" class="mr-main" placeholder="标题" maxlength="11" clearable
          @keyup.enter.native="pageChange({ page_num: 1, limit: page_info.limit })"></el-input>
        <el-button type="primary" @click="pageChange({ page_num: 1, limit: page_info.limit })">查询</el-button>
      </div>
    </div>
    <common-table :data="table_data" :props="props" :page_info="page_info" @page-change="pageChange">
      <template #image="{ row, index }">
        <common-image class="image-item" fit="cover" :src="row.output.url" width="100%" height="auto"
          :preview_src_list="preview_image_list" :initial_index="index" @sub-click="imageSubClick">
          <el-button type="primary">投稿</el-button>
        </common-image>
      </template>
      <template #image_url="{ row, index }">
        <el-tooltip class="item" effect="dark" :content="row.output.url" placement="top">
          <div class="text-overflow3" v-copy-text="row.output.url" style="max-width: 100%;">
            {{ row.output.url }}
          </div>
        </el-tooltip>
      </template>
      <template #size="{ row }">
        {{ row.size.width }}X{{ row.size.height }}
      </template>
      <template #prompt="{ row }">
        <el-tooltip class="item" effect="dark" :content="row.input.Prompt || row.input.prompt" placement="top">
          <div class="text-overflow3" v-copy-text="row.input.Prompt || row.input.prompt" style="max-width: 100%;">
            {{ row.input.Prompt || row.input.prompt }}
          </div>
        </el-tooltip>
      </template>
      <template #title="{ row }">
        <el-input v-model="row.title" @keyup.enter.native="editItem({ row, key: 'title' })"></el-input>
      </template>
      <template #base_like="{ row }">
        <el-input v-model="row.base_like" @keyup.enter.native="editItem({ row, key: 'base_like' })"></el-input>
      </template>
      <template #user="{ row }">
        <div v-if="row.user&&row.user.avatar_url" class="flex aic jcsb">
          <el-image class="avatar" fit="cover" :src="row.user.avatar_url" :preview-src-list="[row.user.avatar_url]">
          </el-image>
          <div>{{ row.user.nickname || row.user.username }}</div>
        </div>
      </template>
      <el-table-column label="操作" min-width="160" fixed="right" align="center">
        <div slot-scope="{ row }">
          <el-button size="mini" type="text" @click.stop="deleteItem(row)">删除</el-button>
          <el-button size="mini" type="text" @click.stop="putSquareItem(row)">投稿</el-button>
        </div>
      </el-table-column>
    </common-table>
  </div>
</template>
 
<script>
module.exports = {
  name: 'square',
  components: {
    'common-table': 'url:/admin/components/common/common-table.vue',
    'common-image': 'url:/admin/components/common/common-image.vue',
  },
  data: () => {
    return {
      search_title: '',
      order_key: '',
      order_type: '',
      page_info: {
        page_num: 1,
        limit: 10,
        total: 0
      },
      preview_image_list: [],
      table_data: [],
      props: [
        { label: '图片', key: 'image', min_width: 200, slot_name: 'image', },
        { label: '图片路径', key: 'image_url', min_width: 200, slot_name: 'image_url', },
        { label: '尺寸', key: 'size', min_width: 160, slot_name: 'size', },
        { label: '指令', key: 'prompt', min_width: 160, slot_name: 'prompt' },
        { label: '用户', key: 'user', min_width: 160, slot_name: 'user' },
        { label: '创建时间', key: 'createdAt', min_width: 160, filter: 'formateTime' },
        { label: '更新时间', key: 'updatedAt', min_width: 160, filter: 'formateTime' },
      ],
      point_user_info: {},
      add_integration: null,
      current_row: {}
    }
  },
  created() {
    this.pageChange({ page_num: 1, limit: this.page_info.limit })
  },
  methods: {
    pageChange({ page_num = 1, limit = 10 } = {}) {
      this.page_info.page_num = page_num
      this.page_info.limit = limit
      lc.readTotal('KSImage', (q) => {
        if (this.search_title) q.contains('title', this.search_title)
        q.equalTo('status', 1)
        q.include('user')
        q.limit(limit)
        q.skip(limit * (page_num - 1))
        q.descending('createdAt')
      })
        .then(res => {
          let { data, count } = res
          this.page_info.total = count
          if (!data.length && this.search_title) throw { rawMessage: '行为名称查询失败' }
          this.table_data = data.map(i => {
            let item = i.toJSON()
            item.size = this.getSize(item)
            return item
          })
          this.preview_image_list = this.table_data.map(i => i.output.url)
        })
        .catch(err => {
          console.log(err)
          this.$alert(err)
        })
    },
    getSize(item) {
      let { input } = item
      let width = input.width || (input.ResultConfig?.Resolution.split(':')[0]) || 768
      let height = input.height || (input.ResultConfig?.Resolution.split(':')[1]) || 768
      return {
        width,
        height
      }
    },
    deleteItem(row) {
      this.$confirm('确认删除？')
        .then(() => {
          lc.delete('KSImage', row.objectId)
            .then(() => {
              this.pageChange(this.page_info)
            })
            .catch(err => {
              console.log(err)
              this.$alert(err)
            })
        })
    },
    putSquareItem(row) {
      this.$prompt('输入标题', '投稿', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
      }).then(({ value }) => {
        return lc.run('userImageContribute', { 'title': value, 'image_id': row.objectId })
      })
        .then(() => {
          this.$toast('投稿成功,审核后可在广场显示')
        })
        .catch(err => {
          console.log(err)
          err.rawMessage && this.$alert(err)
        })
    },
    imageSubClick({ index }) {
      let row = this.table_data[index]
      this.putSquareItem(row)
    }
  },
}
</script>

<style scoped>
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