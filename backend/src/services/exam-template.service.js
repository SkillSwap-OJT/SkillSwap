const SUBJECT_QUESTION_BANK = {
  'python programming': [
    q('Which Python data type preserves insertion order and stores key-value pairs?', ['set', 'dict', 'tuple', 'range'], 1),
    q('What is the output of `len([1, 2, 3])`?', ['2', '3', '4', 'Error'], 1),
    q('Which keyword is used to handle exceptions?', ['catch', 'except', 'rescue', 'error'], 1),
    q('Which statement creates a list comprehension?', ['[x for x in items]', '{x => items}', '(x in items)', '<x for x>'], 0),
    q('Which command creates a virtual environment?', ['python -m venv env', 'pip make env', 'npm init venv', 'python env create'], 0),
  ],
  javascript: [
    q('Which keyword creates a constant binding?', ['var', 'let', 'const', 'define'], 2),
    q('Which array method transforms each element and returns a new array?', ['filter', 'map', 'find', 'forEach'], 1),
    q('What is the result of `typeof null`?', ['null', 'object', 'undefined', 'number'], 1),
    q('Which statement about promises is correct?', ['They only handle synchronous code', 'They represent future completion of async work', 'They replace functions', 'They always resolve immediately'], 1),
    q('Arrow functions inherit what from the surrounding scope?', ['prototype', 'constructor', 'this', 'arguments length'], 2),
  ],
  'react.js': [
    q('Which hook is used for local component state?', ['useEffect', 'useState', 'useMemo', 'useRouter'], 1),
    q('Why is a `key` prop important in lists?', ['To style the list', 'To help React identify items across renders', 'To fetch data', 'To open modals'], 1),
    q('Where should side effects usually live?', ['Inside JSX', 'Inside useEffect', 'Inside return statements', 'Inside props'], 1),
    q('What does JSX compile to?', ['SQL', 'JavaScript function calls', 'CSS rules', 'JSON only'], 1),
    q('What does `React.memo` help with?', ['Database caching', 'Skipping unnecessary re-renders', 'Routing', 'Authentication'], 1),
  ],
  react: [
    q('Which hook is used for local component state?', ['useEffect', 'useState', 'useMemo', 'useRouter'], 1),
    q('Why is a `key` prop important in lists?', ['To style the list', 'To help React identify items across renders', 'To fetch data', 'To open modals'], 1),
    q('Where should side effects usually live?', ['Inside JSX', 'Inside useEffect', 'Inside return statements', 'Inside props'], 1),
    q('What does JSX compile to?', ['SQL', 'JavaScript function calls', 'CSS rules', 'JSON only'], 1),
    q('What does `React.memo` help with?', ['Database caching', 'Skipping unnecessary re-renders', 'Routing', 'Authentication'], 1),
  ],
  'node.js': [
    q('Which engine powers Node.js?', ['V8', 'SpiderMonkey', 'Chakra', 'Java VM'], 0),
    q('Which module reads files asynchronously?', ['fs.readFile', 'fs.readFileSync', 'path.read', 'http.file'], 0),
    q('What is `package.json` mainly used for?', ['Only CSS config', 'Project metadata and dependencies', 'Database storage', 'Browser routing'], 1),
    q('Which framework is common for building Node HTTP APIs?', ['Rails', 'Laravel', 'Express', 'Spring'], 2),
    q('Node.js is best known for which style of I/O?', ['Blocking I/O', 'Event-driven non-blocking I/O', 'GPU rendering', 'Thread-per-request only'], 1),
  ],
  'data science': [
    q('Which library is commonly used for tabular analysis in Python?', ['NumPy', 'Pandas', 'React', 'TensorFlow Serving'], 1),
    q('What is the purpose of exploratory data analysis?', ['Deploy apps', 'Understand patterns and quality in data', 'Encrypt files', 'Render UI'], 1),
    q('Which chart is useful for showing distribution?', ['Histogram', 'Navbar', 'Pie footer', 'Bubble sort'], 0),
    q('What does missing data handling help prevent?', ['Syntax highlighting', 'Biased or invalid analysis', 'Git conflicts', 'Routing bugs'], 1),
    q('Why split data into train and test sets?', ['To rename files', 'To estimate model performance on unseen data', 'To speed up CSS', 'To create indexes'], 1),
  ],
  'machine learning': [
    q('What is overfitting?', ['Model performs well on training data but poorly on new data', 'Model trains too slowly', 'Model has too few features only', 'Database is too large'], 0),
    q('Which task predicts a category label?', ['Regression', 'Classification', 'Clustering only', 'Indexing'], 1),
    q('Why use a validation set?', ['To store logs', 'To tune models before final testing', 'To replace training', 'To host APIs'], 1),
    q('Which metric is common for classification?', ['Accuracy', 'MSE only', 'RGB', 'Latency'], 0),
    q('Feature scaling is helpful because it', ['Always increases data size', 'Makes optimization behave better for many models', 'Removes all noise', 'Eliminates labels'], 1),
  ],
  'data structures': [
    q('Which data structure uses FIFO ordering?', ['Stack', 'Queue', 'Tree', 'Graph'], 1),
    q('What is the average lookup time for a hash table?', ['O(1)', 'O(n log n)', 'O(n^2)', 'O(log n!)'], 0),
    q('Which traversal visits root, left, right?', ['Inorder', 'Preorder', 'Postorder', 'Level-order'], 1),
    q('What does a stack typically support?', ['enqueue/dequeue', 'push/pop', 'insert/sort', 'scan/render'], 1),
    q('Which structure is best for representing hierarchical data?', ['Array only', 'Tree', 'Queue', 'Tuple'], 1),
  ],
  'git & github': [
    q('Which command creates a new commit?', ['git status', 'git add', 'git commit', 'git fetch'], 2),
    q('What does `git pull` usually do?', ['Deletes a branch', 'Fetches and merges remote changes', 'Creates a PR', 'Resets history'], 1),
    q('What is a pull request used for?', ['Changing DNS', 'Code review before merging', 'Deploying MongoDB', 'Running Python'], 1),
    q('Which command shows changed files?', ['git status', 'git branch', 'git init', 'git gc'], 0),
    q('Why use branches?', ['To avoid version control', 'To isolate work before merging', 'To increase CPU speed', 'To replace repositories'], 1),
  ],
  'english communication': [
    q('What improves spoken clarity the most?', ['Speaking too fast', 'Clear structure and pronunciation', 'Using slang in every sentence', 'Ignoring pauses'], 1),
    q('Which is best in a professional email?', ['No subject line', 'Clear greeting and concise request', 'All caps', 'Only emojis'], 1),
    q('Active listening includes', ['Interrupting quickly', 'Paraphrasing and confirming understanding', 'Ignoring tone', 'Avoiding questions'], 1),
    q('Why is audience awareness important?', ['It changes how clearly and formally you communicate', 'It removes grammar', 'It avoids preparation', 'It replaces practice'], 0),
    q('Which habit improves presentation delivery?', ['Reading every word monotonously', 'Practicing pace and eye contact', 'Speaking with no outline', 'Skipping examples'], 1),
  ],
  mathematics: [
    q('What is the value of 7 x 8?', ['54', '56', '58', '64'], 1),
    q('A triangle angle sum is always', ['90 degrees', '180 degrees', '270 degrees', '360 degrees'], 1),
    q('What is 15% of 200?', ['15', '20', '25', '30'], 3),
    q('Which operation reverses multiplication?', ['Addition', 'Division', 'Squaring', 'Averaging'], 1),
    q('If x + 5 = 12, x = ?', ['5', '6', '7', '8'], 2),
  ],
  'digital marketing': [
    q('SEO primarily helps with', ['Organic search visibility', 'Battery life', 'Database backups', 'Compiler speed'], 0),
    q('CTR stands for', ['Click-through rate', 'Customer tracking report', 'Content target ratio', 'Channel timing rule'], 0),
    q('Which metric best shows campaign conversions?', ['Bounce rate only', 'Conversion rate', 'Screen brightness', 'Commit count'], 1),
    q('A target audience is', ['Anyone on the internet', 'The specific group most likely to respond', 'Only existing staff', 'Database admins'], 1),
    q('Why use A/B testing?', ['To compare alternatives and improve results', 'To remove analytics', 'To skip content strategy', 'To avoid measurement'], 0),
  ],
  photography: [
    q('What does aperture affect?', ['Depth of field and light intake', 'Only storage size', 'Git history', 'CPU temperature'], 0),
    q('ISO mainly controls', ['Sensor sensitivity to light', 'Lens diameter only', 'Battery speed', 'File names'], 0),
    q('A fast shutter speed is useful for', ['Freezing motion', 'Blurring every shot', 'Deleting noise', 'Changing white balance'], 0),
    q('Rule of thirds is about', ['File compression', 'Composition', 'Charging batteries', 'Histogram export'], 1),
    q('RAW format is valued because it', ['Always uses less space than JPEG', 'Preserves more editing information', 'Cannot be edited', 'Has no color data'], 1),
  ],
  'music theory': [
    q('How many notes are in a major scale?', ['5', '6', '7', '8'], 2),
    q('A chord built from three notes is called', ['Scale', 'Triad', 'Octave', 'Rest'], 1),
    q('Tempo describes', ['Pitch height', 'Speed of the music', 'Instrument brand', 'Song language'], 1),
    q('An octave spans', ['6 semitones', '8 semitones', '12 semitones', '16 semitones'], 2),
    q('Time signature tells you', ['How loud to sing', 'How beats are grouped in a measure', 'What instrument to buy', 'Which app to use'], 1),
  ],
  'sql & databases': [
    q('Which SQL clause filters rows?', ['ORDER BY', 'WHERE', 'GROUP', 'INDEX'], 1),
    q('Which statement retrieves data?', ['INSERT', 'UPDATE', 'SELECT', 'DELETE'], 2),
    q('A primary key should be', ['Non-unique', 'Unique and stable', 'Optional in joins', 'Always text only'], 1),
    q('What does JOIN do?', ['Combines related rows from tables', 'Deletes duplicates only', 'Backs up data', 'Formats UI'], 0),
    q('Indexes are mainly used to', ['Improve query speed', 'Increase spelling accuracy', 'Remove schemas', 'Replace backups'], 0),
  ],
  'graphic design': [
    q('What is contrast used for in design?', ['Improving visual hierarchy and readability', 'Reducing all color', 'Encrypting files', 'Removing layout'], 0),
    q('What does whitespace help with?', ['Cleaner layout and focus', 'Larger file size', 'Database normalization', 'Lower screen brightness'], 0),
    q('Which tool is central to branding consistency?', ['Style guide', 'Terminal log', 'Compiler', 'Package lock'], 0),
    q('Typography hierarchy helps users', ['Ignore headings', 'Understand importance of content', 'Delete colors', 'Avoid alignment'], 1),
    q('Raster graphics are best described as', ['Pixel-based images', 'Always scalable without loss', 'Database rows', 'Audio clips'], 0),
  ],
  'ui/ux design': [
    q('What does usability testing help reveal?', ['Real user friction points', 'GPU temperature', 'Only font size', 'Git merge conflicts'], 0),
    q('A wireframe is usually', ['A low-fidelity layout plan', 'A production database', 'A CSS reset', 'An audio export'], 0),
    q('Accessibility aims to make products', ['Harder to use', 'Usable by more people, including those with disabilities', 'Only mobile-first', 'Dark mode only'], 1),
    q('What is a user flow?', ['Sequence of steps a user takes to complete a task', 'A color palette', 'An icon set', 'A deployment script'], 0),
    q('Good UX often starts with', ['Guessing', 'Understanding user goals and pain points', 'Skipping research', 'Adding more popups'], 1),
  ],
  physics: [
    q('What is the SI unit of force?', ['Joule', 'Newton', 'Watt', 'Pascal'], 1),
    q('Velocity includes', ['Magnitude only', 'Speed and direction', 'Mass and time', 'Energy and work'], 1),
    q('What law relates force, mass, and acceleration?', ['Newton’s second law', 'Ohm’s law', 'Boyle’s law', 'Hooke’s law'], 0),
    q('Potential energy depends on', ['Position or configuration', 'Only color', 'Programming language', 'File size'], 0),
    q('Current in an electric circuit is measured in', ['Volts', 'Amperes', 'Newtons', 'Lumens'], 1),
  ],
  guitar: [
    q('How many strings does a standard guitar have?', ['4', '5', '6', '7'], 2),
    q('What does a chord diagram usually show?', ['Only lyrics', 'Finger placement on the fretboard', 'Tempo only', 'Microphone settings'], 1),
    q('What is a capo used for?', ['Tune drums', 'Change key by clamping strings', 'Increase volume electronically', 'Store picks'], 1),
    q('Alternate picking refers to', ['Changing guitars often', 'Using downstrokes and upstrokes in sequence', 'Only fingerstyle playing', 'Muting every note'], 1),
    q('Practice with a metronome mainly improves', ['Timing', 'Paint color', 'Wi-Fi signal', 'String thickness'], 0),
  ],
  'public speaking': [
    q('A strong opening in a talk should', ['Confuse the audience', 'Grab attention and set the topic', 'Skip the topic', 'Only show statistics'], 1),
    q('Why is pacing important?', ['It helps clarity and audience understanding', 'It replaces preparation', 'It is only for actors', 'It avoids structure'], 0),
    q('Eye contact generally helps by', ['Building connection and confidence', 'Reducing volume', 'Hiding slides', 'Ending talks early'], 0),
    q('A clear speech structure should usually include', ['Beginning, middle, and end', 'Only random points', 'No conclusion', 'Only jokes'], 0),
    q('What reduces presentation anxiety over time?', ['Avoiding all speaking', 'Practice and preparation', 'Talking faster', 'Skipping outlines'], 1),
  ],
  spanish: [
    q('What is a common greeting in Spanish?', ['Bonjour', 'Hola', 'Ciao', 'Hallo'], 1),
    q('Which pronoun means “I” in Spanish?', ['Tú', 'Yo', 'Él', 'Nosotros'], 1),
    q('Spanish nouns generally have', ['No gender', 'Masculine or feminine gender', 'Only plural form', 'Only one article'], 1),
    q('Which phrase means “thank you”?', ['Por favor', 'Gracias', 'Buenos días', 'De nada'], 1),
    q('Verb conjugation changes mainly with', ['File size', 'Person and tense', 'Monitor type', 'Keyboard layout'], 1),
  ],
};

