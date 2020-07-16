<template>
  <div>
    <!--面包屑导航-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图-->
    <el-card class="box-card">
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!--表格-->
      <tree-table class="treeTable" border :show-row-hover="false" :expand-type="false" index-text="#" show-index
                  :data="cateList"
                  :selection-type="false"
                  :columns="columns">
        <!--是否有效-->
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" style="color: greenyellow" v-if="scope.row.cat_deleted===false"></i>
          <i class="el-icon-erroe" style="color: red" v-else></i>
        </template>
        <!--排序-->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level===0">一级</el-tag>
          <el-tag size="mini" v-else-if="scope.row.cat_level===1" type="success">二级</el-tag>
          <el-tag size="mini" v-else type="warning">三级</el-tag>
        </template>
        <!--操作-->
        <template slot="opt">
          <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
        </template>
      </tree-table>
      <!--分页-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3,5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
    <!--添加分类对话框-->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      @close="addCateDialogClosed"
      width="50%">
      <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级名称">
          <!--options数据源，props数据对象-->
          <el-cascader
            :options="parentCateList"
            :props="cascaderProps"
            clearable
            v-model="selectedKeys"
            @change="parentCateChange"></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="addCateDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addCate">确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    data () {
      return {
        addCateDialogVisible: false,
        total: 0,
        cateList: [],
        queryInfo: {
          type: 3,
          pagenum: 1,
          pagesize: 5
        },
        columns: [{
          label: '分类名称',
          prop: 'cat_name'
        }, {
          label: '是否有效',
          /*当前列定义为模板列*/
          type: 'template',
          /*模板名称*/
          template: 'isok'
        }, {
          label: '排序',
          /*当前列定义为模板列*/
          type: 'template',
          /*模板名称*/
          template: 'order'
        }, {
          label: '操作',
          /*当前列定义为模板列*/
          type: 'template',
          /*模板名称*/
          template: 'opt'
        }],
        addCateForm: {
          cat_name: '',
          /*父分类id*/
          cat_pid: 0,
          cat_level: 0

        },
        addCateFormRules: {
          cat_name: [
            {
              required: true,
              message: '请输入分类名称',
              trigger: 'blur'
            }
          ]
        },
        /*父级分类列表*/
        parentCateList: [],
        cascaderProps: {
          expandTrigger: 'hover',
          value: 'cat_id',
          label: 'cat_name',
          children: 'children',
          checkStrictly: true
        },
        selectedKeys: []
      }
    },
    methods: {
      async getCateList () {
        const { data: res } = await this.$http.get('/categories', {
          params: this.queryInfo
        })
        if (res.meta.status !== 200) return this.$message.error('获取商品分类失败')
        this.cateList = res.data.result
        this.total = res.data.total
      },
      /*监听pagesize变化*/
      handleSizeChange (newPageSize) {
        this.queryInfo.pagesize = newPageSize
        this.getCateList()

      },
      /*及监听pagenum变化*/
      handleCurrentChange (newPageSize) {
        this.queryInfo.pagenum = newPageSize
        this.getCateList()

      },
      /*展示添加分类对话框*/
      showAddCateDialog () {
        this.getParentCateList()
        this.addCateDialogVisible = true
      },
      /*获取父级分类*/
      async getParentCateList () {
        const { data: res } = await this.$http.get('categories', {
          params: { type: 2 }
        })
        if (res.meta.status !== 200) return this.$message.error('获取父级分类失败')
        this.parentCateList = res.data
      },
      /*选择项发生变化*/
      parentCateChange () {
        /*选中父级分类*/
        if (this.selectedKeys.length > 0) {
          this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
          this.addCateForm.cat_level = this.selectedKeys.length
        } else {
          this.addCateForm.cat_pid = 0
          this.addCateForm.cat_level = 0
        }
      },
      /*监听表单关闭*/
      addCateDialogClosed () {
        this.$refs.addCateFormRef.resetFields()
        this.selectedKeys = []
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      },
      /*添加分类*/
      addCate () {
        this.$refs.addCateFormRef.validate(async valid => {
          if (!valid) return
          const { data: res } = await this.$http.post('categories', this.addCateForm)
          if (res.meta.status !== 201) return this.$message.error('添加分类失败')
          this.$message.success('添加分类成功')
          this.addCateDialogVisible = false
          await this.getCateList()
        })
      },
    },
    created () {
      this.getCateList()
    }
  }
</script>

<style lang="less" scoped>
  .treeTable {
    margin-top: 15px;
  }


</style>
