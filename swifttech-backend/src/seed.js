const { pool } = require('./src/config/database');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const ADMIN_EMAIL = 'admin@swifttech.co.ke';
const ADMIN_PASSWORD = 'admin1234';

const sampleProducts = [
  {
    name: 'Samsung 55" 4K Smart TV',
    description: 'Ultra HD Smart TV with HDR, built-in WiFi and Alexa voice control.',
    price: 85000, original_price: 95000,
    category: 'electronics', brand: 'Samsung', sku: 'ST-TV-55-001', stock: 12,
    images: [], specs: [
      { label: 'Screen Size', value: '55"' },
      { label: 'Resolution', value: '4K UHD' },
      { label: 'Smart OS', value: 'Tizen' },
    ], featured: true, status: 'active',
  },
  {
    name: 'LG Side-by-Side Refrigerator 700L',
    description: 'Premium frost-free refrigerator with inverter compressor for energy efficiency.',
    price: 145000, original_price: 160000,
    category: 'home_appliances', brand: 'LG', sku: 'ST-FRIDGE-700-001', stock: 5,
    images: [], specs: [
      { label: 'Capacity', value: '700L' },
      { label: 'Energy Rating', value: 'A++' },
      { label: 'Compressor', value: 'Inverter' },
    ], featured: true, status: 'active',
  },
  {
    name: 'Bosch 1200W Angle Grinder',
    description: 'Professional-grade angle grinder ideal for cutting, grinding, and polishing.',
    price: 12500, original_price: 14000,
    category: 'tools', brand: 'Bosch', sku: 'ST-TOOL-AG-001', stock: 30,
    images: [], specs: [
      { label: 'Power', value: '1200W' },
      { label: 'Disc Size', value: '125mm' },
      { label: 'Speed', value: '11,000 RPM' },
    ], featured: false, status: 'active',
  },
  {
    name: 'Industrial Air Compressor 50L',
    description: 'Heavy-duty air compressor for industrial and workshop use.',
    price: 38000, original_price: 42000,
    category: 'machinery', brand: 'DeWalt', sku: 'ST-MACH-AC-001', stock: 8,
    images: [], specs: [
      { label: 'Tank Capacity', value: '50L' },
      { label: 'Pressure', value: '8 bar' },
      { label: 'Voltage', value: '220V' },
    ], featured: false, status: 'active',
  },
  {
    name: 'HP LaserJet Pro MFP',
    description: 'All-in-one laser printer with print, scan, copy and wireless connectivity.',
    price: 28000, original_price: 32000,
    category: 'electronics', brand: 'HP', sku: 'ST-PRINT-HP-001', stock: 15,
    images: [], specs: [
      { label: 'Print Speed', value: '22ppm' },
      { label: 'Connectivity', value: 'Wi-Fi, USB' },
      { label: 'Monthly Duty', value: '20,000 pages' },
    ], featured: false, status: 'active',
  },
  {
    name: 'Raspberry Pi 4 Model B (8GB)',
    description: 'Single-board computer with 8GB RAM for prototyping and embedded systems.',
    price: 8500,
    category: 'components', brand: 'Raspberry Pi', sku: 'ST-COMP-RPI4-001', stock: 50,
    images: [], specs: [
      { label: 'RAM', value: '8GB LPDDR4' },
      { label: 'CPU', value: 'Quad-core 1.8GHz' },
      { label: 'USB', value: '2× USB 3.0, 2× USB 2.0' },
    ], featured: false, status: 'active',
  },
];

async function seed() {
  const client = await pool.connect();
  try {
    console.log('🌱 Seeding database...\n');

    // Create admin user
    const hash = await bcrypt.hash(ADMIN_PASSWORD, 12);
    await client.query(
      `INSERT INTO users (email, password_hash, name, role)
       VALUES ($1, $2, $3, 'admin')
       ON CONFLICT (email) DO UPDATE SET password_hash = $2, name = $3`,
      [ADMIN_EMAIL, hash, 'Swift Tech Admin']
    );
    console.log(`✅ Admin user: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);

    // Insert products
    for (const p of sampleProducts) {
      await client.query(
        `INSERT INTO products
          (name, description, price, original_price, category, brand, sku,
           stock, images, specs, featured, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
         ON CONFLICT (sku) DO NOTHING`,
        [
          p.name, p.description, p.price, p.original_price || 0, p.category,
          p.brand, p.sku, p.stock,
          JSON.stringify(p.images), JSON.stringify(p.specs),
          p.featured, p.status,
        ]
      );
      console.log(`✅ Product: ${p.name}`);
    }

    console.log('\n🎉 Seeding complete!');
    console.log('\nAdmin login:');
    console.log(`  Email:    ${ADMIN_EMAIL}`);
    console.log(`  Password: ${ADMIN_PASSWORD}`);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch(() => process.exit(1));
