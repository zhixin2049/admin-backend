# React-admin 项目状态文档

> 最后更新：2026-05-29 | 高考志愿填报指南 CMS 系统

---

## 1. 项目概述

**高考志愿填报指南**全栈内容管理系统，React 18 + TypeScript + Vite + Ant Design 6 构建，包含：
- **官网前台**：首页、专业展示、视频内容、用户登录/注册
- **管理后台**：仪表盘、用户/角色/权限管理、内容 CRUD、系统配置

| 项 | 值 |
|---|---|
| 仓库 | https://gitee.com/zhixin2049/AdminTest |
| 框架 | React 18.3 + TypeScript 5.6 |
| UI | antd 6.4 + @ant-design/icons 6.2 |
| 路由 | react-router-dom 7.15 |
| 状态 | zustand 5.0 |
| HTTP | axios 1.16 |
| 富文本 | WangEditor 5 (`@wangeditor/editor`) |
| 构建 | Vite 5.4，端口 **5174**（strictPort） |
| 数据 | localStorage Mock 持久化 |

---

## 2. 目录结构

```
src/
├── App.tsx                      # 根组件（BrowserRouter）
├── main.tsx                     # 入口
├── api/index.ts                 # localStorage Mock API 层（12个资源模块）
├── mock/index.ts                # 默认 Mock 数据定义
├── types/index.ts               # 全局类型定义（20个接口）
├── store/index.ts               # Zustand 状态（auth/layout/tab/navMenu/user）
├── router/
│   ├── index.tsx                # 路由配置（懒加载 + AuthGuard）
│   └── routes.ts                # 菜单路由配置（权限声明）
├── utils/http.ts                # Axios 封装（Token/CSRF/错误处理）
├── styles/layout.css            # 后台布局样式
│
├── components/
│   ├── common/                  # 公共组件
│   │   ├── AuthGuard.tsx        # 路由守卫（RBAC 权限）
│   │   └── RichTextEditor.tsx   # WangEditor 封装
│   ├── home/                    # 前台组件
│   │   ├── Navbar.tsx           # 主导航栏（动态菜单 + 移动端 Drawer）
│   │   ├── Carousel.tsx         # 轮播图（图片/占位双模式）
│   │   ├── MajorCard.tsx        # 专业卡片
│   │   ├── ContentList.tsx      # 内容列表容器
│   │   └── navbar/              # 导航栏子模块（styles.ts/utils.ts）
│   └── layout/                  # 后台布局
│       ├── MainLayout.tsx       # 主布局（Sider+Header+Content）
│       ├── SideMenu.tsx         # 侧边栏菜单
│       ├── TopBar.tsx           # 顶栏
│       ├── TabsBar.tsx          # 多标签页导航
│       └── BreadcrumbBar.tsx    # 面包屑
│
├── pages/
│   ├── home/                    # 前台页面
│   │   ├── Home.tsx             # 首页
│   │   ├── LoginPage.tsx        # 用户登录
│   │   ├── RegisterPage.tsx     # 用户注册
│   │   ├── Lists.tsx            # 全部内容列表
│   │   ├── VideoDetail.tsx      # 视频详情
│   │   ├── MajorDetail.tsx      # 专业主页 /major/:slug
│   │   ├── MajorDetailBig.tsx   # 大卡片全屏版 /major/:slug/big
│   │   ├── MajorCardDetail.tsx  # 专栏卡片详情 /major/:slug/card/:cardId
│   │   └── data.ts              # 前台数据层
│   ├── adminlogin/AdminLogin.tsx # 后台登录
│   ├── dashboard/Dashboard.tsx   # 仪表盘
│   ├── user/                    # 用户管理
│   │   ├── members/MemberList.tsx  # 注册用户 CRUD
│   │   ├── admins/AdminList.tsx    # 管理员 CRUD
│   │   └── roles/RolePermission.tsx # 角色权限矩阵
│   ├── content/                 # 内容管理
│   │   ├── carousel/CarouselManage.tsx   # 轮播图管理
│   │   ├── major/MajorCategory.tsx      # 专业分类 CRUD
│   │   ├── majorhome/                   # 专业主页管理
│   │   │   ├── MajorHomeManage.tsx       # 主页配置入口
│   │   │   ├── FeaturedCardEditPage.tsx  # 大卡片编辑（多段富文本）
│   │   │   └── CardEditPage.tsx          # 专栏卡片编辑（多段富文本）
│   │   └── video/
│   │       ├── VideoGroup.tsx   # 视频分组
│   │       ├── VideoList.tsx    # 视频列表
│   │       └── VideoForm.tsx    # 视频编辑表单
│   └── system/                  # 系统设置
│       ├── site/SiteSettings.tsx  # 网站基础设置
│       ├── menu/NavMenuManage.tsx # 导航菜单管理
│       └── footer/FooterManage.tsx # 页脚管理
```