export function buildExamDefinition(skill) {
  const key = normalize(skill?.name || skill?.slug || '');
  const questions = SUBJECT_QUESTION_BANK[key] || buildFallbackQuestions(skill);

  return {
    title: `${skill.name} Verification Exam`,
    description: `Demonstrate that you can confidently teach ${skill.name}.`,
    passingScore: 70,
    durationMinutes: 15,
    questions,
  };
}

function buildFallbackQuestions(skill) {
  const name = skill?.name || 'this skill';
  const category = skill?.category || 'general';
  const keywords = (skill?.keywords || []).slice(0, 3);
  const focus = keywords.length ? keywords.join(', ') : name;

  return [
    q(`Which answer best describes the core focus of ${name}?`, [`Unrelated topics`, `${name} concepts and practice`, 'Only hardware repair', 'Only project budgets'], 1),
    q(`A good teacher of ${name} should be able to explain`, ['Only advanced jargon', `${focus} in clear steps`, 'Nothing to beginners', 'Only exam scores'], 1),
    q(`When teaching ${name}, a practical example helps because it`, ['Makes the topic harder', 'Connects theory to real use', 'Removes the need for questions', 'Always replaces fundamentals'], 1),
    q(`Which is a good learning approach for ${name}?`, ['Skip basics', 'Build understanding step by step', 'Memorize without context', 'Avoid practice'], 1),
    q(`This skill belongs closest to which category?`, [category, 'Unrelated category', 'No category', 'Only networking'], 0),
  ];
}

function q(text, options, correctIndex) {
  return { text, options, correctIndex };
}

function normalize(value) {
  return String(value).trim().toLowerCase();
}
