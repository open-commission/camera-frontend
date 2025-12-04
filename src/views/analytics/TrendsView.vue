<template>
  <div class="analytics-trends">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>传感器数据趋势</span>
          <div>
            <el-select v-model="selectedSensorType" placeholder="选择传感器类型" @change="handleSensorTypeChange">
              <el-option
                v-for="item in sensorTypes"
                :key="item"
                :label="item"
                :value="item"
              />
            </el-select>
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              style="margin-left: 15px;"
              @change="handleDateChange"
            />
          </div>
        </div>
      </template>
      
      <div ref="chartContainer" style="width: 100%; height: 500px;"></div>
      
      <el-card style="margin-top: 20px;">
        <template #header>
          <span>数据统计</span>
        </template>
        <el-row :gutter="20">
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-value">{{ statistics.maxValue }}</div>
              <div class="stat-label">最大值</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-value">{{ statistics.minValue }}</div>
              <div class="stat-label">最小值</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-value">{{ statistics.avgValue }}</div>
              <div class="stat-label">平均值</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-value">{{ statistics.stdDeviation }}</div>
              <div class="stat-label">标准差</div>
            </div>
          </el-col>
        </el-row>
      </el-card>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { analyticsApi } from '@/api'

// 图表相关
const chart = ref(null)
const chartContainer = ref(null)

// 选中的传感器类型
const selectedSensorType = ref('temperature')

// 传感器类型列表
const sensorTypes = ref(['temperature', 'humidity', 'pressure', 'voltage', 'current'])

// 日期范围
const dateRange = ref([])

// 数据统计
const statistics = ref({
  maxValue: 0,
  minValue: 0,
  avgValue: 0,
  stdDeviation: 0
})

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
      text: `${selectedSensorType.value} 传感器数据趋势`
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['数值']
    },
    xAxis: {
      type: 'category',
      data: data.map((item, index) => `点${index + 1}`)
    },
    yAxis: {
      type: 'value',
      name: getUnitBySensorType(selectedSensorType.value)
    },
    series: [{
      name: '数值',
      type: 'line',
      data: data.map(item => item.value),
      smooth: true,
      markLine: {
        data: [
          { type: 'average', name: '平均值' }
        ]
      }
    }]
  }
  
  chart.value.setOption(option, true)
}

// 根据传感器类型获取单位
const getUnitBySensorType = (type) => {
  switch (type) {
    case 'temperature':
      return '°C'
    case 'humidity':
      return '%RH'
    case 'pressure':
      return 'kPa'
    case 'voltage':
      return 'V'
    case 'current':
      return 'A'
    default:
      return ''
  }
}

// 获取传感器数据趋势
const fetchSensorTrends = async () => {
  try {
    // 计算小时差
    let hours = 24
    if (dateRange.value && dateRange.value.length === 2) {
      const diffTime = Math.abs(dateRange.value[1] - dateRange.value[0])
      hours = Math.ceil(diffTime / (1000 * 60 * 60))
    }
    
    // 模拟数据
    const mockData = []
    const baseValue = getBaseValueBySensorType(selectedSensorType.value)
    for (let i = 0; i < 24; i++) {
      const value = baseValue + (Math.random() - 0.5) * 10
      mockData.push({
        value: parseFloat(value.toFixed(2)),
        recorded_at: new Date(Date.now() - (23 - i) * 60 * 60 * 1000)
      })
    }
    
    // 计算统计数据
    const values = mockData.map(item => item.value)
    statistics.value = {
      maxValue: Math.max(...values).toFixed(2),
      minValue: Math.min(...values).toFixed(2),
      avgValue: (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2),
      stdDeviation: calculateStandardDeviation(values).toFixed(2)
    }
    
    updateChart(mockData)
    ElMessage.success('获取传感器趋势数据成功')
  } catch (error) {
    console.error('获取传感器趋势数据失败:', error)
    ElMessage.error('获取传感器趋势数据失败: ' + (error.message || '未知错误'))
  }
}

// 根据传感器类型获取基准值
const getBaseValueBySensorType = (type) => {
  switch (type) {
    case 'temperature':
      return 25
    case 'humidity':
      return 50
    case 'pressure':
      return 101.3
    case 'voltage':
      return 12
    case 'current':
      return 2
    default:
      return 0
  }
}

// 计算标准差
const calculateStandardDeviation = (values) => {
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const squaredDiffs = values.map(value => Math.pow(value - mean, 2))
  const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / squaredDiffs.length
  return Math.sqrt(avgSquaredDiff)
}

// 处理传感器类型变更
const handleSensorTypeChange = () => {
  fetchSensorTrends()
}

// 处理日期变更
const handleDateChange = () => {
  fetchSensorTrends()
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
  fetchSensorTrends()
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

.stat-item {
  text-align: center;
  padding: 20px 0;
}

.stat-value {
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