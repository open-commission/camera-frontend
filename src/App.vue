<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <div id="app" style="padding: 0; margin: 0; width: 100vw; height: 100vh; overflow: hidden;">
    <el-container style="height: 100vh;">
      <el-header style="background-color: #409eff; color: white; display: flex; align-items: center; justify-content: space-between; padding: 0 20px; margin: 0;">
        <h2>设备管理系统</h2>
        <div>
          <el-button type="primary" link>登录</el-button>
          <el-button type="primary" link>注册</el-button>
        </div>
      </el-header>

      <el-container>
        <el-aside width="200px" style="background-color: #f5f5f5; height: calc(100vh - 60px); padding: 0; margin: 0;">
          <el-menu router default-active="$route.path" class="el-menu-vertical-demo" style="height: 100%; border-right: none;">
            <el-menu-item index="/">
              <el-icon><House /></el-icon>
              <span>首页</span>
            </el-menu-item>
            <el-sub-menu index="1">
              <template #title>
                <el-icon><User /></el-icon>
                <span>用户管理</span>
              </template>
              <el-menu-item index="/users">用户列表</el-menu-item>
              <el-menu-item index="/roles">角色管理</el-menu-item>
            </el-sub-menu>
            <el-sub-menu index="2">
              <template #title>
                <el-icon><Monitor /></el-icon>
                <span>设备管理</span>
              </template>
              <el-menu-item index="/equipment">设备列表</el-menu-item>
              <el-menu-item index="/alerts">设备警报</el-menu-item>
            </el-sub-menu>
            <el-menu-item index="/borrow-records">
              <el-icon><Document /></el-icon>
              <span>借用记录</span>
            </el-menu-item>
            <el-menu-item index="/sensor-data">
              <el-icon><DataAnalysis /></el-icon>
              <span>传感器数据</span>
            </el-menu-item>
            <el-sub-menu index="3">
              <template #title>
                <el-icon><PieChart /></el-icon>
                <span>数据分析</span>
              </template>
              <el-menu-item index="/analytics/usage">设备使用统计</el-menu-item>
              <el-menu-item index="/analytics/ranking">用户借用排行</el-menu-item>
              <el-menu-item index="/analytics/alerts">设备报警统计</el-menu-item>
              <el-menu-item index="/analytics/trends">传感器趋势</el-menu-item>
            </el-sub-menu>
          </el-menu>
        </el-aside>

        <el-main style="padding: 0; margin: 0;">
          <RouterView />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<style scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>