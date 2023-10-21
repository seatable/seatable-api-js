const fs = require('fs')
const { Base } = require('../lib');

const config = {
  server: 'http://127.0.0.1',
  APIToken: '41c667e75ff105563fbea5cf59cb3549d37e51c0'
};


async function testAPI() {
  const base = new Base(config);
  await base.auth();
  const data = await base.query('select * from Table1');
  fs.writeFileSync('./abc.json', JSON.stringify(data, null, 2))
}

testAPI();
