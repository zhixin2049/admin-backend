# 安全防范规范

本文档说明本后台管理系统所采用的安全措施，供后端接口对接时参考实现。

---

## 一、同源策略（CORS）
- 后端设置 `Access-Control-Allow-Origin` 白名单，仅允许已知前端域名
- 禁止通配符 `*`（已登录接口）

## 二、CSRF 防御
- 采用双重保护：**CSRF Token**（存入 HttpOnly Cookie，前端从响应头或非 HttpOnly Cookie 读取附带请求头）
- 验证请求 `Referer / Origin` 头是否属于白名单域
- 敏感操作（删除/修改）增加**二次验证弹窗**确认

## 三、点击劫持（ClickJacking）
```
X-Frame-Options: SAMEORIGIN
Content-Security-Policy: frame-ancestors 'self'
```

## 四、XSS 防御
- Token 存入 **HttpOnly Cookie**（`localStorage` 仅作演示，生产环境应替换）
- 所有用户输入输出进行 HTML 转义
- 后端设置 CSP 响应头：
  ```
  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'
  ```
- 富文本内容使用白名单过滤（后端 DOMPurify 或等效库）

## 五、SQL 注入
- 后端全部使用**预编译语句（Prepared Statement）**
- ORM 层（如 Prisma/Sequelize/TypeORM）禁止拼接原始 SQL
- 所有输入字段长度和格式在前后端双重验证

## 六、文件上传
- 上传目录设置为**不可执行**
- 服务端生成随机文件名（UUID + 扩展名），不信任原始文件名
- MIME 类型白名单（`image/jpeg`, `image/png`, `image/webp`）
- 检测文件头（Magic Bytes）防止伪造扩展名
- 文件大小限制（默认 10MB）

## 七、Session / Token 安全
- JWT Token 有效期：`access_token` 2h，`refresh_token` 7d
- 支持**单设备登录**（新登录使旧 token 失效）
- Session ID 使用 `crypto.randomBytes(32)` 生成强随机数
- 登出时后端加入 token 黑名单或清除 refresh_token

## 八、授权控制（RBAC）
- 前端路由守卫：`AuthGuard` 检查 token + 角色
- 后端每个 API 接口中间件验证角色权限（`resource:action`）
- 数据级访问控制（Policy）：确保用户只能访问自己有权限的数据

## 九、密钥管理
- 所有密钥（JWT Secret、DB Password、OSS Keys）**只能通过环境变量**注入，禁止硬编码
- 使用 `crypto.randomBytes(64).toString('hex')` 生成 JWT Secret
- `.env` 文件加入 `.gitignore`，不提交到版本控制

---

## 前台 URL 设计规则

| 路径 | 说明 |
|------|------|
| `/` 或 `index.html` | 首页 |
| `/major/{slug}` | 专业主页 |
| `/major/{slug}/1` | 大卡片详情页 |
| `/major/{slug}/2~7` | 专栏卡片详情页（共6张） |
| `/videos` | 视频内容列表页 |
| `/videos/{id}` | 视频内容详情页 |
| `register.html` | 注册页面 |
| `login.html` | 前台登录页 |

### Slug 命名规范
- ✅ 只允许：小写字母（a-z）+ 数字（0-9）
- ❌ 禁止：连字符 `-`、下划线 `_`、空格、特殊符号、大写字母
- 示例：`law`、`computer`、`economics2024`

---

> 本文档由系统自动生成，请后端开发者对照实现各项安全措施。
