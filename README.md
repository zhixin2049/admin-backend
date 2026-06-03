# Admin System Backend

基于 Express + tRPC + Prisma + MySQL 的全栈管理系统后端。

## 技术栈

- Node.js 20+
- Express 4.x
- tRPC 10.x
- Prisma ORM
- MySQL / TiDB
- TypeScript

## 项目结构

```
backend/
├── src/
│   ├── routers/          # tRPC 路由
│   │   ├── auth.ts       # 认证相关接口
│   │   ├── admin.ts      # 管理员管理
│   │   ├── member.ts     # 用户管理
│   │   ├── role.ts       # 角色权限管理
│   │   ├── content.ts    # 内容管理（轮播图、专业、视频）
│   │   ├── system.ts     # 系统设置（网站设置、导航、页脚）
│   │   ├── dashboard.ts  # 仪表盘统计
│   │   └── index.ts      # 路由汇总
│   ├── middleware/       # 中间件
│   │   └── auth.ts       # 权限校验中间件
│   ├── context.ts        # tRPC 上下文
│   ├── trpc.ts           # tRPC 初始化配置
│   ├── prisma.ts         # Prisma 客户端
│   ├── scripts/          # 脚本
│   │   └── init-db.ts    # 数据库初始化脚本
│   └── index.ts          # 应用入口
├── prisma/
│   └── schema.prisma     # Prisma 数据库模型定义
├── .env                  # 环境变量
└── package.json
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置数据库

修改 `.env` 文件，配置数据库连接：

```env
PORT=3001
JWT_SECRET=your_jwt_secret_key_here_must_be_at_least_32_characters_long
DATABASE_URL="mysql://username:password@localhost:3306/admin_test"
```

### 3. 创建数据库表

```bash
npx prisma migrate dev --name init
```

### 4. 初始化基础数据

```bash
npx ts-node src/scripts/init-db.ts
```

这将创建：
- 权限资源列表
- 预设角色（超级管理员、内容编辑）
- 默认管理员账号：admin/admin123
- 专业分类数据
- 轮播图数据
- 视频分组数据
- 导航菜单数据

### 5. 启动开发服务器

```bash
npm run dev
```

后端服务将在 `http://localhost:3001` 启动。

## API 接口

### 认证接口

- `POST /api/trpc/auth.login` - 管理员登录
- `POST /api/trpc/auth.logout` - 管理员登出
- `GET /api/trpc/auth.getProfile` - 获取当前管理员信息

### 仪表盘接口

- `GET /api/trpc/dashboard.getStats` - 获取统计数据
- `GET /api/trpc/dashboard.getGroupVideoStats` - 获取分组视频统计
- `GET /api/trpc/dashboard.getMajorVideoStats` - 获取专业视频统计

### 用户管理接口

- `GET /api/trpc/member.list` - 获取用户列表（分页）
- `POST /api/trpc/member.create` - 创建用户
- `PUT /api/trpc/member.update` - 更新用户信息
- `POST /api/trpc/member.toggleStatus` - 切换用户状态
- `POST /api/trpc/member.login` - 用户登录（前端用户）

### 管理员管理接口

- `GET /api/trpc/admin.list` - 获取管理员列表（分页）
- `POST /api/trpc/admin.create` - 创建管理员
- `PUT /api/trpc/admin.update` - 更新管理员信息
- `DELETE /api/trpc/admin.remove` - 删除管理员

### 角色权限接口

- `GET /api/trpc/role.list` - 获取角色列表
- `POST /api/trpc/role.create` - 创建角色
- `PUT /api/trpc/role.update` - 更新角色信息
- `DELETE /api/trpc/role.remove` - 删除角色
- `GET /api/trpc/role.permissions` - 获取所有权限列表

### 内容管理接口

