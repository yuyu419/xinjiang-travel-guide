# 伊犁旅行避坑攻略 PWA

这是一个零基础也能使用的纯静态网页 App。

## 里面有什么

- 首页
- 目的地列表
- 景点详情
- 路线规划
- 避坑指南
- 本地收藏
- 支持添加到 iPhone 主屏幕
- 支持基础离线缓存

## 文件说明

- `index.html`：网页入口
- `style.css`：样式
- `app.js`：页面交互
- `data.js`：旅行攻略内容，后续主要改这个文件
- `manifest.json`：让网站像 App 一样显示
- `service-worker.js`：基础离线缓存
- `icon.svg`：桌面图标

## 本地打开方法

直接双击 `index.html` 即可预览大部分内容。

如果收藏或离线功能在本地不稳定，属于正常现象，部署到 GitHub Pages 后会更稳定。

## 免费部署到 GitHub Pages

1. 登录 GitHub
2. 新建仓库，例如 `xinjiang-travel-guide`
3. 上传这些文件
4. 进入 Settings
5. 点击 Pages
6. Source 选择 `Deploy from a branch`
7. Branch 选择 `main`
8. Folder 选择 `/root`
9. 保存
10. 等待 GitHub 生成网址

## iPhone 添加到桌面

1. 用 Safari 打开 GitHub Pages 网址
2. 点击分享按钮
3. 选择“添加到主屏幕”
4. 命名为“伊犁攻略”
