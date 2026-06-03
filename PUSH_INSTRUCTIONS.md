# 推送指南

## 快速推送（复制以下命令到终端）

```bash
cd c:\Users\admin\Documents\TRAESOLOCN\backend
git remote -v
git push -u origin main
```

## 如果遇到问题

### 1. 使用 HTTPS 方式
```bash
git remote set-url origin https://github.com/zhixin2049/admin-backend.git
git push -u origin main
```

### 2. 使用 SSH 方式（需要配置 SSH Key）
```bash
git remote set-url origin git@github.com:zhixin2049/admin-backend.git
git push -u origin main
```

### 3. 如果仓库不存在
需要先在 GitHub 上创建仓库：
1. 访问 https://github.com/new
2. Repository name: `admin-backend`
3. 选择 Private（私有）或 Public（公开）
4. 不要勾选 "Initialize this repository with a README"
5. 点击 "Create repository"
6. 按照页面上的说明推送代码

### 4. 配置 SSH Key（推荐）
```bash
# 检查是否已有 SSH Key
ls ~/.ssh

# 如果没有，生成新的 SSH Key
ssh-keygen -t ed25519 -C "your_email@example.com"

# 查看公钥
cat ~/.ssh/id_ed25519.pub

# 将公钥添加到 GitHub
# 访问 https://github.com/settings/keys
# 点击 "New SSH key"
# 粘贴公钥内容
```

## 验证推送成功
```bash
git log --oneline
# 应该看到类似输出：
# ae4174e feat: Express + tRPC + Prisma backend for admin system
```

## 克隆已推送的仓库
```bash
git clone https://github.com/zhixin2049/admin-backend.git
cd admin-backend
npm install
```
