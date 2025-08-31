import { PrismaClient } from '../src/generated/prisma/index.js';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create categories
  const categories = [
    { name: 'Electronics', description: 'Phones, laptops, gadgets, and electronic accessories' },
    { name: 'Fashion', description: 'Clothing, shoes, accessories, and fashion items' },
    { name: 'Home & Garden', description: 'Furniture, home decor, garden tools, and household items' },
    { name: 'Sports & Outdoors', description: 'Sports equipment, outdoor gear, and fitness items' },
    { name: 'Books & Media', description: 'Books, movies, music, and educational materials' },
    { name: 'Toys & Games', description: 'Toys, board games, video games, and collectibles' },
    { name: 'Automotive', description: 'Car parts, accessories, and automotive tools' },
    { name: 'Health & Beauty', description: 'Skincare, makeup, health supplements, and beauty tools' }
  ];

  console.log('📂 Creating categories...');
  for (const categoryData of categories) {
    await prisma.category.upsert({
      where: { name: categoryData.name },
      update: {},
      create: categoryData
    });
  }

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@marketplace.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@marketplace.com',
      password: adminPassword,
      role: 'Admin',
      location: 'System',
      contactInfo: 'admin@marketplace.com'
    }
  });

  // Create sample seller
  const sellerPassword = await bcrypt.hash('seller123', 10);
  const seller = await prisma.user.upsert({
    where: { email: 'seller@marketplace.com' },
    update: {},
    create: {
      name: 'Sample Seller',
      email: 'seller@marketplace.com',
      password: sellerPassword,
      role: 'Seller',
      location: 'New York, NY',
      contactInfo: 'seller@marketplace.com'
    }
  });

  // Create sample buyer
  const buyerPassword = await bcrypt.hash('buyer123', 10);
  const buyer = await prisma.user.upsert({
    where: { email: 'buyer@marketplace.com' },
    update: {},
    create: {
      name: 'Sample Buyer',
      email: 'buyer@marketplace.com',
      password: buyerPassword,
      role: 'Buyer',
      location: 'Los Angeles, CA',
      contactInfo: 'buyer@marketplace.com'
    }
  });

  console.log('✅ Database seeding completed!');
  console.log('👤 Created users:');
  console.log(`   Admin: admin@marketplace.com / admin123`);
  console.log(`   Seller: seller@marketplace.com / seller123`);
  console.log(`   Buyer: buyer@marketplace.com / buyer123`);
  console.log(`📂 Created ${categories.length} categories`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
