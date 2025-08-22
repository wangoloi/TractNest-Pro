import bcrypt from 'bcryptjs';

async function generateHash() {
  const password = 'bachawa123';
  const saltRounds = 10;
  
  try {
    const hash = await bcrypt.hash(password, saltRounds);
    console.log('Password:', password);
    console.log('Hash:', hash);
  } catch (error) {
    console.error('Error generating hash:', error);
  }
}

generateHash();

