require('dotenv').config();

const connectDB = require('../config/db');

const User = require('../models/User');
const Category = require('../models/Category');
const Experience = require('../models/Experience');

const categories = require('./categories');
const experiencesData = require('./experiences');

const seed = async () => {
  try {
    console.log('\n========================================');
    console.log('   WANDERLUST DATABASE SEED');
    console.log('========================================\n');

    await connectDB();

    console.log('MongoDB connected successfully.\n');

    await Experience.deleteMany({});
    await Category.deleteMany({});

    console.log('Old experiences and categories removed.\n');

    const adminName =
      process.env.ADMIN_NAME || 'Wanderlust Admin';

    const adminEmail =
      process.env.ADMIN_EMAIL?.trim().toLowerCase();

    const adminPassword =
      process.env.ADMIN_PASSWORD;

    if (!adminEmail) {
      throw new Error(
        'ADMIN_EMAIL is missing from .env'
      );
    }

    if (!adminPassword) {
      throw new Error(
        'ADMIN_PASSWORD is missing from .env'
      );
    }

    if (adminPassword.length < 6) {
      throw new Error(
        'ADMIN_PASSWORD must be at least 6 characters'
      );
    }

    await User.updateMany(
      {
        role: 'ADMIN',
        email: {
          $ne: adminEmail,
        },
      },
      {
        $set: {
          role: 'USER',
        },
      }
    );

    let admin = await User.findOne({
      email: adminEmail,
    }).select('+password');

    if (!admin) {
      admin = await User.create({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        role: 'ADMIN',
        isActive: true,
      });

      console.log('Admin account created.\n');
    } else {
      admin.name = adminName;
      admin.password = adminPassword;
      admin.role = 'ADMIN';
      admin.isActive = true;

      await admin.save();

      console.log('Admin account updated.\n');
    }

    const createdCategories =
      await Category.insertMany(categories);

    const categoryMap =
      createdCategories.reduce(
        (map, category) => {
          map[category.slug] = category._id;
          return map;
        },
        {}
      );

    const experiences =
      experiencesData.map((experience) => {
        const categorySlug =
          typeof experience.category === 'object'
            ? experience.category.slug
            : experience.category;

        const categoryId =
          categoryMap[categorySlug];

        if (!categoryId) {
          throw new Error(
            `Category "${categorySlug}" not found for experience "${experience.title}"`
          );
        }

        return {
          ...experience,
          category: categoryId,
          reviews: experience.reviews || [],
          rating: experience.rating || 0,
          numReviews:
            experience.numReviews || 0,
        };
      });

    const createdExperiences =
      await Experience.insertMany(
        experiences
      );

    console.log(
      'Categories created:',
      createdCategories.length
    );

    console.log(
      'Experiences created:',
      createdExperiences.length
    );

    console.log('\nAdmin:');
    console.log(`- Email: ${adminEmail}`);
    console.log('- Password: Loaded from .env');
    console.log('- Role: ADMIN');

    console.log(
      '\nOther previous ADMIN accounts have been changed to USER.'
    );

    console.log('\nCategories:');

    createdCategories.forEach((category) => {
      console.log(
        `- ${category.name} (${category.slug})`
      );
    });

    console.log('\nExperiences:');

    createdExperiences.forEach((experience) => {
      console.log(
        `- ${experience.title}`
      );
    });

    console.log(
      '\n========================================'
    );

    console.log(
      '   DATABASE SEED SUCCESSFUL'
    );

    console.log(
      '========================================\n'
    );

    process.exit(0);
  } catch (error) {
    console.error(
      '\n========================================'
    );

    console.error(
      '   DATABASE SEED ERROR'
    );

    console.error(
      '========================================'
    );

    console.error(error.message);

    console.error(
      '\n========================================\n'
    );

    process.exit(1);
  }
};

seed();