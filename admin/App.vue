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
module.exports = {
  data: () => ({
    menu_index: '',
    menu_list: [
    ],
    view_name: '',
    current_path: '',
    user_roles: [],
  }),
  computed: {
    user() {
      return lc.currentUser()
    },
  },
  watch: {
    '$route.path': {
      handler(path) {
        this.getMenuSet(path)
      },
      immediate: true
    }
  },
  created() {
    if (!this.user) {
      this.userError()
    } else {
      const role_query = new AV.Query(AV.Role)
      role_query.equalTo('users', this.user).include('permission_list').find()
        .then((roles) => {
          if (!roles.length) {
            this.userError()
          } else {
            this.user_roles = roles.map(i => i.get('name'))
            this.getRoutes()
          }
        }).catch((error) => {
          console.log(error)
          // 处理错误
          this.userError()
        })
    }
  },
  methods: {
    getRoutes() {
      lc.read('KSAdminRoute', (q) => {
        q.doesNotExist('parent')
        q.include(['children', 'parent', 'permission_list'])
        q.ascending('sort')
        q.addDescending('createdAt')
      })
        .then(res => {
          let routes = []
          res.forEach(i => {
            let item = i.toJSON()
            // 处理数据
            item.children = item.children.filter(children_item => children_item && children_item.page_path && this.hasPermissionRoute(children_item))
            item = this.getItemRoute(item)
            if (this.hasPermissionRoute(item)) {
              routes.push(item)
            }
          })
          this.$router.addRoutes(routes)
          this.menu_list = routes
          this.getMenuSet()
        })
        .catch(err => {
          console.log(err)
          this.$alert(err)
        })
    },
    getItemRoute(item) {
      if (item.children.length) {
        item.path = ''
        item.component = { template: `<router-view></router-view>` }
        item.children = item.children.map(i => {
          return {
            ...i,
            meta: {
              title: i.title
            },
            path: `/${i.name}`,
            component: httpVueLoader(i.page_path)
          }
        })
      } else {
        item.meta = {
          title: item.title
        }
        if (!item.page_path) {
          delete item.children
          return { ...item, path: '' }
        }
        item.path = `/${item.name}`
        item.component = httpVueLoader(item.page_path)
        delete item.children
      }
      return item
    },
    userError() {
      window.location.href = '/'
    },
    menuClick(path) {
      if (this.current_path !== path) this.$router.push(path)
    },
    getMenuSet(path = this.$route.path) {
      this.current_path = path
      this.menu_index = this.getMenuIndex(this.menu_list, path)
    },
    hasPermissionRoute(item) {
      if (this.user_roles.includes('super_admin')) return true
      let page_permission_item = item.permission_list.find(i => i.type === 'page')
      return !item.permission_list.length || !page_permission_item || (page_permission_item.roles.some(i => this.user_roles.includes(i)))
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