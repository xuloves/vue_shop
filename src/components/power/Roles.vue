<template>
  <div>
    <!--面包屑导航-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图-->
    <el-card class="box-card">
      <el-row>
        <el-col>
          <el-button type="primary" @click="addDialogVisible=true">添加角色</el-button>
        </el-col>
      </el-row>
      <el-table border stripe
                :data="rolesList"
                style="width: 100%">
        <!--展开列-->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row v-for="(item1,i1) in scope.row.children" :key="item1.id"
                    :class="['bdbottom',i1===0?'bdtop':'','vcenter']">
              <!--渲染一级权限-->
              <el-col :span="5">
                <el-tag @close="removeRightById(scope.row,item1.id)" closable>{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!--渲染二、三级权限-->
              <el-col :span="19">
                <el-row v-for="(item2,i2) in item1.children" :key="item2.id"
                        :class="['bdbottom',i2===0?'bdtop':'','vcenter']">
                  <el-col :span="6">
                    <el-tag @close="removeRightById(scope.row,item2.id)" closable type="success">{{item2.authName}}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag @close="removeRightById(scope.row,item3.id)" closable type="warning"
                            v-for="(item3,i3) in item2.children"
                            :key="item3.id" :class="['bdbottom',i3===0?'bdtop':'']">{{item2.authName}}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!--索引列-->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <!--搜索-->
            <el-button type="primary" icon="el-icon-edit" size="mini">搜索</el-button>
            <!--删除按钮-->
            <el-button type="danger" icon="el-icon-delete"
                       size="mini">删除
            </el-button>
            <!--分配角色-->
            <el-button @click="showSetRightDialog(scope.row)" type="warning" icon="el-icon-setting" size="mini">分配权限
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!--添加角色对话框-->
    <el-dialog
      title="添加角色"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed">
      <!--主体-->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="addDialogVisible= false">取 消</el-button>
    <el-button type="primary" @click="addRole">确 定</el-button>
  </span>
    </el-dialog>
    <!--分配权限对话框-->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="setRightsDialogClosed ">
      <el-tree show-checkbox node-key="id" ref="treeRef" :data="rightsList" :props="treeProps" default-expand-all
               :default-checked-keys="defKeys"></el-tree>
      <span slot="footer" class="dialog-footer">
    <el-button @click="setRightDialogVisible= false">取 消</el-button>
    <el-button type="primary" @click="allotRights">确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>
<script>
  export default {
    data () {
      return {
        roleId: '',
        defKeys: [],
        /*所有角色*/
        rolesList: [],
        /*树形控件属性*/
        treeProps: {
          label: 'authName',
          children: 'children'
        },
        /*所有权限*/
        rightsList: [],
        addDialogVisible: false,
        setRightDialogVisible: false,
        addForm: {
          roleName: '',
          roleDesc: ''
        },
        addFormRules: {
          roleName: [{
            required: true,
            message: '请输入角色名',
            trigger: 'blur'
          },
            {
              min: 3,
              max: 8,
              message: '长度在 3 到 8 个字符',
              trigger: 'blur'
            }]
        }
      }
    },
    created () {
      this.getRolesList()
    },
    methods: {
      /*获取所有角色列表*/
      async getRolesList () {
        const { data: res } = await this.$http.get('roles')
        if (res.meta.status !== 200) return this.$message.error('获取角色列表失败')
        this.rolesList = res.data

      },
      /*监听角色对话框关闭*/
      addDialogClosed () {
        this.$refs.addFormRef.resetFields()
      },
      /*监听权限对话框关闭*/
      setRightsDialogClosed () {
        this.defKeys = []
      },
      /*添加角色*/
      addRole () {
        this.$refs.addFormRef.validate(async valid => {
          if (!valid) return
          const { data: res } = await this.$http.post('roles', this.addForm)
          if (res.meta.status !== 201) return this.$message.error('添加角色失败')
          this.$message.success('添加角色成功')
          //隐藏对话框
          this.addDialogVisible = false
          //刷新列表
          await this.getRolesList()
        })
      },
      /*删除三级权限*/
      async removeRightById (role, id) {
        const confirmResult = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        if (confirmResult !== 'confirm') {
          return this.$message.info('您取消该操作')
        }
        const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${id}`)
        if (res.meta.status !== 200) return this.$message.error('删除权限失败')
        this.$message.success('删除权限成功')
        role.children = res.data
      },
      /*分配权限对话框*/
      async showSetRightDialog (role) {
        this.roleId = role.id
        const { data: res } = await this.$http.get('rights/tree')
        if (res.meta.status !== 200) return this.$message.error('获取权限数据失败')
        this.rightsList = res.data
        this.getLeafKeys(role, this.defKeys)
        this.setRightDialogVisible = true
      },
      /*获取角色下所有三级权限,保存到defKeys*/
      getLeafKeys (node, arr) {
        if (!node.children) {
          return arr.push(node.id)
        }
        node.children.forEach(item => {
          this.getLeafKeys(item, arr)
        })
      },
      /*分配权限*/
      async allotRights () {
        const keys = [
          ...this.$refs.treeRef.getCheckedKeys(),
          ...this.$refs.treeRef.getHalfCheckedKeys(),
        ]
        const idStr = keys.join(',')
        const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
        if (res.meta.status !== 200) return this.$message.error('分配权限失败')
        this.$message.success('分配权限成功')
        await this.getRolesList()
        this.setRightDialogVisible = false
      }
    }
  }
</script>

<style lang="less" scoped>
  .el-tag {
    margin: 7px;
  }

  .bdtop {
    border-top: 1px solid #eeeeee;

  }

  .bdbottom {
    border-bottom: 1px solid #eeeeee;
  }

  .vcenter {
    display: flex;
    align-items: center;
  }

</style>
