import axios from 'axios'

// 创建 axios 实例
const apiClient = axios.create({
  baseURL: 'http://localhost:8000', // 根据实际后端地址进行修改
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
apiClient.interceptors.request.use(
  config => {
    // 可以在这里添加认证token等
    // const token = localStorage.getItem('access_token')
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`
    // }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
apiClient.interceptors.response.use(
  response => {
    return response
  },
  error => {
    if (error.response?.status === 401) {
      // 处理未授权错误
      console.error('未授权访问')
    }
    return Promise.reject(error)
  }
)

// 用户相关 API
export const userApi = {
  // 获取用户列表
  getUsers(params) {
    return apiClient.get('/users/users', { params })
  },
  
  // 创建用户
  createUser(data) {
    return apiClient.post('/users/users', data)
  },
  
  // 获取单个用户
  getUser(id) {
    return apiClient.get(`/users/users/${id}`)
  },
  
  // 更新用户
  updateUser(id, data) {
    return apiClient.patch(`/users/users/${id}`, data)
  },
  
  // 删除用户
  deleteUser(id) {
    return apiClient.delete(`/users/users/${id}`)
  }
}

// 角色相关 API
export const roleApi = {
  // 获取角色列表
  getRoles(params) {
    return apiClient.get('/roles/roles', { params })
  },
  
  // 创建角色
  createRole(data) {
    return apiClient.post('/roles/roles', data)
  },
  
  // 获取单个角色
  getRole(id) {
    return apiClient.get(`/roles/roles/${id}`)
  },
  
  // 更新角色
  updateRole(id, data) {
    return apiClient.patch(`/roles/roles/${id}`, data)
  },
  
  // 删除角色
  deleteRole(id) {
    return apiClient.delete(`/roles/roles/${id}`)
  }
}

// 设备相关 API
export const equipmentApi = {
  // 获取设备列表
  getEquipment(params) {
    return apiClient.get('/equipment/equipment', { params })
  },
  
  // 创建设备
  createEquipment(data) {
    return apiClient.post('/equipment/equipment', data)
  },
  
  // 获取单个设备
  getEquipmentById(id) {
    return apiClient.get(`/equipment/equipment/${id}`)
  },
  
  // 更新设备
  updateEquipment(id, data) {
    return apiClient.patch(`/equipment/equipment/${id}`, data)
  },
  
  // 删除设备
  deleteEquipment(id) {
    return apiClient.delete(`/equipment/equipment/${id}`)
  }
}

// 借用记录相关 API
export const borrowRecordApi = {
  // 获取借用记录列表
  getBorrowRecords(params) {
    return apiClient.get('/borrow-records/borrow-records', { params })
  },
  
  // 创建借用记录
  createBorrowRecord(data) {
    return apiClient.post('/borrow-records/borrow-records', data)
  },
  
  // 获取单个借用记录
  getBorrowRecord(id) {
    return apiClient.get(`/borrow-records/borrow-records/${id}`)
  },
  
  // 更新借用记录
  updateBorrowRecord(id, data) {
    return apiClient.patch(`/borrow-records/borrow-records/${id}`, data)
  },
  
  // 删除借用记录
  deleteBorrowRecord(id) {
    return apiClient.delete(`/borrow-records/borrow-records/${id}`)
  }
}

// 设备警报相关 API
export const alertApi = {
  // 获取警报列表
  getAlerts(params) {
    return apiClient.get('/alerts/alerts', { params })
  },
  
  // 创建警报
  createAlert(data) {
    return apiClient.post('/alerts/alerts', data)
  },
  
  // 获取单个警报
  getAlert(id) {
    return apiClient.get(`/alerts/alerts/${id}`)
  },
  
  // 更新警报
  updateAlert(id, data) {
    return apiClient.patch(`/alerts/alerts/${id}`, data)
  },
  
  // 删除警报
  deleteAlert(id) {
    return apiClient.delete(`/alerts/alerts/${id}`)
  }
}

// 传感器数据相关 API
export const sensorDataApi = {
  // 获取传感器数据列表
  getSensorData(params) {
    return apiClient.get('/sensor-data/sensor-data', { params })
  },
  
  // 创建传感器数据
  createSensorData(data) {
    return apiClient.post('/sensor-data/sensor-data', data)
  },
  
  // 获取单个传感器数据
  getSensorDatum(id) {
    return apiClient.get(`/sensor-data/sensor-data/${id}`)
  },
  
  // 更新传感器数据
  updateSensorData(id, data) {
    return apiClient.patch(`/sensor-data/sensor-data/${id}`, data)
  },
  
  // 删除传感器数据
  deleteSensorData(id) {
    return apiClient.delete(`/sensor-data/sensor-data/${id}`)
  },
  
  // 获取最新传感器数据
  getLatestSensorData(hours) {
    return apiClient.get('/dashboard/latest-sensor-data', { params: { hours } })
  },
  
  // 根据类型获取传感器数据
  getSensorDataByType(sensorType, hours) {
    return apiClient.get('/dashboard/sensor-data-by-type', { 
      params: { sensor_type: sensorType, hours } 
    })
  }
}

// 仪表盘相关 API
export const dashboardApi = {
  // 获取最新传感器数据
  getLatestSensorData(hours = 24) {
    return apiClient.get('/dashboard/latest-sensor-data', { params: { hours } })
  },
  
  // 获取所有设备的当前状态
  getEquipmentStatus() {
    return apiClient.get('/dashboard/equipment-status')
  },
  
  // 根据传感器类型获取数据
  getSensorDataByType(sensorType, hours = 24) {
    return apiClient.get('/dashboard/sensor-data-by-type', { 
      params: { sensor_type: sensorType, hours } 
    })
  }
}

// 数据分析相关 API
export const analyticsApi = {
  // 获取设备使用统计（按借用次数）
  getEquipmentUsageStatistics(days = 30) {
    return apiClient.get('/analytics/equipment-usage', { params: { days } })
  },
  
  // 获取用户借用排行榜
  getUserBorrowRanking(days = 30) {
    return apiClient.get('/analytics/user-ranking', { params: { days } })
  },
  
  // 获取设备报警统计
  getEquipmentAlertStatistics(days = 30) {
    return apiClient.get('/analytics/equipment-alerts', { params: { days } })
  },
  
  // 获取传感器数据趋势
  getSensorTrends(sensorType, hours = 24) {
    return apiClient.get('/analytics/sensor-trends', { 
      params: { sensor_type: sensorType, hours } 
    })
  },
  
  // 获取仪表板摘要信息
  getDashboardSummary() {
    return apiClient.get('/analytics/dashboard-summary')
  }
}

export default apiClient