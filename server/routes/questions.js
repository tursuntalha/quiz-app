const router = require('express').Router();
const { authMiddleware } = require('./auth');
const Question = require('../models/Question');
const { generateQuestion } = require('../engines/generator');

// Seed 50 questions across 5 topics
const SEED_QUESTIONS = [
  // JavaScript (10)
  { stem: 'What does `typeof null` return in JavaScript?', options: ['"null"', '"object"', '"undefined"', '"boolean"'], correctIndex: 1, explanation: 'This is a known quirk — typeof null returns "object" due to a bug in the original JS implementation.', topic: 'javascript', difficulty: -1.5 },
  { stem: 'Which method creates a new array with the results of calling a function on every element?', options: ['filter()', 'map()', 'reduce()', 'forEach()'], correctIndex: 1, explanation: 'map() transforms each element and returns a new array of the same length.', topic: 'javascript', difficulty: -1.0 },
  { stem: 'What is the output of `console.log(0.1 + 0.2 === 0.3)`?', options: ['true', 'false', 'undefined', 'NaN'], correctIndex: 1, explanation: 'Floating-point precision: 0.1 + 0.2 = 0.30000000000000004, which is not exactly 0.3.', topic: 'javascript', difficulty: -0.5 },
  { stem: 'What does the `reduce` method return?', options: ['An array', 'A single value', 'A boolean', 'A promise'], correctIndex: 1, explanation: 'reduce() executes a reducer function on each element, resulting in a single output value.', topic: 'javascript', difficulty: 0.0 },
  { stem: 'How does `bind()` differ from `call()` and `apply()`?', options: ['It returns a new function', 'It immediately invokes the function', 'It only works with arrow functions', 'There is no difference'], correctIndex: 0, explanation: 'bind() creates a new function with a bound this, while call/apply invoke immediately.', topic: 'javascript', difficulty: 0.5 },
  { stem: 'What is the event loop?', options: ['A loop that creates events', 'A mechanism handling async callbacks', 'A DOM API', 'A CSS feature'], correctIndex: 1, explanation: 'The event loop continuously checks the call stack and task queues to process async operations.', topic: 'javascript', difficulty: 1.0 },
  { stem: 'What are closures in JavaScript?', options: ['Block-scoped variables', 'Functions with access to outer scope', 'Error-handling blocks', 'HTML elements'], correctIndex: 1, explanation: 'A closure is a function that retains access to its outer (enclosing) lexical scope.', topic: 'javascript', difficulty: 0.5 },
  { stem: 'What does the spread operator (...) do?', options: ['Removes duplicates', 'Expands iterables into elements', 'Creates a copy of a function', 'Pauses execution'], correctIndex: 1, explanation: 'The spread operator expands arrays, objects, or other iterables into individual elements.', topic: 'javascript', difficulty: -0.5 },
  { stem: 'What is hoisting?', options: ['DOM manipulation', 'Moving declarations to scope top', 'CSS animation', 'AJAX request'], correctIndex: 1, explanation: 'Hoisting moves variable and function declarations to the top of their scope before execution.', topic: 'javascript', difficulty: 0.0 },
  { stem: 'Which is NOT a JavaScript data type?', options: ['Symbol', 'BigInt', 'Integer', 'Undefined'], correctIndex: 2, explanation: 'JavaScript has Number, not Integer. All numbers are floating-point (or BigInt for large integers).', topic: 'javascript', difficulty: -1.0 },
  // Python (10)
  { stem: 'What is a decorator in Python?', options: ['A design pattern', 'A function modifying another function', 'A class method', 'A variable type'], correctIndex: 1, explanation: 'A decorator is a function that takes another function and extends its behavior without modifying it.', topic: 'python', difficulty: 0.5 },
  { stem: 'What does PEP 8 refer to?', options: ['Python version', 'Style guide', 'A library', 'A built-in function'], correctIndex: 1, explanation: 'PEP 8 is Python\'s official style guide for writing readable code.', topic: 'python', difficulty: -1.0 },
  { stem: 'What is the difference between a list and a tuple?', options: ['Lists are ordered, tuples are not', 'Lists are mutable, tuples are immutable', 'Tuples are faster for iteration', 'No difference'], correctIndex: 1, explanation: 'Lists can be modified (mutable), while tuples cannot (immutable) after creation.', topic: 'python', difficulty: -1.5 },
  { stem: 'What does `*args` mean in a function definition?', options: ['Keyword arguments', 'Positional arguments as a tuple', 'Default arguments', 'Type hints'], correctIndex: 1, explanation: '*args collects extra positional arguments into a tuple.', topic: 'python', difficulty: -0.5 },
  { stem: 'What is a generator in Python?', options: ['A class that generates numbers', 'A function with yield statements', 'A random number generator', 'A type of list'], correctIndex: 1, explanation: 'A generator uses yield to produce a sequence of values lazily, one at a time.', topic: 'python', difficulty: 0.0 },
  { stem: 'What does the GIL (Global Interpreter Lock) do?', options: ['Prevents memory leaks', 'Limits one thread to execute at a time', 'Manages garbage collection', 'Optimizes loops'], correctIndex: 1, explanation: 'The GIL ensures only one thread executes Python bytecode at a time, limiting CPU-bound parallelism.', topic: 'python', difficulty: 1.5 },
  { stem: 'What is a context manager used for?', options: ['Managing imports', 'Resource acquisition/release', 'Exception handling', 'Creating decorators'], correctIndex: 1, explanation: 'Context managers (used with `with` statements) handle setup and teardown of resources like files.', topic: 'python', difficulty: 0.0 },
  { stem: 'What does `__init__` do in a Python class?', options: ['Allocates memory', 'Constructor/initializer method', 'Destructor method', 'String representation'], correctIndex: 1, explanation: '__init__ is the constructor method called when a new instance of a class is created.', topic: 'python', difficulty: -1.0 },
  { stem: 'Which data structure provides O(1) average lookup time?', options: ['List', 'Dictionary', 'Tuple', 'Set'], correctIndex: 1, explanation: 'Dictionaries use hash tables for O(1) average time lookups by key.', topic: 'python', difficulty: 0.5 },
  { stem: 'What is the purpose of `__slots__` in Python?', options: ['Define method signatures', 'Reduce memory usage by preventing __dict__', 'Create slots in a list', 'Define class attributes'], correctIndex: 1, explanation: '__slots__ restricts attribute creation to listed names, reducing memory overhead per instance.', topic: 'python', difficulty: 2.0 },
  // React (10)
  { stem: 'What is JSX?', options: ['A templating engine', 'A syntax extension for JavaScript', 'A CSS framework', 'A build tool'], correctIndex: 1, explanation: 'JSX is a syntax extension for JavaScript that looks like HTML and is used with React.', topic: 'react', difficulty: -1.5 },
  { stem: 'What is the `useState` hook used for?', options: ['Making API calls', 'Managing component state', 'Styling components', 'Routing'], correctIndex: 1, explanation: 'useState allows functional components to manage local state.', topic: 'react', difficulty: -1.0 },
  { stem: 'What does `useEffect` do?', options: ['Creates CSS effects', 'Runs side effects after render', 'Optimizes rendering', 'Handles user input'], correctIndex: 1, explanation: 'useEffect lets you perform side effects (data fetching, subscriptions, DOM updates) in function components.', topic: 'react', difficulty: -0.5 },
  { stem: 'What is the virtual DOM?', options: ['A browser API', 'A lightweight copy of the real DOM', 'A database', 'A testing tool'], correctIndex: 1, explanation: 'The virtual DOM is an in-memory representation of the real DOM that React uses for efficient updates.', topic: 'react', difficulty: 0.0 },
  { stem: 'What are React keys used for?', options: ['Encryption', 'Identifying list items for reconciliation', 'CSS styling', 'Event handling'], correctIndex: 1, explanation: 'Keys help React identify which items changed, added, or removed in lists for efficient re-rendering.', topic: 'react', difficulty: 0.0 },
  { stem: 'Explain the concept of lifting state up.', options: ['Using Redux', 'Moving state to parent component', 'Deleting state', 'Using global variables'], correctIndex: 1, explanation: 'Lifting state up means moving shared state to the nearest common ancestor component.', topic: 'react', difficulty: 0.5 },
  { stem: 'What is the Context API used for?', options: ['State management without prop drilling', 'CSS theming', 'Routing', 'API calls'], correctIndex: 0, explanation: 'Context provides a way to pass data through the component tree without manually passing props at every level.', topic: 'react', difficulty: 0.5 },
  { stem: 'What is the difference between controlled and uncontrolled components?', options: ['Controlled components have state managed by React, uncontrolled by the DOM', 'There is no difference', 'Controlled components are faster', 'Uncontrolled components use Redux'], correctIndex: 0, explanation: 'Controlled components have form data handled by React state; uncontrolled components manage their own state via the DOM.', topic: 'react', difficulty: 1.0 },
  { stem: 'What is the purpose of `React.memo`?', options: ['Memoizing API responses', 'Preventing unnecessary re-renders', 'Caching CSS styles', 'Optimizing bundle size'], correctIndex: 1, explanation: 'React.memo is a higher-order component that memoizes the rendered output, skipping re-renders if props haven\'t changed.', topic: 'react', difficulty: 1.0 },
  { stem: 'What are React Portals?', options: ['A state management library', 'Rendering children into a different DOM subtree', 'A routing solution', 'A CSS framework'], correctIndex: 1, explanation: 'Portals let you render children into a DOM node outside the parent component\'s DOM hierarchy.', topic: 'react', difficulty: 1.5 },
  // Algorithms (10)
  { stem: 'What is the time complexity of binary search?', options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'], correctIndex: 1, explanation: 'Binary search repeatedly divides the search space in half, giving O(log n) complexity.', topic: 'algorithms', difficulty: -0.5 },
  { stem: 'What is a hash table\'s average lookup time?', options: ['O(n)', 'O(log n)', 'O(1)', 'O(n log n)'], correctIndex: 2, explanation: 'Hash tables provide O(1) average-case lookup using a hash function to map keys to indices.', topic: 'algorithms', difficulty: 0.0 },
  { stem: 'Which sorting algorithm has O(n²) worst-case time?', options: ['Merge sort', 'Quick sort', 'Bubble sort', 'Heap sort'], correctIndex: 2, explanation: 'Bubble sort has O(n²) worst-case time complexity, making it inefficient for large datasets.', topic: 'algorithms', difficulty: -1.0 },
  { stem: 'What is a stack data structure?', options: ['FIFO (First In, First Out)', 'LIFO (Last In, First Out)', 'Random access', 'Priority-based access'], correctIndex: 1, explanation: 'A stack follows LIFO — the last element added is the first removed, like a stack of plates.', topic: 'algorithms', difficulty: -1.5 },
  { stem: 'What is memoization?', options: ['Writing memory-efficient code', 'Caching function results to avoid recomputation', 'A garbage collection technique', 'A sorting method'], correctIndex: 1, explanation: 'Memoization stores the results of expensive function calls and returns the cached result when the same inputs occur again.', topic: 'algorithms', difficulty: 0.5 },
  { stem: 'What is the difference between BFS and DFS?', options: ['BFS uses stack, DFS uses queue', 'BFS uses queue, DFS uses stack', 'They are the same', 'BFS is recursive'], correctIndex: 1, explanation: 'BFS uses a queue (explores level by level), while DFS uses a stack (explores depth first).', topic: 'algorithms', difficulty: 0.5 },
  { stem: 'What is a trie data structure?', options: ['A tree for efficient string searches', 'A balanced binary tree', 'A hash set', 'A sorting algorithm'], correctIndex: 0, explanation: 'A trie (prefix tree) is an ordered tree for storing strings, enabling fast prefix-based searches.', topic: 'algorithms', difficulty: 1.5 },
  { stem: 'What is the Master Theorem used for?', options: ['Proving algorithmic correctness', 'Analyzing divide-and-conquer recurrence relations', 'Optimizing memory usage', 'Testing algorithms'], correctIndex: 1, explanation: 'The Master Theorem provides asymptotic bounds for recurrences of the form T(n) = aT(n/b) + f(n).', topic: 'algorithms', difficulty: 2.0 },
  { stem: 'What is dynamic programming?', options: ['Writing code that changes at runtime', 'Breaking problems into overlapping subproblems', 'A Python library', 'A memory allocation technique'], correctIndex: 1, explanation: 'Dynamic programming solves complex problems by breaking them into overlapping subproblems and storing their results.', topic: 'algorithms', difficulty: 0.5 },
  { stem: 'What is amortized analysis?', options: ['Average performance over a sequence of operations', 'Worst-case of each operation', 'Best-case optimization', 'Memory usage analysis'], correctIndex: 0, explanation: 'Amortized analysis averages the time cost of a sequence of operations, even if some individual operations are expensive.', topic: 'algorithms', difficulty: 2.0 },
  // Databases (10)
  { stem: 'What does ACID stand for in databases?', options: ['Atomicity, Consistency, Isolation, Durability', 'Automated, Consistent, Isolated, Durable', 'Atomic, Concurrent, Isolated, Durable', 'Automated, Consistent, Integrated, Durable'], correctIndex: 0, explanation: 'ACID ensures reliable transaction processing through Atomicity, Consistency, Isolation, and Durability.', topic: 'databases', difficulty: 0.5 },
  { stem: 'What is a primary key?', options: ['The first column in a table', 'A unique identifier for each row', 'An indexed column', 'A foreign key reference'], correctIndex: 1, explanation: 'A primary key uniquely identifies each row in a database table and cannot be NULL.', topic: 'databases', difficulty: -1.5 },
  { stem: 'What is the difference between SQL and NoSQL?', options: ['SQL is faster than NoSQL', 'SQL uses relational tables, NoSQL uses flexible document/key-value/graph models', 'NoSQL is only for graphs', 'There is no difference'], correctIndex: 1, explanation: 'SQL databases use structured relational tables; NoSQL databases use flexible schemas like documents, key-values, or graphs.', topic: 'databases', difficulty: -0.5 },
  { stem: 'What is an index in a database?', options: ['A table of contents', 'A data structure improving query speed', 'A type of join', 'A backup mechanism'], correctIndex: 1, explanation: 'An index is a data structure that speeds up data retrieval operations by providing fast lookup paths.', topic: 'databases', difficulty: 0.0 },
  { stem: 'What is a JOIN in SQL?', options: ['Merging two tables into one', 'Combining rows from multiple tables based on a related column', 'Deleting duplicate rows', 'Creating a new table'], correctIndex: 1, explanation: 'JOIN combines columns from related tables based on a condition, typically matching foreign keys to primary keys.', topic: 'databases', difficulty: -0.5 },
  { stem: 'What is normalization?', options: ['Making data normal', 'Reducing redundancy by organizing fields into tables', 'Increasing storage', 'Creating backups'], correctIndex: 1, explanation: 'Normalization organizes database columns into tables to minimize data redundancy and dependency.', topic: 'databases', difficulty: 0.5 },
  { stem: 'What is a transaction in a database?', options: ['Sending money between accounts', 'A unit of work with multiple operations', 'A read-only query', 'A schema change'], correctIndex: 1, explanation: 'A transaction is a logical unit of work containing one or more SQL statements that execute as a single operation.', topic: 'databases', difficulty: 0.0 },
  { stem: 'What is the CAP theorem?', options: ['Consistency, Availability, Partition tolerance - pick two', 'Capacity, Availability, Performance', 'Consistency, Accuracy, Performance', 'Complexity, Accuracy, Partitioning'], correctIndex: 0, explanation: 'The CAP theorem states distributed databases can only guarantee two of three: Consistency, Availability, and Partition tolerance.', topic: 'databases', difficulty: 1.5 },
  { stem: 'What is a NoSQL document store example?', options: ['PostgreSQL', 'MongoDB', 'MySQL', 'SQLite'], correctIndex: 1, explanation: 'MongoDB is a popular document-oriented NoSQL database that stores data in flexible, JSON-like documents.', topic: 'databases', difficulty: -1.0 },
  { stem: 'What is the difference between WHERE and HAVING?', options: ['WHERE filters rows before grouping, HAVING filters after', 'WHERE is for SELECT only', 'HAVING is faster than WHERE', 'There is no difference'], correctIndex: 0, explanation: 'WHERE filters individual rows before GROUP BY; HAVING filters groups after aggregation.', topic: 'databases', difficulty: 1.0 },
];

router.post('/seed', async (req, res) => {
  try {
    const existing = await Question.countDocuments();
    if (existing >= 50) {
      return res.json({ message: `Already seeded (${existing} questions)` });
    }
    await Question.deleteMany({ source: 'seed' });
    await Question.insertMany(SEED_QUESTIONS);
    const count = await Question.countDocuments();
    res.json({ message: `Seeded ${count} questions across 5 topics` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  const { topic, limit = 20 } = req.query;
  const filter = topic ? { topic } : {};
  const questions = await Question.find(filter).limit(Number(limit));
  res.json(questions);
});

router.get('/topics', async (req, res) => {
  const topics = await Question.distinct('topic');
  res.json(topics);
});

router.post('/generate', authMiddleware, async (req, res) => {
  try {
    const { topic, difficulty = 0, count = 5 } = req.body;
    const questions = await generateQuestion(topic, difficulty, count);
    const saved = await Question.insertMany(questions.map(q => ({
      ...q, topic, difficulty, source: 'generated',
    })));
    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
module.exports.SEED_QUESTIONS = SEED_QUESTIONS;
