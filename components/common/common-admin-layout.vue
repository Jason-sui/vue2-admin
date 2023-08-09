<template>
  <el-container class="w-100 h-100 mh-100">
    <el-aside width="200px" class="bg-white">
      <el-menu :default-active="menu_index" :unique-opened="true">
        <template v-for="(item, index) in menu_list">
          <el-submenu v-if="item.children" :index="`${index}`" :key="index">
            <template slot="title">
              <i :class="item.icon"></i>
              <span>{{ item.title }}</span>
            </template>
            <el-menu-item v-for="(child_item, child_index) in item.children" :index="`${index}-${child_index}`"
              :key="child_item.view_name" @click="menuClick(child_item.path,`${index}-${child_index}`)">
              <template slot="title">
                <i :class="child_item.icon"></i>
                <span>{{ child_item.title }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
          <el-menu-item v-else :index="`${index}`" :key="index" @click="menuClick(item.path,`${index}`)">
            <template slot="title">
              <i :class="item.icon"></i>
              <span>{{ item.title }}</span>
            </template></el-menu-item>
        </template>
      </el-menu>
    </el-aside>
    <el-main>
      <KeepAlive>
        <router-view></router-view>
      </KeepAlive>
    </el-main>
  </el-container>
</template>
 
<script>
export default {
  name: "APP",
  data: () => ({
    menu_index: '0',
    menu_list: [
      {
        icon: 'el-icon-setting',
        title: '默认页面',
        children: [
          { icon: 'el-icon-setting', title: '默认页面(旧)', path: '/template-page' },
        ]
      },
      { icon: 'el-icon-school', title: '教程中心', path: '/' },
    ],
    view_name: '',
    current_path: ''
  }),
  computed: {

  },
  watch: {
    '$route.path': {
      handler(path) {
        this.current_path = path
        this.menu_index = this.getMenuIndex(this.menu_list, path)
      },
      immediate: true
    }
  },
  created() {

  },
  methods: {
    menuClick(path) {
      if (this.current_path !== path) this.$router.push(path)
    },
    getMenuIndex(list, path) {
      for (let i = 0; i < list.length; i++) {
        const item = list[i]
        if (item.path === path) {
          return `${i}`
        } else if (item.children) {
          const child_index = this.getMenuIndex(item.children, path)
          if (child_index !== '') {
            return `${i}-${child_index}`
          }
        }
      }
      return ''
    }
  },
}
</script>
 
<style scoped>
</style>