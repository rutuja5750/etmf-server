const documentsRouter = require('./routes/documents');

// ... existing middleware ...

app.use('/api/documents', documentsRouter);
 
// ... rest of the code ... 