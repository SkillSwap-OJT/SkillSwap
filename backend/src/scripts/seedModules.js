import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { connectDB } from '../config/db.js';
import { Skill } from '../models/Skill.js';

const modulesData = {
  'React.js': [
    { title: 'React Official Tutorial', url: 'https://react.dev/learn', type: 'article' },
    { title: 'React Crash Course', url: 'https://www.youtube.com/watch?v=w7ejDZ8SWv8', type: 'video' },
  ],
  'Python Programming': [
    { title: 'Automate the Boring Stuff', url: 'https://automatetheboringstuff.com/', type: 'course' },
    { title: 'Python in 100 Seconds', url: 'https://www.youtube.com/watch?v=x7X9w_GIm1s', type: 'video' },
  ],
  'JavaScript': [
    { title: 'MDN Web Docs', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript', type: 'article' },
    { title: 'JavaScript Mastery', url: 'https://www.youtube.com/watch?v=jS4aFq5-9GI', type: 'video' },
  ],
  'Data Science': [
    { title: 'Kaggle Learn', url: 'https://www.kaggle.com/learn', type: 'course' },
    { title: 'Data Science Full Course', url: 'https://www.youtube.com/watch?v=ua-CiDNNj30', type: 'video' },
  ],
};

async function seed() {
  try {
    await connectDB(env.mongoUri);
    console.log('Connected to DB. Seeding study modules...');

    for (const [name, modules] of Object.entries(modulesData)) {
      const skill = await Skill.findOne({ name });
      if (skill) {
        await Skill.updateOne({ _id: skill._id }, { $set: { studyModules: modules } });
        console.log(`Updated skill: ${name}`);
      } else {
        console.log(`Skill not found: ${name}`);
      }
    }

    console.log('Done!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
