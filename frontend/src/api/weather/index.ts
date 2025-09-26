// 和风天气API服务
// 文档：https://dev.qweather.com/docs/api/weather/

export interface WeatherLocation {
  name: string
  id: string
  lat: string
  lon: string
  adm2: string
  adm1: string
  country: string
  tz: string
  utcOffset: string
  isDst: string
  type: string
  rank: string
  fxLink: string
}

export interface WeatherNow {
  obsTime: string
  temp: string
  feelsLike: string
  icon: string
  text: string
  wind360: string
  windDir: string
  windScale: string
  windSpeed: string
  humidity: string
  precip: string
  pressure: string
  vis: string
  cloud: string
  dew: string
}

export interface WeatherDaily {
  fxDate: string
  tempMax: string
  tempMin: string
  textDay: string
  textNight: string
  iconDay: string
  iconNight: string
  wind360Day: string
  windDirDay: string
  windScaleDay: string
  windSpeedDay: string
  wind360Night: string
  windDirNight: string
  windScaleNight: string
  windSpeedNight: string
  humidity: string
  precip: string
  pressure: string
  vis: string
  cloud: string
  uvIndex: string
  temp: string
  pop: string
  dew: string
}

export interface WeatherResponse {
  code: string
  updateTime: string
  fxLink: string
  now: WeatherNow
  daily: WeatherDaily[]
  location: WeatherLocation[]
}

// 空气质量（实时）
export interface AirNow {
  pubTime: string
  aqi: string
  level: string
  category: string
  primary: string
}

// 逐小时预报条目
export interface HourlyItem {
  fxTime: string
  temp: string
  icon: string
  text: string
  wind360: string
  windDir: string
  windScale: string
  windSpeed: string
  pop: string
  precip: string
}

// 预警
export interface WarningItem {
  id: string
  pubTime: string
  title: string
  type: string
  level: string
  text: string
}

// 和风天气API配置
const QWEATHER_CONFIG = {
  // 从环境变量读取API密钥；默认空，防止使用无效占位符导致404
  API_KEY: import.meta.env.VITE_QWEATHER_API_KEY || '',
  // 凭据ID，用于JWT认证
  CREDENTIAL_ID: import.meta.env.VITE_QWEATHER_CREDENTIAL_ID || '',
  BASE_URL: `https://${import.meta.env.VITE_QWEATHER_API_APIHOST || 'devapi.qweather.com'}/v7`
}

// 注意：城市查询使用 geoapi.qweather.com 域名与 v2 版本，但如果有自定义域名，则使用自定义域名
const QWEATHER_GEO_BASE = import.meta.env.VITE_QWEATHER_API_APIHOST 
  ? `https://${import.meta.env.VITE_QWEATHER_API_APIHOST}/v2`
  : 'https://geoapi.qweather.com/v2'

// 默认城市配置
const DEFAULT_CITY = import.meta.env.VITE_DEFAULT_CITY || '北京'

// 天气更新间隔（毫秒）
const UPDATE_INTERVAL = parseInt(import.meta.env.VITE_WEATHER_UPDATE_INTERVAL || '300000')
// 能见度阈值（km），用于触发可视化告警
const VIS_ALERT_KM = parseFloat(import.meta.env.VITE_VIS_ALERT_KM || '5')

// 获取城市信息
export const getCityInfo = async (location: string): Promise<WeatherLocation[]> => {
  try {
    if (!QWEATHER_CONFIG.API_KEY || QWEATHER_CONFIG.API_KEY === 'YOUR_QWEATHER_API_KEY_HERE') {
      console.warn('和风天气API密钥未配置或使用默认占位符，请在 .env.local 文件中配置 VITE_QWEATHER_API_KEY')
      throw new Error('未配置和风天气API密钥 (VITE_QWEATHER_API_KEY)')
    }
    const url = `${QWEATHER_GEO_BASE}/city/lookup?location=${encodeURIComponent(location)}&key=${QWEATHER_CONFIG.API_KEY}`
    console.log('请求和风天气城市信息:', url.replace(QWEATHER_CONFIG.API_KEY, '***'))
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('和风天气城市信息响应:', data)
    // code 文档：https://dev.qweather.com/docs/resource/status-code/
    if (data.code !== '200') {
      console.error('QWeather city lookup error:', data)
      throw new Error(`QWeather city lookup error: ${data.code}`)
    }
    
    return data.location || []
  } catch (error) {
    console.error('获取城市信息失败:', error)
    throw error
  }
}

