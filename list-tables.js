const { Client } = require('pg');
async function main() {
  const c = new Client({ host: 'localhost', port: 5432, user: 'postgres', password: 'postgres', database: 'uilms' });
  await c.connect();
  const res = await c.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name");
  res.rows.forEach(r => console.log(r.table_name));
  await c.end();
}
main().catch(e => { console.error(e); process.exit(1); });
