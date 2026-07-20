# ScoutFlow

**Personal Lead Discovery Bot for Freelancers**

---

## Project Overview

### What is ScoutFlow?

ScoutFlow is a personal, Node.js-based lead discovery bot that monitors public Facebook groups for potential freelance opportunities. It scans configured groups, extracts posts, scores them against customizable keywords, and sends Telegram notifications when promising leads are found.

### The Problem It Solves

Freelancers and agency owners spend hours manually browsing Facebook groups, searching for posts where people are looking to hire developers, designers, or automation experts. ScoutFlow automates this discovery process, allowing you to focus on responding to leads rather than finding them.

### Who It Is Built For

- Freelance developers looking for new clients
- Small agency owners who want to find leads efficiently
- Anyone who wants to automate their lead generation from Facebook groups

### Current Development Status

**Status:** 🟡 Partially Functional MVP

ScoutFlow has a solid foundation but is not yet ready for production use. The core architecture is complete, but the Facebook scanner (the most critical component) requires stabilization and testing.

### Original Goals

1. ✅ Monitor selected Facebook groups
2. ✅ Detect new posts
3. ✅ Score posts based on configurable keywords
4. ✅ Send Telegram notifications with inline actions
5. ✅ Store leads in Firebase
6. ✅ Duplicate detection
7. ❌ Production-ready stability
8. ❌ Multi-platform support (Twitter, Quora - deferred)

### What Parts Are Completed

- ✅ Project architecture and structure
- ✅ Telegram bot with admin-only access
- ✅ Command system (`/start`, `/help`, `/ping`, `/status`, `/version`)
- ✅ Firebase storage adapter
- ✅ Scoring engine with keyword matching
- ✅ Scheduler with cron-based scanning
- ✅ Facebook scanner implementation (code complete, needs testing)
- ✅ Session persistence for Facebook authentication
- ✅ Duplicate detection
- ✅ Inline notification buttons (Open Post, Ignore)

### What Parts Remain Unfinished

- ❌ Production testing and stabilization
- ❌ Comprehensive test suite
- ❌ Error recovery and retry logic
- ❌ Rate limiting and anti-detection measures
- ❌ Multi-platform support (planned for future)

---

## High-Level Architecture

### Architecture Diagram

```mermaid
graph TD
    A[Application Start] --> B[Environment Validation]
    B --> C[Firebase Initialization]
    C --> D[Telegram Bot Initialization]
    D --> E[Scheduler Start]
    E --> F[Scan Cycle]

    F --> G[Facebook Scanner Setup]
    G --> H[Browser Launch]
    H --> I[Session Load/Auth]
    I --> J[Group Scan]

    J --> K[Post Extraction]
    K --> L[Lead Normalization]
    L --> M[Duplicate Check]
    M --> N[Scoring Engine]
    N --> O[Storage Save]
    O --> P[Telegram Notification]

    P --> Q[Wait for Next Cycle]
    Q --> F

    subgraph "Components"
        G
        K
        L
        M
        N
        O
        P
    end

    subgraph "External Services"
        C --> R[(Firebase)]
        D --> S[Telegram API]
        G --> T[Facebook]
    end
```

### Component Flow

1. **Application Startup**: Loads configuration, validates environment, initializes services
2. **Firebase**: Provides persistent storage for leads, settings, and ignored posts
3. **Telegram Bot**: Handles commands, authentication, and notifications
4. **Scheduler**: Runs scan cycles at configured intervals (default: every 5 minutes)
5. **Facebook Scanner**: Uses Playwright to authenticate and scrape groups
6. **Scoring Engine**: Matches posts against keywords and calculates confidence scores
7. **Notification System**: Sends formatted alerts to Telegram with action buttons

---

## Folder Structure

```
scoutflow/
├── src/
│   ├── adapters/              # Storage adapters
│   │   ├── firebase-adapter.js    # Firebase implementation
│   │   └── storage-adapter.js     # Abstract storage interface (fallback)
│   │
│   ├── commands/              # Telegram bot commands
│   │   ├── base-command.js        # Base command class
│   │   ├── index.js               # Command registry
│   │   ├── start.js               # /start command
│   │   ├── help.js                # /help command
│   │   ├── ping.js                # /ping command
│   │   ├── status.js              # /status command
│   │   └── version.js             # /version command
│   │
│   ├── config/                # Configuration management
│   │   ├── index.js               # Environment validation
│   │   ├── commands.js            # Command metadata
│   │   ├── keywords.js            # Default keyword weights
│   │   └── platforms.js           # Platform enablement
│   │
│   ├── constants/             # Application constants
│   │   └── index.js
│   │
│   ├── middleware/            # Telegram bot middleware
│   │   └── auth.js               # Admin authorization
│   │
│   ├── models/                # Data models
│   │   ├── lead.js               # Lead data structure
│   │   └── scanner-result.js     # Scanner result structure
│   │
│   ├── scanners/              # Platform scanners
│   │   ├── base-scanner.js       # Abstract scanner class
│   │   ├── facebook-scanner.js   # Facebook implementation
│   │   └── index.js              # Scanner registry
│   │
│   ├── scoring/               # Scoring engine
│   │   └── index.js              # Keyword matching and scoring
│   │
│   ├── services/              # Core services
│   │   ├── logger.js             # Winston logger
│   │   └── telegram.js           # Telegram service wrapper
│   │
│   ├── utils/                 # Utility functions
│   │   ├── date.js               # Date formatting
│   │   ├── string.js             # String manipulation
│   │   └── validator.js          # Data validation
│   │
│   ├── app.js                 # Application entry point
│   ├── bot.js                 # Telegram bot initialization
│   └── scheduler.js           # Task scheduler
│
├── firebase/                  # Firebase credentials
│   └── service-account.json   # Service account key (not committed)
│
├── logs/                      # Application logs
│   └── app.log
│
├── sessions/                  # Facebook session storage
│   └── facebook-session.json  # Playwright session file
│
├── scripts/                   # Utility scripts
│   ├── dev.js                    # Development environment check
│   └── setup.js                  # Setup wizard
│
├── tests/                     # Test files (incomplete)
│   ├── unit/
│   └── integration/
│
├── .env.example               # Environment template
├── package.json               # Dependencies and scripts
└── README.md                  # Project documentation
```

