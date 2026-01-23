<template>
  <div class="sensor-data-view">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>传感器数据</span>
          <el-button type="primary" @click="refreshData">刷新数据</el-button>
        </div>
      </template>
      
      <!-- 搜索条件 -->
      <el-form :inline="true" :model="searchForm" class="demo-form-inline">
        <el-form-item label="设备ID">
          <el-input v-model="searchForm.equipment_id" placeholder="请输入设备ID" />
        </el-form-item>
        <el-form-item label="传感器类型">
          <el-input v-model="searchForm.sensor_type" placeholder="请输入传感器类型" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
      
      <!-- 传感器数据表格 -->
      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="equipment_id" label="设备ID" width="80" />
        <el-table-column prop="sensor_type" label="传感器类型" />
        <el-table-column prop="value" label="数值" />
        <el-table-column prop="unit" label="单位" width="100" />
        <el-table-column prop="recorded_at" label="记录时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.recorded_at) }}
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="scope">
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
    
    <!-- 图表展示区域 -->
    <el-card style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span>数据图表</span>
          <el-select v-model="chartFilter.type" placeholder="选择传感器类型" @change="loadChartData">
            <el-option
              v-for="item in sensorTypes"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </div>
      </template>
      
      <div ref="chartContainer" style="width: 100%; height: 400px;"></div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as echarts from 'echarts'
import { sensorDataApi, dashboardApi } from '../api'

// 表格数据
const tableData = ref([])
const loading = ref(false)

// 图表相关
const chart = ref(null)
const chartContainer = ref(null)
const sensorTypes = ref([])

// 分页参数
const pagination = reactive({
  page: 1,
  itemsPerPage: 10,
  total: 0
})

// 搜索表单
const searchForm = reactive({
  equipment_id: '',
  sensor_type: ''
})

// 图表筛选条件
const chartFilter = reactive({
  type: ''
})

// 表单引用
const formRef = ref()

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

// 初始化图表
const initChart = () => {
  if (chartContainer.value) {
    chart.value = echarts.init(chartContainer.value)
  }
}

// 更新图表
const updateChart = (data) => {
  if (!chart.value) return
  
  const option = {
    title: {
      text: `${chartFilter.type} 传感器数据趋势`
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: data.map(item => {
        const date = new Date(item.recorded_at)
        return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
      })
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      data: data.map(item => item.value),
      type: 'line',
      smooth: true
    }]
  }
  
  chart.value.setOption(option, true)
}

// 加载图表数据
const loadChartData = async () => {
  if (!chartFilter.type) return
  
  try {
    const response = await dashboardApi.getSensorDataByType(chartFilter.type, 24)
    const data = response.data
    
    if (Array.isArray(data)) {
      updateChart(data)
    }
  } catch (error) {
    console.error('加载图表数据失败:', error)
    ElMessage.error('加载图表数据失败: ' + (error.message || '未知错误'))
  }
}

// 获取传感器数据列表
const fetchSensorData = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      itemsPerPage: pagination.itemsPerPage,
      ...searchForm
    }
    
    const response = await sensorDataApi.getSensorData(params)
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
    
    ElMessage.success('获取传感器数据列表成功')
  } catch (error) {
    console.error('获取传感器数据列表失败:', error)
    ElMessage.error('获取传感器数据列表失败: ' + (error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

// 获取传感器类型列表
const fetchSensorTypes = async () => {
  try {
    const response = await sensorDataApi.getSensorData({ limit: 1000 })
    const data = response.data
    
    const types = data.data ? data.data : data
    sensorTypes.value = [...new Set(types.map(item => item.sensor_type))]
    
    if (sensorTypes.value.length > 0 && !chartFilter.type) {
      chartFilter.type = sensorTypes.value[0]
      loadChartData()
    }
  } catch (error) {
    console.error('获取传感器类型失败:', error)
  }
}

// 刷新数据
const refreshData = () => {
  fetchSensorData()
  fetchSensorTypes()
  if (chartFilter.type) {
    loadChartData()
  }
}

// 处理搜索
const handleSearch = () => {
  pagination.page = 1
  fetchSensorData()
}

// 处理重置
const handleReset = () => {
  searchForm.equipment_id = ''
  searchForm.sensor_type = ''
  pagination.page = 1
  fetchSensorData()
}

// 处理删除
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除传感器数据 ID "${row.id}" 吗？`,
    '确认删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await sensorDataApi.deleteSensorData(row.id)
      ElMessage.success('删除成功')
      fetchSensorData()
    } catch (error) {
      console.error('删除传感器数据失败:', error)
      ElMessage.error('删除传感器数据失败: ' + (error.message || '未知错误'))
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 处理分页大小变化
const handleSizeChange = (val) => {
  pagination.itemsPerPage = val
  fetchSensorData()
}

// 处理当前页变化
const handleCurrentChange = (val) => {
  pagination.page = val
  fetchSensorData()
}

// 窗口大小改变时重置图表
const handleResize = () => {
  if (chart.value) {
    chart.value.resize()
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchSensorData()
  fetchSensorTypes()
  initChart()
  window.addEventListener('resize', handleResize)
  loadChartData()
})

// 组件卸载前清理
onBeforeUnmount(() => {
  if (chart.value) {
    chart.value.dispose()
  }
  window.removeEventListener('resize', handleResize)
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