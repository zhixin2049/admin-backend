# 升学志愿指导平台 - 全栈项目

基于 React + Express + tRPC + Prisma 的全栈管理平台，包含官网展示和管理后台。

## 🏗️ 项目架构

```
admin-backend/
├── frontend/              # 前端项目 (React + Vite)
│   ├── src/
│   │   ├── api/         # API 接口层
│   │   ├── components/   # React 组件
│   │   ├── pages/       # 页面
│   │   ├── router/       # 路由配置
│   │   ├── store/        # 状态管理
│   │   └── mock/         # 模拟数据
│   ├── package.json
│   └── vite.config.ts
│
├── backend/              # 后端项目 (Express + tRPC)
│   ├── src/
│   │   ├── routers/     # tRPC 路由
│   │   ├── middleware/   # 中间件
│   │   ├── scripts/     # 数据库初始化脚本
│   │   └── prisma.ts    # 数据库客户端
│   ├── prisma/          # Prisma Schema
│   └── package.json
│
├── prisma/              # 数据库配置
│   └── schema.prisma
│
└── package.json         # 根目录配置
```

## 🚀 快速开始

### 1. 安装依赖

```bash
# 安装根目录依赖
npm install

# 或分别安装前后端依赖
cd frontend && npm install
cd ../backend && npm install
```

### 2. 配置数据库

后端使用 SQLite 作为开发数据库，无需额外安装数据库软件。

如需使用 MySQL/TiDB，修改 `prisma/schema.prisma`：

```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

### 3. 初始化数据库

```bash
cd backend
npx prisma generate
npx prisma db push
npx ts-node src/scripts/init-db.ts
```

### 4. 启动开发服务器

```bash
# 同时启动前后端（需要 concurrently）
npm run dev:all

# 或分别启动
npm run dev:frontend  # 前端: http://localhost:5173
npm run dev:backend   # 后端: http://localhost:3001
```

## 📦 技术栈

### 前端
- React 18
- TypeScript
- Vite
- Ant Design
- React Router
- Zustand (状态管理)
- Axios

### 后端
- Express.js
- TypeScript
- tRPC (类型安全的 API)
- Prisma ORM
- SQLite / MySQL / TiDB
- JWT 认证
- bcryptjs 密码加密

## 🔐 默认账号

- **管理员账号**: admin
- **密码**: admin123

## 📚 API 接口

### 认证接口
- `POST /api/trpc/auth.login` - 管理员登录
- `POST /api/trpc/auth.logout` - 登出
- `GET /api/trpc/auth.getProfile` - 获取用户信息

### 用户管理
- `GET /api/trpc/member.list` - 用户列表
- `POST /api/trpc/member.create` - 创建用户
- `PUT /api/trpc/member.update` - 更新用户
- `POST /api/trpc/member.toggleStatus` - 切换状态

### 内容管理
- `GET/POST/PUT/DELETE /api/trpc/content.carousel.*` - 轮播图
- `GET/POST/PUT/DELETE /api/trpc/content.major.*` - 专业分类
- `GET/POST/PUT/DELETE /api/trpc/content.video.*` - 视频管理
- `GET/POST/PUT/DELETE /api/trpc/content.videoGroup.*` - 视频分组

### 系统设置
- `GET/POST /api/trpc/system.siteSettings.*` - 网站设置
- `GET/POST/PUT/DELETE /api/trpc/system.navMenu.*` - 导航菜单
- `GET/POST/PUT/DELETE /api/trpc/system.footer.*` - 页脚管理

### 仪表盘
- `GET /api/trpc/dashboard.getStats` - 统计数据
- `GET /api/trpc/dashboard.getGroupVideoStats` - 分组视频统计
- `GET /api/trpc/dashboard.getMajorVideoStats` - 专业视频统计

## 🛠️ 开发指南

### 前端开发

```bash
cd frontend
npm run dev    # 启动开发服务器
npm run build  # 构建生产版本
```

### 后端开发

```bash
cd backend
npm run dev    # 启动开发服务器
npm run build  # 构建生产版本
npx prisma studio  # 打开数据库管理界面
```

### 数据库迁移

```bash
cd backend
npx prisma migrate dev --name init  # 创建迁移
npx prisma migrate deploy          # 应用迁移
npx prisma db push                 # 同步 schema 到数据库
```

## 📝 许可证

ISC
