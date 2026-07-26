import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Mã hóa mật khẩu cho tài khoản Admin
  // Sử dụng bcryptjs để hash mật khẩu '123' với salt rounds = 10
  const hashedPassword = await bcrypt.hash('123', 10);

  // Khởi tạo tài khoản admin mặc định nếu chưa tồn tại
  const adminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
      name: 'Administrator',
      email: 'admin@eremsystem.local',
    },
  });

  console.log(`Tài khoản Admin đã được cấu hình thành công:`, adminUser.username);
  console.log('Không thêm dữ liệu giả (mock data) khác theo yêu cầu.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
