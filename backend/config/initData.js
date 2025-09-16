const { User, Business, Subscription } = require('../models');
const bcrypt = require('bcryptjs');

async function initializeData() {
  try {
    // Check if owner already exists
    const existingOwner = await User.findOne({ where: { username: 'bachawa' } });
    
    if (!existingOwner) {
      console.log('🔧 Creating default owner user...');
      
      // Create owner user (password will be hashed by the beforeCreate hook)
      const owner = await User.create({
        username: 'bachawa',
        password: 'bachawa@1999',
        name: 'Bachawa - TrackNest Pro Owner',
        email: 'bachawa@tracknest.com',
        role: 'owner',
        status: 'active',
        access_level: 'full'
      });

      console.log('✅ Owner user created successfully');
    } else {
      console.log('✅ Owner user already exists');
    }

    // Check if any businesses exist
    const businessCount = await Business.count();
    
    if (businessCount === 0) {
      console.log('🔧 Creating default business...');
      
      const owner = await User.findOne({ where: { username: 'bachawa' } });
      
      if (owner) {
        await Business.create({
          business_id: 'business_owner_001',
          name: 'TrackNest Pro Headquarters',
          type: 'services',
          address: '123 Main Street, City',
          phone: '+1234567890',
          email: 'business@tracknest.com',
          owner_id: owner.id,
          status: 'active'
        });

        console.log('✅ Default business created successfully');
      }
    } else {
      console.log('✅ Businesses already exist');
    }

    // Check if any subscriptions exist
    const subscriptionCount = await Subscription.count();
    
    if (subscriptionCount === 0) {
      console.log('🔧 Creating default subscription...');
      
      const owner = await User.findOne({ where: { username: 'bachawa' } });
      
      if (owner) {
        await Subscription.create({
          user_id: owner.id,
          plan: 'premium',
          status: 'active',
          amount: 0.00,
          billing_cycle: 'monthly',
          start_date: new Date(),
          next_payment: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        });

        console.log('✅ Default subscription created successfully');
      }
    } else {
      console.log('✅ Subscriptions already exist');
    }

    console.log('🎉 Data initialization completed successfully');
  } catch (error) {
    console.error('❌ Error initializing data:', error);
    throw error;
  }
}

module.exports = initializeData;
