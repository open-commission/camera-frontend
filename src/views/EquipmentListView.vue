<template>
  <div class="equipment-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>设备管理</span>
          <el-button type="primary" @click="handleAdd">新增设备</el-button>
        </div>
      </template>
      
      <!-- 搜索条件 -->
      <el-form :inline="true" :model="searchForm" class="demo-form-inline">
        <el-form-item label="设备名称">
          <el-input v-model="searchForm.name" placeholder="请输入设备名称" />
        </el-form-item>
        <el-form-item label="序列号">
          <el-input v-model="searchForm.serial_number" placeholder="请输入序列号" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="可用" value="available" />
            <el-option label="借出" value="borrowed" />
            <el-option label="维修中" value="maintenance" />
            <el-option label="报废" value="scrapped" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
      
      <!-- 设备表格 -->
      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="设备名称" />
        <el-table-column prop="category" label="分类" />
        <el-table-column prop="serial_number" label="序列号" />
        <el-table-column prop="location" label="位置" />
        <el-table-column prop="status" label="状态">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)">
              {{ getStatusLabel(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="purchase_date" label="购买日期" width="120">
          <template #default="scope">
            {{ formatDate(scope.row.purchase_date) }}
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.created_at) }}
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
    
    <!-- 设备表单对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="设备名称" prop="name">
              <el-input v-model="form.name" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="分类" prop="category">
              <el-input v-model="form.category" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="序列号" prop="serial_number">
              <el-input v-model="form.serial_number" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="位置" prop="location">
              <el-input v-model="form.location" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-select v-model="form.status" style="width: 100%;">
                <el-option label="可用" value="available" />
                <el-option label="借出" value="borrowed" />
                <el-option label="维修中" value="maintenance" />
                <el-option label="报废" value="scrapped" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="购买日期" prop="purchase_date">
              <el-date-picker
                v-model="form.purchase_date"
                type="date"
                placeholder="选择日期"
                style="width: 100%;"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="保修期至" prop="warranty_expiry">
              <el-date-picker
                v-model="form.warranty_expiry"
                type="date"
                placeholder="选择日期"
                style="width: 100%;"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
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
import { equipmentApi } from '../api'

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
  name: '',
  serial_number: '',
  status: ''
})

// 对话框相关
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isAdding = ref(false)

// 表单数据
const form = reactive({
  id: null,
  name: '',
  description: '',
  category: '',
  serial_number: '',
  status: 'available',
  location: '',
  purchase_date: '',
  warranty_expiry: ''
})

// 表单验证规则
const rules = {
  name: [{ required: true, message: '请输入设备名称', trigger: 'blur' }],
  category: [{ required: true, message: '请输入分类', trigger: 'blur' }],
  serial_number: [{ required: true, message: '请输入序列号', trigger: 'blur' }],
  location: [{ required: true, message: '请输入位置', trigger: 'blur' }]
}

// 表单引用
const formRef = ref()

// 获取状态标签类型
const getStatusTagType = (status) => {
  switch (status) {
    case 'available':
      return 'success'
    case 'borrowed':
      return 'warning'
    case 'maintenance':
      return 'info'
    case 'scrapped':
      return 'danger'
    default:
      return ''
  }
}

// 获取状态标签文本
const getStatusLabel = (status) => {
  switch (status) {
    case 'available':
      return '可用'
    case 'borrowed':
      return '借出'
    case 'maintenance':
      return '维修中'
    case 'scrapped':
      return '报废'
    default:
      return status
  }
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}

// 获取设备列表
const fetchEquipment = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      itemsPerPage: pagination.itemsPerPage,
      ...searchForm
    }
    
    const response = await equipmentApi.getEquipment(params)
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
    
    ElMessage.success('获取设备列表成功')
  } catch (error) {
    console.error('获取设备列表失败:', error)
    ElMessage.error('获取设备列表失败: ' + (error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

// 处理搜索
const handleSearch = () => {
  pagination.page = 1
  fetchEquipment()
}

// 处理重置
const handleReset = () => {
  searchForm.name = ''
  searchForm.serial_number = ''
  searchForm.status = ''
  pagination.page = 1
  fetchEquipment()
}

// 处理新增
const handleAdd = () => {
  isAdding.value = true
  dialogTitle.value = '新增设备'
  resetForm()
  dialogVisible.value = true
}

// 处理编辑
const handleEdit = (row) => {
  isAdding.value = false
  dialogTitle.value = '编辑设备'
  Object.assign(form, row)
  dialogVisible.value = true
}

// 处理删除
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除设备 "${row.name}" 吗？`,
    '确认删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await equipmentApi.deleteEquipment(row.id)
      ElMessage.success('删除成功')
      fetchEquipment()
    } catch (error) {
      console.error('删除设备失败:', error)
      ElMessage.error('删除设备失败: ' + (error.message || '未知错误'))
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
    description: '',
    category: '',
    serial_number: '',
    status: 'available',
    location: '',
    purchase_date: '',
    warranty_expiry: ''
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
          // 新增设备
          await equipmentApi.createEquipment(form)
          ElMessage.success('新增设备成功')
        } else {
          // 编辑设备
          const { id, ...updateData } = form
          await equipmentApi.updateEquipment(id, updateData)
          ElMessage.success('更新设备成功')
        }
        
        dialogVisible.value = false
        fetchEquipment()
      } catch (error) {
        console.error('保存设备失败:', error)
        ElMessage.error('保存设备失败: ' + (error.message || '未知错误'))
      }
    }
  })
}

// 处理分页大小变化
const handleSizeChange = (val) => {
  pagination.itemsPerPage = val
  fetchEquipment()
}

// 处理当前页变化
const handleCurrentChange = (val) => {
  pagination.page = val
  fetchEquipment()
}

// 组件挂载时获取数据
onMounted(() => {
  fetchEquipment()
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