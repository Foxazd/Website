const bcrypt = require('bcryptjs'); // Sử dụng bcryptjs
const bcryptNative = require('bcrypt'); // Sử dụng bcrypt

async function testHashing() {
  const password = '123456789';

  // Sử dụng bcryptjs
  const hashedPasswordJS = await bcrypt.hash(password, 10);

  // Sử dụng bcrypt
  const hashedPasswordNative = await bcryptNative.hash(password, 10);

  console.log('bcryptjs hash:', hashedPasswordJS);
  console.log('bcrypt hash:', hashedPasswordNative);
}

testHashing();