---

## 3. 完整路由表

### 前台路由（无权限要求）

| 路径 | 页面 | 说明 |
|------|------|------|
| `/` | Home | 首页（轮播 + 31 专业卡片 + 视频列表） |
| `/login` | LoginPage | 用户登录 |
| `/register` | RegisterPage | 用户注册 |
| `/adminlogin` | AdminLogin | 管理员登录 |
| `/videos` | Lists | 全部内容汇总（筛选 + 分页） |
| `/videos/detail/:id` | VideoDetail | 视频详情（B 站播放器） |
| `/major/:slug` | MajorDetail | 专业主页 |
| `/major/:slug/big` | MajorDetailBig | 专业大卡片全屏版 |
| `/major/:slug/card/:cardId` | MajorCardDetail | 专栏卡片详情 |

### 后台路由（需 AuthGuard）

| 路径 | 页面 | 权限 |
|------|------|------|
| `/admin` | → 重定向 /admin/dashboard | 登录 |
| `/admin/dashboard` | Dashboard | 登录 |
| `/admin/user/members` | MemberList | 用户管理 |
| `/admin/user/admins` | AdminList | 管理员管理 |
| `/admin/user/roles` | RolePermission | 角色权限 |
| `/admin/content/carousel` | CarouselManage | 轮播图 |
| `/admin/content/major` | MajorCategory | 专业分类 |
| `/admin/content/majorhome` | MajorHomeManage | 专业主页 |
| `/admin/content/video-group` | VideoGroup | 视频分组 |
| `/admin/content/video` | VideoList | 视频列表 |
| `/admin/content/video/create` | VideoForm | 新增视频 |
| `/admin/content/video/edit/:id` | VideoForm | 编辑视频 |
| `/admin/content/majorhome/card/edit/:cardId` | CardEditPage | 编辑专栏卡片 |
| `/admin/content/majorhome/featured/edit/:majorId` | FeaturedCardEditPage | 编辑大卡片 |
| `/admin/system/site` | SiteSettings | 网站设置 |
| `/admin/system/menu` | NavMenuManage | 导航菜单 |
| `/admin/system/footer` | FooterManage | 页脚管理 |
| `*` | → 重定向 `/` | 兜底 |

---

## 4. localStorage 数据键表

| Key | 类型 | 用途 |
|-----|------|------|
| `mock_members` | `Member[]` | 注册用户列表 |
| `mock_credentials` | `Record<string,string>` | 用户密码凭证（username/phone → password） |
| `mock_admins` | `Admin[]` | 管理员账号 |
| `mock_roles` | `Role[]` | 角色权限配置 |
| `mock_nav_menus` | `NavMenu[]` | 前台导航菜单 |
| `mock_carousel_items` | `Carousel[]` | 轮播图数据 |
| `mock_majors` | `MajorCategory[]` | 专业分类（31 条） |
| `mock_major_homes` | `Record<number, MajorHome>` | 专业主页配置 |
| `mock_video_groups` | `VideoGroup[]` | 视频分组 |
| `mock_videos` | `Video[]` | 视频内容 |
| `mock_footer_items` | `FooterItem[]` | 页脚信息 |
| `admin_token` | `string` | 管理员登录 token |
| `auth-storage` | Zustand persist | auth store（token + admin） |
| `layout-storage` | Zustand persist | layout store（collapsed + darkMode） |
| `navmenu-storage` | Zustand persist | 导航菜单 store |
| `user-storage` | Zustand persist | 前台用户 store |

---

## 5. 数据同步机制

管理后台修改数据后，通过 `window.dispatchEvent` 派发自定义事件，前台页面监听后自动刷新：

| 事件名 | 触发场景 | 监听页面 |
|--------|----------|----------|
| `major-data-changed` | 专业分类/专业主页 CRUD 后 | Home, MajorDetail, MajorDetailBig, MajorCardDetail |
| `video-data-changed` | 视频/视频分组 CRUD 后 | Home, MajorDetail |
| `carousel-data-changed` | 轮播图 CRUD 后 | 各页面 Carousel 组件内部 |

