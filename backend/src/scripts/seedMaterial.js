import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { connectDB } from '../config/db.js';
import { Skill } from '../models/Skill.js';

const templates = {
  'Python Programming': `
    <div>
      <h2 style="margin-bottom:16px;">Python Programming: The Comprehensive Guide</h2>
      <p>Python is a high-level, interpreted programming language known for its readability and versatility.</p>
      <h3 style="margin-top:24px; margin-bottom:12px;">Core Syntax & Data Types</h3>
      <ul style="padding-left:20px; margin-bottom:16px; line-height: 1.6;">
        <li><strong>Variables:</strong> Dynamically typed (<code>x = 5</code>, <code>y = "Hello"</code>).</li>
        <li><strong>Data Structures:</strong> Lists (mutable), Tuples (immutable), Dictionaries (key-value).</li>
        <li><strong>Control Flow:</strong> Indentation-based code blocks. <code>if/elif/else</code> and <code>for/while</code> loops.</li>
      </ul>
      <h3 style="margin-top:24px; margin-bottom:12px;">Object-Oriented Python</h3>
      <p>Classes use the <code>class</code> keyword and <code>__init__</code> for constructors. Python supports multiple inheritance.</p>
    </div>
  `,
  'Python': `
    <div>
      <h2 style="margin-bottom:16px;">Python Fundamentals</h2>
      <p>A deep dive into Python scripting, automation, and basic algorithms.</p>
      <h3 style="margin-top:24px; margin-bottom:12px;">Scripting Basics</h3>
      <ul style="padding-left:20px; margin-bottom:16px; line-height: 1.6;">
        <li><strong>File I/O:</strong> Using <code>open()</code> with context managers (<code>with</code> statement) for safe file handling.</li>
        <li><strong>Libraries:</strong> Leveraging <code>os</code> and <code>sys</code> for system-level operations.</li>
      </ul>
      <p>Recommended Practice: Write a script to rename a batch of files in a directory.</p>
    </div>
  `,
  'JavaScript': `
    <div>
      <h2 style="margin-bottom:16px;">JavaScript: The Language of the Web</h2>
      <p>JavaScript powers the dynamic behavior of web pages and servers via Node.js.</p>
      <h3 style="margin-top:24px; margin-bottom:12px;">The Event Loop & Async JS</h3>
      <ul style="padding-left:20px; margin-bottom:16px; line-height: 1.6;">
        <li><strong>Call Stack:</strong> JS is single-threaded. Functions are pushed and popped.</li>
        <li><strong>Promises:</strong> Represent future values. Handled via <code>.then()</code> or <code>async/await</code>.</li>
        <li><strong>Closures:</strong> Functions that remember the environment in which they were created.</li>
      </ul>
    </div>
  `,
  'React.js': `
    <div>
      <h2 style="margin-bottom:16px;">Mastering React.js</h2>
      <p>A declarative, component-based UI library maintained by Facebook.</p>
      <h3 style="margin-top:24px; margin-bottom:12px;">Core Concepts</h3>
      <ul style="padding-left:20px; margin-bottom:16px; line-height: 1.6;">
        <li><strong>Virtual DOM:</strong> Efficiently updates only the changed parts of the actual DOM.</li>
        <li><strong>State & Props:</strong> Internal component memory vs. data passed down from parents.</li>
        <li><strong>Hooks:</strong> <code>useState</code> for local state, <code>useEffect</code> for side effects and data fetching.</li>
      </ul>
    </div>
  `,
  'React': `
    <div>
      <h2 style="margin-bottom:16px;">React Native & Ecosystem</h2>
      <p>Beyond the web, React concepts apply to mobile apps and server-side rendering.</p>
      <h3 style="margin-top:24px; margin-bottom:12px;">Advanced Patterns</h3>
      <ul style="padding-left:20px; margin-bottom:16px; line-height: 1.6;">
        <li><strong>Context API:</strong> Avoid prop-drilling by sharing state globally.</li>
        <li><strong>Custom Hooks:</strong> Extracting reusable stateful logic.</li>
      </ul>
    </div>
  `,
  'Node.js': `
    <div>
      <h2 style="margin-bottom:16px;">Node.js Backend Development</h2>
      <p>Run JavaScript outside the browser using the V8 engine.</p>
      <h3 style="margin-top:24px; margin-bottom:12px;">Server Architecture</h3>
      <ul style="padding-left:20px; margin-bottom:16px; line-height: 1.6;">
        <li><strong>Event-Driven:</strong> Non-blocking I/O model makes it lightweight and efficient.</li>
        <li><strong>Express.js:</strong> The standard framework for building REST APIs.</li>
        <li><strong>Middleware:</strong> Functions that have access to request and response objects.</li>
      </ul>
    </div>
  `,
  'Data Science': `
    <div>
      <h2 style="margin-bottom:16px;">Data Science: From Raw Data to Insights</h2>
      <p>Extracting knowledge from noisy, structured, and unstructured data.</p>
      <h3 style="margin-top:24px; margin-bottom:12px;">The Data Lifecycle</h3>
      <ol style="padding-left:20px; margin-bottom:16px; line-height: 1.6;">
        <li><strong>Preparation:</strong> Cleaning data and handling missing values (Pandas).</li>
        <li><strong>Exploration (EDA):</strong> Finding patterns visually (Matplotlib/Seaborn).</li>
        <li><strong>Modeling:</strong> Applying statistical models to predict outcomes.</li>
      </ol>
    </div>
  `,
  'Machine Learning': `
    <div>
      <h2 style="margin-bottom:16px;">Applied Machine Learning</h2>
      <p>Teaching computers to learn from data without explicit programming.</p>
      <h3 style="margin-top:24px; margin-bottom:12px;">Key Algorithms</h3>
      <ul style="padding-left:20px; margin-bottom:16px; line-height: 1.6;">
        <li><strong>Supervised:</strong> Linear Regression, Random Forests, Support Vector Machines.</li>
        <li><strong>Unsupervised:</strong> K-Means Clustering, PCA for dimensionality reduction.</li>
        <li><strong>Deep Learning:</strong> Neural networks using TensorFlow or PyTorch.</li>
      </ul>
    </div>
  `,
  'UI/UX Design': `
    <div>
      <h2 style="margin-bottom:16px;">UI/UX: Designing User Experiences</h2>
      <p>Creating interfaces that are both beautiful and highly functional.</p>
      <h3 style="margin-top:24px; margin-bottom:12px;">Design Principles</h3>
      <ul style="padding-left:20px; margin-bottom:16px; line-height: 1.6;">
        <li><strong>User Research:</strong> Creating personas and user journey maps.</li>
        <li><strong>Wireframing:</strong> Low-fidelity sketches of layout and flow.</li>
        <li><strong>Prototyping:</strong> High-fidelity interactive mockups in Figma or Adobe XD.</li>
      </ul>
    </div>
  `,
  'Graphic Design': `
    <div>
      <h2 style="margin-bottom:16px;">Fundamentals of Graphic Design</h2>
      <p>Visual communication using typography, photography, and illustration.</p>
      <h3 style="margin-top:24px; margin-bottom:12px;">Core Theory</h3>
      <ul style="padding-left:20px; margin-bottom:16px; line-height: 1.6;">
        <li><strong>Color Theory:</strong> Understanding the color wheel, contrast, and harmony.</li>
        <li><strong>Typography:</strong> Serif vs Sans-Serif, kerning, tracking, and leading.</li>
        <li><strong>Composition:</strong> The rule of thirds, balance, and visual hierarchy.</li>
      </ul>
    </div>
  `,
  'English Communication': `
    <div>
      <h2 style="margin-bottom:16px;">Professional English Communication</h2>
      <p>Mastering the art of writing and speaking clearly in business environments.</p>
      <h3 style="margin-top:24px; margin-bottom:12px;">Effective Strategies</h3>
      <ul style="padding-left:20px; margin-bottom:16px; line-height: 1.6;">
        <li><strong>Active Listening:</strong> Fully concentrating on what is being said.</li>
        <li><strong>Business Writing:</strong> Keep emails concise, structured, and action-oriented.</li>
        <li><strong>Articulation:</strong> Pacing your speech and eliminating filler words.</li>
      </ul>
    </div>
  `,
  'Mathematics': `
    <div>
      <h2 style="margin-bottom:16px;">Advanced Mathematics</h2>
      <p>The foundation of algorithms, physics, and logic.</p>
      <h3 style="margin-top:24px; margin-bottom:12px;">Key Branches</h3>
      <ul style="padding-left:20px; margin-bottom:16px; line-height: 1.6;">
        <li><strong>Calculus:</strong> Limits, derivatives, and integrals. Crucial for optimization.</li>
        <li><strong>Linear Algebra:</strong> Vectors and matrices. The core of computer graphics and AI.</li>
        <li><strong>Discrete Math:</strong> Graph theory and combinatorics, essential for software engineering.</li>
      </ul>
    </div>
  `,
  'Digital Marketing': `
    <div>
      <h2 style="margin-bottom:16px;">Modern Digital Marketing</h2>
      <p>Promoting products and services using digital channels.</p>
      <h3 style="margin-top:24px; margin-bottom:12px;">Marketing Channels</h3>
      <ul style="padding-left:20px; margin-bottom:16px; line-height: 1.6;">
        <li><strong>SEO:</strong> Optimizing websites to rank higher in search engines.</li>
        <li><strong>Content Marketing:</strong> Creating valuable content to attract audiences.</li>
        <li><strong>PPC:</strong> Pay-per-click advertising via Google Ads and Facebook Ads.</li>
      </ul>
    </div>
  `,
  'Photography': `
    <div>
      <h2 style="margin-bottom:16px;">Digital Photography Mastery</h2>
      <p>Capturing light to create compelling visual narratives.</p>
      <h3 style="margin-top:24px; margin-bottom:12px;">The Exposure Triangle</h3>
      <ul style="padding-left:20px; margin-bottom:16px; line-height: 1.6;">
        <li><strong>Aperture:</strong> Controls depth of field (blurry backgrounds).</li>
        <li><strong>Shutter Speed:</strong> Freezes or blurs motion.</li>
        <li><strong>ISO:</strong> Sensor sensitivity to light. Balance carefully to avoid noise.</li>
      </ul>
    </div>
  `,
  'Music Theory': `
    <div>
      <h2 style="margin-bottom:16px;">Foundations of Music Theory</h2>
      <p>The language and mechanics behind musical composition.</p>
      <h3 style="margin-top:24px; margin-bottom:12px;">Musical Elements</h3>
      <ul style="padding-left:20px; margin-bottom:16px; line-height: 1.6;">
        <li><strong>Scales & Modes:</strong> Major, Minor, Dorian, Phrygian.</li>
        <li><strong>Chords:</strong> Triads, 7th chords, and common progressions (I-IV-V).</li>
        <li><strong>Rhythm:</strong> Time signatures, syncopation, and tempo.</li>
      </ul>
    </div>
  `,
  'SQL & Databases': `
    <div>
      <h2 style="margin-bottom:16px;">Relational Databases and SQL</h2>
      <p>Storing, querying, and managing structured data.</p>
      <h3 style="margin-top:24px; margin-bottom:12px;">Database Design & Querying</h3>
      <ul style="padding-left:20px; margin-bottom:16px; line-height: 1.6;">
        <li><strong>Normalization:</strong> Organizing tables to reduce data redundancy.</li>
        <li><strong>JOINs:</strong> Combining rows from two or more tables (INNER, LEFT, RIGHT).</li>
        <li><strong>Indexes:</strong> Speeding up data retrieval at the cost of write performance.</li>
      </ul>
    </div>
  `,
  'Git & GitHub': `
    <div>
      <h2 style="margin-bottom:16px;">Version Control with Git</h2>
      <p>Tracking changes and collaborating on code seamlessly.</p>
      <h3 style="margin-top:24px; margin-bottom:12px;">Workflow Essentials</h3>
      <ul style="padding-left:20px; margin-bottom:16px; line-height: 1.6;">
        <li><strong>Branching:</strong> Creating isolated environments for new features.</li>
        <li><strong>Committing:</strong> Writing clear, atomic commit messages.</li>
        <li><strong>Pull Requests:</strong> Reviewing code collaboratively before merging into the main branch.</li>
      </ul>
    </div>
  `,
  'Data Structures': `
    <div>
      <h2 style="margin-bottom:16px;">Algorithms & Data Structures</h2>
      <p>The building blocks of efficient software engineering.</p>
      <h3 style="margin-top:24px; margin-bottom:12px;">Core Structures</h3>
      <ul style="padding-left:20px; margin-bottom:16px; line-height: 1.6;">
        <li><strong>Arrays & Linked Lists:</strong> Memory contiguous vs. pointer-based storage.</li>
        <li><strong>Trees & Graphs:</strong> Hierarchical data and network relationships (Binary Search Trees, Tries).</li>
        <li><strong>Hash Tables:</strong> Using hash functions for O(1) average time complexity lookups.</li>
      </ul>
    </div>
  `,
  'Spanish Language': `
    <div>
      <h2 style="margin-bottom:16px;">Conversational Spanish</h2>
      <p>Learning one of the world's most spoken languages.</p>
      <h3 style="margin-top:24px; margin-bottom:12px;">Grammar & Vocab</h3>
      <ul style="padding-left:20px; margin-bottom:16px; line-height: 1.6;">
        <li><strong>Verb Conjugation:</strong> Regular (AR/ER/IR) and irregular verbs.</li>
        <li><strong>Ser vs Estar:</strong> Understanding the two verbs for "to be" (permanent vs temporary).</li>
        <li><strong>Immersion:</strong> Practice through listening to native speakers and reading.</li>
      </ul>
    </div>
  `,
  'Physics': `
    <div>
      <h2 style="margin-bottom:16px;">Classical & Modern Physics</h2>
      <p>Understanding the fundamental laws of nature and the universe.</p>
      <h3 style="margin-top:24px; margin-bottom:12px;">Core Principles</h3>
      <ul style="padding-left:20px; margin-bottom:16px; line-height: 1.6;">
        <li><strong>Mechanics:</strong> Newton's laws of motion, kinematics, and energy conservation.</li>
        <li><strong>Electromagnetism:</strong> Maxwell's equations and electric circuits.</li>
        <li><strong>Quantum Mechanics:</strong> Wave-particle duality and probability functions.</li>
      </ul>
    </div>
  `,
  'Guitar': `
    <div>
      <h2 style="margin-bottom:16px;">Acoustic & Electric Guitar</h2>
      <p>Techniques for mastering the six-string instrument.</p>
      <h3 style="margin-top:24px; margin-bottom:12px;">Playing Techniques</h3>
      <ul style="padding-left:20px; margin-bottom:16px; line-height: 1.6;">
        <li><strong>Chords & Strumming:</strong> Open chords, barre chords, and rhythmic patterns.</li>
        <li><strong>Fingerpicking:</strong> Travis picking and classical techniques.</li>
        <li><strong>Fretboard Mastery:</strong> Memorizing notes and pentatonic scales for soloing.</li>
      </ul>
    </div>
  `,
  'Public Speaking': `
    <div>
      <h2 style="margin-bottom:16px;">The Art of Public Speaking</h2>
      <p>Captivating an audience and delivering memorable presentations.</p>
      <h3 style="margin-top:24px; margin-bottom:12px;">Delivery Mechanics</h3>
      <ul style="padding-left:20px; margin-bottom:16px; line-height: 1.6;">
        <li><strong>Body Language:</strong> Maintaining eye contact, posture, and purposeful movement.</li>
        <li><strong>Vocal Variety:</strong> Adjusting pitch, pace, and volume to emphasize points.</li>
        <li><strong>Storytelling:</strong> Hooking the audience with narratives and relatable anecdotes.</li>
      </ul>
    </div>
  `
};

async function seed() {
  try {
    await connectDB(env.mongoUri);
    console.log('Connected to DB. Generating unique study materials...');

    const skills = await Skill.find();
    
    for (const skill of skills) {
      let material = templates[skill.name];
      if (!material) {
        material = `<div><h2>${skill.name} Overview</h2><p>Material coming soon.</p></div>`;
      }
      
      await Skill.updateOne({ _id: skill._id }, { $set: { studyMaterial: material } });
      console.log(`Generated unique material for: ${skill.name}`);
    }

    console.log('Successfully seeded all study materials!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
