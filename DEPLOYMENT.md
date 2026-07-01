# CarCar English Linux 部署手册

本项目是 React + TypeScript + Vite 静态前端应用。生产环境推荐用 Nginx 托管 `dist/`，不需要 Node.js 常驻服务。

## 1. 服务器环境

推荐环境：

- Ubuntu 22.04 / Debian 12 / CentOS 8+
- Node.js 20 LTS 或 22 LTS
- Nginx
- 可选：域名、HTTPS 证书

检查版本：

```bash
node -v
npm -v
nginx -v
```

安装 Node.js 和 Nginx，以 Ubuntu 为例：

```bash
sudo apt update
sudo apt install -y nginx curl
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
```

## 2. 上传代码

方式 A：用 Git 拉取：

```bash
cd /var/www
sudo git clone <你的仓库地址> carcar-english
sudo chown -R $USER:$USER /var/www/carcar-english
cd /var/www/carcar-english
```

方式 B：本地打包上传：

```bash
# 本地
npm install
npm run build
```

然后把 `dist/` 上传到服务器，例如：

```bash
scp -r dist/* root@你的服务器IP:/var/www/carcar-english/dist/
```

## 3. 安装依赖并构建

如果在服务器上构建：

```bash
cd /var/www/carcar-english
npm ci
npm run build
```

构建成功后会生成：

```text
/var/www/carcar-english/dist/
```

## 4. 配置 Nginx

创建配置文件：

```bash
sudo nano /etc/nginx/sites-available/carcar-english
```

写入以下内容，把 `your-domain.com` 改成你的域名；没有域名可先用服务器 IP。

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/carcar-english/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|svg|webp|ico|woff2?)$ {
        expires 30d;
        add_header Cache-Control "public, max-age=2592000, immutable";
        try_files $uri =404;
    }
}
```

启用配置：

```bash
sudo ln -s /etc/nginx/sites-available/carcar-english /etc/nginx/sites-enabled/carcar-english
sudo nginx -t
sudo systemctl reload nginx
```

访问：

```text
http://your-domain.com
```

## 5. 配置 HTTPS

如果有域名，推荐使用 Certbot：

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

自动续期检查：

```bash
sudo certbot renew --dry-run
```

## 6. 防火墙

Ubuntu UFW 示例：

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

云服务器还需要在安全组里开放：

- 80
- 443

## 7. 更新部署

服务器上更新代码：

```bash
cd /var/www/carcar-english
git pull
npm ci
npm run build
sudo systemctl reload nginx
```

如果只是上传本地构建结果，覆盖 `dist/` 后 reload Nginx 即可：

```bash
sudo systemctl reload nginx
```

## 8. 注意事项

- Web Speech API 使用浏览器语音能力，通常需要用户点击后才能播放声音。
- 学习进度和星星保存在浏览器 `localStorage`，换设备或清浏览器数据会丢失。
- 车标页面当前会从外部图标服务加载真实品牌图标，服务器不需要代理；但访问端浏览器需要能访问这些图标服务。
- 如果要做完全离线部署，建议把车标图片批量下载到 `public/logos/`，再改成本地路径。

## 9. 常见问题

### 打开页面是 404

确认 Nginx 配置里有：

```nginx
try_files $uri $uri/ /index.html;
```

### 页面空白

检查构建是否成功：

```bash
npm run build
```

检查 Nginx root 是否指向：

```text
/var/www/carcar-english/dist
```

### 声音不播放

浏览器通常要求先点击页面按钮后才允许语音播放。请点击 `Listen` 或车辆/车标卡片。

