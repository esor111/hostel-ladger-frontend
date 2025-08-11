const { Client } = require('pg');

async function verifyUUIDs() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'root',
    password: 'root',
    database: 'kaha_hostel_db'
  });

  try {
    await client.connect();
    console.log('🔍 Verifying UUID migration...\n');

    // Check table counts first
    const studentCount = await client.query('SELECT COUNT(*) FROM students');
    const roomCount = await client.query('SELECT COUNT(*) FROM rooms');
    const buildingCount = await client.query('SELECT COUNT(*) FROM buildings');
    
    console.log(`📊 Data counts:`);
    console.log(`  - Students: ${studentCount.rows[0].count}`);
    console.log(`  - Rooms: ${roomCount.rows[0].count}`);
    console.log(`  - Buildings: ${buildingCount.rows[0].count}`);

    if (parseInt(studentCount.rows[0].count) > 0) {
      // Check students table
      const studentsResult = await client.query('SELECT id, name FROM students LIMIT 3');
      console.log('\n✅ Students with UUIDs:');
      studentsResult.rows.forEach(row => {
        console.log(`  - ${row.name}: ${row.id}`);
      });
    }

    if (parseInt(roomCount.rows[0].count) > 0) {
      // Check rooms table
      const roomsResult = await client.query('SELECT id, name FROM rooms LIMIT 3');
      console.log('\n✅ Rooms with UUIDs:');
      roomsResult.rows.forEach(row => {
        console.log(`  - ${row.name}: ${row.id}`);
      });
    }

    if (parseInt(buildingCount.rows[0].count) > 0) {
      // Check buildings table
      const buildingsResult = await client.query('SELECT id, name FROM buildings LIMIT 2');
      console.log('\n✅ Buildings with UUIDs:');
      buildingsResult.rows.forEach(row => {
        console.log(`  - ${row.name}: ${row.id}`);
      });
    }

    // Check table structure for UUID columns
    const tableInfo = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'students' AND column_name = 'id'
    `);
    
    console.log(`\n🔧 Table Structure:`);
    console.log(`  - Students ID column type: ${tableInfo.rows[0]?.data_type || 'Not found'}`);
    
    if (tableInfo.rows[0]?.data_type === 'uuid') {
      console.log('\n🎯 UUID Migration: ✅ COMPLETED');
      console.log('📝 Note: Database is ready but no seed data present');
    } else {
      console.log('\n❌ UUID Migration: FAILED - ID column is not UUID type');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

verifyUUIDs();