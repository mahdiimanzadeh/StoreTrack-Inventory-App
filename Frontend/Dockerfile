# Dockerfile برای فرانت‌اند (React)

# مرحله 1: ساخت ایمیج بیس برای ساخت (Build Stage)
# از ایمیج رسمی Node.js برای ساخت پروژه React استفاده می‌کنیم.
FROM node:20-alpine as builder

# تنظیم دایرکتوری کاری
WORKDIR /app

# کپی کردن فایل‌های package.json و package-lock.json
COPY package*.json ./

# نصب وابستگی‌ها
RUN npm install

# کپی کردن بقیه فایل‌های پروژه فرانت‌اند
COPY . .

# ساخت پروژه React برای محیط Production
# این دستور فایل‌های بهینه‌سازی شده را در پوشه 'build' ایجاد می‌کند.
RUN npm run build

# مرحله 2: ساخت ایمیج نهایی (Serve Stage)
# از ایمیج Nginx سبک برای سرو کردن فایل‌های استاتیک استفاده می‌کنیم.
FROM nginx:alpine

# کپی کردن فایل‌های ساخته شده از مرحله 'builder' به دایرکتوری Nginx
COPY --from=builder /app/build /usr/share/nginx/html

# کپی کردن فایل پیکربندی Nginx (اختیاری: اگر نیاز به پیکربندی خاص Nginx دارید)
# اگر فایل nginx.conf سفارشی دارید، آن را در پوشه Frontend ایجاد کنید و این خط را فعال کنید.
# COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# اکسپوز کردن پورت Nginx (پورت پیش‌فرض برای سرویس HTTP)
EXPOSE 80

# دستور اجرای Nginx
CMD ["nginx", "-g", "daemon off;"]
