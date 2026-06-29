const bcrypt = require('bcrypt');
const { sequelize, User, ServiceType } = require('./src/models');

const seedDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to database for seeding...');

    // Hash the password
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Create Owner
    const [owner, created] = await User.findOrCreate({
      where: { email: 'agustianputra2108@gmail.com' },
      defaults: {
        name: 'Agustian Putra Sukarya',
        password: hashedPassword,
        role: 'owner',
        is_active: true
      }
    });

    if (created) {
      console.log('Owner account created successfully.');
    } else {
      console.log('Owner account already exists.');
    }

    // Create Default Services
    const services = [
      { name: 'Reguler', price_per_kg: 8000, est_days: 3 },
      { name: 'Express', price_per_kg: 15000, est_days: 1 }
    ];

    for (const s of services) {
      await ServiceType.findOrCreate({
        where: { name: s.name },
        defaults: s
      });
    }
    console.log('Default services seeded.');

    console.log('Seeding completed.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
