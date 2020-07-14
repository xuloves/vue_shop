import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login'
import Home from '../components/Home'
import Welcome from '../components/Welcome'
import Users from '../components/user/Users'

Vue.use(VueRouter)

const routes = [{
  path: '/login',
  component: Login
}, {
  path: '/',
  redirect: '/login'
}, {
  path: '/home',
  component: Home,
  redirect: '/welcome',
  children: [
    {
      path: '/welcome',
      component: Welcome
    }, {
      path: '/users',
      component: Users
    }
  ]
}]

const router = new VueRouter({
  routes
})
/*路由导航守卫,未登录则跳转登录页*/
router.beforeEach((to, from, next) => {
    //to:访问哪个路径，from:从哪里来，next:放行函数
    if (to.path === '/login') return next()
    //获取token
    const token = window.sessionStorage.getItem('token')
    //无token,未登录
    if (!token) return next('/login')
    next()
  }
)

export default router
