<template>
  <div class="role-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>角色管理</span>
          <el-button type="primary" @click="handleAdd">新增角色</el-button>
        </div>
      </template>
      
      <!-- 搜索条件 -->
      <el-form :inline="true" :model="searchForm" class="demo-form-inline">
        <el-form-item label="角色名称">
          <el-input v-model="searchForm.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
      
      <!-- 角色表格 -->
      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="角色名称" />
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column prop="updated_at" label="更新时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.updated_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.itemsPerPage"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        style="margin-top: 20px; justify-content: flex-end;"
      />
    </el-card>
    
    <!-- 角色表单对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { roleApi } from '@/api'

// 表格数据
const tableData = ref([])
const loading = ref(false)

// 分页参数
const pagination = reactive({
  page: 1,
  itemsPerPage: 10,
  total: 0
})

// 搜索表单
const searchForm = reactive({
  name: ''
})

// 对话框相关
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isAdding = ref(false)

// 表单数据
const form = reactive({
  id: null,
  name: '',
  description: ''
})

// 表单验证规则
const rules = {
  name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }]
}

// 表单引用
const formRef = ref()

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

// 获取角色列表
const fetchRoles = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      itemsPerPage: pagination.itemsPerPage,
      ...searchForm
    }
    
    const response = await roleApi.getRoles(params)
    const data = response.data
    
    if (data.data) {
      // 处理分页响应
      tableData.value = data.data
      pagination.total = data.total_count || 0
    } else {
      // 处理简单列表响应
      tableData.value = data
      pagination.total = data.length
    }
    
    ElMessage.success('获取角色列表成功')
  } catch (error) {
    console.error('获取角色列表失败:', error)
    ElMessage.error('获取角色列表失败: ' + (error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

// 处理搜索
const handleSearch = () => {
  pagination.page = 1
  fetchRoles()
}

// 处理重置
const handleReset = () => {
  searchForm.name = ''
  pagination.page = 1
  fetchRoles()
}

// 处理新增
const handleAdd = () => {
  isAdding.value = true
  dialogTitle.value = '新增角色'
  resetForm()
  dialogVisible.value = true
}

// 处理编辑
const handleEdit = (row) => {
  isAdding.value = false
  dialogTitle.value = '编辑角色'
  Object.assign(form, row)
  dialogVisible.value = true
}

// 处理删除
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除角色 "${row.name}" 吗？`,
    '确认删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await roleApi.deleteRole(row.id)
      ElMessage.success('删除成功')
      fetchRoles()
    } catch (error) {
      console.error('删除角色失败:', error)
      ElMessage.error('删除角色失败: ' + (error.message || '未知错误'))
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 重置表单
const resetForm = () => {
  Object.assign(form, {
    id: null,
    name: '',
    description: ''
  })
  
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

// 处理提交
const handleSubmit = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (isAdding.value) {
          // 新增角色
          await roleApi.createRole(form)
          ElMessage.success('新增角色成功')
        } else {
          // 编辑角色
          const { id, ...updateData } = form
          await roleApi.updateRole(id, updateData)
          ElMessage.success('更新角色成功')
        }
        
        dialogVisible.value = false
        fetchRoles()
      } catch (error) {
        console.error('保存角色失败:', error)
        ElMessage.error('保存角色失败: ' + (error.message || '未知错误'))
      }
    }
  })
}

// 处理分页大小变化
const handleSizeChange = (val) => {
  pagination.itemsPerPage = val
  fetchRoles()
}

// 处理当前页变化
const handleCurrentChange = (val) => {
  pagination.page = val
  fetchRoles()
}

// 组件挂载时获取数据
onMounted(() => {
  fetchRoles()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.demo-form-inline {
  margin-bottom: 20px;
}
</style>