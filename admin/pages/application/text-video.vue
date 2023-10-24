<template>
  <div class="admin-page">
    <div class="flex aic mb-main">
      <common-form :data_list="batch_form_data" :form_data.sync="batch_form" :select_data="select_data"
        @submit-form="handleText" confirm_button_text="开始处理"></common-form>
    </div>
    <common-table :data="table_data" :props="props" :page_info="page_info" @page-change="pageChange"
      @edit-item="({ value, key, index }) => editItem({ type: '', value, key, index })">
      <template #result_list_status="{row,index}">
        <div>{{row.result_list.length}}</div>
        <common-table :data="row.result_list" :props="result_props">
          <template #result_image="scope">
            <el-image v-if="scope.row.status===1" class="width:100%;" :src="scope.row.output.url"></el-image>
          </template>
          <template #result_text="scope">
            <el-tooltip class="item" effect="dark" placement="top">
              <div slot="content"
                style="white-space: pre-line !important;max-width:300px;max-height:60vh;overflow-y: scroll;">
                {{row.input.text_list[scope.index]}}
              </div>
              <div class="text-overflow3" v-copy-text style="max-width: 100%;">
                {{row.input.text_list[scope.index]}}
              </div>
            </el-tooltip>
          </template>
          <template #result_voice="scope">
            <audio v-if="row.handle_params.voice_list&&row.handle_params.voice_list[scope.index]" class="w-100"
              :src="row.handle_params.voice_list[scope.index]" controls></audio>
          </template>
          <el-table-column label="序号" :width="100" align="center">
            <div slot-scope="scope">
              {{scope.$index}}
            </div>
          </el-table-column>
          <el-table-column label="操作" :min-width="120" align="center">
            <div slot-scope="scope">
              <el-button size="mini" type="text"
                @click.stop="redoItem({ row:scope.row,application:row.application })">图片重试</el-button>
            </div>
          </el-table-column>
        </common-table>
      </template>
      <el-table-column label="操作" :min-width="180" fixed="right" align="center">
        <div slot-scope="{ row,$index }">
          <el-button size="mini" type="text" @click.stop="deleteItem({ row,index: $index })">删除</el-button>
          <el-button size="mini" type="text" @click.stop="handleVideo({ row })">合成视频</el-button>
        </div>
      </el-table-column>
    </common-table>
  </div>
</template>
 
