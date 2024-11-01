const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();
const PORT = 3001;


app.use(bodyParser.json());
app.use(cors());

const dataPath = path.join(__dirname, 'data.json');


const readData = () => {
    const data = fs.readFileSync(dataPath);
    return JSON.parse(data);
};

const writeData = (data) => {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
};




app.get('/api/saved-programs', (req, res) => {
    const data = readData();
    res.json(data.savedPrograms);
});

app.get('/api/bodyparts', (req, res) => {
    const data = readData();
    const bodyParts = data.exerciseCategories.map(category => category.name);
    res.json(bodyParts);
});



app.post('/api/saved-programs', (req, res) => {
    const newProgram = req.body;
    const data = readData();
    
  
    newProgram.id = data.savedPrograms.length > 0 ? Math.max(data.savedPrograms.map(p => p.id)) + 1 : 1;
    
    data.savedPrograms.push(newProgram);
    writeData(data);
    res.status(201).json(newProgram);
});

// 4. Clear all saved programs
app.delete('/api/saved-programs', (req, res) => {
    const data = readData();
    data.savedPrograms = [];
    writeData(data);
    res.status(204).send();
});


app.get('/api/exercises-by-bodypart', (req, res) => {
    const { name } = req.query;
    const data = readData();
    const category = data.exerciseCategories.find(cat => cat.name.toLowerCase() === name.toLowerCase());

    if (category) {
        res.json({
            bodyPart: category.name,
            exercises: category.exercises
        });
    } else {
        res.status(404).send('Body part not found');
    }
});



app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
