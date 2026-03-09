import bcrypt from 'bcrypt';

async function generateHash() {
  const password = 'admin123';
  const hash = await bcrypt.hash(password, 10);
  console.log('Password:', password);
  console.log('Bcrypt Hash:', hash);
  
  // Verify it works
  const isValid = await bcrypt.compare(password, hash);
  console.log('Hash verification:', isValid);
}

generateHash();
