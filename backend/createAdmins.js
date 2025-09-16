const { User, Business } = require('./models');
const bcrypt = require('bcryptjs');

async function createAdminUsers() {
  try {
    console.log('🔧 Creating admin users...');
    
    // Admin users to create
    const adminUsers = [
      {
        username: 'wangolobachawa',
        password: 'wangolo@bachawa',
        name: 'wangolo bachawa',
        email: 'wangolobachawa9@gmail.com',
        role: 'admin',
        status: 'active',
        access_level: 'full'
      }
      // Add more admin users here if needed
    ];

    for (const adminData of adminUsers) {
      // Check if user already exists
      const existingUser = await User.findOne({ where: { username: adminData.username } });
      
      if (!existingUser) {
        console.log(`🔧 Creating admin user: ${adminData.username}`);
        
        // Create admin user
        const admin = await User.create(adminData);
        
        // Create a business for this admin
        await Business.create({
          business_id: `business_${admin.username}_001`,
          name: `${adminData.name}'s Business`,
          type: 'retail',
          address: 'Business Address',
          phone: '+1234567890',
          email: adminData.email,
          owner_id: admin.id,
          status: 'active'
        });
        
        console.log(`✅ Admin user ${adminData.username} created successfully`);
      } else {
        console.log(`✅ Admin user ${adminData.username} already exists`);
      }
    }
    
    console.log('🎉 Admin users creation completed');
  } catch (error) {
    console.error('❌ Error creating admin users:', error);
    throw error;
  }
}

// Run the script
createAdminUsers()
  .then(() => {
    console.log('✅ Admin users script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Admin users script failed:', error);
    process.exit(1);
  });






