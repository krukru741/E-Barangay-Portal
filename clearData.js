require('dotenv').config()
const { Client } = require('pg')

async function clearBadData() {
  const client = new Client({
    connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL
  })
  await client.connect()
  try {
    await client.query('DELETE FROM "Hearing";')
    await client.query('DELETE FROM "Blotter";')
    console.log('Successfully cleared old Blotter test data.')
  } catch (err) {
    console.error('Error clearing data:', err.message)
  } finally {
    await client.end()
  }
}

clearBadData()
