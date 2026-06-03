# CHANGELOG

> 记录 Bug 修复、功能调整、样式调整
> 格式：`[日期] commit-hash 简述`

---

## 2026-05-22

### 功能调整

- **轮播图系统重构（未提交）**
  - 官网轮播图：从静态 `<div>` 替换为 antd `Carousel` arrows 样式（自动播放、左右箭头）
  - 数据源：从硬编码 → localStorage `mock_carousels`，管理后台修改实时反映到官网
  - 同步预读：`useState` 初始化直接读 localStorage，消除首帧 4→2 闪烁问题
  - 无数据回退：没有轮播图时显示 4 张渐变色占位卡片
  - 管理后台：图片 URL 输入 → 图片上传（`Upload` + `picture-card` + `FileReader` → base64）
  - 上传限制：jpg/png/jpeg，单文件 ≤ 2MB
  - 编辑回显：已有图片以缩略图展示在 Upload 组件中
  - 删除防抖：`setData(prev.filter(...))` 即时移除，不触发 loading
  - 默认数据：4 条首页轮播图（mock/index.ts）
  - 涉及文件：`Carousel.tsx`、`CarouselManage.tsx`、`api/index.ts`、`mock/index.ts`

### 文档

- **`4712f82`** 新增今日问题与解决方法汇总（`docs/issues-2026-05-21.md`，15 项）
- **`44dec83`** 更新项目状态文档和变更日志

## 2026-05-21

### 功能调整

- **`094bc47` 权限系统重构 + 管理员/角色持久化 + 多项bug修复**
  - 权限系统：双重检查（slug 匹配 + resource:action 权限），新增 ROUTE_PERMISSION 映射表（12 条路由）
  - 管理员/角色：localStorage 持久化（`mock_admins` / `mock_roles`），新增管理员自动存密码
  - 侧边菜单：按角色+权限过滤显示（`canAccess` + `filterRoutes`）
  - 路由守卫：`AuthGuard` 增加 resource:action 权限检查，传递 `path` prop
  - 内容管理：所有子路由（轮播图/专业/主页/视频）限制 `roles: ['superadmin']`
  - UI：顶栏隐藏管理员用户名，折叠按钮改橙色 `#ff8400`
  - 修复：未注册登录拦截、旧账号密码兼容、仪表盘动态数据、admin 用户名修正、管理员密码修改生效、
    新增管理员可登录、自定义角色菜单、内容管理权限隔离等共 14 项

- **`de8ec10` 登录认证完善 + 导航栏登录状态**
  - LoginPage 接入 `memberApi.login()` 凭证校验：非空 → 账号存在 → 未被禁用 → 密码匹配
  - 错误精确提示：账号未注册/已禁用/密码错误
  - store 新增 `useUserStore`（Zustand + persist, key: `user-storage`），存储前台登录用户
  - Navbar 读取 `useUserStore`：已登录显示用户名+退出按钮，未登录显示登录/注册
  - 涉及文件：`LoginPage.tsx`、`store/index.ts`、`Navbar.tsx`、`api/index.ts`

- **`b7f7c89` 新增官网登录页和注册页**
  - LoginPage.tsx：以 FrontWebpage LoginPage.jsx 为原型，TS + inline styles 重写
  - RegisterPage.tsx：完全重写，对齐 FrontWebpage RegisterPage.jsx 原型
  - 字段：账号名称/账号密码/手机号码/用户性别/所在省份
  - 路由 `/login`（前台登录）、`/register`（前台注册）
  - Navbar 登录按钮 href → `/login`

- **注册用户管理 — 新增用户功能**
  - memberApi 新增 `create()` 方法（去重校验、自动生成 id/registeredAt/lastLoginAt）
  - MemberList 新增「新增用户」按钮 + Modal 弹窗表单
  - 编辑弹窗新增「账号密码」字段（placeholder: "不修改密码留空"）

- **注册用户数据持久化**
  - `mock_members` localStorage 持久化（替代内存数组）
  - `memberApi.list()` 从 localStorage 读取，按注册时间降序
  - `memberApi.create/update/toggleStatus` 同步写入 localStorage

- **密码凭证存储 `mock_credentials`**
  - localStorage 键 `mock_credentials`：`{ username: pwd, phone: pwd }`
  - 注册时写入，登录时校验
  - 旧账号兼容：凭证缺失时首次登录补录密码

- **字段标签全链路统一**
  - 登录页：账号/手机、用户密码
  - 注册页：账号名称、账号密码、手机号码、用户性别、所在省份
  - 管理后台表格/弹窗同步对齐

