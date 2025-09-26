<template>
  <div class="weather-widget">
    <!-- 加载状态 -->
    <div v-if="loading" class="weather-loading">
      <div class="loading-spinner"></div>
      <p>正在获取天气信息...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="weather-error">
      <div class="error-icon">⚠️</div>
      <p>{{ error }}</p>
      <button @click="refreshWeather" class="retry-btn">重试</button>
    </div>

    <!-- 天气信息 -->
    <div v-else-if="weatherData" class="weather-content">
      <!-- 当前天气 -->
      <div class="current-weather">
        <div class="weather-header">
          <div class="location">
            <span class="location-icon">📍</span>
            <span class="location-text">{{ weatherData.current?.city || '南京市' }}</span>
          </div>
          <div class="update-time">
            {{ formatUpdateTime(weatherData.updateTime) }}
          </div>
        </div>

        <div class="weather-main">
          <!-- 左侧：天气信息 -->
          <div class="weather-info-section">
            <div class="weather-items-container">
              <!-- 温度展示 -->
              <div class="weather-item">
                <div class="weather-icon">
                  {{ getWeatherIcon(weatherData.current?.weather || '') }}
                </div>
                <div class="weather-info">
                  <div class="temperature" :style="{ color: getTemperatureColor(parseFloat(weatherData.current?.temperature || '0')) }">
                    {{ weatherData.current?.temperature || '--' }}°
                  </div>
                  <div class="weather-desc">{{ weatherData.current?.weather || '--' }}</div>
                </div>
              </div>
              
              <!-- 湿度 -->
              <div class="weather-item">
                <div class="weather-icon">💧</div>
                <div class="weather-info">
                  <div class="temperature" :style="{ color: getTemperatureColor(parseFloat(weatherData.current?.humidity || '0')) }">
                    {{ weatherData.current?.humidity || '--' }}%
                  </div>
                  <div class="weather-desc">湿度</div>
                </div>
              </div>
              
              <!-- 风力 -->
              <div class="weather-item">
                <div class="weather-icon">💨</div>
                <div class="weather-info">
                  <div class="temperature" :style="{ color: getTemperatureColor(parseFloat(weatherData.current?.windpower || '0')) }">
                    {{ weatherData.current?.windpower || '--' }}级
                  </div>
                  <div class="weather-desc">风力</div>
                </div>
              </div>
              
              <!-- 风向 -->
              <div class="weather-item">
                <div class="weather-icon">🧭</div>
                <div class="weather-info">
                  <div class="temperature" :style="{ color: getTemperatureColor(parseFloat(weatherData.current?.temperature || '0')) }">
                    {{ weatherData.current?.winddirection || '--' }}
                  </div>
                  <div class="weather-desc">风向</div>
                </div>
              </div>
              
              <!-- 体感 -->
              <!-- <div class="weather-item">
                <div class="weather-icon">🌡️</div>
                <div class="weather-info">
                  <div class="temperature" :style="{ color: getTemperatureColor(parseFloat(weatherData.current?.temperature || '0')) }">
                    {{ weatherData.current?.temperature || '--' }}°
                  </div>
                  <div class="weather-desc">体感</div>
                </div>
              </div> -->
            </div>
          </div>

          <!-- 右侧：天气预报 -->
          <div v-if="weatherData.forecast && weatherData.forecast.length > 0" class="weather-forecast-section">
            <div class="forecast-list-compact">
              <div 
                v-for="(item, index) in weatherData.forecast.slice(0, 3)" 
                :key="index"
                class="forecast-item-compact"
              >
                <div class="forecast-line" style="flex-direction: row; align-items: center; gap: 0.5rem;">
                  <span class="forecast-date">{{ item.date }}</span>
                  <span class="forecast-weather">{{ item.dayweather }}</span>
                  <span class="forecast-temp">{{ item.daytemp }}°C/{{ item.nighttemp }}°C</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 无数据状态 -->
    <div v-else class="weather-no-data">
      <div class="no-data-icon">🌤️</div>
      <p>暂无天气数据</p>
      <button @click="refreshWeather" class="retry-btn">刷新</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getAmapCompleteWeather, getWeatherIcon, getTemperatureColor, type AmapWeatherInfo, type AmapForecastItem } from '@/api/weather/amap'

// 响应式数据
const loading = ref(false)
const error = ref<string | null>(null)
const weatherData = ref<{
  current: AmapWeatherInfo | null
  forecast: AmapForecastItem[]
  updateTime: string
} | null>(null)

// 获取天气数据
const fetchWeather = async () => {
  loading.value = true
  error.value = null
  
  try {
    console.log('开始获取天气数据...')
    const data = await getAmapCompleteWeather('南京市')
    weatherData.value = data
    console.log('天气数据获取成功:', data)
  } catch (err: any) {
    console.error('获取天气数据失败:', err)
    error.value = err.message || '获取天气数据失败'
  } finally {
    loading.value = false
  }
}

// 刷新天气
const refreshWeather = () => {
  fetchWeather()
}

