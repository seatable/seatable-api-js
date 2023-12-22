const fs = require('fs')
const { Base } = require('../lib');

const config = {
  server: 'http://127.0.0.1',
  APIToken: 'acdf4e21d4a0f36686848d81523a2df4ab67bf2d'
};


async function testAPI() {
  const base = new Base(config);
  await base.auth();
  const data = await base.query('select * from Table2');
  fs.writeFileSync('./abc.json', JSON.stringify(data, null, 2))
}

testAPI();
