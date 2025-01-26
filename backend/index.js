require('dotenv').config(); // Ensure environment variables are loaded
const express = require('express');
const cors = require('cors');
const client = require('./grpcClient');

const app = express();
app.use(cors());
app.use(express.json());

// REST API Endpoint: Get all questions
app.get('/api/questions', (req, res) => {
  client.GetQuestions({}, (error, response) => {
    if (error) {
      console.error('Error fetching questions:', error);
      return res.status(500).send('Internal Server Error');
    }
    res.json(response.questions);
  });
});

// REST API Endpoint: Get unique question types
app.get('/api/types', (req, res) => {
  client.GetUniqueQuestionTypes({}, (error, response) => {
    if (error) {
      console.error('Error fetching unique types:', error);
      return res.status(500).send('Internal Server Error');
    }
    res.json(response.types); // Assuming `types` is the field in gRPC response
  });
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`REST API server running on http://localhost:${PORT}`);
});
