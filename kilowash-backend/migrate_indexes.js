// Script: tambah Index untuk mempercepat query database
require('dotenv').config();
const { Sequelize } = require('sequelize');
const pg = require('pg');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectModule: pg,
  logging: false,
  dialectOptions: { ssl: { require: true, rejectUnauthorized: false } }
});

async function run() {
  const qi = sequelize.getQueryInterface();
  console.log('Menambahkan Database Indexes...');

  try {
    await qi.addIndex('orders', ['order_code']);
    console.log('✅ Index: orders.order_code');
  } catch (e) { console.log('⚠️ Index orders.order_code mungkin sudah ada'); }

  try {
    await qi.addIndex('orders', ['status']);
    console.log('✅ Index: orders.status');
  } catch (e) { console.log('⚠️ Index orders.status mungkin sudah ada'); }

  try {
    await qi.addIndex('orders', ['created_at']);
    console.log('✅ Index: orders.created_at');
  } catch (e) { console.log('⚠️ Index orders.created_at mungkin sudah ada'); }

  try {
    await qi.addIndex('customers', ['name']);
    console.log('✅ Index: customers.name');
  } catch (e) { console.log('⚠️ Index customers.name mungkin sudah ada'); }

  try {
    await qi.addIndex('customers', ['phone']);
    console.log('✅ Index: customers.phone');
  } catch (e) { console.log('⚠️ Index customers.phone mungkin sudah ada'); }

  await sequelize.close();
  console.log('🎉 Selesai membuat index!');
}

run().catch(e => { console.error('❌ Error:', e.message); process.exit(1); });
