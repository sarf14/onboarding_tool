// Quick script to generate a secure JWT secret
const crypto = require('crypto');
const secret = crypto.randomBytes(32).toString('hex');
console.log('\n🔐 Generated JWT Secret:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(secret);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('\n✅ Copy this and use it as JWT_SECRET in your deployment\n');
