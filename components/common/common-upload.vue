<template>
  <div class="image-box" :style="{ height }">
    <div class="flex aic mb-4">
      <el-input v-model="image_url" class="f1" placeholder="网络地址" @blur="urlImageChange">
      </el-input>
      <el-upload class="upload-box" :limit="limit" :show-file-list="false" :on-success="handleUploadSuccess"
        :before-upload="beforeUpload" :http-request="customUpload">
        <el-button type="primary">上传</el-button>
      </el-upload>
    </div>
    <el-image v-if="url && url.startsWith('http')" class="image-item mr-half" :src="url" fit="contain"
      :preview-src-list="[url]"></el-image>
  </div>
</template>
<script>
module.exports = {
  props: {
    limit: {
      type: Number,
      default: () => 1
    },
    limit_size: {
      type: Number,
      default: () => 100
    },
    url: {
      type: String,
      default: () => ''
    },
    height: {
      type: String,
      default: () => '80px'
    },
  },
  data() {
    return {
      file_list: [],
      image_url: ''
    }
  },
  watch: {
    url(val) {
      this.file_list = [{ url: val }]
    }
  },
  mounted() {
    this.file_list = [{ url: this.url }]
    this.image_url = this.url
  },
  methods: {
    beforeAvatarUpload(file) {
      const isJPG = file.type === 'image/jpeg'
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isJPG) {
        this.$message.error('上传头像图片只能是 JPG 格式!')
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!')
      }
      return isJPG && isLt2M
    },
    beforeUpload(file) {
      // 在上传之前执行一些校验或处理逻辑
      const is_jpg = file.type === 'image/jpeg' || file.type === 'image/png'
      const is_lt100_kb = (file.size / 1024) < this.limit_size
      if (!is_jpg) {
        this.$alert('只能上传jpg/png文件')
      }
      if (!is_lt100_kb) {
        this.$alert(`文件大小不能超过${this.limit_size}KB`)
      }
      if (is_jpg && is_lt100_kb) {
        const reader = new FileReader()

        return new Promise((resolve, reject) => {
          reader.onload = (event) => {
            const base64 = event.target.result
            file.base64 = base64
            resolve(file)
          }
          reader.readAsDataURL(file)
        })
      } else {
        return false
      }
    },
    urlImageChange() {
      // 上传成功后的处理逻辑
      this.$emit('update:url', this.image_url)
      this.$emit('change', this.image_url)
    },
    handleUploadSuccess(response) {
      // 上传成功后的处理逻辑
      this.image_url = response.url
      this.$emit('update:url', response.url)
      this.$emit('change', response.url)
    },
    handleUploadError(err) {
      console.log(err)
      this.$alert('上传失败')
    },
    customUpload({ file }) {
      // 返回一个Promise对象
      return lc.upload(file.base64)
        .then((ret) => {
          return ret.toJSON()
        })
    },
  },
}
</script>
<style scoped>
.image-box {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.image-item {
  height: 100%;
}
</style>
