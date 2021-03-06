import Vue from 'vue'
import {
  Button, Input, Form, FormItem, Message,
  Container, Aside, Header, Main,
  Menu, Submenu, MenuItem, Breadcrumb, BreadcrumbItem,
  Card, Row, Col, Table, TableColumn, Switch,
  Tooltip, Pagination,Dialog,MessageBox,Tag,
  Tree,Select,Option,Cascader
} from 'element-ui'

Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
Vue.use(Container)
Vue.use(Aside)
Vue.use(Header)
Vue.use(Main)
Vue.use(MenuItem)
Vue.use(Menu)
Vue.use(Submenu)
Vue.use(Breadcrumb)
Vue.use(BreadcrumbItem)
Vue.use(Card)
Vue.use(Card)
Vue.use(Row)
Vue.use(Col)
Vue.use(TableColumn)
Vue.use(Table)
Vue.use(Switch)
Vue.use(Tooltip)
Vue.use(Pagination)
Vue.use(Dialog)
Vue.use(Tag)
Vue.use(Tree)
Vue.use(Select)
Vue.use(Option)
Vue.use(Cascader)
/*挂载弹框组件*/
Vue.prototype.$message = Message
Vue.prototype.$confirm = MessageBox.confirm
