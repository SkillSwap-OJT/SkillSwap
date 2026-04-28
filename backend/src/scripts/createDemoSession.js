import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { connectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Skill } from '../models/Skill.js';
import { Session } from '../models/Session.js';
import bcrypt from 'bcryptjs';

async function setupDemo() {
  try {
    await connectDB(env.mongoUri);
    console.log('Connected to DB. Setting up demo session...');

    // 1. Get a couple of skills
    const python = await Skill.findOne({ name: 'Python Programming' });
    const react = await Skill.findOne({ name: 'React.js' });

    if (!python || !react) {
      console.log('Required skills not found. Please run seed script first.');
      process.exit(1);
    }

    // 2. Clear old demo data if exists
    await User.deleteMany({ email: { $in: ['alice@demo.com', 'bob@demo.com'] } });
    
    // 3. Create users
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const alice = await User.create({
      name: 'Alice Mentor',
      email: 'alice@demo.com',
      passwordHash: hashedPassword,
      intent: 'both',
      onboarded: true,
      skillsOffered: [{ skill: python._id, level: 'advanced', verified: true, verifiedAt: new Date() }],
      skillsWanted: [{ skill: react._id, level: 'beginner', verified: false }]
    });

    const bob = await User.create({
      name: 'Bob Learner',
      email: 'bob@demo.com',
      passwordHash: hashedPassword,
      intent: 'both',
      onboarded: true,
      skillsOffered: [{ skill: react._id, level: 'advanced', verified: true, verifiedAt: new Date() }],
      skillsWanted: [{ skill: python._id, level: 'beginner', verified: false }]
    });

    // 4. Create an active session
    const activeSession = await Session.create({
      participants: [alice._id, bob._id],
      skillFromA: python._id,
      skillFromB: react._id,
      status: 'active',
      startedAt: new Date()
    });

    console.log('\\n=== DEMO SETUP COMPLETE ===');
    console.log('You can now open two browser windows to test the live chat and AI moderation.');
    console.log('\\nWindow 1 (Alice):');
    console.log('Email: alice@demo.com');
    console.log('Password: password123');
    console.log(`Session Link: http://localhost:5173/session/${activeSession._id}`);
    
    console.log('\\nWindow 2 (Bob) [Use Incognito]:');
    console.log('Email: bob@demo.com');
    console.log('Password: password123');
    console.log(`Session Link: http://localhost:5173/session/${activeSession._id}`);
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

setupDemo();
