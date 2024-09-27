#!/bin/bash

# 设置代理（如果需要）
# 取消注释下面的行来设置代理
# export https_proxy=http://127.0.0.1:7890 http_proxy=http://127.0.0.1:7890 all_proxy=socks5://127.0.0.1:7890

# 检查 Node.js 和 npm 是否已安装
if ! command -v node &> /dev/null || ! command -v npm &> /dev/null
then
    echo "Node.js 或 npm 未安装。正在使用 Homebrew 安装 Node.js..."
    brew install node
fi

# 显示 Node.js 和 npm 版本
echo "Node.js 版本:"
node --version
echo "npm 版本:"
npm --version

# 创建新的 React 项目
npx create-react-app urm-visualization
cd urm-visualization

# 安装 TypeScript 和相关类型定义
npm install --save-dev typescript @types/node @types/react @types/react-dom @types/jest

# 重命名 JavaScript 文件为 TypeScript 文件
mv src/App.js src/App.tsx
mv src/index.js src/index.tsx

# 安装 Tailwind CSS 和相关依赖
npm install -D tailwindcss@latest postcss@latest autoprefixer@latest
npx tailwindcss init -p

echo "项目设置完成。请手动编辑以下文件："
echo "1. tsconfig.json - 添加 TypeScript 配置"
echo "2. tailwind.config.js - 配置 Tailwind CSS"
echo "3. src/index.css - 添加 Tailwind 指令"
echo "4. src/App.tsx - 添加你的 React 组件代码"

echo "完成编辑后，运行 'npm start' 来启动你的项目。"