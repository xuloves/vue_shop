<template>
  <div>
    <!--面包屑导航-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图-->
    <el-card class="box-card">
      <!--搜索添加区域-->
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input placeholder="请输入内容" clearable @clear="getUserList" v-model="queryInfo.query"
                    class="input-with-select">
            <el-button slot="append" @click="getUserList" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible=true">添加用户</el-button>
        </el-col>
      </el-row>
      <!--用户列表区域-->
      <el-table border stripe
                :data="userList"
                style="width: 100%">
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch @change="userStateChange(scope.row)"
                       v-model="scope.row.mg_state"
                       active-color="#13ce66"
                       inactive-color="#ff4949">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <!--修改按钮-->
            <el-button type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.id)" size="mini"></el-button>
            <!--删除按钮-->
            <el-button @click="removeUserById(scope.row.id)" type="danger" icon="el-icon-delete"
                       size="mini"></el-button>
            <!--分配角色-->
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button @click="setRole(scope.row)" type="warning" icon="el-icon-setting" size="mini"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!--分页区域-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
    <!--添加用户对话框-->
    <el-dialog
      title="添加用户"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed">
      <!--主体-->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input type="password" v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="addDialogVisible= false">取 消</el-button>
    <el-button type="primary" @click="addUser">确 定</el-button>
  </span>
    </el-dialog>
    <!--修改用户对话框-->
    <el-dialog
      title="修改用户"
      @close="editDialogClose"
      :visible.sync="editDialogVisible"
      width="50%">
      <el-form :model="editForm" :rules="editFormrules" ref="editFormRef" label-width="70px">
        <el-form-item label="用户名">
          <el-input disabled v-model="editForm.username"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="editDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editUserInfo">确 定</el-button>
  </span>
    </el-dialog>
    <!--分配角色对话框-->
    <el-dialog
      title="分配角色"
      :visible.sync="setRoleDialogVisible"
      @close="setRoleDialogClosed"
      width="50%">
      <div>
        <p>当前用户：{{userInfo.username}}</p>
        <p>当前角色：{{userInfo.role_name}}</p>
        <p>分配角色：
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option
              v-for="item in rolesList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id">
            </el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
    <el-button @click="setRoleDialogVisible= false">取 消</el-button>
    <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    data () {
      // 验证邮箱的规则
      const checkEmail = (rule, value, cb) => {
        // 验证邮箱的正则表达式
        const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
        if (regEmail.test(value)) {
          // 合法的邮箱
          return cb()
        }
        cb(new Error('请输入合法的邮箱'))
      }

      // 验证手机号的规则
      const checkMobile = (rule, value, cb) => {
        // 验证手机号的正则表达式
        const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
        if (regMobile.test(value)) {
          return cb()
        }
        cb(new Error('请输入合法的手机号'))
      }

      return {
        //获取用户列表参数
        queryInfo: {
          query: '',
          pagenum: 1,
          pagesize: 2
        },
        userList: [],
        total: 0,
        //隐藏对话框
        addDialogVisible: false,
        setRoleDialogVisible: false,
        editDialogVisible: false,
        /*已经选中角色*/
        selectedRoleId: [],
        /*所有角色数据*/
        rolesList: [],
        /*需要分配权限的用户信息*/
        userInfo: {},
        //查询到的用户信息
        editForm: {},
        addForm: {
          username: '',
          password: '',
          email: '',
          mobile: ''
        },
        editFormrules: {
          email: [{
            required: true,
            validator: checkEmail,
            trigger: 'blur'
          }],
          mobile: [{
            required: true,
            validator: checkMobile,
            trigger: 'blur'
          }]
        },
        addFormRules: {
          username: [{
            required: true,
            message: '请输入用户名',
            trigger: 'blur'
          },
            {
              min: 3,
              max: 10,
              message: '长度在 3 到 10 个字符',
              trigger: 'blur'
            }],
          password: [{
            required: true,
            message: '请输入密码',
            trigger: 'blur'
          },
            {
              min: 6,
              max: 15,
              message: '长度在 6 到 15 个字符',
              trigger: 'blur'
            }],
          email: [{
            required: true,
            validator: checkEmail,
            trigger: 'blur'
          }],
          mobile: [{
            required: true,
            validator: checkMobile,
            trigger: 'blur'
          }]
        }
      }

    },
    created () {
      this.getUserList()
    },
    methods: {
      /*获取所有用户*/
      async getUserList () {
        const { data: res } = await this.$http.get('users', {
          params: this.queryInfo
        })
        if (res.meta.status !== 200) return this.$message.error('获取用户列表失败！')
        this.userList = res.data.users
        this.total = res.data.total
      },
      //监听pagesize改变
      handleSizeChange (newpageSize) {
        this.queryInfo.pagesize = newpageSize
        this.getUserList()

      },
      //监听页码值改变
      handleCurrentChange (newpageNum) {
        this.queryInfo.pagenum = newpageNum
        this.getUserList()
      },
      //监听switch状态改变
      async userStateChange (userinfo) {
        const { data: res } = await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
        if (res.meta.status !== 200) {
          userinfo.mg_state = !userinfo.mg_state
          return this.$message.error('更新用户状态失败')
        }
        this.$message.success('更新用户状态成功！')
      },
      /*监听对话框关闭*/
      addDialogClosed () {
        this.$refs.addFormRef.resetFields()
      },
      /*添加用户*/
      addUser () {
        this.$refs.addFormRef.validate(async valid => {
          if (!valid) return
          const { data: res } = await this.$http.post('users', this.addForm)
          if (res.meta.status !== 201) return this.$message.error('添加用户失败')
          this.$message.success('添加用户成功')
          //隐藏对话框
          this.addDialogVisible = false
          //刷新列表
          await this.getUserList()
        })
      },
      /*编辑用户对话框*/
      async showEditDialog (id) {
        const { data: res } = await this.$http.get('users/' + id)
        if (res.meta.status !== 200) return this.$message.error('查询用户失败！')
        this.editForm = res.data
        this.editDialogVisible = true

      },
      /*关闭编辑用户对话框*/
      editDialogClose () {
        this.$refs.editFormRef.resetFields()
      },
      /*编辑用户信息并提交*/
      editUserInfo () {
        this.$refs.editFormRef.validate(async valid => {
          if (!valid) return
          const { data: res } = await this.$http.put('users/' + this.editForm.id, {
            email: this.editForm.email,
            mobile: this.editForm.mobile
          })
          if (res.meta.status !== 200) return this.$message.error('更新用户信息失败')
          this.$message.success('更新用户成功')
          //隐藏对话框
          this.addDialogVisible = false
          //刷新列表
          await this.getUserList()
        })
      },
      /*删除用户*/
      async removeUserById (id) {
        const confimResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        //取消,cancel
        if (confimResult !== 'confirm') {
          return this.$message.info('你已取消')
        }
        //确认,confirm
        const { data: res } = await this.$http.delete('users/' + id)
        if (res.meta.status !== 200) return this.$message.error('删除用户失败')
        this.$message.success('删除用户成功')
        //刷新列表
        await this.getUserList()

      },
      /*展示分配权限*/
      async setRole (userInfo) {
        this.userInfo = userInfo
        const { data: res } = await this.$http.get('roles')
        if (res.meta.status !== 200) return this.$message.error('获取角色列表失败')
        this.rolesList = res.data
        this.setRoleDialogVisible = true

      },
      /*分配角色*/
      async saveRoleInfo () {
        if (!this.selectedRoleId) {
          return this.$message.error('请选择要分配角色')
        }
        const { data: res } = await this.$http.put(`users/${this.userInfo.id}/role`, {
          rid: this.selectedRoleId
        })
        if (res.meta.status !== 200) return this.$message.error('更新角色失败')
        this.$message.success('更新角色成功')
        await this.getUserList()
        this.setRoleDialogVisible = false
      },
      /*监听分配角色对话框关闭*/
      setRoleDialogClosed () {
        this.userInfo = []
        this.selectedRoleId = []
      }

    }

  }
</script>

<style lang="less" scoped>

</style>