// 获取实时天气
export const getCurrentWeather = async (locationId: string): Promise<WeatherNow> => {
  try {
    if (!QWEATHER_CONFIG.API_KEY) {
      throw new Error('未配置和风天气API密钥 (VITE_QWEATHER_API_KEY)')
    }
    const response = await fetch(
      `${QWEATHER_CONFIG.BASE_URL}/weather/now?location=${locationId}&key=${QWEATHER_CONFIG.API_KEY}`
    )
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.code !== '200') {
      throw new Error(`API error: ${data.code}`)
    }
    
    return data.now
  } catch (error) {
    console.error('获取实时天气失败:', error)
    throw error
  }
}

// 获取天气预报
export const getWeatherForecast = async (locationId: string, days: number = 3): Promise<WeatherDaily[]> => {
  try {
    if (!QWEATHER_CONFIG.API_KEY) {
      throw new Error('未配置和风天气API密钥 (VITE_QWEATHER_API_KEY)')
    }
    const response = await fetch(
      `${QWEATHER_CONFIG.BASE_URL}/weather/${days}d?location=${locationId}&key=${QWEATHER_CONFIG.API_KEY}`
    )
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.code !== '200') {
      throw new Error(`API error: ${data.code}`)
    }
    
    return data.daily || []
  } catch (error) {
    console.error('获取天气预报失败:', error)
    throw error
  }
}

// 获取空气质量（实时）
export const getAirNow = async (locationId: string): Promise<AirNow | null> => {
  try {
    if (!QWEATHER_CONFIG.API_KEY) {
      return null
    }
    const response = await fetch(
      `${QWEATHER_CONFIG.BASE_URL}/air/now?location=${locationId}&key=${QWEATHER_CONFIG.API_KEY}`
    )
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    if (data.code !== '200') {
      return null
    }
    return data.now as AirNow
  } catch (error) {
    console.error('获取空气质量失败:', error)
    return null
  }
}

// 获取24小时逐小时预报
export const getHourly24h = async (locationId: string): Promise<HourlyItem[]> => {
  try {
    if (!QWEATHER_CONFIG.API_KEY) {
      return []
    }
    const response = await fetch(
      `${QWEATHER_CONFIG.BASE_URL}/weather/24h?location=${locationId}&key=${QWEATHER_CONFIG.API_KEY}`
    )
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    if (data.code !== '200') {
      return []
    }
    return (data.hourly || []) as HourlyItem[]
  } catch (error) {
    console.error('获取逐小时预报失败:', error)
    return []
  }
}

// 获取当前预警
export const getWarnings = async (locationId: string): Promise<WarningItem[]> => {
  try {
    if (!QWEATHER_CONFIG.API_KEY) {
      return []
    }
    const response = await fetch(
      `${QWEATHER_CONFIG.BASE_URL}/warning/now?location=${locationId}&key=${QWEATHER_CONFIG.API_KEY}`
    )
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    if (data.code !== '200') {
      return []
    }
    return (data.warning || []) as WarningItem[]
  } catch (error) {
    console.error('获取天气预警失败:', error)
    return []
  }
}

// 获取完整天气信息（实时+预报）
export const getCompleteWeather = async (location: string = DEFAULT_CITY): Promise<{
  location: WeatherLocation
  now: WeatherNow
  daily: WeatherDaily[]
  updateTime: string
}> => {
  try {
    // 1. 获取城市信息
    const locations = await getCityInfo(location)
    if (locations.length === 0) {
      throw new Error('未找到指定城市')
    }
    
    const cityInfo = locations[0]
    
    // 2. 并行获取实时天气和预报
    const [now, daily] = await Promise.all([
      getCurrentWeather(cityInfo.id),
      getWeatherForecast(cityInfo.id, 4) // 获取4天预报
    ])
    
    return {
      location: cityInfo,
      now,
      daily,
      updateTime: new Date().toISOString()
    }
  } catch (error) {
    console.error('获取完整天气信息失败:', error)
    throw error
  }
}

// 备用API：OpenWeatherMap（如果和风天气不可用）
const OPENWEATHER_CONFIG = {
  API_KEY: import.meta.env.VITE_OPENWEATHER_API_KEY || 'YOUR_OPENWEATHER_API_KEY',
  BASE_URL: 'https://api.openweathermap.org/data/2.5'
}

export const getOpenWeatherData = async (city: string = 'Beijing'): Promise<any> => {
  try {
    const response = await fetch(
      `${OPENWEATHER_CONFIG.BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${OPENWEATHER_CONFIG.API_KEY}&units=metric&lang=zh_cn`
    )
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('OpenWeatherMap API调用失败:', error)
    throw error
  }
}

// 导出配置常量供组件使用
export { DEFAULT_CITY, UPDATE_INTERVAL, VIS_ALERT_KM }