---

## Complete File Documentation

### `src/app.js` - Application Entry Point

**Purpose:** Main application class that orchestrates startup and shutdown.

**Responsibilities:**
- Validates environment variables
- Creates storage adapter
- Initializes Telegram bot
- Initializes scheduler
- Handles graceful shutdown

**Key Functions:**
- `start()` - Complete startup sequence
- `stop()` - Graceful shutdown

**Dependencies:**
- `./config` - Environment validation
- `./services/logger` - Logging
- `./bot` - Telegram bot initialization
- `./scheduler` - Task scheduler
- `./adapters/firebase-adapter` - Storage

**Exports:** `ScoutFlow` class

---

### `src/bot.js` - Telegram Bot Initialization

**Purpose:** Initializes the Telegraf bot with middleware and command handlers.

**Responsibilities:**
- Creates Telegraf instance
- Sets up global error handling
- Applies authorization middleware
- Registers command registry
- Sets up callback handlers for inline buttons
- Launches bot with polling

**Key Functions:**
- `initializeBot(storage)` - Bot setup and launch
- `getBot()` - Returns bot instance

**Dependencies:**
- `telegraf` - Telegram bot framework
- `./services/logger` - Logging
- `./middleware/auth` - Authorization
- `./commands` - Command registry

**Exports:** `initializeBot`, `getBot`

---

### `src/scheduler.js` - Task Scheduler

**Purpose:** Manages recurring scan cycles using node-cron.

**Responsibilities:**
- Schedules scan tasks
- Runs initial scan on startup
- Manages scanner lifecycle (setup, scan, teardown)
- Handles scan failures gracefully

**Key Functions:**
- `start()` - Start the scheduler
- `stop()` - Stop the scheduler
- `_runScanCycle()` - Execute one scan cycle

**Dependencies:**
- `node-cron` - Cron scheduling
- `./services/logger` - Logging
- `./scanners` - Scanner registry
- `./scoring` - Lead processing

**Exports:** `Scheduler`, `initializeScheduler`, `getScheduler`

---

### `src/commands/index.js` - Command Registry

**Purpose:** Manages all Telegram bot commands.

**Responsibilities:**
- Registers command handlers
- Lazy loads command modules
- Executes commands with error handling

**Key Functions:**
- `initialize()` - Register all commands
- `execute(ctx, commandName)` - Execute a command
- `getAll()` - Get all registered commands

**Dependencies:**
- `./services/logger` - Logging
- `./base-command` - Base command class
- Individual command files

**Exports:** `CommandRegistry`, `getCommandRegistry`

---

### `src/commands/base-command.js` - Base Command Class

**Purpose:** Abstract base class for all bot commands.

**Responsibilities:**
- Defines command interface
- Provides common utilities (logging, replies)

**Key Methods:**
- `execute(ctx)` - Abstract method for command logic
- `replyError(ctx, message)` - Send error reply
- `replySuccess(ctx, message)` - Send success reply
- `replyInfo(ctx, message)` - Send info reply

**Dependencies:**
- `./services/logger` - Logging

**Exports:** `BaseCommand`

---

### Individual Command Files

| File | Command | Purpose |
|------|---------|---------|
| `start.js` | `/start` | Welcome message and introduction |
| `help.js` | `/help` | List all available commands |
| `ping.js` | `/ping` | Health check with response time |
| `status.js` | `/status` | Application status and statistics |
| `version.js` | `/version` | Version information |

Each command extends `BaseCommand` and implements `execute(ctx)`.

---

### `src/config/index.js` - Configuration Loader

**Purpose:** Validates and loads environment variables.

**Responsibilities:**
- Validates environment variables using Joi
- Creates required directories (logs, sessions)
- Provides configuration object

**Key Functions:**
- `validateEnvironment()` - Validate .env variables
- `validateStartup()` - Check startup conditions
- `getConfig()` - Return configuration object

**Dependencies:**
- `joi` - Schema validation
- `./services/logger` - Logging

**Exports:** `validateEnvironment`, `validateStartup`, `getConfig`

---

### `src/config/platforms.js` - Platform Configuration

**Purpose:** Defines enabled platforms and their settings.

**Configuration:**
```javascript
FACEBOOK: {
  enabled: true,
  scanner: 'FacebookScanner',
  groupLimit: 10,
  scanDelay: 2000
}
```

**Functions:**
- `getEnabledPlatforms()` - Get enabled platforms
- `getPlatform(platformId)` - Get platform config

**Exports:** `PLATFORMS`, `getPlatforms`, `getPlatform`, `getEnabledPlatforms`

---

### `src/config/keywords.js` - Keyword Configuration

**Purpose:** Defines default keywords and their weights.

**Structure:**
```javascript
'hiring': { weight: 10, priority: 'high' },
'web developer': { weight: 8, priority: 'medium' }
```

**Functions:**
- `getKeywords()` - Get all keywords
- `getKeywordWeights()` - Get weight mapping

**Exports:** `DEFAULT_KEYWORDS`, `getKeywords`, `getKeywordWeights`, `getKeywordPriorities`

---

### `src/scanners/base-scanner.js` - Base Scanner Class

**Purpose:** Abstract class for all platform scanners.

**Methods:**
- `scan()` - Abstract method for scanning
- `normalize(rawData)` - Convert to standard Lead format
- `generateId(rawData)` - Abstract ID generation
- `extractAuthor(rawData)` - Abstract author extraction
- `extractText(rawData)` - Abstract text extraction
- `extractUrl(rawData)` - Abstract URL extraction
- `extractDate(rawData)` - Abstract date extraction
- `extractPlatformData(rawData)` - Optional platform-specific data
- `setup()` - Pre-scan setup
- `teardown()` - Post-scan cleanup

**Exports:** `BaseScanner`

---

### `src/scanners/facebook-scanner.js` - Facebook Scanner

**Purpose:** Scans Facebook groups using Playwright.

**Responsibilities:**
- Launch Chromium browser
- Load/authenticate Facebook session
- Scan configured groups
- Extract posts with complete metadata
- Save session for future runs
- Handle 2FA

