# 阿里云服务器部署指南

本文档详细介绍如何将项目部署到阿里云服务器，并将数据从 SQLite 迁移到 MySQL。

## 目录
- [准备工作](#准备工作)
- [环境配置](#环境配置)
- [MySQL 数据库配置](#mysql-数据库配置)
- [代码部署](#代码部署)
- [PM2 进程管理](#pm2-进程管理)
- [Nginx 反向代理](#nginx-反向代理)
- [SSL 证书配置](#ssl-证书配置)
- [数据迁移](#数据迁移)
- [常见问题](#常见问题)

---

## 准备工作

### 1. 阿里云服务器要求
- **操作系统**：Ubuntu 20.04 / CentOS 7+ / Debian 11
- **配置**：至少 2核2G（生产环境建议 2核4G+）
- **安全组**：开放 22（SSH）、80（HTTP）、443（HTTPS）、3001（后端API）端口

### 2. 域名准备（可选）
- 准备一个域名并解析到服务器 IP
- 建议使用阿里云 DNS 解析

### 3. 本地工具
```bash
# 安装阿里云 CLI（用于上传文件，可选）
# 或使用 scp 命令直接上传
```

---

## 环境配置

### 1. 连接服务器
```bash
ssh root@你的服务器IP
```

### 2. 更新系统
```bash
# Ubuntu/Debian
apt update && apt upgrade -y

# CentOS
yum update -y
```

### 3. 安装 Node.js 18+
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs

# 验证
node -v  # 应显示 v18.x.x
npm -v

# CentOS
yum install -y nodejs
```

### 4. 安装 Git
```bash
# Ubuntu/Debian
apt install -y git

# CentOS
yum install -y git
```

### 5. 安装 PM2（进程管理器）
```bash
npm install -g pm2
pm2 install ubuntu-server-init
```

### 6. 安装 Nginx
```bash
# Ubuntu/Debian
apt install -y nginx

# CentOS
yum install -y nginx
```

---

## MySQL 数据库配置

### 1. 安装 MySQL 8.0
```bash
# Ubuntu/Debian
apt install -y mysql-server

# 启动并设置开机启动
systemctl start mysql
systemctl enable mysql

# CentOS
yum install -y mysql-server
systemctl start mysqld
systemctl enable mysqld
```

### 2. 安全配置
```bash
mysql_secure_installation
```

按照提示：
- 设置 root 密码（记住这个密码！）
- 删除匿名用户：Y
- 禁止 root 远程登录：N（开发环境）/ Y（生产环境）
- 删除测试数据库：Y
- 重新加载权限表：Y

### 3. 创建数据库和用户
```bash
mysql -u root -p
```

在 MySQL 命令行中执行：

```sql
-- 创建数据库
CREATE DATABASE admin_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建用户（修改 'your_password' 为强密码）
CREATE USER 'admin_user'@'localhost' IDENTIFIED BY 'your_strong_password';

-- 授予权限
GRANT ALL PRIVILEGES ON admin_system.* TO 'admin_user'@'localhost';

-- 刷新权限
FLUSH PRIVILEGES;

-- 退出
EXIT;
```

### 4. 验证连接
```bash
mysql -u admin_user -p
SHOW DATABASES;
```

---

## 代码部署

### 1. 创建项目目录
```bash
mkdir -p /var/www/admin-backend
cd /var/www/admin-backend
```

### 2. 从 GitHub 拉取代码
```bash
git clone https://github.com/zhixin2049/admin-backend.git .
```

### 3. 安装依赖
```bash
# 安装后端依赖
npm install

# 进入前端目录安装依赖
cd frontend
npm install
cd ..
```

### 4. 配置环境变量

创建 `.env` 文件：
```bash
cd /var/www/admin-backend
nano .env
```

添加以下内容（根据实际情况修改）：
```env
# 服务端口
PORT=3001

# JWT 密钥（使用强随机字符串，可以使用以下命令生成）
# openssl rand -base64 32
JWT_SECRET=your_super_secret_jwt_key_generate_with_openssl

# 数据库配置
DATABASE_URL="mysql://admin_user:your_strong_password@localhost:3306/admin_system"

# 生产环境标识
NODE_ENV=production
```

### 5. 修改 Prisma Schema 支持 MySQL

编辑 `prisma/schema.prisma`，将：
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

改为：
```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

### 6. 生成 Prisma Client 并创建表结构
```bash
npx prisma generate
npx prisma db push
```

### 7. 构建前端
```bash
cd frontend
npm run build
cd ..
```

前端构建产物会在 `frontend/dist` 目录。

---

## PM2 进程管理

### 1. 创建 PM2 配置文件
```bash
nano ecosystem.config.js
```

添加以下内容：
```javascript
module.exports = {
  apps: [
    {
      name: 'admin-backend',
      script: 'node_modules/.bin/ts-node',
      args: 'src/index.ts',
      cwd: '/var/www/admin-backend',
      interpreter: 'none',
      watch: false,
      instances: 1,
      autorestart: true,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: '/var/log/pm2/admin-backend-error.log',
      out_file: '/var/log/pm2/admin-backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss'
    }
  ]
};
```

### 2. 创建日志目录
```bash
mkdir -p /var/log/pm2
```

### 3. 启动应用
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 4. PM2 常用命令
```bash
# 查看状态
pm2 status

# 查看日志
pm2 logs admin-backend

# 重启应用
pm2 restart admin-backend

# 停止应用
pm2 stop admin-backend

# 监控资源使用
pm2 monit
```

---

## Nginx 反向代理

### 1. 创建 Nginx 配置文件
```bash
nano /etc/nginx/sites-available/admin-backend
```

添加以下内容（将 `your-domain.com` 替换为你的域名或 IP）：

```nginx
server {
    listen 80;
    server_name your-domain.com;  # 或服务器 IP

    # 前端静态文件
    root /var/www/admin-backend/frontend/dist;
    index index.html;

    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # 前端路由（React Router 需要）
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 后端 API 代理
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # 缓存静态资源
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # 日志配置
    access_log /var/log/nginx/admin-backend-access.log;
    error_log /var/log/nginx/admin-backend-error.log;

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

### 2. 启用配置
```bash
# 创建软链接
ln -s /etc/nginx/sites-available/admin-backend /etc/nginx/sites-enabled/

# 测试配置
nginx -t

# 重载 Nginx
systemctl reload nginx
systemctl enable nginx
```

### 3. 配置防火墙
```bash
# Ubuntu/Debian (UFW)
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp

# CentOS (firewalld)
firewall-cmd --permanent --add-port=80/tcp
firewall-cmd --permanent --add-port=443/tcp
firewall-cmd --permanent --add-port=22/tcp
firewall-cmd --reload
```

---

## SSL 证书配置

### 使用 Let's Encrypt 免费证书（推荐）

### 1. 安装 Certbot
```bash
# Ubuntu/Debian
apt install -y certbot python3-certbot-nginx

# CentOS
yum install -y certbot python3-certbot-nginx
```

### 2. 申请证书
```bash
# 确保域名已解析到服务器 IP
certbot --nginx -d your-domain.com
```

按照提示操作：
- 输入邮箱地址
- 同意服务条款
- 选择是否接受邮件
- 选择是否自动重定向（建议选择 2：重定向）

### 3. 自动续期
```bash
# 测试自动续期
certbot renew --dry-run

# 设置定时任务（自动续期）
systemctl status certbot.timer
```

---

## 数据迁移

### 方式一：从 SQLite 导出数据（如果有数据）

#### 1. 导出 SQLite 数据
在本地开发环境中执行：
```bash
cd admin-backend

# 安装 sqlite3 命令行工具
# Windows: 下载 sqlite-tools
# macOS: brew install sqlite3
# Linux: apt install sqlite3

# 导出数据为 SQL
sqlite3 prisma/dev.db ".dump" > backup.sql
```

#### 2. 清理 SQLite 特定的 SQL 语句
编辑 `backup.sql`，移除以下内容：
```sql
-- 删除这些行：
PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
COMMIT;
-- 删除创建和使用 sqlite_sequence 的语句
```

#### 3. 导入到 MySQL
```bash
# 在服务器上执行
mysql -u admin_user -p admin_system < backup.sql
```

### 方式二：重新初始化数据库

如果没有重要数据，可以直接重新初始化：
```bash
cd /var/www/admin-backend

# 清理旧数据库（如果存在）
npx prisma db push --force-reset

# 初始化默认数据
npx ts-node src/scripts/init-db.ts
```

---

## 生产环境配置

### 1. 设置目录权限
```bash
chown -R www-data:www-data /var/www/admin-backend
chmod -R 755 /var/www/admin-backend
```

### 2. 设置环境变量文件权限
```bash
chmod 600 /var/www/admin-backend/.env
```

### 3. 配置防火墙
```bash
# 只开放必要端口
ufw default deny incoming
ufw allow ssh
ufw allow http
ufw allow https
ufw enable
```

### 4. 设置 Swap（防止内存不足）
```bash
# 创建 2GB Swap
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

### 5. 配置定时备份
```bash
# 创建备份脚本
nano /usr/local/bin/backup.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR=/var/backups/admin-backend
mkdir -p $BACKUP_DIR

# 备份数据库
mysqldump -u admin_user -p admin_system > $BACKUP_DIR/db_$DATE.sql

# 备份环境变量（排除敏感信息）
cp /var/www/admin-backend/.env $BACKUP_DIR/.env_$DATE

# 保留最近 7 天的备份
find $BACKUP_DIR -mtime +7 -delete

echo "Backup completed: $DATE"
```

```bash
# 设置执行权限
chmod +x /usr/local/bin/backup.sh

# 添加定时任务
crontab -e
```

添加：
```
0 2 * * * /usr/local/bin/backup.sh >> /var/log/backup.log 2>&1
```

---

## 常见问题

### 1. PM2 无法启动
```bash
# 查看详细错误
pm2 logs admin-backend --err

# 检查 Node 版本
node -v  # 确保是 18.x

# 检查端口占用
lsof -i :3001
```

### 2. Nginx 502 Bad Gateway
- 检查 PM2 是否运行：`pm2 status`
- 检查后端是否监听正确端口：`curl http://localhost:3001`
- 检查 Nginx 错误日志：`tail -f /var/log/nginx/admin-backend-error.log`

### 3. 数据库连接失败
- 检查 `.env` 中的 `DATABASE_URL` 是否正确
- 测试数据库连接：`mysql -u admin_user -p admin_system`
- 检查 MySQL 是否运行：`systemctl status mysql`

### 4. 前端静态资源 404
- 确保前端已构建：`ls /var/www/admin-backend/frontend/dist`
- 检查 Nginx root 路径配置
- 清除浏览器缓存

### 5. SSL 证书申请失败
- 确保域名已正确解析：`ping your-domain.com`
- 确保 80 和 443 端口开放
- 检查 Cloudflare 等 DNS 服务是否暂停了代理

---

## 快速部署脚本

创建一个一键部署脚本：
```bash
nano /var/www/admin-backend/deploy.sh
```

```bash
#!/bin/bash
set -e

echo "=== 开始部署 ==="
cd /var/www/admin-backend

# 拉取最新代码
echo "拉取最新代码..."
git pull origin main

# 安装后端依赖
echo "安装后端依赖..."
npm install

# 安装前端依赖
echo "安装前端依赖..."
cd frontend
npm install

# 构建前端
echo "构建前端..."
npm run build
cd ..

# 重启应用
echo "重启应用..."
pm2 restart admin-backend

# 查看状态
pm2 status

echo "=== 部署完成 ==="
```

```bash
chmod +x /var/www/admin-backend/deploy.sh
```

以后部署只需运行：
```bash
/var/www/admin-backend/deploy.sh
```

---

## 访问地址

部署完成后，通过以下地址访问：

- **前台网站**：http://your-domain.com 或 http://服务器IP
- **管理后台**：http://your-domain.com/admin 或 http://服务器IP/admin
- **默认管理员账号**：admin
- **默认密码**：admin123

**重要**：首次登录后请立即修改默认密码！

---

## 技术支持

如果遇到问题，请检查：
1. `pm2 logs admin-backend` - 后端日志
2. `/var/log/nginx/admin-backend-error.log` - Nginx 错误日志
3. MySQL 错误日志 - `sudo tail -f /var/log/mysql/error.log`
