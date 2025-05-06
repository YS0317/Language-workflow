const config = {
    // 开发环境
    development: {
        apiBaseUrl: 'http://localhost:3000'
    },
    // 生产环境
    production: {
        apiBaseUrl: 'https://your-backend-domain.com'  // 替换为您的后端服务地址
    }
};

// 根据当前环境选择配置
const env = window.location.hostname === 'localhost' ? 'development' : 'production';
const currentConfig = config[env];

export default currentConfig;