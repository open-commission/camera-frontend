<template>
  <div class="analytics-ranking">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户借用排行榜</span>
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
      
      <el-table :data="rankingData" style="width: 100%" v-loading="loading">
        <el-table-column type="index" label="排名" width="80" />
        <el-table-column prop="user_name" label="用户姓名" />
        <el-table-column prop="borrow_count" label="借用次数" />
        <el-table-column prop="total_duration" label="总时长(小时)" />
        <el-table-column prop="favorite_equipment" label="常用设备" />
      </el-table>
      
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
import { analyticsApi } from '@/api'

// 图表相关
const chart = ref(null)
const chartContainer = ref(null)

// 表格数据
const rankingData = ref([])
const loading = ref(false)

// 日期范围
const dateRange = ref([])

// 初始化图表
const initChart = () => {
  if (chartContainer.value) {
    chart.value = echarts.init(chartContainer.value)
  }
}

// 更新图表
const updateChart = () => {
  if (!chart.value || !rankingData.value.length) return
  
  const option = {
    title: {
      text: '用户借用次数排行'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    xAxis: {
      type: 'category',
      data: rankingData.value.slice(0, 10).map(item => item.user_name)
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      data: rankingData.value.slice(0, 10).map(item => item.borrow_count),
      type: 'bar',
      barWidth: '60%'
    }]
  }
  
  chart.value.setOption(option, true)
}

// 获取用户借用排行榜数据
const fetchRankingData = async () => {
  loading.value = true
  try {
    // 计算天数差
    let days = 30
    if (dateRange.value && dateRange.value.length === 2) {
      const diffTime = Math.abs(dateRange.value[1] - dateRange.value[0])
      days = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    }
    
    // 模拟数据
    rankingData.value = [
      { user_name: '张三', borrow_count: 25, total_duration: 120, favorite_equipment: '示波器' },
      { user_name: '李四', borrow_count: 22, total_duration: 98, favorite_equipment: '万用表' },
      { user_name: '王五', borrow_count: 18, total_duration: 85, favorite_equipment: '信号发生器' },
      { user_name: '赵六', borrow_count: 15, total_duration: 76, favorite_equipment: '频谱分析仪' },
      { user_name: '钱七', borrow_count: 12, total_duration: 65, favorite_equipment: '示波器' },
      { user_name: '孙八', borrow_count: 10, total_duration: 54, favorite_equipment: '万用表' },
      { user_name: '周九', borrow_count: 8, total_duration: 42, favorite_equipment: '电源' },
      { user_name: '吴十', borrow_count: 6, total_duration: 30, favorite_equipment: '函数发生器' }
    ]
    
    updateChart()
    ElMessage.success('获取排行榜数据成功')
  } catch (error) {
    console.error('获取排行榜数据失败:', error)
    ElMessage.error('获取排行榜数据失败: ' + (error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

// 处理日期变更
const handleDateChange = () => {
  fetchRankingData()
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
  fetchRankingData()
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
</style>