**Key Methods:**
- `setup()` - Launch browser and load session
- `authenticate()` - Login to Facebook
- `loadSession()` - Load saved session
- `saveSession()` - Save browser session
- `scan()` - Scan all groups
- `scanGroup(groupUrl)` - Scan a single group
- `extractPostData(postElement, groupUrl)` - Extract post details
- `teardown()` - Close browser and save session

**Post Extraction:**
- Text content
- Author name
- Post URL
- Post ID (from URL or generated)
- Timestamp (relative or absolute)
- Group name

**Dependencies:**
- `playwright` - Browser automation
- `fs` - File system operations
- `path` - Path handling
- `./base-scanner` - Base scanner class

**Exports:** `FacebookScanner`

---

### `src/adapters/firebase-adapter.js` - Firebase Storage

**Purpose:** Persistent storage using Firebase Firestore.

**Collections:**
- `leads` - Stored leads
- `settings` - Application settings
- `ignored` - Ignored leads

**Key Methods:**
- `initialize()` - Connect to Firebase
- `save(key, data)` - Save a lead
- `get(key)` - Get a lead
- `exists(key)` - Check if lead exists
- `delete(key)` - Delete a lead
- `markIgnored(leadId)` - Mark as ignored
- `isIgnored(leadId)` - Check if ignored

**Dependencies:**
- `firebase-admin` - Firebase SDK
- `./services/logger` - Logging
- `./config` - Configuration

**Exports:** `FirebaseAdapter`, `createStorageAdapter`

---

### `src/scoring/index.js` - Scoring Engine

**Purpose:** Scores leads based on keyword matching.

**Key Functions:**
- `scoreLead(lead, options)` - Score a lead
- `processLeads(params)` - Process leads from a scanner

**Scoring Algorithm:**
1. Check text for each keyword
2. Sum keyword weights
3. Add recency bonus (5 points if < 24 hours old)
4. Cap at 100 points
5. Return score and matched keywords

**Dependencies:**
- `./config/keywords` - Keyword configuration
- `./services/telegram` - Notification service

**Exports:** `scoreLead`, `processLeads`

---

### `src/services/logger.js` - Winston Logger

**Purpose:** Structured logging with file and console outputs.

**Features:**
- Console logging with colors
- File logging with rotation (10MB max, 5 files)
- Separate error log file
- Context support

**Configuration:**
- Level: From `LOG_LEVEL` environment variable
- Format: Timestamp, level, message, metadata
- File: `logs/app.log`
- Error file: `logs/error.log`

**Exports:** `logger` instance

---

### `src/services/telegram.js` - Telegram Service

**Purpose:** Wrapper for sending Telegram messages.

**Key Methods:**
- `sendMessage(chatId, text, options)` - Send a message
- `sendToAdmin(text, options)` - Send to admin user
- `sendNotification(lead)` - Send lead notification
- `formatNotification(lead)` - Format notification HTML
- `answerCallback(queryId, text, showAlert)` - Answer callback

**Notification Format:**
- Platform and group name
- Author and timestamp
- Confidence score
- Matched keywords
- Post content (truncated)
- Suggested reply
- Inline buttons (Open Post, Ignore)

**Dependencies:**
- `./bot` - Bot instance
- `./logger` - Logging

**Exports:** `TelegramService`, `getTelegramService`

---

### `src/middleware/auth.js` - Authorization Middleware

**Purpose:** Restricts bot commands to the configured admin user.

**Functions:**
- `authorizeAdmin(ctx, next)` - Check if user is admin
- `logCommands(ctx, next)` - Log all commands

**Behavior:**
- Non-admin users receive "⛔ Unauthorized" message
- Unauthorized attempts are logged
- Admin chat ID must be configured

**Exports:** `authorizeAdmin`, `logCommands`

---

### `src/models/lead.js` - Lead Model

**Purpose:** Standardized lead data structure.

**Fields:**
- `id` - Unique identifier
- `platform` - Source platform
- `author` - Post author
- `text` - Post content
- `url` - Post URL
- `createdAt` - Post timestamp
- `score` - Confidence score
- `matchedKeywords` - Keywords that matched
- `group` - Group name
- `processedAt` - Processing timestamp

**Methods:**
- `toJSON()` - Serialize to JSON
- `isValid()` - Validate required fields
- `getSummary()` - Short summary

**Exports:** `Lead`

---

### `src/utils/` - Utilities

| File | Purpose |
|------|---------|
| `date.js` | Date formatting, time ago, recency checking |
| `string.js` | Truncation, email/URL extraction, keyword matching |
| `validator.js` | Lead validation, URL/email validation |

---

## Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | No | Environment mode (development/production) |
| `TELEGRAM_BOT_TOKEN` | **Yes** | Bot token from @BotFather |
| `TELEGRAM_ADMIN_CHAT_ID` | **Yes** | Your Telegram user ID |
| `FACEBOOK_LOGIN` | **Yes** | Facebook account email |
| `FACEBOOK_PASSWORD` | **Yes** | Facebook account password |
| `FACEBOOK_SESSION_PATH` | No | Session file path (default: ./sessions/facebook-session.json) |
| `FACEBOOK_GROUPS` | **Yes** | Comma-separated group URLs |
| `FIREBASE_PROJECT_ID` | **Yes** | Firebase project ID |
| `FIREBASE_CLIENT_EMAIL` | **Yes** | Firebase service account email |
| `FIREBASE_PRIVATE_KEY` | **Yes** | Firebase private key (with \n for newlines) |
| `FIREBASE_DATABASE_URL` | **Yes** | Firebase database URL |
| `SCAN_INTERVAL_CRON` | No | Cron schedule (default: */5 * * * *) |
| `MIN_SCORE_THRESHOLD` | No | Minimum score for notification (default: 30) |
| `MAX_POSTS_PER_SCAN` | No | Maximum posts to extract per group (default: 20) |
| `LOG_LEVEL` | No | Log level (error/warn/info/debug) |
| `LOG_FILE_PATH` | No | Log file path (default: ./logs/app.log) |

### Example `.env` File

