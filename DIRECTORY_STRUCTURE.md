# 项目目录结构

## 完整文件列表

```
admin-backend/
│
├── .env                        # 环境变量配置
├── .gitignore                  # Git 忽略规则
├── package.json                # 根目录配置文件
├── package-lock.json           # 依赖锁定文件
├── PUSH_INSTRUCTIONS.md        # 推送说明文档
├── README.md                   # 项目说明文档
├── tsconfig.json               # TypeScript 配置
│
├── .github/                    # GitHub 配置
│   └── workflows/
│       └── ci.yml             # CI/CD 工作流配置
│
├── frontend/                   # 前端项目
│   ├── docs/
│   │   ├── issues-2026-05-21.md
│   │   └── issues-carousel-2026-05-22.md
│   │
│   ├── public/
│   │   └── vite.svg
│   │
│   ├── src/
│   │   ├── api/
│   │   │   ├── index.ts
│   │   │   └── trpcApi.ts
│   │   │
│   │   ├── assets/
│   │   │   └── react.svg
│   │   │
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── AuthGuard.tsx
│   │   │   │   └── RichTextEditor.tsx
│   │   │   │
│   │   │   ├── home/
│   │   │   │   ├── Carousel.tsx
│   │   │   │   ├── ContentList.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   ├── MajorCard.tsx
│   │   │   │   ├── Navbar.tsx
│   │   │   │   └── navbar/
│   │   │   │       ├── Navbar.tsx
│   │   │   │       ├── styles.ts
│   │   │   │       └── utils.ts
│   │   │   │
│   │   │   └── layout/
│   │   │       ├── BreadcrumbBar.tsx
│   │   │       ├── SideMenu.tsx
│   │   │       ├── TabsBar.tsx
│   │   │       └── TopBar.tsx
│   │   │
│   │   ├── layouts/
│   │   │   └── MainLayout.tsx
│   │   │
│   │   ├── mock/
│   │   │   └── index.ts
│   │   │
│   │   ├── pages/
│   │   │   ├── adminlogin/
│   │   │   │   └── AdminLogin.tsx
│   │   │   │
│   │   │   ├── content/
│   │   │   │   ├── carousel/
│   │   │   │   │   └── CarouselManage.tsx
│   │   │   │   ├── major/
│   │   │   │   │   └── MajorCategory.tsx
│   │   │   │   ├── majorhome/
│   │   │   │   │   ├── CardEditPage.tsx
│   │   │   │   │   ├── FeaturedCardEditPage.tsx
│   │   │   │   │   └── MajorHomeManage.tsx
│   │   │   │   └── video/
│   │   │   │       ├── VideoForm.tsx
│   │   │   │       ├── VideoGroup.tsx
│   │   │   │       └── VideoList.tsx
│   │   │   │
│   │   │   ├── dashboard/
│   │   │   │   └── Dashboard.tsx
│   │   │   │
│   │   │   ├── home/
│   │   │   │   ├── data.ts
│   │   │   │   ├── Home.tsx
│   │   │   │   ├── Lists.tsx
│   │   │   │   ├── LoginPage.tsx
│   │   │   │   ├── MajorCardDetail.tsx
│   │   │   │   ├── MajorDetail.tsx
│   │   │   │   ├── MajorDetailBig.tsx
│   │   │   │   ├── RegisterPage.tsx
│   │   │   │   └── VideoDetail.tsx
│   │   │   │
│   │   │   ├── system/
│   │   │   │   ├── footer/
│   │   │   │   │   └── FooterManage.tsx
│   │   │   │   ├── menu/
│   │   │   │   │   └── NavMenuManage.tsx
│   │   │   │   └── site/
│   │   │   │       └── SiteSettings.tsx
│   │   │   │
│   │   │   └── user/
│   │   │       ├── admins/
│   │   │       │   └── AdminList.tsx
│   │   │       ├── members/
│   │   │       │   └── MemberList.tsx
│   │   │       └── roles/
│   │   │           └── RolePermission.tsx
│   │   │
│   │   ├── router/
│   │   │   ├── index.tsx
│   │   │   └── routes.ts
│   │   │
│   │   ├── store/
│   │   │   └── index.ts
│   │   │
│   │   ├── styles/
│   │   │   └── layout.css
│   │   │
│   │   ├── types/
│   │   │   └── index.ts
│   │   │
│   │   ├── utils/
│   │   │   ├── http.ts
│   │   │   ├── trpc.ts
│   │   │   └── trpcClient.ts
│   │   │
│   │   ├── App.css
│   │   ├── App.tsx
│   │   ├── index.css
│   │   ├── main.tsx
│   │   └── vite-env.d.ts
│   │
│   ├── .gitignore
│   ├── AUDIT_REPORT.md
│   ├── CHANGELOG.md
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── PROJECT_STATUS.md
│   ├── README.md
│   ├── SECURITY.md
│   ├── start-dev.mjs
│   ├── tsconfig.app.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── tsconfig.tsbuildinfo
│   ├── vite.config.d.ts
│   ├── vite.config.mjs
│   └── vite.config.ts
│
├── prisma/                     # Prisma 数据库配置
│   ├── dev.db                  # SQLite 数据库文件
│   └── schema.prisma           # 数据库模型定义
│
└── src/                        # 后端项目
    ├── context.ts              # tRPC 上下文配置
    ├── index.ts                # 后端入口文件
    ├── prisma.ts               # Prisma 客户端
    ├── trpc.ts                 # tRPC 初始化配置
    │
    ├── middleware/              # 中间件
    │   └── auth.ts             # 认证中间件
    │
    ├── routers/                # tRPC 路由
    │   ├── admin.ts            # 管理员管理
    │   ├── auth.ts             # 认证接口
    │   ├── content.ts          # 内容管理（轮播图、专业、视频）
    │   ├── dashboard.ts         # 仪表盘统计
    │   ├── index.ts            # 路由汇总
    │   ├── member.ts           # 用户管理
    │   ├── role.ts             # 角色权限
    │   └── system.ts           # 系统设置
    │
    └── scripts/                 # 脚本
        └── init-db.ts          # 数据库初始化脚本
```

## 文件统计

| 类别 | 文件数 | 说明 |
|------|--------|------|
| 前端 TypeScript/TSX 文件 | 52+ | React 组件、页面、工具函数 |
| 前端配置文件 | 15+ | package.json, vite.config, tsconfig 等 |
| 后端 TypeScript 文件 | 12+ | tRPC 路由、中间件、配置 |
| 文档文件 | 10+ | README, CHANGELOG, 推送说明等 |
| 数据库文件 | 2 | Prisma schema, SQLite 数据库 |
| **总计** | **100+** | 完整的全栈项目 |

## 技术栈

### 前端
- React 18
- TypeScript
- Vite
- Ant Design
- React Router
- Zustand (状态管理)
- Axios
- tRPC Client

### 后端
- Express.js
- TypeScript
- tRPC Server
- Prisma ORM
- SQLite / MySQL / TiDB
- JWT 认证
- bcryptjs 密码加密

## 快速开始

### 安装依赖
```bash
# 前端
cd frontend
npm install

# 后端
cd ../backend
npm install
```

### 初始化数据库
```bash
npx prisma generate
npx prisma db push
npx ts-node src/scripts/init-db.ts
```

### 启动开发服务器
```bash
# 前端
cd frontend
npm run dev

# 后端
cd backend
npm run dev
```

## 默认账号
- **管理员账号**: admin
- **密码**: admin123
