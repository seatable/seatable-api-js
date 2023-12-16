const fs = require('fs')
const { Base } = require('../lib');

const config = {
  server: 'https://dev.seatable.cn',
  APIToken: 'e16880c58426d59d698143f1dfb8abc8bd5d2ecc'
};


async function testAPI() {
  const base = new Base(config);
  await base.auth();
  const data = await base.deleteTable('Sheet1');
  console.log(data, 'ssssssss')
  // fs.writeFileSync('./abc.json', JSON.stringify(data, null, 2))
}

testAPI();