```env
# Application
NODE_ENV=development

# Telegram Bot
TELEGRAM_BOT_TOKEN=YOUR_BOT_TOKEN_FROM_BOTFATHER
TELEGRAM_ADMIN_CHAT_ID=YOUR_TELEGRAM_USER_ID

# Facebook Authentication
FACEBOOK_LOGIN=your_facebook_account@email.com
FACEBOOK_PASSWORD=your_facebook_password
FACEBOOK_SESSION_PATH=./sessions/facebook-session.json

# Facebook Groups to Monitor
FACEBOOK_GROUPS=https://www.facebook.com/groups/group1,https://www.facebook.com/groups/group2

# Firebase Configuration
FIREBASE_PROJECT_ID=your-firebase-project
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEv...\n-----END PRIVATE KEY-----\n"
FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com

# Scraping Configuration
SCAN_INTERVAL_CRON=*/5 * * * *
MIN_SCORE_THRESHOLD=30
MAX_POSTS_PER_SCAN=20

# Logging
LOG_LEVEL=info
LOG_FILE_PATH=./logs/app.log
```

---

## Startup Sequence

```mermaid
sequenceDiagram
    participant App
    participant Config
    participant Firebase
    participant Bot
    participant Scheduler
    participant Scanner

    App->>App: Start application
    App->>Config: validateEnvironment()
    Config-->>App: Environment valid
    App->>Config: validateStartup()
    Config-->>App: Startup valid

    App->>Firebase: createStorageAdapter()
    Firebase->>Firebase: initialize()
    Firebase-->>App: Firebase ready

    App->>Bot: initializeBot(storage)
    Bot->>Bot: Create Telegraf instance
    Bot->>Bot: Set up middleware
    Bot->>Bot: Register commands
    Bot->>Bot: bot.launch()
    Bot-->>App: Bot ready

    App->>Scheduler: initializeScheduler()
    Scheduler->>Scheduler: Create scheduler
    Scheduler->>Scheduler: start()
    Scheduler->>Scanner: Run initial scan
    Scheduler-->>App: Scheduler running

    App->>App: Setup shutdown handlers
    App-->>App: Application running
```

### Startup Log Output

```
🚀 Starting ScoutFlow...
✅ Startup validation passed
✅ Firebase initialized successfully
Storage adapter initialized
Telegram bot launched as @ScoutFlowBot
Command registry initialized with 5 commands
✅ ScoutFlow is running in development mode
📡 Telegram bot: @ScoutFlowBot
⏰ Scan schedule: */5 * * * *
📋 Monitoring 2 Facebook groups
```

---

## Telegram System

### Bot Initialization

The bot is initialized in `src/bot.js` using Telegraf:

1. Create Telegraf instance with token
2. Set up global error handler
3. Apply `logCommands` middleware
4. Apply `authorizeAdmin` middleware
5. Get command registry
6. Register all command handlers
7. Set up callback handler for "Ignore" buttons
8. Launch with polling mode

### Command Registry

Commands are registered in `src/commands/index.js`:

1. Lazy load command modules
2. Create command instances
3. Register in command map
4. Execute commands with error handling

### Current Commands

| Command | Description | Auth Required |
|---------|-------------|---------------|
| `/start` | Welcome message | Yes |
| `/help` | List all commands | Yes |
| `/ping` | Health check | Yes |
| `/status` | Application status | Yes |
| `/version` | Version information | Yes |

### Authorization

1. Admin chat ID is checked against `TELEGRAM_ADMIN_CHAT_ID`
2. Non-admin users receive "⛔ Unauthorized" message
3. Unauthorized attempts are logged

### Notifications

Notifications include:
- Platform and group name
- Author and timestamp
- Confidence score
- Matched keywords
- Post content (truncated)
- Suggested reply template
- Inline buttons: "Open Post" and "Ignore"

### Polling Configuration

```javascript
await bot.launch({
  dropPendingUpdates: true,
  webhook: undefined
});
```

---

## Facebook Scanner

### Architecture

The scanner uses Playwright to automate a browser that navigates to Facebook groups and extracts posts.

### Authentication Flow

1. **Session Check**: Look for saved session file
2. **No Session**: Open browser and navigate to Facebook
3. **Login**: Fill email and password
4. **2FA**: Wait for manual 2FA entry (60-second timeout)
5. **Session Save**: Save authenticated session to file

### Session Persistence

- Session stored in `sessions/facebook-session.json`
- Contains cookies and localStorage state
- Reused on subsequent runs
- Re-authenticates if session expires

### Group Scanning

1. Navigate to group URL
2. Wait for posts to load
3. Scroll to load more posts
4. Extract up to `MAX_POSTS_PER_SCAN` posts
5. For each post, extract metadata

### Post Extraction

```javascript
{
  postId: string,      // From URL or generated
  postText: string,    // Full text content
  authorName: string,  // Author display name
  postUrl: string,     // Direct URL to post
  timestamp: string,   // ISO timestamp
  groupUrl: string,    // Group URL
  groupName: string    // Group name
}
```

### Current Implementation Status

**Status:** ✅ Implemented, ⚠️ Needs Testing

The scanner code is complete but has not been thoroughly tested in production. Key features include:

- ✅ Browser launch with headless/production mode
- ✅ Session persistence
- ✅ Authentication with 2FA support
- ✅ Group scanning
- ✅ Post extraction
- ✅ Error handling
- ⚠️ Rate limiting (needs implementation)
- ⚠️ Anti-detection measures (basic)

### Known Limitations

1. **Facebook UI Changes**: The scanner relies on CSS selectors that may change
2. **Manual 2FA**: First authentication requires manual intervention
3. **Rate Limiting**: Facebook may throttle requests
4. **Headless Detection**: Facebook can detect headless browsers

---

## Firebase

### Initialization

Firebase is initialized in `src/adapters/firebase-adapter.js`:

1. Look for `firebase/service-account.json` file
2. If not found, use environment variables
3. Initialize Firebase Admin SDK
4. Test connection

### Collections

| Collection | Purpose |
|------------|---------|
| `leads` | Stored leads with scores and metadata |
| `settings` | Application settings (future use) |
| `ignored` | IDs of ignored leads |

### Document Structure