// 格式化更新时间
const formatUpdateTime = (timeStr: string) => {
  try {
    const date = new Date(timeStr)
    const now = new Date()
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffMinutes < 1) return '刚刚更新'
    if (diffMinutes < 60) return `${diffMinutes}分钟前更新`
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}小时前更新`
    return date.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
  } catch {
    return '更新时间未知'
  }
}

// 格式化预报日期
const formatForecastDate = (dateStr: string) => {
  try {
    const date = new Date(dateStr)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)
    
    if (date.toDateString() === today.toDateString()) {
      return '今天'
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return '明天'
    } else {
      return `${date.getMonth() + 1}/${date.getDate()}`
    }
  } catch {
    return dateStr
  }
}

// 组件挂载时获取天气数据
onMounted(() => {
  fetchWeather()
})
</script>

<style scoped>
.weather-widget {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: rgba(0, 212, 255, 0.05);
  border-radius: 8px;
  overflow: hidden;
}

/* 加载状态 */
.weather-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #00d4ff;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid rgba(0, 212, 255, 0.3);
  border-top: 2px solid #00d4ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 0.5rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.weather-loading p {
  font-size: 0.9rem;
  margin: 0;
}

/* 错误状态 */
.weather-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  text-align: center;
}

.error-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.weather-error p {
  color: #ef4444;
  font-size: 0.9rem;
  margin: 0 0 1rem 0;
}

.retry-btn {
  background: rgba(0, 212, 255, 0.1);
  border: 1px solid rgba(0, 212, 255, 0.3);
  color: #00d4ff;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.3s ease;
}

.retry-btn:hover {
  background: rgba(0, 212, 255, 0.2);
  border-color: rgba(0, 212, 255, 0.5);
}

/* 天气内容 */
.weather-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0.75rem;
  gap: 0.75rem;
}

/* 当前天气 */
.current-weather {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.weather-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.location {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.location-icon {
  font-size: 0.8rem;
}

.location-text {
  font-size: 0.9rem;
  font-weight: 600;
  color: #00d4ff;
}

.update-time {
  font-size: 0.7rem;
  color: #64748b;
}

.weather-main {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
  align-items: flex-start;
}

/* 左侧：天气信息区域 */
.weather-info-section {
  flex: 1;
  min-width: 0;
}

/* 天气项容器 */
.weather-items-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

/* 统一的天气项样式 */
.weather-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.weather-item:hover {
  transform: translateY(-2px);
}

.weather-icon {
  font-size: 2.5rem;
  line-height: 1;
  flex-shrink: 0;
}

.weather-info {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  flex-shrink: 0;
}

.temperature {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
}

.weather-desc {
  font-size: 0.9rem;
  color: #e2e8f0;
}

/* 右侧：天气预报区域 */
.weather-forecast-section {
  flex: 0 0 200px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.forecast-title {
  font-size: 0.8rem;
  font-weight: 600;
  color: #00d4ff;
  text-align: center;
  margin-bottom: 0.25rem;
}

.forecast-list-compact {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.forecast-item-compact {
  background: rgba(0, 212, 255, 0.03);
  border-radius: 4px;
  border: 1px solid rgba(0, 212, 255, 0.08);
  padding: 0.3rem 0.5rem;
  font-size: 0.7rem;
}

.forecast-line {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  line-height: 1.2;
}

.forecast-day {
  color: #00d4ff;
  font-weight: 600;
  font-size: 0.65rem;
}

.forecast-date {
  color: #94a3b8;
  font-size: 0.9rem;
}

.forecast-week {
  color: #64748b;
  font-size: 0.6rem;
}

.forecast-weather {
  color: #e2e8f0;
  font-size: 0.9rem;
}

.forecast-temp {
  color: #e2e8f0;
  font-weight: 600;
  font-size: 0.9rem;
}

/* 无数据状态 */
.weather-no-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
}

.no-data-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.weather-no-data p {
  color: #64748b;
  font-size: 0.9rem;
  margin: 0 0 1rem 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .weather-content {
    padding: 0.5rem;
    gap: 0.5rem;
  }
  
  .weather-main {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .weather-forecast-section {
    flex: none;
    width: 100%;
  }
  
  .weather-items-container {
    justify-content: center;
    gap: 0.4rem;
  }
  
  .weather-icon {
    font-size: 2rem;
  }
  
  .temperature {
    font-size: 1.8rem;
  }
  
  .weather-desc {
    font-size: 0.8rem;
  }
  
  .forecast-list-compact {
    flex-direction: row;
    gap: 0.5rem;
  }
  
  .forecast-item-compact {
    flex: 1;
    padding: 0.3rem 0.4rem;
  }
  
  .forecast-line {
    text-align: center;
  }
}

@media (max-width: 480px) {
  .weather-content {
    padding: 0.4rem;
    gap: 0.4rem;
  }
  
  .weather-header {
    flex-direction: column;
    gap: 0.25rem;
    text-align: center;
    margin-bottom: 0.25rem;
  }
  
  .weather-main {
    margin-bottom: 0.25rem;
    gap: 0.5rem;
  }
  
  .weather-items-container {
    gap: 0.3rem;
  }
  
  .weather-icon {
    font-size: 1.5rem;
  }
  
  .temperature {
    font-size: 1.5rem;
  }
  
  .weather-desc {
    font-size: 0.7rem;
  }
  
  .weather-forecast-section {
    width: 100%;
  }
  
  .forecast-list-compact {
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .forecast-item-compact {
    padding: 0.2rem 0.4rem;
    font-size: 0.65rem;
  }
}
</style>

