<template>
  <div class="borrow-record-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>借用记录</span>
          <el-button type="primary" @click="handleAdd">新增记录</el-button>
        </div>
      </template>
      
      <!-- 搜索条件 -->
      <el-form :inline="true" :model="searchForm" class="demo-form-inline">
        <el-form-item label="用户ID">
          <el-input v-model="searchForm.user_id" placeholder="请输入用户ID" />
        </el-form-item>
        <el-form-item label="设备ID">
          <el-input v-model="searchForm.equipment_id" placeholder="请输入设备ID" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="借用中" value="borrowed" />
            <el-option label="已归还" value="returned" />
            <el-option label="超期" value="overdue" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
      
      <!-- 借用记录表格 -->
      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="user_id" label="用户ID" width="80" />
        <el-table-column prop="equipment_id" label="设备ID" width="80" />
        <el-table-column prop="borrow_time" label="借用时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.borrow_time) }}
          </template>
        </el-table-column>
        <el-table-column prop="expected_return_time" label="预计归还时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.expected_return_time) }}
          </template>
        </el-table-column>
        <el-table-column prop="actual_return_time" label="实际归还时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.actual_return_time) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)">
              {{ getStatusLabel(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="purpose" label="用途" show-overflow-tooltip />
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
    
    <!-- 借用记录表单对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="用户ID" prop="user_id">
              <el-input v-model.number="form.user_id" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="设备ID" prop="equipment_id">
              <el-input v-model.number="form.equipment_id" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="借用时间" prop="borrow_time">
              <el-date-picker
                v-model="form.borrow_time"
                type="datetime"
                placeholder="选择日期时间"
                style="width: 100%;"
                value-format="YYYY-MM-DD HH:mm:ss"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="预计归还时间" prop="expected_return_time">
              <el-date-picker
                v-model="form.expected_return_time"
                type="datetime"
                placeholder="选择日期时间"
                style="width: 100%;"
                value-format="YYYY-MM-DD HH:mm:ss"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="实际归还时间" prop="actual_return_time">
              <el-date-picker
                v-model="form.actual_return_time"
                type="datetime"
                placeholder="选择日期时间"
                style="width: 100%;"
                value-format="YYYY-MM-DD HH:mm:ss"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-select v-model="form.status" style="width: 100%;">
                <el-option label="借用中" value="borrowed" />
                <el-option label="已归还" value="returned" />
                <el-option label="超期" value="overdue" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="用途" prop="purpose">
          <el-input v-model="form.purpose" />
        </el-form-item>
        
        <el-form-item label="备注" prop="remarks">
          <el-input v-model="form.remarks" type="textarea" :rows="3" />
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
import { borrowRecordApi } from '../api'

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
  user_id: '',
  equipment_id: '',
  status: ''
})

// 对话框相关
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isAdding = ref(false)

// 表单数据
const form = reactive({
  id: null,
  user_id: null,
  equipment_id: null,
  borrow_time: '',
  expected_return_time: '',
  actual_return_time: '',
  status: 'borrowed',
  purpose: '',
  remarks: ''
})

// 表单验证规则
const rules = {
  user_id: [
    { required: true, message: '请输入用户ID', trigger: 'blur' },
    { type: 'number', message: '用户ID必须为数字', trigger: 'blur' }
  ],
  equipment_id: [
    { required: true, message: '请输入设备ID', trigger: 'blur' },
    { type: 'number', message: '设备ID必须为数字', trigger: 'blur' }
  ],
  borrow_time: [{ required: true, message: '请选择借用时间', trigger: 'blur' }]
}

// 表单引用
const formRef = ref()

// 获取状态标签类型
const getStatusTagType = (status) => {
  switch (status) {
    case 'borrowed':
      return 'warning'
    case 'returned':
      return 'success'
    case 'overdue':
      return 'danger'
    default:
      return ''
  }
}

// 获取状态标签文本
const getStatusLabel = (status) => {
  switch (status) {
    case 'borrowed':
      return '借用中'
    case 'returned':
      return '已归还'
    case 'overdue':
      return '超期'
    default:
      return status
  }
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

// 获取借用记录列表
const fetchBorrowRecords = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      itemsPerPage: pagination.itemsPerPage,
      ...searchForm
    }
    
    const response = await borrowRecordApi.getBorrowRecords(params)
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
    
    ElMessage.success('获取借用记录列表成功')
  } catch (error) {
    console.error('获取借用记录列表失败:', error)
    ElMessage.error('获取借用记录列表失败: ' + (error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

// 处理搜索
const handleSearch = () => {
  pagination.page = 1
  fetchBorrowRecords()
}

// 处理重置
const handleReset = () => {
  searchForm.user_id = ''
  searchForm.equipment_id = ''
  searchForm.status = ''
  pagination.page = 1
  fetchBorrowRecords()
}

// 处理新增
const handleAdd = () => {
  isAdding.value = true
  dialogTitle.value = '新增借用记录'
  resetForm()
  dialogVisible.value = true
}

// 处理编辑
const handleEdit = (row) => {
  isAdding.value = false
  dialogTitle.value = '编辑借用记录'
  Object.assign(form, row)
  dialogVisible.value = true
}

// 处理删除
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除借用记录 ID "${row.id}" 吗？`,
    '确认删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await borrowRecordApi.deleteBorrowRecord(row.id)
      ElMessage.success('删除成功')
      fetchBorrowRecords()
    } catch (error) {
      console.error('删除借用记录失败:', error)
      ElMessage.error('删除借用记录失败: ' + (error.message || '未知错误'))
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 重置表单
const resetForm = () => {
  Object.assign(form, {
    id: null,
    user_id: null,
    equipment_id: null,
    borrow_time: '',
    expected_return_time: '',
    actual_return_time: '',
    status: 'borrowed',
    purpose: '',
    remarks: ''
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
          // 新增借用记录
          await borrowRecordApi.createBorrowRecord(form)
          ElMessage.success('新增借用记录成功')
        } else {
          // 编辑借用记录
          const { id, ...updateData } = form
          await borrowRecordApi.updateBorrowRecord(id, updateData)
          ElMessage.success('更新借用记录成功')
        }
        
        dialogVisible.value = false
        fetchBorrowRecords()
      } catch (error) {
        console.error('保存借用记录失败:', error)
        ElMessage.error('保存借用记录失败: ' + (error.message || '未知错误'))
      }
    }
  })
}

// 处理分页大小变化
const handleSizeChange = (val) => {
  pagination.itemsPerPage = val
  fetchBorrowRecords()
}

// 处理当前页变化
const handleCurrentChange = (val) => {
  pagination.page = val
  fetchBorrowRecords()
}

// 组件挂载时获取数据
onMounted(() => {
  fetchBorrowRecords()
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