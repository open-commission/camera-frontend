<template>
  <div class="analytics-usage">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>设备使用统计</span>
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            @change="handleDateChange"
          />
        </div>
      </template>
      
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ usageStats.totalBorrows || 0 }}</div>
              <div class="stat-label">总借用次数</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ usageStats.activeEquipments || 0 }}</div>
              <div class="stat-label">活跃设备数</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ usageStats.popularEquipment?.name || '暂无' }}</div>
              <div class="stat-label">最热门设备</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ usageStats.averageBorrowDays || 0 }}天</div>
              <div class="stat-label">平均借用时长</div>
            </div>
          </el-card>
        </el-col>
      </el-row>
      
      <el-card style="margin-top: 20px;">
        <div ref="chartContainer" style="width: 100%; height: 400px;"></div>
      </el-card>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { analyticsApi } from '../../api'

// 图表相关
const chart = ref(null)
const chartContainer = ref(null)

// 日期范围
const dateRange = ref([])

// 使用统计
const usageStats = ref({
  totalBorrows: 0,
  activeEquipments: 0,
  popularEquipment: {},
  averageBorrowDays: 0
})

// 图表数据
const chartData = ref([])

// 初始化图表
const initChart = () => {
  if (chartContainer.value) {
    chart.value = echarts.init(chartContainer.value)
  }
}

// 更新图表
const updateChart = () => {
  if (!chart.value || !chartData.value.length) return
  
  const option = {
    title: {
      text: '设备借用趋势'
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: chartData.value.map(item => item.date)
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      data: chartData.value.map(item => item.count),
      type: 'line',
      smooth: true
    }]
  }
  
  chart.value.setOption(option, true)
}

// 获取设备使用统计数据
const fetchUsageStats = async () => {
  try {
    // 计算天数差
    let days = 30
    if (dateRange.value && dateRange.value.length === 2) {
      const diffTime = Math.abs(dateRange.value[1] - dateRange.value[0])
      days = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    }
    
    const response = await analyticsApi.getEquipmentUsageStatistics(days)
    usageStats.value = response.data
    
    // 获取图表数据
    // 这里可以根据实际API返回的数据进行调整
    chartData.value = [
      { date: '周一', count: 120 },
      { date: '周二', count: 132 },
      { date: '周三', count: 101 },
      { date: '周四', count: 134 },
      { date: '周五', count: 90 },
      { date: '周六', count: 230 },
      { date: '周日', count: 210 }
    ]
    
    updateChart()
  } catch (error) {
    console.error('获取设备使用统计失败:', error)
    ElMessage.error('获取设备使用统计失败: ' + (error.message || '未知错误'))
  }
}

// 处理日期变更
const handleDateChange = () => {
  fetchUsageStats()
}

// 窗口大小改变时重置图表
const handleResize = () => {
  if (chart.value) {
    chart.value.resize()
  }
}

// 组件挂载时获取数据
onMounted(() => {
  initChart()
  fetchUsageStats()
  window.addEventListener('resize', handleResize)
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

.stat-card {
  text-align: center;
}

.stat-content {
  padding: 20px 0;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-top: 10px;
}
</style>