#### 轮播图
- `GET /api/trpc/content.carousel.list` - 获取轮播图列表
- `GET /api/trpc/content.carousel.adminList` - 获取所有轮播图（管理后台）
- `POST /api/trpc/content.carousel.create` - 创建轮播图
- `PUT /api/trpc/content.carousel.update` - 更新轮播图
- `DELETE /api/trpc/content.carousel.remove` - 删除轮播图
- `POST /api/trpc/content.carousel.reorder` - 重新排序轮播图

#### 专业分类
- `GET /api/trpc/content.major.list` - 获取专业分类列表
- `GET /api/trpc/content.major.adminList` - 获取所有专业（管理后台）
- `GET /api/trpc/content.major.getBySlug` - 按标识获取专业
- `POST /api/trpc/content.major.create` - 创建专业分类
- `PUT /api/trpc/content.major.update` - 更新专业分类
- `DELETE /api/trpc/content.major.remove` - 删除专业分类

#### 视频分组
- `GET /api/trpc/content.videoGroup.list` - 获取视频分组列表
- `GET /api/trpc/content.videoGroup.adminList` - 获取所有分组（管理后台）
- `POST /api/trpc/content.videoGroup.create` - 创建视频分组
- `PUT /api/trpc/content.videoGroup.update` - 更新视频分组
- `DELETE /api/trpc/content.videoGroup.remove` - 删除视频分组

#### 视频管理
- `GET /api/trpc/content.video.list` - 获取视频列表（分页）
- `GET /api/trpc/content.video.adminList` - 获取所有视频（管理后台）
- `POST /api/trpc/content.video.create` - 创建视频
- `PUT /api/trpc/content.video.update` - 更新视频信息
- `DELETE /api/trpc/content.video.remove` - 删除视频

### 系统设置接口

#### 网站设置
- `GET /api/trpc/system.siteSettings.get` - 获取网站设置
- `POST /api/trpc/system.siteSettings.save` - 保存网站设置

#### 导航菜单
- `GET /api/trpc/system.navMenu.list` - 获取导航菜单（树形结构）
- `GET /api/trpc/system.navMenu.adminList` - 获取所有菜单（管理后台）
- `POST /api/trpc/system.navMenu.create` - 创建导航菜单
- `PUT /api/trpc/system.navMenu.update` - 更新导航菜单
- `DELETE /api/trpc/system.navMenu.remove` - 删除导航菜单

#### 页脚管理
- `GET /api/trpc/system.footer.list` - 获取页脚列表
- `GET /api/trpc/system.footer.adminList` - 获取所有页脚（管理后台）
- `POST /api/trpc/system.footer.create` - 创建页脚项
- `PUT /api/trpc/system.footer.update` - 更新页脚项
- `DELETE /api/trpc/system.footer.remove` - 删除页脚项

## 权限说明

系统采用基于角色的权限控制（RBAC）：

### 预设角色

1. **超级管理员** (superadmin)
   - 拥有所有权限
   - 不能被删除

2. **内容编辑** (editor)
   - 拥有轮播图、专业分类、视频的读写权限
   - 没有删除权限

### 权限资源

| 资源 | 操作 | 说明 |
|------|------|------|
| dashboard | read | 查看仪表盘 |
| member | read/write/delete | 用户管理 |
| admin | read/write/delete | 管理员管理 |
| role | read/write/delete | 角色管理 |
| carousel | read/write/delete | 轮播图管理 |
| major | read/write/delete | 专业分类管理 |
| video | read/write/delete | 视频管理 |
| siteSettings | read/write | 网站设置 |
| navMenu | read/write/delete | 导航菜单管理 |
| footer | read/write/delete | 页脚管理 |

## JWT 认证

登录成功后返回 JWT Token，后续请求需在 Header 中携带：

```
Authorization: Bearer <token>
```

Token 有效期为 7 天。

## 开发注意事项

1. 确保 Node.js 版本 >= 20
2. 数据库需提前创建（库名：admin_test）
3. JWT_SECRET 建议使用 32 位以上随机字符串
4. 生产环境需修改默认管理员密码
