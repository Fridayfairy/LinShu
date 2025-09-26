# 天气API配置说明

## 和风天气API配置

### 1. 注册和风天气开发者账号
- 访问：https://dev.qweather.com/
- 注册账号并完成实名认证
- 创建应用获取API Key

### 2. 配置API密钥

#### 方法一：使用环境变量（推荐）
在项目根目录创建 `.env.local` 文件：

```bash
# 天气API配置
VITE_QWEATHER_API_KEY=您的和风天气API密钥
VITE_DEFAULT_CITY=北京
VITE_WEATHER_UPDATE_INTERVAL=300000

# 备用API配置（可选）
VITE_OPENWEATHER_API_KEY=您的OpenWeatherMap API密钥
```

#### 方法二：直接修改代码
在 `/frontend/src/api/weather/index.ts` 文件中，将默认值替换为您的实际API密钥：

```typescript
const QWEATHER_CONFIG = {
  API_KEY: import.meta.env.VITE_QWEATHER_API_KEY || '您的和风天气API密钥',
  BASE_URL: 'https://devapi.qweather.com/v7'
}
```

### 3. API使用限制
- **免费版**：每分钟1000次调用，每天10000次调用
- **个人开发者版**：每分钟1000次调用，每天100000次调用
- **商业版**：根据套餐不同，调用次数更多

### 4. 支持的功能
- ✅ 实时天气数据
- ✅ 3-7天天气预报
- ✅ 24小时逐小时预报
- ✅ 空气质量数据
- ✅ 生活指数
- ✅ 天气预警信息

## 备用API：OpenWeatherMap

如果和风天气API不可用，可以配置OpenWeatherMap作为备用：

### 1. 注册OpenWeatherMap账号
- 访问：https://openweathermap.org/api
- 注册免费账号
- 获取API密钥

### 2. 配置备用API
在 `/frontend/src/api/weather/index.ts` 文件中配置：

```typescript
const OPENWEATHER_CONFIG = {
  API_KEY: '您的OpenWeatherMap API密钥',
  BASE_URL: 'https://api.openweathermap.org/data/2.5'
}
```

### 3. OpenWeatherMap限制
- **免费版**：每分钟60次调用，每月1,000,000次调用
- **付费版**：根据套餐不同，调用次数更多

## 使用说明

### 1. 基本使用
```typescript
import { getCompleteWeather } from '@/api/weather'

// 获取北京天气
const weather = await getCompleteWeather('北京')
```

### 2. 城市搜索
```typescript
import { getCityInfo } from '@/api/weather'

// 搜索城市
const cities = await getCityInfo('上海')
```

### 3. 错误处理
组件已内置错误处理机制：
- API调用失败时自动使用模拟数据
- 显示友好的错误信息
- 提供重试按钮

## 注意事项

1. **API密钥安全**：请勿将API密钥提交到公共代码仓库
2. **调用频率**：注意API调用频率限制，避免超出免费额度
3. **数据缓存**：建议实现数据缓存机制，减少API调用次数
4. **错误处理**：生产环境中应实现完善的错误处理和降级方案

## 故障排除

### 常见问题

1. **API调用失败**
   - 检查API密钥是否正确
   - 确认网络连接正常
   - 查看浏览器控制台错误信息

2. **城市搜索失败**
   - 确认城市名称拼写正确
   - 尝试使用英文城市名
   - 检查城市是否在API覆盖范围内

3. **数据不准确**
   - 确认API数据源
   - 检查数据更新时间
   - 对比多个数据源

### 调试模式
在浏览器控制台中可以看到详细的API调用日志，帮助定位问题。
