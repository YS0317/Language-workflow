const express = require('express');
const cors = require('cors');
const axios = require('axios');
const multer = require('multer');
const FormData = require('form-data');
const app = express();
const port = 3000;

// 配置 multer 用于处理文件上传
const upload = multer({ storage: multer.memoryStorage() });

// 允许跨域请求
app.use(cors({
    origin: true,  // 允许所有来源
    credentials: true,  // 允许credentials
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// 环境变量
const API_KEY = 'app-15PRVqE0AhKReF8datoRJUuJ';
const API_BASE_URL = 'https://mify-be.pt.xiaomi.com/api/v1';

// 文件上传接口
app.post('/api/upload', upload.single('file'), async (req, res) => {
    try {
        console.log('收到上传请求');
        
        if (!req.file) {
            console.error('未收到文件');
            return res.status(400).json({ error: '未收到文件' });
        }

        console.log('文件信息:', {
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size
        });

        // 将JS文件内容转换为TXT格式
        const jsContent = req.file.buffer.toString('utf-8');
        const txtContent = jsContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        const txtBuffer = Buffer.from(txtContent, 'utf-8');

        // 创建 FormData 对象
        const formData = new FormData();
        formData.append('file', txtBuffer, {
            filename: 'converted.txt',
            contentType: 'text/plain'
        });
        formData.append('user', 'abc-123');
        formData.append('type', 'TXT');

        console.log('准备发送到API');
        
        const response = await axios.post(`${API_BASE_URL}/files/upload`, formData, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                ...formData.getHeaders()
            }
        });

        console.log('API响应:', response.data);
        res.json(response.data);
    } catch (error) {
        console.error('上传错误:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        
        res.status(error.response?.status || 500).json({
            error: '上传失败',
            details: error.response?.data || error.message
        });
    }
});

// 工作流运行接口
app.post('/api/workflows/run', async (req, res) => {
    try {
        console.log('收到工作流请求:', req.body);
        
        const response = await axios.post(`${API_BASE_URL}/workflows/run`, req.body, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            responseType: 'stream'
        });
        
        // 设置响应头
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        
        // 转发流式响应
        response.data.pipe(res);
    } catch (error) {
        console.error('工作流错误:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        
        res.status(error.response?.status || 500).json({
            error: '请求失败',
            details: error.response?.data || error.message
        });
    }
});

app.listen(port, () => {
    console.log(`服务器运行在 http://localhost:${port}`);
}); 