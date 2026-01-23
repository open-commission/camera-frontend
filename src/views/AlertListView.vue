<template>
  <div class="alert-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>设备警报</span>
          <el-button type="primary" @click="handleAdd">新增警报</el-button>
        </div>
      </template>
      
      <!-- 搜索条件 -->
      <el-form :inline="true" :model="searchForm" class="demo-form-inline">
        <el-form-item label="设备ID">
          <el-input v-model="searchForm.equipment_id" placeholder="请输入设备ID" />
        </el-form-item>
        <el-form-item label="警报类型">
          <el-input v-model="searchForm.alert_type" placeholder="请输入警报类型" />
        </el-form-item>
        <el-form-item label="警报级别">
          <el-select v-model="searchForm.alert_level" placeholder="请选择警报级别" clearable>
            <el-option label="低" value="low" />
            <el-option label="中" value="medium" />
            <el-option label="高" value="high" />
            <el-option label="紧急" value="critical" />
          </el-select>
        </el-form-item>
        <el-form-item label="是否解决">
          <el-select v-model="searchForm.resolved" placeholder="请选择状态" clearable>
            <el-option label="未解决" :value="false" />
            <el-option label="已解决" :value="true" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
      
      <!-- 警报表格 -->
      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="equipment_id" label="设备ID" width="80" />
        <el-table-column prop="alert_type" label="警报类型" />
        <el-table-column prop="alert_level" label="警报级别">
          <template #default="scope">
            <el-tag :type="getLevelTagType(scope.row.alert_level)">
              {{ getLevelLabel(scope.row.alert_level) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
        <el-table-column prop="resolved" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.resolved ? 'success' : 'danger'">
              {{ scope.row.resolved ? '已解决' : '未解决' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="resolved_at" label="解决时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.resolved_at) }}
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button 
              v-if="!scope.row.resolved" 
              size="small" 
              type="success" 
              @click="handleResolve(scope.row)"
            >
              标记为已解决
            </el-button>
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
    
    <!-- 警报表单对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="设备ID" prop="equipment_id">
              <el-input v-model.number="form.equipment_id" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="警报类型" prop="alert_type">
              <el-input v-model="form.alert_type" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="警报级别" prop="alert_level">
              <el-select v-model="form.alert_level" style="width: 100%;">
                <el-option label="低" value="low" />
                <el-option label="中" value="medium" />
                <el-option label="高" value="high" />
                <el-option label="紧急" value="critical" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否解决" prop="resolved">
              <el-switch v-model="form.resolved" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" />
        </el-form-item>
        
        <el-form-item label="解决时间" prop="resolved_at" v-if="form.resolved">
          <el-date-picker
            v-model="form.resolved_at"
            type="datetime"
            placeholder="选择日期时间"
            style="width: 100%;"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
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
import { alertApi } from '../api'

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
  equipment_id: '',
  alert_type: '',
  alert_level: '',
  resolved: ''
})

// 对话框相关
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isAdding = ref(false)

// 表单数据
const form = reactive({
  id: null,
  equipment_id: null,
  alert_type: '',
  alert_level: 'medium',
  description: '',
  resolved: false,
  resolved_at: '',
  resolved_by: null
})

// 表单验证规则
const rules = {
  equipment_id: [
    { required: true, message: '请输入设备ID', trigger: 'blur' },
    { type: 'number', message: '设备ID必须为数字', trigger: 'blur' }
  ],
  alert_type: [{ required: true, message: '请输入警报类型', trigger: 'blur' }],
  alert_level: [{ required: true, message: '请选择警报级别', trigger: 'blur' }],
  description: [{ required: true, message: '请输入描述', trigger: 'blur' }]
}

// 表单引用
const formRef = ref()

// 获取警报级别标签类型
const getLevelTagType = (level) => {
  switch (level) {
    case 'low':
      return ''
    case 'medium':
      return 'warning'
    case 'high':
      return 'danger'
    case 'critical':
      return 'danger'
    default:
      return ''
  }
}

// 获取警报级别标签文本
const getLevelLabel = (level) => {
  switch (level) {
    case 'low':
      return '低'
    case 'medium':
      return '中'
    case 'high':
      return '高'
    case 'critical':
      return '紧急'
    default:
      return level
  }
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

// 获取警报列表
const fetchAlerts = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      itemsPerPage: pagination.itemsPerPage,
      ...searchForm
    }
    
    // 处理布尔值参数
    if (params.resolved === '') {
      delete params.resolved
    } else {
      params.resolved = params.resolved === 'true' || params.resolved === true
    }
    
    const response = await alertApi.getAlerts(params)
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
    
    ElMessage.success('获取警报列表成功')
  } catch (error) {
    console.error('获取警报列表失败:', error)
    ElMessage.error('获取警报列表失败: ' + (error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

// 处理搜索
const handleSearch = () => {
  pagination.page = 1
  fetchAlerts()
}

// 处理重置
const handleReset = () => {
  searchForm.equipment_id = ''
  searchForm.alert_type = ''
  searchForm.alert_level = ''
  searchForm.resolved = ''
  pagination.page = 1
  fetchAlerts()
}

// 处理新增
const handleAdd = () => {
  isAdding.value = true
  dialogTitle.value = '新增警报'
  resetForm()
  dialogVisible.value = true
}

// 处理编辑
const handleEdit = (row) => {
  isAdding.value = false
  dialogTitle.value = '编辑警报'
  Object.assign(form, row)
  dialogVisible.value = true
}

// 处理标记为已解决
const handleResolve = (row) => {
  ElMessageBox.confirm(
    `确定要将警报 ID "${row.id}" 标记为已解决吗？`,
    '确认操作',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const updateData = {
        resolved: true,
        resolved_at: new Date().toISOString()
      }
      
      await alertApi.updateAlert(row.id, updateData)
      ElMessage.success('标记成功')
      fetchAlerts()
    } catch (error) {
      console.error('标记警报失败:', error)
      ElMessage.error('标记警报失败: ' + (error.message || '未知错误'))
    }
  }).catch(() => {
    ElMessage.info('已取消操作')
  })
}

// 处理删除
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除警报 ID "${row.id}" 吗？`,
    '确认删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await alertApi.deleteAlert(row.id)
      ElMessage.success('删除成功')
      fetchAlerts()
    } catch (error) {
      console.error('删除警报失败:', error)
      ElMessage.error('删除警报失败: ' + (error.message || '未知错误'))
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 重置表单
const resetForm = () => {
  Object.assign(form, {
    id: null,
    equipment_id: null,
    alert_type: '',
    alert_level: 'medium',
    description: '',
    resolved: false,
    resolved_at: '',
    resolved_by: null
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
          // 新增警报
          await alertApi.createAlert(form)
          ElMessage.success('新增警报成功')
        } else {
          // 编辑警报
          const { id, ...updateData } = form
          await alertApi.updateAlert(id, updateData)
          ElMessage.success('更新警报成功')
        }
        
        dialogVisible.value = false
        fetchAlerts()
      } catch (error) {
        console.error('保存警报失败:', error)
        ElMessage.error('保存警报失败: ' + (error.message || '未知错误'))
      }
    }
  })
}

// 处理分页大小变化
const handleSizeChange = (val) => {
  pagination.itemsPerPage = val
  fetchAlerts()
}

// 处理当前页变化
const handleCurrentChange = (val) => {
  pagination.page = val
  fetchAlerts()
}

// 组件挂载时获取数据
onMounted(() => {
  fetchAlerts()
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