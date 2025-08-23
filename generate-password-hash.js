import bcrypt from 'bcrypt';

async function generateHash() {
  const passwords = ['password', 'bachawa123'];
  const saltRounds = 10;
  
  for (const password of passwords) {
    try {
      const hash = await bcrypt.hash(password, saltRounds);
      console.log('Password:', password);
      console.log('Hash:', hash);
      console.log('---');
    } catch (error) {
      console.error('Error generating hash:', error);
    }
  }
  
  // Test the known hash
  const knownHash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';
  const testPassword = 'password';
  const isMatch = await bcrypt.compare(testPassword, knownHash);
  console.log('Testing known hash:', knownHash);
  console.log('Password "password" matches:', isMatch);
}

generateHash();

