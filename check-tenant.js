const { Client } = require('pg');
async function main() {
  const c = new Client({ host: 'localhost', port: 5432, user: 'postgres', password: 'postgres', database: 'uilms' });
  await c.connect();
  
  const t = await c.query("SELECT id, name, slug FROM tenant WHERE id='00000000-0000-0000-0000-000000000001'");
  console.log('Tenant:', t.rows);
  
  const b = await c.query("SELECT id, name FROM branch WHERE id='00000000-0000-0000-0000-000000000001'");
  console.log('Branch:', b.rows);

  // Also check all tenants and branches available
  const allT = await c.query("SELECT id, name, slug FROM tenant");
  console.log('\nAll Tenants:', allT.rows);
  
  const allB = await c.query("SELECT id, name, \"tenantId\" FROM branch");
  console.log('All Branches:', allB.rows);
  
  await c.end();
}
main().catch(e => { console.error(e); process.exit(1); });