```javascript
{
  id: string,
  platform: string,
  author: string,
  text: string,
  url: string,
  createdAt: string,
  score: number,
  matchedKeywords: [],
  group: string,
  processedAt: string,
  savedAt: timestamp,
  ignored: boolean,
  ignoredAt: timestamp
}
```

### Duplicate Detection

- Each lead has a unique ID (platform-specific or generated)
- `exists(leadId)` checks if the lead already exists
- Duplicates are skipped during processing

### Ignored Leads

- Marked in both `leads` and `ignored` collections
- `isIgnored(leadId)` checks if a lead was ignored
- Ignored leads are skipped during future scans

---

## Scheduler

### Cron Schedule

- Default: `*/5 * * * *` (every 5 minutes)
- Configurable via `SCAN_INTERVAL_CRON`
- Runs immediately on application startup

### Execution Flow

1. Get active scanners from registry
2. For each scanner:
   - Call `setup()`
   - Call `scan()`
   - Process results
   - Call `teardown()`
3. Log results and duration

### Scanner Lifecycle

```
setup() → scan() → teardown()
```

Each scan cycle fully initializes and cleans up the scanner.

### Failure Handling

- Scanner failures are logged but don't crash the application
- Individual group failures don't stop other groups
- Cron continues even if a scan cycle fails

---

## Scoring Engine

### Keyword Configuration

Keywords are stored in `src/config/keywords.js` with weights:

```javascript
{
  'hiring': { weight: 10, priority: 'high' },
  'web developer': { weight: 8, priority: 'medium' },
  'project': { weight: 4, priority: 'low' }
}
```

### Scoring Algorithm

1. **Keyword Matching**: Check text for each keyword
2. **Weight Sum**: Add weights for matched keywords
3. **Recency Bonus**: +5 if post is < 24 hours old
4. **Normalize**: Cap at 100

### Threshold

- Default: 30
- Configurable via `MIN_SCORE_THRESHOLD`
- Only leads above threshold are notified

### Notification Trigger

A lead is notified when:
- Score >= `MIN_SCORE_THRESHOLD`
- At least one keyword matched
- Not a duplicate
- Not ignored

---

## Logging System

### Logger Configuration

- **Library**: Winston
- **Level**: From `LOG_LEVEL` environment variable
- **Console**: Colored output
- **Files**: `logs/app.log` and `logs/error.log`
- **Rotation**: 10MB max, 5 files

### Log Levels

| Level | Use Case |
|-------|----------|
| `error` | Application errors, failures |
| `warn` | Warnings, non-critical issues |
| `info` | Important events (startup, scan cycles, notifications) |
| `debug` | Detailed debug information |

### Debug Logging

Debug logs are used for troubleshooting:
- Scanner setup/teardown
- Browser launch
- Authentication
- Post extraction
- Command execution

### Using Logs for Troubleshooting

```bash
# View live logs
tail -f logs/app.log

# View error logs
tail -f logs/error.log

# Filter for specific component
grep "Facebook Scanner" logs/app.log

# Filter for errors
grep ERROR logs/app.log
```

---

## Runtime Flow

```mermaid
flowchart TD
    A[Application Start] --> B[Environment Validation]
    B --> C[Firebase Initialization]
    C --> D[Telegram Bot Start]
    D --> E[Scheduler Start]

    E --> F{Scan Cycle}
    F --> G[Get Active Scanners]
    G --> H{Scanners Found?}
    H -->|No| I[Log Warning]
    H -->|Yes| J[Process Each Scanner]

    J --> K[scanner.setup]
    K --> L[scanner.scan]
    L --> M[scanner.teardown]

    L --> N[Process Results]
    N --> O{Any Posts?}
    O -->|No| P[Log No Posts]
    O -->|Yes| Q[Process Each Post]

    Q --> R[Normalize to Lead]
    R --> S{Duplicate?}
    S -->|Yes| T[Skip]
    S -->|No| U[Score Lead]

    U --> V{Score ≥ Threshold?}
    V -->|No| W[Save Only]
    V -->|Yes| X[Save and Notify]

    X --> Y[Format Notification]
    Y --> Z[Send to Telegram]
    Z --> AA[Wait for Next Cycle]
    AA --> F

    I --> AA
    P --> AA
    T --> V
    W --> AA
```

### Complete Flow Description

1. **Application Start**: `npm start` executes `src/app.js`
2. **Environment Validation**: Checks all required variables
3. **Firebase Initialization**: Connects to Firebase Firestore
4. **Telegram Bot Start**: Initializes Telegraf with commands
5. **Scheduler Start**: Starts cron job for scan cycles
6. **Initial Scan**: Runs immediately
7. **Scan Cycle**:
   - Get active scanners (Facebook)
   - Setup scanner (launch browser)
   - Scan groups (extract posts)
   - Process results (score, store, notify)
   - Teardown scanner (save session, close browser)
8. **Wait**: Sleep until next cron interval
9. **Repeat**: Continue forever

---

## Current Project State

### What Is Working

| Component | Status | Notes |
|-----------|--------|-------|
| Project Architecture | ✅ Complete | Well-organized, modular |
| Environment Configuration | ✅ Complete | Joi validation, startup checks |
| Firebase Adapter | ✅ Complete | Fully implemented with all methods |
| Telegram Bot | ✅ Complete | Commands, middleware, notifications |
| Command System | ✅ Complete | 5 commands, command registry |
| Scoring Engine | ✅ Complete | Keyword matching, scoring |
| Scheduler | ✅ Complete | Cron scheduling, scan cycles |
| Facebook Scanner | ✅ Implemented | Code complete, needs testing |
| Session Persistence | ✅ Implemented | Saves and loads sessions |
| Duplicate Detection | ✅ Implemented | Firebase-based deduplication |
| Notification Formatting | ✅ Implemented | HTML messages with buttons |
| Logging | ✅ Complete | Winston with file/console |

### What Appears Implemented

- Facebook authentication with 2FA support
- Playwright browser management
- Post extraction from Facebook groups
- Relative timestamp parsing
- Group name extraction
- Error handling and recovery (basic)

### What Is Partially Implemented

- **Error Recovery**: Basic failure handling, needs exponential backoff
- **Rate Limiting**: Not yet implemented
- **Testing**: Test directories exist but are empty
- **Documentation**: Code comments exist but incomplete

