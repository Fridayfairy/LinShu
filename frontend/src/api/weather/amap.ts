// 高德天气API服务
// 文档：https://lbs.amap.com/api/webservice/guide/api/weatherinfo

export interface AmapWeatherInfo {
  province: string
  city: string
  adcode: string
  weather: string
  temperature: string
  winddirection: string
  windpower: string
  humidity: string
  reporttime: string
  temperature_float: string
  humidity_float: string
}

export interface AmapWeatherResponse {
  status: string
  count: string
  info: string
  infocode: string
  lives: AmapWeatherInfo[]
}

export interface AmapForecastInfo {
  city: string
  adcode: string
  province: string
  reporttime: string
  casts: AmapForecastItem[]
}

export interface AmapForecastItem {
  date: string
  week: string
  dayweather: string
  nightweather: string
  daytemp: string
  nighttemp: string
  daywind: string
  nightwind: string
  daypower: string
  nightpower: string
}

export interface AmapForecastResponse {
  status: string
  count: string
  info: string
  infocode: string
  forecasts: AmapForecastInfo[]
}

// 高德天气API配置
const AMAP_CONFIG = {
  API_KEY: 'a7733f85e5dc6af551bb9490e03e30d0', // 您提供的高德天气API密钥
  BASE_URL: 'https://restapi.amap.com/v3'
}

// 默认城市配置
const DEFAULT_CITY = '南京市'

// 获取实时天气
export const getAmapCurrentWeather = async (city: string = DEFAULT_CITY): Promise<AmapWeatherInfo | null> => {
  try {
    const url = `${AMAP_CONFIG.BASE_URL}/weather/weatherInfo?key=${AMAP_CONFIG.API_KEY}&city=${encodeURIComponent(city)}&extensions=base`
    console.log('请求高德实时天气:', url.replace(AMAP_CONFIG.API_KEY, '***'))
    
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data: AmapWeatherResponse = await response.json()
    console.log('高德实时天气响应:', data)
    
    if (data.status !== '1') {
      console.error('高德天气API错误:', data)
      throw new Error(`高德天气API错误: ${data.info}`)
    }
    
    return data.lives && data.lives.length > 0 ? data.lives[0] : null
  } catch (error) {
    console.error('获取高德实时天气失败:', error)
    throw error
  }
}

// 获取天气预报
export const getAmapWeatherForecast = async (city: string = DEFAULT_CITY): Promise<AmapForecastItem[]> => {
  try {
    const url = `${AMAP_CONFIG.BASE_URL}/weather/weatherInfo?key=${AMAP_CONFIG.API_KEY}&city=${encodeURIComponent(city)}&extensions=all`
    console.log('请求高德天气预报:', url.replace(AMAP_CONFIG.API_KEY, '***'))
    
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data: AmapForecastResponse = await response.json()
    console.log('高德天气预报响应:', data)
    
    if (data.status !== '1') {
      console.error('高德天气预报API错误:', data)
      throw new Error(`高德天气预报API错误: ${data.info}`)
    }
    
    return data.forecasts && data.forecasts.length > 0 ? data.forecasts[0].casts : []
  } catch (error) {
    console.error('获取高德天气预报失败:', error)
    throw error
  }
}

// 获取完整天气信息（实时+预报）
export const getAmapCompleteWeather = async (city: string = DEFAULT_CITY): Promise<{
  current: AmapWeatherInfo | null
  forecast: AmapForecastItem[]
  updateTime: string
}> => {
  try {
    // 并行获取实时天气和预报
    const [current, forecast] = await Promise.all([
      getAmapCurrentWeather(city),
      getAmapWeatherForecast(city)
    ])
    
    return {
      current,
      forecast,
      updateTime: new Date().toISOString()
    }
  } catch (error) {
    console.error('获取高德完整天气信息失败:', error)
    throw error
  }
}

// 天气图标映射
export const getWeatherIcon = (weather: string): string => {
  const iconMap: Record<string, string> = {
    '晴': '☀️',
    '多云': '⛅',
    '阴': '☁️',
    '小雨': '🌦️',
    '中雨': '🌧️',
    '大雨': '🌧️',
    '暴雨': '⛈️',
    '雷阵雨': '⛈️',
    '雪': '❄️',
    '雾': '🌫️',
    '霾': '😷',
    '沙尘': '🌪️'
  }
  
  return iconMap[weather] || '🌤️'
}

// 温度颜色映射
export const getTemperatureColor = (temp: number): string => {
  if (temp >= 35) return '#ff4757' // 高温红色
  if (temp >= 30) return '#ff6b35' // 炎热橙色
  if (temp >= 25) return '#ffa726' // 温暖黄色
  if (temp >= 20) return '#66bb6a' // 舒适绿色
  if (temp >= 15) return '#42a5f5' // 凉爽蓝色
  if (temp >= 10) return '#5c6bc0' // 冷紫色
  return '#3f51b5' // 寒冷深蓝
}

// 导出配置常量
export { DEFAULT_CITY }
