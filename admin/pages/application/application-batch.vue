<template>
  <div class="admin-page">
    <div class="flex aic mb-main">
      <common-form :data_list="batch_form_data" :form_data.sync="batch_form" @submit-form="batchApplication"
        confirm_button_text="开始生成"></common-form>
    </div>
    <common-table :data="table_data" :props="props" :page_info="page_info" @page-change="pageChange"
      @edit-item="({ value, key, index }) => editItem({ type: '', value, key, index })">
      <template #result_list="{ row, index }">
        <template v-if="['image2image','text2image'].includes(row.type)&&row.image_list.length">
          <common-image class="image-item" fit="cover" :src="row.image_list[index]" width="100%" height="auto"
            :preview_src_list="row.image_list">
          </common-image>
        </template>
        <template v-if="['chat'].includes(row.type)">
          <div class="flex-c" style="max-height:300px;overflow: auto;">
            <div v-for="answer in row.answer_list" style="white-space: pre-line !important;">
              {{answer}}
            </div>
          </div>
        </template>
      </template>
      <template #result_list_status="{row,index}">
        <div>{{row.result_list.length}}</div>
        <common-table :data="row.result_list" :props="result_props">
          <el-table-column label="序号" :width="100" align="center">
            <div slot-scope="scope">
              {{scope.$index}}
            </div>
          </el-table-column>
          <el-table-column label="操作" :min-width="120" align="center">
            <div slot-scope="scope">
              <el-button size="mini" type="text"
                @click.stop="redoItem({ row:scope.row,application:row.application })">重试</el-button>
            </div>
          </el-table-column>
        </common-table>
      </template>
      <el-table-column label="操作" :min-width="180" fixed="right" align="center">
        <div slot-scope="{ row,$index }">
          <el-button size="mini" type="text" @click.stop="downLoadAll({row})">全部下载</el-button>
          <el-button v-if="['image2image','text2image'].includes(row.type)" size="mini" type="text"
            @click.stop="image2Video({row})">导出视频</el-button>
          <el-button size="mini" type="text" @click.stop="deleteItem({ row,index: $index })">删除</el-button>
        </div>
      </el-table-column>
    </common-table>
  </div>
</template>
 