<script>
module.exports = {
  name: 'voice-video',
  components: {
    'common-table': 'url:/admin/components/common/common-table.vue',
    'common-form': 'url:/admin/components/common/common-form.vue',
    'common-image': 'url:/admin/components/common/common-image.vue',
  },
  data: () => ({
    class_name: 'KSApplicationBatch',
    props: [
      { label: '绘图应用', key: 'application', min_width: 160, filter: 'getObjectKey', filterParams: ['name'] },
      { label: '结果状态', key: 'result_list', min_width: 800, slot_name: 'result_list_status' },
    ],
    table_data: [],
    page_info: {
      page_num: 1,
      limit: 10,
      total: 0
    },
    result_props: [
      { label: '图片状态', key: 'status', min_width: 160, filter: 'formateListLabel', filterParams: [admin_mock_data.select_data.result_status] },
      { label: '图片', key: 'image', min_width: 160, slot_name: 'result_image' },
      { label: '文本内容', key: 'text', min_width: 160, slot_name: 'result_text' },
      { label: '声音', key: 'voice', min_width: 300, slot_name: 'result_voice' },
    ],
    batch_form_data: [
      { label: '声音', key: 'voice', type: 'select', },
      { label: '绘图应用', key: 'application', type: 'relation', edit_type: 'relation', object_class: 'KSApplication', search_form: { type: 'image' } },
      { label: '内容', key: 'content', type: 'textarea', },
    ],
    select_data: {
      voice: [{ label: "童话故事女", value: "童话故事女" },
      { label: "影视男性", value: "影视男性" },
      { label: "网络小说", value: "网络小说" },
      { label: "童话故事", value: "童话故事" },
      { label: "百家讲坛", value: "百家讲坛" },
      { label: "老年故事", value: "老年故事" },
      { label: "科普女性", value: "科普女性" },
      { label: "吴侬软语", value: "吴侬软语" },
      { label: "台湾女孩", value: "台湾女孩" },
      { label: "粤语", value: "粤语" },
      { label: "粤语女", value: "粤语女" },
      { label: "粤语女孩", value: "粤语女孩" },
      { label: "陕西女", value: "陕西女" },]
    },
    batch_form: {
      content: `徐娜紧紧地握着手中的小刀，汗水顺着她的额头滴落在地上。她蜷缩在黑暗的角落里，呼吸急促，心脏狂跳不止。四周的寂静被突如其来的风声打破，使得她整个人都猛地一颤。
刚刚还在阳光明媚的村庄，徐娜不知怎么被带到了这个阴森恐怖的地方。她记得自己只是在家中读书，突然一股强大的旋风将她卷走，接着她就发现自己置身于这片荒凉的土地上。四周一片黑暗，只有月光勉强照亮了她的周围，但也只够让她看清自己的手指。
徐娜试图寻找出口，然而她发现自己仿佛置身于一个无底的迷宫中。走了许多步，她发现自己回到了起点。恐惧在她心中蔓延，但她知道只有继续前进才能找到答案。于是，她继续前行，小心翼翼地踩着地面，生怕触动什么陷阱。
突然，她听到了一阵微弱的呻吟声。徐娜立刻停下脚步，耳朵紧贴地面，努力听清楚。呻吟声越来越清晰，似乎是从前方的一个小洞中传来的。徐娜犹豫了一下，然后决定慢慢地趴下，试图通过洞口看清楚里面的情况。
洞内充满了阴冷的气息，墙壁上的青苔显露出岁月的痕迹。徐娜透过洞口，发现了一个令人毛骨悚然的景象：一个人影蜷缩在墙角，全身浑身是血，但奇怪的是，他的呻吟声却带着一种奇异的愉悦。
徐娜感到一阵寒意，她几乎要从洞口退缩出去。然而，在她即将离开时，那个浑身是血的人影突然抬起头，狰狞的面孔映入她的眼帘。徐娜瞪大了眼睛，差点发出了惊叫。
“帮...帮我...”那人影的声音嘶哑而诡异，仿佛是从地狱中传来的。
徐娜感到一股无法抗拒的冲动，她的手自发地将小刀递给了那个人影。那人影的嘴角扯出一个扭曲的笑容，嘴里发出一阵阵令人毛骨悚然的笑声。然后，他迅速将小刀刺向自己的胸口，鲜血瞬间喷涌而出，弄得徐娜满脸都是。
徐娜惊恐地退后几步，却发现自己无法移开视线。那个人影的眼神变得越来越空洞，仿佛失去了灵魂，但他的笑声却越来越大，越来越疯狂。
“你...你为什么这样做？”徐娜结结巴巴地问道，声音中充满了恐惧和不解。
那个人影突然停止了笑声，他的眼睛死死地盯着徐娜，嘴角扯出一个扭曲的笑容：“因为...这是唯一的出路。”
徐娜感到一阵头晕目眩，仿佛被什么恶劣的力量吸引着。她的手不受控制地举起小刀，渐渐靠近了自己的胸口。她努力挣扎，但就像是有一只无形的手在控制着她一样，她无法抵抗。
就在小刀即将刺入她的胸口的那一刻，一道明亮的闪电划过夜空，紧接着是一声巨响。徐娜猛地感到一股强大的力量将她推开，小刀从她手中飞出，在地上发出清脆的声响。
徐娜狼狈地跌坐在地上，呼吸急促，心脏还在剧烈地跳动着。她抬起头，发现眼前站着一个身穿黑袍的人，脸上被一个面具遮住，只露出一双深邃的眼眸。
“不要害怕，你已经安全了。”那个黑袍人的声音平静而温和。
徐娜艰难地点了点头，她的喉咙像是被什么东西堵住了一样，一时间无法说话。
“这个地方充满了诡异的力量，许多人都在这里迷失了自己。”黑袍人缓缓地说道，“但你有勇气抵抗，你还有未完成的使命。”
徐娜疑惑地看着黑袍人，心中涌现出无数个问题，但她却不知道从何开始问起。
黑袍人伸出一只苍白的手，轻轻地碰触了她的额头，一股温暖的能量瞬间传遍她的全身。徐娜的记忆逐渐恢复，她想起了自己是一名神秘组织的成员，正在追寻一件能够打破诅咒的宝物。
“你必须找到那件宝物，它是唯一能够拯救这片土地的希望。”黑袍人说道，“但在此之前，你必须战胜自己内心的恐惧。”
徐娜点了点头，她感到一股坚定的力量在心中涌起。她知道自己不能被这片阴森恐怖的土地所吞噬，她必须坚强地前行，找到那件宝物，解开这里的诅咒。
于是，徐娜重新站起身，她的眼神中充满了决心。黑袍人微微一笑，然后消失在了夜色中，只留下一阵微风，轻轻拂过徐娜的脸庞。
徐娜深吸了一口气，转身走向迷宫的深处。黑暗再次笼罩了她的身影，但这一次，她不再畏惧，因为她知道，内心的光芒将会引导她找到光明的出口`,
      voice: '',
      application_id: '',
      application_list: [],
    }
  }),
  created() {
    this.pageChange(this.page_info)
  },
  methods: {
    handleText() {
      let text_list = this.batch_form.content.split('\n')
      console.log(text_list)
      let voice = this.batch_form.voice
      let promise_list = text_list.map((i) => lc.run('azureText2Audio', { content: i, voice_role: voice }))
      Promise.all(promise_list)
        .then(res => {
          let data = {
            type: 'text2image',
            text_list,
            application_id: this.batch_form.application_id || '64ac18525d666b1e29d5c5f2',
            handle_params: {
              voice,
              voice_list: res.map(i => (!window.is_dev ? 'https://kslcengine.kvker.com/' : 'https://stg-kslcengine.kvker.com/') + i.data)
            }
          }
          console.log(data)
          return lc.run('applicationBatch', data)
        })
        .then(res => {
          console.log(res)
        })
    },
    pageChange({ page_num = 1, limit = 10 } = {}, class_name = this.class_name) {
      if (!class_name) return
      this.page_info.page_num = page_num
      this.page_info.limit = limit
      this.$loading()
      lc.readTotal(class_name, (q) => {
        q = this.$setQuery(q, this.search_form, this.query_data)
        q.include(['result_list', 'application'])
        q.equalTo('type', 'text2image')
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
    handleVideo({ row }) {
      this.$loading()
      console.time('voiceImage2Video')
      let voice_urls = row.handle_params.voice_list
      let image_urls = row.image_list
      voice_urls.length = 3
      image_urls.length = 3
      this.$videoHandle.composeAudioAndImages({ voice_urls, image_urls, image_type: 'jpg' })
        .then(res => {
          util.downloadBlobUrl(res, 'output.mp4')
        })
        .catch(err => {
          console.log(err)
        })
        .finally(() => {
          this.$loading().close()
          console.timeEnd('voiceImage2Video')
        })
    }
  },
}
</script>
 
<style scoped>
</style>