### What Still Needs Work

| Task | Priority | Estimated Effort |
|------|----------|------------------|
| Production testing | High | 4-6 hours |
| Error recovery improvements | Medium | 2-3 hours |
| Rate limiting | Medium | 2-3 hours |
| Anti-detection measures | Medium | 3-4 hours |
| Test suite | Medium | 8-12 hours |
| CI/CD setup | Low | 2-3 hours |
| Deployment automation | Low | 2-3 hours |

### What Is Production-Ready

None of the components are fully production-ready. The application needs:
- Real-world testing
- Error recovery improvements
- Rate limiting

### What Is Experimental

- Playwright browser automation (anti-detection)
- Facebook session persistence (may break with UI changes)
- 2FA handling (manual intervention required)

---

## Known Problems

### Critical Issues

#### 1. Bot Launch Hanging

**Issue:** `bot.launch()` in Telegraf can hang indefinitely.

**Cause:** Existing webhook configuration on the bot token.

**Status:** ✅ Fixed - Added `dropPendingUpdates: true, webhook: undefined`

**Affects:** Application startup

#### 2. Playwright Browser Download Issues

**Issue:** Playwright fails to download Chromium on some networks.

**Cause:** Network/DNS issues, CDN availability, corporate firewalls.

**Status:** ⚠️ Workaround available - Use system Chrome or manual download.

**Affects:** Facebook scanner setup

#### 3. Facebook Authentication Failures

**Issue:** Authentication may fail due to:
- Invalid credentials
- 2FA (manual intervention required)
- Account restrictions
- Facebook security measures

**Status:** ⚠️ Graceful error handling, manual 2FA support.

**Affects:** Facebook scanner

### Moderate Issues

#### 4. CSS Selector Fragility

**Issue:** The scanner relies on Facebook's DOM structure which can change.

**Affected Selectors:**
- `[role="article"]` - Post containers
- `div[dir="auto"]` - Text content
- `a[role="link"] > span` - Author name
- `abbr` - Timestamps

**Status:** ⚠️ May need periodic updates.

#### 5. Session Expiry

**Issue:** Facebook sessions expire after approximately 30 days.

**Status:** ✅ Handled - Scanner re-authenticates automatically.

#### 6. Rate Limiting

**Issue:** No rate limiting implemented for Facebook requests.

**Status:** ❌ Not implemented - Could lead to temporary blocks.

### Minor Issues

#### 7. Group URL Formatting

**Issue:** Trailing slashes in group URLs may cause issues.

**Status:** ⚠️ Fix applied - URLs are trimmed.

#### 8. Timestamp Parsing

**Issue:** Relative timestamps ("2h", "3m") are parsed, but complex formats may fail.

**Status:** ⚠️ Basic support implemented.

#### 9. Headless Detection

**Issue:** Facebook can detect headless Chrome.

**Status:** ⚠️ Basic evasion flags used (`--no-sandbox`, `--disable-setuid-sandbox`).

### Configuration Pitfalls

| Issue | Solution |
|-------|----------|
| Missing `FACEBOOK_PASSWORD` | Must be set in .env |
| Placeholder Firebase values | Must use real credentials |
| Invalid group URLs | Use full Facebook group URLs |
| Admin chat ID mismatch | Get correct ID from @userinfobot |
| Bot token invalid | Regenerate token if expired |

---

## Development History

### Milestone 1: Project Foundation

- Set up project structure
- Configured dependencies
- Implemented environment validation
- Created logger service
- Set up storage abstraction

### Milestone 2: Telegram Administration Bot

- Implemented command system
- Added authorization middleware
- Created base command class
- Implemented 5 commands (`/start`, `/help`, `/ping`, `/status`, `/version`)

### Milestone 3: Facebook Scanner (Phase 1)

- Implemented base scanner class
- Created Facebook scanner stub
- Added Playwright dependency

### Milestone 4: Scoring & Notification System

- Implemented scoring engine
- Added keyword configuration
- Created notification system
- Implemented Telegram service wrapper

### Milestone 5: Firebase Integration

- Created Firebase adapter
- Implemented storage methods
- Added duplicate detection
- Added ignored leads support

### Milestone 6: Facebook Scanner (Phase 2 - Complete)

- Implemented full Facebook scanner
- Added session persistence
- Implemented authentication
- Added post extraction
- Added 2FA support

### Major Architectural Decisions

1. **Playwright over Puppeteer**: Better performance and API
2. **Session persistence**: Store authenticated cookies
3. **Firebase for storage**: Scalable, managed database
4. **Telegraf for Telegram**: Most mature Node.js library
5. **Winston for logging**: Structured, file-based logging
6. **Abstract scanner pattern**: Easy to add new platforms

### Unfinished Refactors

1. **Rate limiting**: Should be abstracted and configurable
2. **Error recovery**: Should use exponential backoff
3. **Testing**: Test suite was never completed
4. **Multi-platform**: Twitter and Quora scanners are stubs

---

## How To Continue Development

### For a New Developer

If you've just cloned this repository, here's your path forward:

#### Step 1: Understand the Project

```bash
# Read the documentation
cat README.md

# Review the architecture
# Examine src/app.js to understand startup

# Check the scanner implementation
# Examine src/scanners/facebook-scanner.js
```

#### Step 2: Set Up Development Environment

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install chromium

# Configure environment
cp .env.example .env
# Edit .env with your values

# Run setup script
npm run setup

