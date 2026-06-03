# 管理后台系统

基于 React 18 + TypeScript + Ant Design 6.x + Vite 构建的通用后台管理系统。

## 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| React | 18.3.1 | 前端框架 |
| TypeScript | 5.6.2 | 类型安全 |
| Ant Design | 6.4.3 | UI 组件库 |
| React Router | 7.15.1 | 路由（懒加载） |
| Zustand | 5.0.13 | 轻量状态管理（含持久化） |
| Axios | 1.16.1 | HTTP 请求封装 |
| Vite | 5.4.10 | 构建工具 |

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器（端口 5174）
npm run dev

# 构建生产包
npm run build

# 预览生产包
npm run preview
```

## 演示账号

### 后台管理
```
地址：http://localhost:5174/adminlogin
账号：admin
密码：admin123
角色：超级管理员（superadmin）
```

### 前台用户
```
地址：http://localhost:5174/login
可通过 /register 注册新账号
```

## 页面结构

本项目包含两部分：

### 官网前台（公开访问）
- `/` — 官网首页（高考志愿填报指南）
- `/login` — 用户登录（凭证校验）
- `/register` — 用户注册（6 字段）

### 管理后台（需登录）
- `/admin/dashboard` — 仪表盘
- `/admin/user/*` — 用户管理（注册用户 / 管理员 / 角色权限）
- `/admin/content/*` — 内容管理（轮播图 / 专业分类 / 专业主页 / 视频）
- `/admin/system/*` — 系统设置（网站设置 / 导航菜单 / 页脚）

## 项目结构

```
src/
├── api/              # API 接口封装（Mock 数据模式）
├── components/
│   ├── common/       # 公共组件（AuthGuard 权限守卫）
│   ├── home/         # 官网组件（Navbar / Carousel / MajorCard / ContentList）
│   └── layout/       # 布局组件（侧边栏/顶栏/标签栏/面包屑）
├── layouts/          # 主布局（MainLayout）
├── mock/            # Mock 数据结构 + 演示数据
├── pages/
│   ├── home/         # 官网页面（Home / Login / Register）
│   ├── adminlogin/   # 后台登录页
│   ├── dashboard/    # 仪表盘
│   ├── user/         # 用户管理（注册用户/管理员/角色权限）
│   ├── content/      # 内容管理（轮播图/专业/专业主页/视频）
│   └── system/       # 系统设置（网站设置/导航菜单/页脚）
├── router/           # 路由配置（懒加载 + AuthGuard）
├── store/            # Zustand 状态管理（5 个 Store，含 localStorage 持久化）
├── styles/           # 全局样式
├── types/            # TypeScript 类型定义
└── utils/            # 工具函数（Axios 封装含 Token 注入/CSRF/错误拦截）
```

## 组件列表

### 首页组件 (`src/components/home/`)

| 组件 | 说明 |
|------|------|
| `navbar/Navbar` | 官网导航栏（桌面/移动端自适应，支持多级下拉菜单） |
| `navbar/DesktopNavItem` | 桌面端菜单项（hover 下拉子菜单） |
| `navbar/MobileNavItem` | 移动端菜单项（点击展开/折叠） |
| `navbar/MenuLink` | 通用链接（内链用 Link，外链用 a） |
| `Carousel` | 首页轮播图 |
| `ContentList` | 首页内容列表 |
| `MajorCard` | 专业分类卡片 |

### 布局组件 (`src/components/layout/`)

| 组件 | 说明 |
|------|------|
| `SideMenu` | 侧边栏菜单（多级嵌套、默认展开、当前高亮） |
| `TopBar` | 顶栏（折叠按钮 + 深色模式 + 用户下拉 + 返回官网） |
| `TabsBar` | 多 Tab 标签页（可关闭，仪表盘不可关闭） |
| `BreadcrumbBar` | 面包屑导航（动态生成、可点击跳转） |

### 公共组件 (`src/components/common/`)

| 组件 | 说明 |
|------|------|
| `AuthGuard` | 路由守卫（检查登录状态 + RBAC 角色权限） |

## 功能模块

### 前台登录/注册
- 用户注册：账号名/密码/手机/性别/省份，6 字段
- 用户登录：支持用户名或手机号 + 密码
- 凭证校验：未注册提示、禁用提示、密码错误提示
- 登录状态：导航栏实时显示用户名 + 退出按钮
- 数据持久化：localStorage（`mock_members` + `mock_credentials`）

### 登录/认证（后台）
- 账号密码登录（演示账号 admin/admin123）
- JWT Token 存储（localStorage 持久化）
- 刷新页面保持登录状态

### 权限控制（RBAC）
- AuthGuard 路由守卫：检查登录状态 + 角色权限
- 角色 slug：`superadmin` / `editor`
- 超级管理员可访问全部页面，编辑角色仅可访问内容管理

### 侧边栏菜单
- 多级嵌套菜单（支持 3 层）
- 默认展开全部，支持手动收起/展开
- 当前页面高亮

### Tab 标签页
- 自动记录访问过的页面
- 支持关闭标签（仪表盘不可关闭）
- 点击标签切换页面

### 面包屑导航
- 随路由自动生成
- 点击跳转上级菜单

### 管理后台页面

| 路径 | 模块 | 功能 |
|------|------|------|
| /admin/dashboard | 仪表盘 | 4 统计卡片 + 2 数据表格 |
| /admin/user/members | 注册用户 | 搜索/新增/编辑/详情/状态开关 |
| /admin/user/admins | 管理员账号 | 增删改查 |
| /admin/user/roles | 角色权限 | 左右双栏权限矩阵 |
| /admin/content/carousel | 轮播图 | 排序/上下架 |
| /admin/content/major | 专业分类 | 颜色选择器 |
| /admin/content/majorhome | 专业主页 | 大卡片 + 专栏卡片编辑 |
| /admin/content/video-group | 视频分组 | 分组配置 |
| /admin/content/video | 视频列表 | 高级搜索 + 富文本表单 |
| /admin/system/site | 网站设置 | 基础信息 |
| /admin/system/menu | 导航菜单 | 树形无限层级 |
| /admin/system/footer | 页脚管理 | 增删改排序 |

### 其他功能
- 深色模式切换
- 侧边栏折叠/展开
- 响应式布局

## Mock 数据说明

所有 API 调用均使用本地 Mock 数据。持久化策略：

| 数据 | 存储方式 | localStorage Key |
|------|----------|------------------|
| 注册用户 | localStorage | `mock_members` |
| 密码凭证 | localStorage | `mock_credentials` |
| 导航菜单 | localStorage | `mock_nav_menus` |
| 管理员/角色/权限 | 内存 | — |
| 内容数据（轮播图/视频等） | 内存 | — |

接入真实后端时，只需将 `src/api/index.ts` 中的 Mock 函数替换为 `http.get/post/put/delete` 调用即可，无需修改业务代码。

## 相关文档

- [PROJECT_STATUS.md](./PROJECT_STATUS.md) — 详细项目状态
- [CHANGELOG.md](./CHANGELOG.md) — 变更记录
- [SECURITY.md](./SECURITY.md) — 安全规范

## 开发状态

- [x] 项目初始化与构建
- [x] 后台登录/登出
- [x] 前台登录/注册（凭证校验 + 数据持久化）
- [x] RBAC 权限控制
- [x] 侧边栏多级菜单
- [x] Tab 标签页
- [x] 面包屑
- [x] 深色模式
- [x] 响应式布局
- [x] 所有页面模块 CRUD
- [ ] 官网内容详情页（专业解读/院校查询/就业分析/志愿填报）
- [ ] 接入真实后端 API
- [ ] 单元测试