### Bug 修复

- **修复未注册账号也能登录**
  - 根因：LoginPage.handleSubmit 仅做非空校验，无凭证验证
  - 修复：调用 `memberApi.login()` 校验账号存在性 + 密码

- **修复旧账号登录提示密码错误**
  - 根因：`mock_credentials` 新增后，凭证系统上线前注册的账号密码未存储，`creds[username]` 为 undefined
  - 修复：`storedPwd === undefined` 时视为旧账号首次登录，补录密码

- **修复 TreeSelect `value: undefined` 警告**
  - 根因：`treeData` 中"顶级菜单"根节点 `value: undefined`
  - 修复：移除包装根节点，直接暴露 `buildTreeData` 树

- **`buildNavTree` 孤儿节点被静默丢弃**
  - 根因：找不到父节点时直接丢弃，与 `buildTableTree` 行为不一致
  - 修复：孤儿节点提升为顶级

- **加固 parentId 类型处理**
  - `parentId === 0` / `''` 统一归一化为 `null`
  - 全部 parentId 比较改为 `Number()` 转换
  - 涉及文件：`NavMenuManage.tsx`、`navbar/utils.ts`、`api/index.ts`

### 样式调整

- **`e046776` 导航菜单表格默认全部展开**
  - Table 改为受控 `expandedRowKeys`，CRUD 后自动重新展开

- **`e046776` Vite 固定端口 5174 + strictPort**
  - 避免端口跳转导致 localStorage 按源隔离数据分裂

---

## 2026-05-20

### Bug 修复

- `4fb5b36` 修复添加子菜单后父菜单消失问题
  - 根因：`buildTableTree` 中 `Map` key 类型不一致（string vs number）导致父子关联失败
  - 修复：`map.set(Number(id), ...)` + `map.get(Number(parentId))`
  - 涉及文件：`src/pages/system/menu/NavMenuManage.tsx`

- `4fb5b36` 修复 `upsertMenu` 覆盖 children 导致子菜单消失
  - 根因：更新菜单时未保留原有 `children`
  - 修复：`{ ...m, ...menu, children: m.children }`
  - 涉及文件：`src/store/index.ts`

- `4fb5b36` 修复移动端 `<li>` 嵌套 `<li>` DOM 验证错误
  - 根因：`MobileNavItem` 根元素是 `<li>`，外层 `<ul>` 渲染时又包了一层 `<li>`
  - 修复：`MobileNavItem` 根元素改为 `<div>`
  - 涉及文件：`src/components/home/navbar/MobileNavItem.tsx`

- `4fb5b36` 修复第一个菜单项 hover 无下拉
  - 根因：第一个菜单项单独使用 `<MenuLink>` 渲染，未走 `DesktopNavItem`
  - 修复：所有顶级菜单项统一使用 `DesktopNavItem`
  - 涉及文件：`src/components/home/navbar/Navbar.tsx`

- `4fb5b36` 修复汉堡按钮点击无响应
  - 根因：汉堡按钮 `zIndex: 1001`，被左右 Logo/按钮（`zIndex: 1002`）截获点击事件
  - 修复：汉堡按钮 wrapper `zIndex` 提升至 `1003`
  - 涉及文件：`src/components/home/navbar/styles.ts`

---

### 功能调整

- `4fb5b36` 导航组件模块化重构
  - 从单文件 `Navbar.tsx` 拆分为 `navbar/` 目录下 6 个模块
  - 新增文件：`styles.ts` / `utils.ts` / `MenuLink.tsx` / `DesktopNavItem.tsx` / `MobileNavItem.tsx` / `index.ts`

- `6b2d946` 重构官网首页
  - 参考 gaokao 项目实现导航栏、专业卡片、内容列表组件

- `4060f98` 后台登录路由重命名
  - `/login` → `/adminlogin`，对应页面改名为 `AdminLogin.tsx`

---

### 样式调整

- `9f618d8` 导航下拉样式最终版
  - 子菜单项尺寸：`100px × 40px`
  - 子菜单默认背景：`#1a1a2e`（深蓝紫）+ 白色文字
  - 子菜单 hover：背景变 `#ff8400`（橙色）
  - 父菜单链接 hover：文字变 `#ff8400`
  - 下拉容器：透明背景，无阴影，无边框

- `4fb5b36` 导航栏三栏居中对齐
  - Logo `flex:1`（左）+ 菜单 `auto`（中）+ 按钮 `flex:1`（右）