# Start the application
npm start
```

#### Step 3: Prioritize Tasks

##### High Priority (Must Fix)

1. **Test Facebook Scanner End-to-End**
   - Create a test Facebook account
   - Join some public groups
   - Run scanner manually
   - Verify post extraction
   - Check notification delivery

2. **Implement Rate Limiting**
   - Add delays between group requests
   - Add delays between post extractions
   - Implement exponential backoff for failures

3. **Improve Error Recovery**
   - Add retry logic for failed requests
   - Handle browser crashes gracefully
   - Recover from session expiry

##### Medium Priority (Should Fix)

4. **Write Test Suite**
   - Unit tests for scoring engine
   - Unit tests for utilities
   - Integration tests for scanner

5. **Improve Anti-Detection**
   - Rotate user agents
   - Add random delays
   - Use residential proxies (if needed)

6. **Add Monitoring**
   - Health check endpoints
   - Alert on scanner failure
   - Uptime monitoring

##### Low Priority (Nice to Have)

7. **Multi-Platform Support**
   - Twitter scanner
   - Quora scanner
   - Reddit scanner

8. **Web Dashboard**
   - Lead management UI
   - Configuration UI
   - Statistics and analytics

#### Step 4: Estimated Effort

| Task | Difficulty | Time |
|------|------------|------|
| Test Facebook Scanner | Medium | 4-6 hours |
| Implement Rate Limiting | Easy | 2-3 hours |
| Improve Error Recovery | Medium | 3-4 hours |
| Write Test Suite | Medium | 8-12 hours |
| Anti-Detection | Hard | 4-8 hours |
| Monitoring | Easy | 2-3 hours |
| Multi-Platform | Hard | 20-30 hours |

### What Should Be Rewritten vs. Fixed

#### Fix (Minor Changes)

- Rate limiting logic
- Error recovery
- Anti-detection measures
- Configuration validation

#### Rewrite (Significant Changes)

- **Test suite**: Start from scratch
- **Deployment automation**: Create from scratch
- **Multi-platform support**: New implementation

#### Keep (Working Well)

- Telegram bot system
- Command system
- Firebase adapter
- Scoring engine
- Scheduler

---

## Future Roadmap

### Phase 1: Stabilization (2-3 weeks)

- [ ] End-to-end testing of Facebook scanner
- [ ] Implement rate limiting
- [ ] Improve error recovery
- [ ] Add retry logic
- [ ] Fix session expiry handling
- [ ] Add health monitoring

### Phase 2: Production Readiness (2-3 weeks)

- [ ] Write comprehensive tests
- [ ] Implement anti-detection measures
- [ ] Add deployment automation
- [ ] Create CI/CD pipeline
- [ ] Set up monitoring and alerting
- [ ] Optimize performance

### Phase 3: Feature Expansion (4-6 weeks)

- [ ] Add Twitter scanner
- [ ] Add Quora scanner
- [ ] Improve scoring with NLP
- [ ] Add lead management dashboard
- [ ] Implement configuration via Telegram
- [ ] Add multi-user support

### Phase 4: Maturity (Ongoing)

- [ ] Community contributions
- [ ] Documentation improvements
- [ ] Performance optimization
- [ ] Security hardening
- [ ] Regular updates for platform changes

---

## Contributing Guide

### Coding Style

- **JavaScript**: ES6+ with Node.js 18+
- **Formatting**: Prettier (run `npm run format`)
- **Linting**: ESLint (run `npm run lint`)
- **File Naming**: kebab-case for files, PascalCase for classes

### Folder Conventions

- `src/` - All source code
- `src/adapters/` - External service adapters
- `src/commands/` - Telegram bot commands
- `src/config/` - Configuration and constants
- `src/models/` - Data models
- `src/scanners/` - Platform scanners
- `src/services/` - Core services
- `src/utils/` - Utility functions
- `src/` - Root-level files are high-level orchestration

### Logging Conventions

```javascript
// Use the logger service
const logger = require('./services/logger');

// Basic logging
logger.info('Message');
logger.error('Error message');
logger.warn('Warning message');
logger.debug('Debug message');

// Contextual logging
logger.withContext({ platform: 'facebook' }).info('Scanning groups');
```

### Testing Expectations

- Unit tests for utilities and scoring
- Integration tests for scanners (mocked)
- End-to-end tests for complete flow (optional)

### Commit Message Guidelines

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

**Example:**
```
feat(scanner): add rate limiting to Facebook scanner

Implement token bucket rate limiting with configurable requests per minute.

Closes #42
```

### Pull Request Process

1. Fork the repository
2. Create a feature branch
3. Write tests for your changes
4. Ensure all tests pass
5. Update documentation
6. Submit a pull request
7. Wait for review

---

## Troubleshooting Guide

### Bot Hangs at Startup

**Symptom:** Application hangs after "Storage adapter initialized"

**Cause:** `bot.launch()` in Telegraf is hanging

**Solution:**
```javascript
// In src/bot.js, ensure launch options are:
await bot.launch({
  dropPendingUpdates: true,
  webhook: undefined
});
```

**Debugging:**
```bash
# Check if webhook is set
curl https://api.telegram.org/bot<YOUR_TOKEN>/getWebhookInfo

# Delete webhook
curl https://api.telegram.org/bot<YOUR_TOKEN>/deleteWebhook
```

---

### Firebase Won't Initialize

**Symptom:** "Failed to initialize Firebase" error

**Causes:**
- Missing `firebase/service-account.json`
- Invalid environment variables
- Network issues

**Solution:**
```bash
# Verify service account exists
ls -la firebase/service-account.json

# Check environment variables
node -e "console.log(process.env.FIREBASE_PROJECT_ID)"

# Test connection
node -e "
const admin = require('firebase-admin');
admin.initializeApp({
  credential: admin.credential.applicationDefault()
});
console.log('Connected');
"
```

---

### Playwright Browser Missing

**Symptom:** "Failed to launch browser" error

**Solutions:**

**Option 1: Install browsers**
```bash
npx playwright install chromium
```

**Option 2: Use system Chrome**
```bash
# Find Chrome path
which google-chrome

# Set environment variable
export PLAYWRIGHT_CHROME_EXECUTABLE_PATH=/usr/bin/google-chrome
```

**Option 3: Manual download**
```bash
# Download Chromium
curl -L https://playwright.azureedge.net/builds/chromium/1228/chromium-mac-arm64.zip -o chromium.zip

