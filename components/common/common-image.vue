<template>
  <div class="cus-image" :style="width + ';' + height">
    <el-image style="width: 100%; height: 100%" :src="src" :fit="fit" :alt="alt" :referrerPolicy="referrerPolicy"
      :zIndex="zIndex" :preview-src-list="preview_src_list" :initial-index="initial_index" @click="cusPreviewImage">
    </el-image>
    <span class="el-image-viewer__btn el-image-viewer__download" :style="{ 'z-index': button_zindex }" v-show="dn_flag"
      @click="clickSubButton">
      <slot></slot>
    </span>
  </div>
</template>
<script>
export default  {
  name: "cusImage",
  data() {
    return {
      button_zindex: 2001,
      dn_flag: false,
      wrapper_elem: null,
      hid_el_class_name_lists: [
        "el-image-viewer__mask",
        "el-image-viewer__btn el-image-viewer__close",
        "el-icon-close",
      ],
    };
  },
  props: {
    src: {
      type: String,
      default: "",
    },
    preview_src_list: {
      type: Array,
      default: function () {
        return []
      },
    },
    initial_index: {
      type: Number,
      default: () => 0
    },
    width: {
      type: String,
      default: "100%",
    },
    height: {
      type: String,
      default: "100%",
    },
    fit: {
      type: String,
      default: "",
    },
    alt: {
      type: String,
      default: "",
    },
    referrerPolicy: {
      type: String,
      default: "",
    },
    zIndex: {
      type: Number,
      default: 2000,
    },
  },
  methods: {
    cusPreviewImage() {
      this.dn_flag = true
      this.checkElemlents()
    },
    checkElemlents() {
      this.$nextTick(() => {
        let wrapper = document.getElementsByClassName(
          "el-image-viewer__wrapper"
        )
        if (wrapper.length > 0) {
          this.wrapper_elem = wrapper[0]
          console.log(this.wrapper_elem)
          this.button_zindex = +this.wrapper_elem.style['z-index'] + 10
          this.cusClickHandler()
        } else {
          this.checkElemlents()
        }
      })
    },
    cusClickHandler() {
      this.wrapper_elem.addEventListener("click", this.hideCusBtn)
    },
    hideCusBtn(e) {
      let className = e.target.className
      if (this.hid_el_class_name_lists.includes(className)) {
        this.dn_flag = false
      }
    },
    clickSubButton() {
      let current_img = this.wrapper_elem.querySelector('.el-image-viewer__canvas img')
      let src = current_img.src
      let index = this.preview_src_list.findIndex(i => i === src)
      console.log(index)
      this.$emit('sub-click', { index })
    }
  },
}
</script>
<style>
.cus-image {
  display: inline-block;
  width: 100%;
}

.el-image-viewer__download {
  position: fixed;
  display: flex;
  align-items: center;
  height: 40px;
  top: 40px;
  right: 100px;
  z-index: 2010;
}
</style>