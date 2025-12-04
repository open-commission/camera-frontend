<template>
  <div class="home">
    <el-card class="welcome-card">
      <template #header>
        <div class="card-header">
          <span>欢迎使用设备管理系统</span>
        </div>
      </template>
      <div class="content">
        <p>这是一个功能齐全的设备管理系统，您可以在这里管理：</p>
        <ul>
          <li>用户和权限</li>
          <li>设备信息和状态</li>
          <li>设备借用记录</li>
          <li>设备警报信息</li>
          <li>传感器实时数据</li>
          <li>数据分析和报表</li>
        </ul>
      </div>
    </el-card>

    <div class="stats-grid">
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-number">128</div>
          <div class="stat-label">设备总数</div>
        </div>
      </el-card>
      
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-number">24</div>
          <div class="stat-label">在线设备</div>
        </div>
      </el-card>
      
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-number">5</div>
          <div class="stat-label">警报数量</div>
        </div>
      </el-card>
      
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-number">36</div>
          <div class="stat-label">今日借用</div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
// 这里可以添加首页的数据获取逻辑
</script>

<style scoped>
.home {
  padding: 20px;
}

.welcome-card {
  margin-bottom: 20px;
}

.content ul {
  padding-left: 20px;
}

.content li {
  margin: 10px 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.stat-card {
  text-align: center;
}

.stat-content {
  padding: 20px 0;
}

.stat-number {
  font-size: 32px;
  font-weight: bold;
  color: #409eff;
}

.stat-label {
  font-size: 16px;
  color: #666;
  margin-top: 10px;
}
</style>