import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { env } from '../config/env.js';
import { Skill } from '../models/Skill.js';
import { Exam } from '../models/Exam.js';

const SKILLS = [
  {
    name: 'JavaScript',
    slug: 'javascript',
    category: 'programming',
    description: 'Modern JavaScript fundamentals (ES2015+)',
    keywords: ['js', 'es6', 'node', 'browser', 'closure', 'promise', 'async', 'await', 'array', 'object'],
    exam: {
      title: 'JavaScript Fundamentals',
      passingScore: 70,
      durationMinutes: 15,
      questions: [
        {
          text: 'Which keyword declares a block-scoped variable that cannot be reassigned?',
          options: ['var', 'let', 'const', 'static'],
          correctIndex: 2,
        },
        {
          text: 'What is the output of typeof null?',
          options: ['"null"', '"undefined"', '"object"', '"number"'],
          correctIndex: 2,
        },
        {
          text: 'Which method creates a new array with results of calling a function on every element?',
          options: ['forEach', 'map', 'reduce', 'filter'],
          correctIndex: 1,
        },
        {
          text: 'A Promise that has neither been fulfilled nor rejected is in which state?',
          options: ['pending', 'settled', 'idle', 'paused'],
          correctIndex: 0,
        },
        {
          text: 'Which statement about arrow functions is true?',
          options: [
            'They have their own this binding',
            'They cannot be passed as callbacks',
            'They inherit this from the enclosing scope',
            'They always return undefined',
          ],
          correctIndex: 2,
        },
      ],
    },
  },
  {
    name: 'Python',
    slug: 'python',
    category: 'programming',
    description: 'Python programming and data structures',
    keywords: ['python', 'list', 'dict', 'tuple', 'set', 'function', 'class', 'pip', 'venv'],
    exam: {
      title: 'Python Basics',
      passingScore: 70,
      durationMinutes: 15,
      questions: [
        {
          text: 'Which of these is mutable?',
          options: ['tuple', 'string', 'list', 'frozenset'],
          correctIndex: 2,
        },
        {
          text: 'What is the output of len("hello")?',
          options: ['4', '5', '6', 'error'],
          correctIndex: 1,
        },
        {
          text: 'Which keyword is used to define a function in Python?',
          options: ['function', 'def', 'fn', 'lambda'],
          correctIndex: 1,
        },
        {
          text: 'What does list comprehension [x*x for x in range(3)] produce?',
          options: ['[0, 1, 2]', '[1, 2, 3]', '[0, 1, 4]', '[1, 4, 9]'],
          correctIndex: 2,
        },
        {
          text: 'How do you create a virtual environment?',
          options: ['python -m venv env', 'pip env create', 'python venv', 'npm init'],
          correctIndex: 0,
        },
      ],
    },
  },
  {
    name: 'React',
    slug: 'react',
    category: 'frontend',
    description: 'React component model and hooks',
    keywords: ['react', 'jsx', 'hooks', 'usestate', 'useeffect', 'props', 'component', 'virtual', 'dom'],
    exam: {
      title: 'React Essentials',
      passingScore: 70,
      durationMinutes: 15,
      questions: [
        {
          text: 'Which hook lets a component manage local state?',
          options: ['useEffect', 'useState', 'useRef', 'useMemo'],
          correctIndex: 1,
        },
        {
          text: 'What is JSX?',
          options: [
            'A new programming language',
            'A syntax extension that compiles to JavaScript',
            'A CSS-in-JS library',
            'A database query language',
          ],
          correctIndex: 1,
        },
        {
          text: 'Where should side effects in function components live?',
          options: ['render body', 'inside useEffect', 'inside useState', 'inside JSX'],
          correctIndex: 1,
        },
        {
          text: 'Which prop is required when rendering lists in React?',
          options: ['id', 'index', 'key', 'ref'],
          correctIndex: 2,
        },
        {
          text: 'What does React.memo do?',
          options: [
            'Caches component output to skip re-render when props are equal',
            'Stores component state in localStorage',
            'Memorizes API responses',
            'Creates a singleton component',
          ],
          correctIndex: 0,
        },
      ],
    },
  },
  {
    name: 'Node.js',
    slug: 'nodejs',
    category: 'backend',
    description: 'Node.js runtime, modules, async I/O',
    keywords: ['node', 'express', 'npm', 'module', 'event', 'loop', 'stream', 'buffer', 'async'],
    exam: {
      title: 'Node.js Basics',
      passingScore: 70,
      durationMinutes: 15,
      questions: [
        {
          text: 'Which engine powers Node.js?',
          options: ['SpiderMonkey', 'JavaScriptCore', 'V8', 'Chakra'],
          correctIndex: 2,
        },
        {
          text: 'Which module system does Node use by default historically?',
          options: ['ES modules', 'AMD', 'CommonJS', 'UMD'],
          correctIndex: 2,
        },
        {
          text: 'What is package.json used for?',
          options: ['Source code', 'Project metadata and dependencies', 'Database config only', 'Logs'],
          correctIndex: 1,
        },
        {
          text: 'Which Node API reads a file asynchronously?',
          options: ['fs.readFile', 'fs.readFileSync', 'fs.openSync', 'fs.copy'],
          correctIndex: 0,
        },
        {
          text: 'Which framework is commonly used to build HTTP APIs in Node?',
          options: ['Django', 'Spring', 'Express', 'Rails'],
          correctIndex: 2,
        },
      ],
    },
  },
  {
    name: 'MongoDB',
    slug: 'mongodb',
    category: 'database',
    description: 'Document database fundamentals',
    keywords: ['mongo', 'mongodb', 'document', 'collection', 'index', 'query', 'aggregation', 'schema'],
    exam: {
      title: 'MongoDB Basics',
      passingScore: 70,
      durationMinutes: 15,
      questions: [
        {
          text: 'MongoDB is what type of database?',
          options: ['Relational', 'Document', 'Graph', 'Columnar'],
          correctIndex: 1,
        },
        {
          text: 'What format does MongoDB store documents in internally?',
          options: ['JSON', 'BSON', 'XML', 'YAML'],
          correctIndex: 1,
        },
        {
          text: 'Which operator selects documents where a field equals a value?',
          options: ['$eq', '$gt', '$in', '$nin'],
          correctIndex: 0,
        },
        {
          text: 'Which library is the most common Node ODM for MongoDB?',
          options: ['Sequelize', 'Mongoose', 'TypeORM', 'Prisma (relational)'],
          correctIndex: 1,
        },
        {
          text: 'What does an index improve?',
          options: ['Write throughput only', 'Query read performance', 'Disk usage', 'Schema validation'],
          correctIndex: 1,
        },
      ],
    },
  },
  {
    name: 'UI/UX Design',
    slug: 'ui-ux-design',
    category: 'design',
    description: 'User interface and experience design principles',
    keywords: ['design', 'ui', 'ux', 'figma', 'wireframe', 'prototype', 'usability', 'accessibility', 'contrast'],
    exam: {
      title: 'UI/UX Foundations',
      passingScore: 70,
      durationMinutes: 12,
      questions: [
        {
          text: 'What does WCAG primarily address?',
          options: ['Color theory', 'Web accessibility', 'Animation', 'Typography'],
          correctIndex: 1,
        },
        {
          text: 'Which is a low-fidelity design artifact?',
          options: ['Wireframe', 'High-fidelity mockup', 'Production app', 'Style guide'],
          correctIndex: 0,
        },
        {
          text: 'A good touch target size on mobile is at least:',
          options: ['8px', '16px', '32px', '44px'],
          correctIndex: 3,
        },
        {
          text: 'Which heuristic is from Nielsen\'s 10 usability heuristics?',
          options: [
            'Match between system and real world',
            'Use of grayscale only',
            'Always use modal dialogs',
            'Hide navigation by default',
          ],
          correctIndex: 0,
        },
        {
          text: 'What does a persona represent?',
          options: [
            'An archetypal user with goals and pain points',
            'A real customer name',
            'A backend service',
            'A design tool',
          ],
          correctIndex: 0,
        },
      ],
    },
  },
];

async function run() {
  await connectDB(env.mongoUri);
  console.log('[seed] connected');

  for (const def of SKILLS) {
    const skill = await Skill.findOneAndUpdate(
      { slug: def.slug },
      {
        name: def.name,
        slug: def.slug,
        category: def.category,
        description: def.description,
        keywords: def.keywords,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log(`[seed] skill: ${skill.name}`);

    if (def.exam) {
      await Exam.findOneAndUpdate(
        { skill: skill._id },
        {
          skill: skill._id,
          title: def.exam.title,
          description: def.exam.description || '',
          passingScore: def.exam.passingScore,
          durationMinutes: def.exam.durationMinutes,
          questions: def.exam.questions,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      console.log(`[seed]  exam : ${def.exam.title} (${def.exam.questions.length} questions)`);
    }
  }

  await mongoose.disconnect();
  console.log('[seed] done');
}

run().catch((err) => {
  console.error('[seed] error', err);
  process.exit(1);
});
