const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
const config = require('./config/config');
const errorHandler = require('./middleware/errorHandler');
const documentsRouter = require('./routes/documents');


// Import routes
// const authRoutes = require('./routes/auth.routes');
// const documentRoutes = require('./routes/document.routes');
// const userRoutes = require('./routes/user.routes');
// const healthRoutes = require('./routes/health.routes');
const aiRoutes = require('./routes/ai.routes');
const studyProtocolRoutes = require('./routes/studyProtocol.routes');
const documentEditorRoutes = require('./routes/documentEditor.routes');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: 'http://localhost:3000', // Update this to match your frontend URL
  credentials: true
}));
app.use(compression());
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!require('fs').existsSync(uploadsDir)) {
  require('fs').mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files from uploads directory
app.use('/uploads', express.static(uploadsDir));

// Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/documents', documentRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/health', healthRoutes);
app.use('/api/documents', documentsRouter);
app.use('/api/ai', aiRoutes);
app.use('/api/study-protocols', studyProtocolRoutes);
app.use('/api/documentEditor', documentEditorRoutes);

// Error handling
app.use(errorHandler);

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.get('/api', (req, res) => {
  res.status(200).json({ status: 'OK' });
});
// Database connection
mongoose.connect(config.mongoUri)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Start server
app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
}); 