# Extract to cache
mkdir -p ~/Library/Caches/ms-playwright/
unzip chromium.zip -d ~/Library/Caches/ms-playwright/chromium-1228/
```

---

### Facebook Login Fails

**Symptom:** "Authentication failed" error

**Causes:**
- Invalid credentials
- 2FA required
- Account locked
- Facebook security measures

**Solutions:**

1. **Check credentials** in `.env`
2. **Manual 2FA**: Look for browser window and enter code
3. **Remove session**: Delete `sessions/facebook-session.json`
4. **Test login**: Manually log in with the same credentials

---

### Scheduler Never Starts

**Symptom:** No scan cycles running

**Causes:**
- No active scanners
- Scanner not enabled in configuration
- Cron expression invalid

**Solutions:**

1. **Check enabled platforms**:
   ```javascript
   // src/config/platforms.js
   FACEBOOK: { enabled: true }
   ```

2. **Verify groups**:
   ```env
   FACEBOOK_GROUPS=https://www.facebook.com/groups/group1
   ```

3. **Check cron expression**:
   ```env
   SCAN_INTERVAL_CRON=*/5 * * * *
   ```

---

### Telegram Commands Don't Work

**Symptom:** Bot doesn't respond to commands

**Causes:**
- Bot not running
- Token invalid
- Wrong admin chat ID

**Solutions:**

1. **Check bot status**:
   ```bash
   npm start
   # Look for "Telegram bot launched as @YourBot"
   ```

2. **Verify token**:
   ```bash
   curl https://api.telegram.org/bot<TOKEN>/getMe
   ```

3. **Get correct chat ID**:
   - Message @userinfobot
   - Use the ID in `TELEGRAM_ADMIN_CHAT_ID`

---

### Notifications Never Send

**Symptom:** No Telegram notifications despite posts found

**Causes:**
- Score below threshold
- No keywords matched
- Posts are duplicates
- Posts are ignored

**Solutions:**

1. **Check score**:
   ```javascript
   // In scoring/index.js, add logging
   logger.debug(`Score: ${score}, Threshold: ${minScore}`);
   ```

2. **Verify keywords**:
   ```javascript
   // src/config/keywords.js
   // Ensure keywords match post content
   ```

3. **Check duplicates**:
   ```javascript
   // In scoring/index.js
   logger.debug(`Duplicate: ${isDuplicate}`);
   ```

---

### Duplicate Detection Fails

**Symptom:** Same post notified multiple times

**Causes:**
- Firebase connection issues
- ID generation conflicts
- Existing leads not checked

**Solutions:**

1. **Check Firebase connection**:
   ```bash
   # Look for "Firebase initialized successfully" in logs
   ```

2. **Verify ID generation**:
   ```javascript
   // In facebook-scanner.js
   console.log(`Lead ID: ${lead.id}`);
   ```

3. **Clear duplicate test**:
   ```bash
   # Temporarily clear Firebase collection
   # WARNING: Only for testing
   ```

---

## Project Assessment

### How Close is This Project to Becoming Usable?

**Current State:** 65% complete

The project has:
- ✅ Complete architecture
- ✅ Working Telegram bot
- ✅ Complete Firebase integration
- ✅ Complete scoring engine
- ✅ Implemented Facebook scanner (code)
- ⚠️ Untested scanner

**Remaining Work:**
- ⚠️ Thorough testing (15%)
- ⚠️ Error recovery (10%)
- ⚠️ Rate limiting (5%)
- ⚠️ Anti-detection (5%)

### Strong Foundations

1. **Architecture**: Clean, modular, extensible
2. **Telegram Bot**: Complete and working
3. **Firebase Integration**: Production-ready
4. **Scoring Engine**: Flexible and configurable
5. **Logging**: Comprehensive

### Should Be Redesigned

1. **Error Recovery**: Currently basic, needs exponential backoff
2. **Rate Limiting**: Not implemented, needs token bucket
3. **Anti-Detection**: Basic flags only, needs more sophisticated measures

### Difficulty for an Experienced Node.js Developer

**Overall Difficulty:** Medium

**Time Estimate:** 2-3 weeks to production-ready

**Breakdown:**
- Understand codebase: 1-2 days
- Test and debug: 3-5 days
- Implement improvements: 3-5 days
- Deploy and monitor: 1-2 days

### Estimated Completion Effort

| Task | Hours |
|------|-------|
| Testing Facebook Scanner | 4-6 |
| Rate Limiting Implementation | 2-3 |
| Error Recovery Improvements | 3-4 |
| Anti-Detection Measures | 4-8 |
| Write Test Suite | 8-12 |
| Deployment Setup | 2-3 |
| Documentation | 4-6 |
| **Total** | **27-42 hours** |

---

## Looking for Contributors

### 🚀 Help Wanted: ScoutFlow

ScoutFlow is an open-source lead discovery bot for freelancers and agency owners. It automates the process of finding potential clients in Facebook groups.

### Current Status

The project has a complete architecture and most features are implemented, but it needs:
- Testing and stabilization
- Error recovery improvements
- Rate limiting implementation
- Anti-detection measures

### We Need Help With

#### 🐛 Bug Fixes
- Fix Playwright browser download issues
- Improve Facebook authentication reliability
- Fix CSS selector fragility

#### 🚀 Feature Development
- Implement rate limiting
- Add exponential backoff for retries
- Improve anti-detection measures
- Twitter and Quora scanners

#### 🧪 Testing
- Unit tests for utilities and scoring
- Integration tests for scanners
- End-to-end testing

#### 📚 Documentation
- API documentation
- Setup guides
- Troubleshooting guides

### Tech Stack

- Node.js 18+
- Telegraf (Telegram Bot)
- Playwright (Browser Automation)
- Firebase (Storage)
- Winston (Logging)

### How to Contribute

1. **Fork the repository**
2. **Set up development environment** (see Setup Guide)
3. **Pick an issue** from GitHub Issues
4. **Submit a pull request**
5. **Join our community** for discussion

### Good First Issues

- ✅ Improve error logging
- ✅ Add retry logic for failed requests
- ✅ Fix timestamp parsing edge cases
- ✅ Add more keywords

### Contact

- **GitHub**: [https://github.com/KaroJunior/scoutflow](https://github.com/KaroJunior/scoutflow)
- **Issues**: [https://github.com/KaroJunior/scoutflow/issues](https://github.com/KaroJunior/scoutflow/issues)
- **Discussions**: [https://github.com/KaroJunior/scoutflow/discussions](https://github.com/KaroJunior/scoutflow/discussions)

---

**Thank you for your interest in ScoutFlow!**