---

## 6. Zustand Store 一览

| Store | persist key | 核心字段 |
|-------|-------------|----------|
| `useAuthStore` | `auth-storage` | `token`, `admin`, `isLoggedIn` |
| `useLayoutStore` | `layout-storage` | `collapsed`, `darkMode` |
| `useTabStore` | 无 | `tabs[]`, `activeKey`（默认仪表盘 Tab 不可关闭） |
| `useNavMenuStore` | `navmenu-storage` | `menus[]`, `loaded` |
| `useUserStore` | `user-storage` | `user: Member \| null` |

---

## 7. 核心组件功能矩阵

### 专业主页系统（最近重点开发）

```
majorhome/
├── MajorHomeManage.tsx        # 入口：左专业列表 + 右大卡片/专栏卡片区
├── FeaturedCardEditPage.tsx   # 大卡片编辑：Form.List 多段富文本描述卡片
├── CardEditPage.tsx           # 专栏卡片编辑：同上结构 + SEO 字段
│
前台渲染：
├── MajorDetail.tsx            # /major/:slug 主页
├── MajorDetailBig.tsx         # /major/:slug/big 大卡片全屏（左内容+右目录）
└── MajorCardDetail.tsx        # /major/:slug/card/:cardId 专栏详情（复刻 Big）
```

当前交互行为：
- 大卡片（MajorDetail）：点击 → `window.open` 新标签 → `/major/:slug/big`
- 专栏卡片（MajorDetail）：点击 → `window.open` 新标签 → `/major/:slug/card/:cardId`

### 技术约定

| 约定 | 内容 |
|------|------|
| 富文本编辑器 | WangEditor 5，路径 `src/components/common/RichTextEditor.tsx` |
| 多描述卡片（Form.List） | 用 `display:none` 而非条件渲染，防止 Form.Item 卸载时 antd 清空字段值 |
| 向后兼容 | `content` 旧字符串自动转为 `[{title:'', content}]` 格式 |
| 渐变模拟边框 | `backgroundImage` + `backgroundSize`（`border` 不支持 linear-gradient） |
| 开发服务器 | 仅启动 AdminTest 端口 5174，不启动 FrontWebpage |
| 推送确认 | 代码修改后先展示效果，用户确认后再推送 |
| 推送目标 | 仅 origin → gitee.com/zhixin2049/AdminTest |

---

## 8. 字段命名约定（对接后台/数据库）

| 场景 | 标签 | 字段名 | 说明 |
|------|------|--------|------|
| 登录 | 账号/手机 | `account` | placeholder: "请输入账号名称或手机号码" |
| 登录 | 用户密码 | `password` | placeholder: "请输入用户密码" |
| 注册 | 账号名称 | `username` | 6~18 位数字/字母 |
| 注册 | 账号密码 | `password` | 6~12 位含数字+字母 |
| 注册 | 手机号码 | `phone` | `1[3-9]\d{9}` |
| 注册 | 用户性别 | `gender` | 1:男 2:女 |
| 注册 | 所在省份 | `province` | 31 省下拉 |
| 后台用户 | 同注册页 | 同注册页 | 表格列/弹窗统一 |

---

## 9. 依赖清单

### 运行时

| 包 | 版本 | 用途 |
|----|------|------|
| react / react-dom | ^18.3.1 | UI 框架 |
| antd | ^6.4.3 | UI 组件库 |
| @ant-design/icons | ^6.2.3 | 图标 |
| react-router-dom | ^7.15.1 | 路由 |
| zustand | ^5.0.13 | 状态管理 |
| axios | ^1.16.1 | HTTP 客户端 |
| dayjs | ^1.11.20 | 日期处理 |
| @wangeditor/editor | ^5.1.23 | 富文本内核 |
| @wangeditor/editor-for-react | ^1.0.6 | 富文本 React 适配 |

### 开发依赖

| 包 | 版本 |
|----|------|
| typescript | ~5.6.2 |
| vite | ^5.4.10 |
| @vitejs/plugin-react | ^4.3.3 |
| eslint 系列 | 9.x |

---

## 10. Vite 配置要点

- 端口：**5174**（`strictPort: true`）
- 别名：`@` → `src/`
- 代理：`/api/*` → `http://localhost:3000/*`（预留后端）
- 分包：react / antd / router 独立 chunk
- 自动打开浏览器：`open: true`
