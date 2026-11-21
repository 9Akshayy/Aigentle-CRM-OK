const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging in development
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.originalUrl.startsWith('/api')) {
      console.log(`[${req.method}] ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Import routes
const leadsRouter = require('./routes/leads');
const activitiesRouter = require('./routes/activities');
const tasksRouter = require('./routes/tasks');
const statsRouter = require('./routes/stats');
const { templates } = require('./templates');

// API Endpoints
app.use('/api/leads', leadsRouter);
app.use('/api/activities', activitiesRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/stats', statsRouter);

// IT Services Email & Proposal Templates Endpoint
app.get('/api/templates', (req, res) => {
  res.json({ success: true, data: templates });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Aigentle IT Services CRM API',
    timestamp: new Date().toISOString()
  });
});

// Serve frontend build if present
const clientDist = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDist));

// Catch-all route for SPA navigation (compatible with Express 5)
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    const indexPath = path.join(clientDist, 'index.html');
    res.sendFile(indexPath, (err) => {
      if (err) {
        res.status(200).send('Aigentle CRM API Server is active. Frontend Vite dev server is on port 3000.');
      }
    });
  } else {
    next();
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`=================================================`);
  console.log(`⚡ Aigentle IT Services CRM Server Running on Port ${PORT}`);
  console.log(`⚡ API Health: http://localhost:${PORT}/api/health`);
  console.log(`=================================================`);
});