<script>
module.exports = {
  name: 'application-batch',
  components: {
    'common-table': 'url:/admin/components/common/common-table.vue',
    'common-form': 'url:/admin/components/common/common-form.vue',
    'common-image': 'url:/admin/components/common/common-image.vue',
  },
  data: () => ({
    props: [
      { label: '类型', key: 'type', min_width: 160 },
      { label: '应用', key: 'application', min_width: 160, filter: 'getObjectKey', filterParams: ['name'] },
      { label: '应用id', key: 'application_id', min_width: 160, copytext: true },
      { label: '结果内容', key: 'result_list', min_width: 160, slot_name: 'result_list' },
      { label: '结果状态', key: 'result_list', min_width: 300, slot_name: 'result_list_status' },
    ],
    table_data: [],
    page_info: {
      page_num: 1,
      limit: 10,
      total: 0
    },
    search_form: {
      name: ''
    },
    select_data: {
      // 选择用的数据
    },
    query_data: {
      name: 'contains',
    },
    class_name: 'KSApplicationBatch',
    empty_item: {
      // 默认新增的item信息
    },
    result_props: [
      { label: '状态', key: 'status', min_width: 160, filter: 'formateListLabel', filterParams: [admin_mock_data.select_data.result_status] },
    ],
    batch_form_data: [
      { label: '视频文件', key: 'file', type: 'upload', button_text: '上传视频', accept: 'video/mp4' },
      { label: '应用', key: 'application', type: 'relation', edit_type: 'relation', object_class: 'KSApplication', search_form: { type: 'image' } },
      { label: '图片线条化', key: 'image_handle', type: 'switch' },
    ],
    batch_form: {
      application_id: '',
      file: null,
      application_list: [],
      image_handle: true
    }
  }),
  created() {
    this.pageChange(this.page_info)
  },
  methods: {
    pageChange({ page_num = 1, limit = 10 } = {}, class_name = this.class_name) {
      if (!class_name) return
      this.page_info.page_num = page_num
      this.page_info.limit = limit
      this.$loading()
      lc.readTotal(class_name, (q) => {
        q = this.$setQuery(q, this.search_form, this.query_data)
        q.include(['result_list', 'application'])
        q.limit(limit)
        q.skip(limit * (page_num - 1))
        q.descending('createdAt')
      })
        .then(res => {
          let { data, count } = res
          this.page_info.total = count
          this.table_data = data.map((i, index) => {
            let item = i.toJSON()
            // 处理数据
            let result_list = item.result_list.filter(i => i.status === 1)
            switch (item.type) {
              case 'image2image':
              case 'text2image':
                item.image_list = result_list.map(result => result.output && result.output.url).filter(i => i)
                break
              case 'chat':
                item.answer_list = result_list.map(i => i.answer)
                break
              default:
                break
            }
            return item
          })
          console.log(this.table_data)
        })
        .catch(err => {
          console.log(err)
          this.$alert(err)
        })
        .finally(() => {
          this.$loading().close()
        })
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
    redoItem({ row, application }) {
      let promise
      switch (application.type) {
        case 'image':
          if (!row.application) {
            //  重新运行并替换位置
            promise = lc.run('applicationBatchRedo', { id: row.objectId })
          } else {
            promise = lc.run('imageLeonardoRedo', { id: row.objectId })
          }
          break
        default:
          this.$toast('暂不支持此类型')
          return
      }
      promise
        .then(() => {
          this.$toast('已重新运行,稍后查看结果')
        })
        .catch(err => {
          console.log(err)

        })
    },
    downLoadAll({ row }) {
      switch (row.type) {
        case 'image2image':
        case 'text2image':
          this.downLoadImageList(row.image_list)
          break
        case 'chat':
          this.downloadTextFile(row.answer_list.join('\n\n###\n\n'), `${row.application.name + new Date().getTime()}.txt`)
          break
      }
    },
    async downLoadImageList(list) {
      let index = 0
      for (let url of list) {
        await util.downloadImg(url, `frame-${index + 1}`)
        index++
      }
    },
    downloadTextFile(content, filename = 'a.txt',) {
      const blob = new Blob([content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)

      const a = document.createElement('a')
      a.href = url
      a.download = filename

      // 将链接添加到 DOM 并触发点击事件
      document.body.appendChild(a)
      a.click()

      // 清理临时资源
      URL.revokeObjectURL(url)
      a.remove()
    },
    batchApplication() {
      if (!this.batch_form.file) {
        this.$alert('参数错误')
        return
      }
      this.$loading()
      // 开始处理 视频转图片,视频转音频
      let voice_url, image_list
      this.$videoHandle.getVideoVoice({ video_url: this.batch_form.file, blob_url: false })
        .then(res => {
          voice_url = res
          return this.$videoHandle.convertVideoToFrames({ video_url: this.batch_form.file, frame_rate: 8, blob_url: false ,image_handle:this.batch_form.image_handle})
        })
        .then(res => {
          image_list = res
          let promise_list = [this.uploadBlob(voice_url, new Date().getTime() / 1000 + '.mp3'), ...image_list.map(i => this.uploadBlob(i, new Date().getTime() / 1000 + '.png'))]
          return Promise.all(promise_list)
        })
        .then(res => {
          let [voice_file, ...image_file_list] = res
          let data = {
            type: 'image2image',
            url_list: image_file_list.map(i => i.get('url')),
            application_id: this.batch_form.application_id || '64df2fd190d2ff4d11f0184a',
            handle_params: {
              voice_url: voice_file.get('url')
            }
          }
          return lc.run('applicationBatch', data)
        })
        .then(res => {
          this.pageChange(this.page_info)
        })
        .catch(err => {
          console.log(err)
        })
        .finally(() => {
          this.$loading().close()
        })
    },
    image2Video({ row }) {
      this.$loading()
      console.time('image2Video')
      this.$videoHandle.convertImagesToVideo({ image_paths: row.image_list, fps: 8, image_type: 'jpg' })
        .then(res => {
          let voice_url = row.handle_params && row.handle_params.voice_url
          if (voice_url) {
            return this.$videoHandle.addVideoVoice({ video_url: res, voice_url })
          } else {
            return Promise.resolve(res)
          }
        })
        .then(res => {
          util.downloadBlobUrl(res, 'output.mp4')
          // return this.$videoHandle.reverseVideoAndAudio({ video_url: res })
        })
        .catch(err => {
          console.log(err)
        })
        .finally(() => {
          this.$loading().close()
          console.timeEnd('image2Video')
        })
    },
    uploadBlob(blob_url, filename) {
      const reader = new FileReader()
      return new Promise((resolve, reject) => {
        reader.onload = (event) => {
          const base64 = event.target.result
          lc.upload(base64, filename)
            .then(res => {
              resolve(res)
            })
            .catch(err => {
              reject(err)
            })
        }
        reader.readAsDataURL(blob_url)
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