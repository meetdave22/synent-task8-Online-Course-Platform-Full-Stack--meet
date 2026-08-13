/**
 * Seeds the database with an admin user, a student user, and a sample course.
 * Run with: node seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Course = require('./models/Course');

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected. Seeding...');

  await User.deleteMany({ email: { $in: ['admin1@example.com', 'student@example.com'] } });
  await Course.deleteMany({ slug: 'intro-to-react' });

  const admin = await User.create({
    name: 'Admin User',
    email: 'admin1@example.com',
    password: 'admin1000',
    role: 'admin',
    isEmailVerified: true
  });

  await User.create({
    name: 'Student User',
    email: 'student@example.com',
    password: 'student1234',
    role: 'student',
    isEmailVerified: true
  });

  await Course.create({
    title: 'Intro to React',
    slug: 'intro-to-react',
    description: 'Learn the fundamentals of React: components, props, state, and hooks, through hands-on lessons.',
    shortDescription: 'Build your first React app from scratch.',
    category: 'Web Development',
    level: 'Beginner',
    price: 499,
    instructor: 'Admin User',
    createdBy: admin._id,
    modules: [
      {
        title: 'Getting Started',
        order: 0,
        lessons: [
          { title: 'Why React?', videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4', duration: 5, order: 0 },
          { title: 'Setting up your environment', videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4', duration: 8, order: 1 }
        ]
      },
      {
        title: 'Components & Props',
        order: 1,
        lessons: [
          { title: 'Your first component', videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4', duration: 10, order: 0 },
          { title: 'Passing props', videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4', duration: 12, order: 1 }
        ]
      }
    ]
  });

  console.log('Seed complete.');
  console.log('Admin login: admin1@example.com / admin1000');
  console.log('Student login: student@example.com / student1234');
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
