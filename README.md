# 视频展示平台

## 命令行

> 先安装依赖 npm install

开发: npm run dev

构建: npm run build

运行: npm run start

## 维护

available via `npm run`:
  dev
    next dev
  build
    next build
  lint
    eslint
  db:generate
    drizzle-kit generate
  db:migrate
    drizzle-kit migrate
  db:seed
    tsx db/seed.ts

  配置

  - drizzle.config.ts：dialect: 'sqlite' → dialect: 'postgresql'
  - .env / .env.example：DATABASE_URL 改为 PostgreSQL 连接字符串格式

  后续步骤

  1. 在 .env 中填入你的 Neon/Vercel Postgres 数据库连接字符串
  2. 运行 npm run db:generate 生成 PostgreSQL 迁移
  3. 运行 npm run db:migrate 执行迁移
  4. 运行 npm run db:seed 创建初始管理员账号