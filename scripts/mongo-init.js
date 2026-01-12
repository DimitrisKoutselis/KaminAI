// MongoDB initialization script
// This runs when the MongoDB container is first created

db = db.getSiblingDB('kaminai');

// Create collections
db.createCollection('articles');
db.createCollection('chat_sessions');
db.createCollection('chat_messages');

// Create indexes for articles
db.articles.createIndex({ "slug": 1 }, { unique: true });
db.articles.createIndex({ "published": 1, "created_at": -1 });
db.articles.createIndex({ "tags": 1 });

// Create indexes for chat
db.chat_sessions.createIndex({ "created_at": -1 });
db.chat_messages.createIndex({ "session_id": 1, "created_at": 1 });

print('MongoDB initialized with collections and indexes for KaminAI');
