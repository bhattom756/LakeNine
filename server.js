const express = require('express');
const mongoose = require('mongoose');
const app = express();

app.use(express.json());

const MONGO_URI = 'mongodb://localhost:27017/chatinterface';

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

const TextSchema = new mongoose.Schema({
    userTxt: String,
    aiTxt: String,
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const TextModel = mongoose.model('Text', TextSchema);

// Populate DB with fake entries
const populateFakeData = async () => {
    const count = await TextModel.countDocuments();
    if (count > 0) {
        console.log('ℹ️  data already exists. Skipping population.');
        return;
    }

    const fakeEntries = [
        { userTxt: "Hi, how are you?", aiTxt: "I'm just code, but I'm doing great!" },
        { userTxt: "ai:", aiTxt: "Why don’t skeletons fight each other? They don’t have the guts." },
        { userTxt: "What's the weather?", aiTxt: "I'm not connected to the internet, but it’s always sunny in the console!" }
    ];

    await TextModel.insertMany(fakeEntries);
    console.log('✅  data populated');
};

// Basic route
app.get('/', (req, res) => {
    res.send('🚀 Server is running and connected to MongoDB!');
});

// Start server
app.listen(3000, async () => {
    console.log('🟢 Server started on http://localhost:5000');
    await populateFakeData();
});
