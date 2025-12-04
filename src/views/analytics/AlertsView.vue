<template>
  <div class="analytics-alerts">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>设备报警统计</span>
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
              <div class="stat-number">{{ alertsStats.totalAlerts || 0 }}</div>
              <div class="stat-label">总报警数</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ alertsStats.unresolvedAlerts || 0 }}</div>
              <div class="stat-label">未解决报警</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ alertsStats.mostCommonType || '暂无' }}</div>
              <div class="stat-label">最常见类型</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ alertsStats.resolutionRate || 0 }}%</div>
              <div class="stat-label">解决率</div>
            </div>
          </el-card>
        </el-col>
      </el-row>
      
      <el-tabs v-model="activeTab" @tab-change="handleTabChange" style="margin-top: 20px;">
        <el-tab-pane label="按类型统计" name="type">
          <div ref="typeChartContainer" style="width: 100%; height: 400px;"></div>
        </el-tab-pane>
        <el-tab-pane label="按时间趋势" name="time">
          <div ref="timeChartContainer" style="width: 100%; height: 400px;"></div>
        </el-tab-pane>
        <el-tab-pane label="按设备统计" name="equipment">
          <div ref="equipmentChartContainer" style="width: 100%; height: 400px;"></div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { analyticsApi } from '@/api'

// 图表相关
const typeChart = ref(null)
const timeChart = ref(null)
const equipmentChart = ref(null)
const typeChartContainer = ref(null)
const timeChartContainer = ref(null)
const equipmentChartContainer = ref(null)

// 当前激活的标签页
const activeTab = ref('type')

// 日期范围
const dateRange = ref([])

// 报警统计
const alertsStats = ref({
  totalAlerts: 0,
  unresolvedAlerts: 0,
  mostCommonType: '',
  resolutionRate: 0
})

// 初始化图表
const initCharts = () => {
  if (typeChartContainer.value) {
    typeChart.value = echarts.init(typeChartContainer.value)
  }
  if (timeChartContainer.value) {
    timeChart.value = echarts.init(timeChartContainer.value)
  }
  if (equipmentChartContainer.value) {
    equipmentChart.value = echarts.init(equipmentChartContainer.value)
  }
}

// 更新按类型统计图表
const updateTypeChart = () => {
  if (!typeChart.value) return
  
  const option = {
    title: {
      text: '报警类型分布'
    },
    tooltip: {
      trigger: 'item'
    },
    legend: {
      top: 'bottom'
    },
    series: [{
      name: '报警类型',
      type: 'pie',
      radius: ['40%', '70%'],
      data: [
        { value: 32, name: '温度异常' },
        { value: 28, name: '电压不稳' },
        { value: 21, name: '通信故障' },
        { value: 15, name: '硬件故障' },
        { value: 4, name: '其他' }
      ]
    }]
  }
  
  typeChart.value.setOption(option, true)
}

// 更新按时间趋势图表
const updateTimeChart = () => {
  if (!timeChart.value) return
  
  const option = {
    title: {
      text: '报警时间趋势'
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      data: [12, 23, 18, 15, 9, 25, 20],
      type: 'line',
      smooth: true
    }]
  }
  
  timeChart.value.setOption(option, true)
}

// 更新按设备统计图表
const updateEquipmentChart = () => {
  if (!equipmentChart.value) return
  
  const option = {
    title: {
      text: '设备报警排行'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    xAxis: {
      type: 'category',
      data: ['设备A', '设备B', '设备C', '设备D', '设备E']
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      data: [12, 18, 9, 7, 5],
      type: 'bar',
      barWidth: '60%'
    }]
  }
  
  equipmentChart.value.setOption(option, true)
}

// 获取设备报警统计数据
const fetchAlertsStats = async () => {
  try {
    // 计算天数差
    let days = 30
    if (dateRange.value && dateRange.value.length === 2) {
      const diffTime = Math.abs(dateRange.value[1] - dateRange.value[0])
      days = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    }
    
    // 模拟数据
    alertsStats.value = {
      totalAlerts: 100,
      unresolvedAlerts: 15,
      mostCommonType: '温度异常',
      resolutionRate: 85
    }
    
    // 更新所有图表
    updateTypeChart()
    updateTimeChart()
    updateEquipmentChart()
    
    ElMessage.success('获取报警统计数据成功')
  } catch (error) {
    console.error('获取报警统计数据失败:', error)
    ElMessage.error('获取报警统计数据失败: ' + (error.message || '未知错误'))
  }
}

// 处理日期变更
const handleDateChange = () => {
  fetchAlertsStats()
}

// 处理标签页切换
const handleTabChange = () => {
  // 可以根据需要重新加载特定图表数据
}

// 窗口大小改变时重置图表
const handleResize = () => {
  if (typeChart.value) {
    typeChart.value.resize()
  }
  if (timeChart.value) {
    timeChart.value.resize()
  }
  if (equipmentChart.value) {
    equipmentChart.value.resize()
  }
}

// 组件挂载时获取数据
onMounted(() => {
  initCharts()
  fetchAlertsStats()
  window.addEventListener('resize', handleResize)
})

// 组件卸载前清理
onBeforeUnmount(() => {
  if (typeChart.value) {
    typeChart.value.dispose()
  }
  if (timeChart.value) {
    timeChart.value.dispose()
  }
  if (equipmentChart.value) {
    equipmentChart.value.dispose()
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