// Reset database script
import { resetDatabase } from './backend/src/infrastructure/database/init.js';

console.log('🔄 Resetting database...');

try {
  await resetDatabase();
  console.log('✅ Database reset and reinitialized successfully!');
  console.log('📝 Demo credentials: admin / password');
} catch (error) {
  console.error('❌ Database reset failed:', error);
}
