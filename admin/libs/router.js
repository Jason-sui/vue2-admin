const routes = [
  {
    path: '/', title: '首页',
    icon: 'el-icon-menu',
    component: httpVueLoader('./pages/index.vue')
  },
]

const router = new VueRouter({
  routes,
})

router.beforeEach((to, from, next) => {
  /* 路由发生变化修改页面title */
  if (to.meta.title) {
    document.title = '一步AI' + to.meta.title
  }
  next()
})