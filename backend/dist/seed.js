"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedData = void 0;
const db_js_1 = require("./config/db.js");
const Event_js_1 = require("./models/Event.js");
const Game_js_1 = require("./models/Game.js");
const Question_js_1 = require("./models/Question.js");
const Student_js_1 = require("./models/Student.js");
const pino_js_1 = require("./config/pino.js");
const seedData = async () => {
    const isConnected = await (0, db_js_1.connectDB)();
    if (!isConnected) {
        pino_js_1.logger.warn('Skipping DB seeding because MongoDB connection is not active.');
        return;
    }
    pino_js_1.logger.info('Seeding initial data with strictly 4 games and full questions...');
    await Event_js_1.EventModel.deleteMany({});
    await Game_js_1.Game.deleteMany({});
    await Question_js_1.Question.deleteMany({});
    await Student_js_1.Student.deleteMany({});
    const event = await Event_js_1.EventModel.create({
        name: '🎉 FRESHER 2026',
        code: 'FRESHER2026',
        status: 'LIVE',
        auditoriumState: {
            state: 'WELCOME',
            payload: { title: '🎉 FRESHER 2026', subtitle: 'Welcome to the Game Arena!' },
            updatedAt: new Date()
        }
    });
    const gamesData = [
        {
            eventId: event._id,
            title: '😂 Guess the Emoji',
            subtitle: 'Identify the movie or phrase represented by emojis',
            type: 'SPEED_MCQ',
            status: 'READY',
            timeLimit: 30,
            prize: 50,
            attemptRule: 'ONE_ATTEMPT',
            winnerRule: 'FIRST_CORRECT',
            description: 'First valid correct submission wins instant ₹50 cash prize!',
            totalQuestions: 10
        },
        {
            eventId: event._id,
            title: '👀 Who Said This?',
            subtitle: 'Identify which iconic professor or celebrity said this quote',
            type: 'SPEED_MCQ',
            status: 'READY',
            timeLimit: 20,
            prize: 50,
            attemptRule: 'ONE_ATTEMPT',
            winnerRule: 'FIRST_CORRECT',
            description: 'Guess the speaker instantly!',
            totalQuestions: 10
        },
        {
            eventId: event._id,
            title: '🎬 Complete the Dialogue',
            subtitle: 'Spotlight number stage challenge',
            type: 'SPOTLIGHT_CHALLENGE',
            status: 'READY',
            timeLimit: 60,
            prize: 100,
            attemptRule: 'ONE_ATTEMPT',
            winnerRule: 'JUDGE_SCORE',
            description: 'Draw Spotlight Number → Student comes to stage to perform dialogue.',
            totalQuestions: 5
        },
        {
            eventId: event._id,
            title: '🧠 Memory Challenge',
            subtitle: 'Remember the sequence shown on screen',
            type: 'SPOTLIGHT_CHALLENGE',
            status: 'READY',
            timeLimit: 60,
            prize: 100,
            attemptRule: 'ONE_ATTEMPT',
            winnerRule: 'JUDGE_SCORE',
            description: 'Visual memory test for spotlight selected student!',
            totalQuestions: 5
        }
    ];
    const createdGames = await Game_js_1.Game.insertMany(gamesData);
    // GAME 1: Guess the Emoji (10 Questions)
    await Question_js_1.Question.create([
        { gameId: createdGames[0]._id, questionText: 'What movie does this represent?', mediaContent: '🦁 + 👑', options: ['Jungle Book', 'Lion King', 'Madagascar', 'Simba'], correctOptionIndex: 1, order: 1 },
        { gameId: createdGames[0]._id, questionText: 'Which superhero movie is this?', mediaContent: '🕷️ + 👨', options: ['Batman', 'Iron Man', 'Spider-Man', 'Superman'], correctOptionIndex: 2, order: 2 },
        { gameId: createdGames[0]._id, questionText: 'Guess the iconic movie title!', mediaContent: '🚢 + ❄️ + 🧊', options: ['Titanic', 'Avatar', 'Pirates of Caribbean', 'Life of Pi'], correctOptionIndex: 0, order: 3 },
        { gameId: createdGames[0]._id, questionText: 'Which superhero is this?', mediaContent: '🦇 + 👨', options: ['Wolverine', 'Thor', 'Batman', 'Flash'], correctOptionIndex: 2, order: 4 },
        { gameId: createdGames[0]._id, questionText: 'Guess the animated movie!', mediaContent: '👨‍🍳 + 🐀', options: ['Kung Fu Panda', 'Ratatouille', 'Shrek', 'Minions'], correctOptionIndex: 1, order: 5 },
        { gameId: createdGames[0]._id, questionText: 'Which fantasy movie series is this?', mediaContent: '🧙‍♂️ + ⚡ + 🦉', options: ['Lord of the Rings', 'Narnia', 'Harry Potter', 'Percy Jackson'], correctOptionIndex: 2, order: 6 },
        { gameId: createdGames[0]._id, questionText: 'Guess the sci-fi adventure!', mediaContent: '🦖 + 🏝️', options: ['Jurassic Park', 'King Kong', 'Godzilla', 'Jumanji'], correctOptionIndex: 0, order: 7 },
        { gameId: createdGames[0]._id, questionText: 'Which space saga is this?', mediaContent: '🚀 + 🌌 + ⚔️', options: ['Star Trek', 'Interstellar', 'Star Wars', 'Guardians of Galaxy'], correctOptionIndex: 2, order: 8 },
        { gameId: createdGames[0]._id, questionText: 'Guess the comedy classic!', mediaContent: '👻 + 🥊', options: ['Ghostbusters', 'Casper', 'Monster Inc', 'Beetlejuice'], correctOptionIndex: 0, order: 9 },
        { gameId: createdGames[0]._id, questionText: 'Guess the fantasy saga!', mediaContent: '💍 + 🌋 + 🧝‍♂️', options: ['The Hobbit', 'Lord of the Rings', 'Game of Thrones', 'Witcher'], correctOptionIndex: 1, order: 10 }
    ]);
    // GAME 2: Who Said This? (10 Questions)
    await Question_js_1.Question.create([
        { gameId: createdGames[1]._id, questionText: 'Who said: "Mogambo Khush Hua!"?', mediaContent: '💬 "Mogambo Khush Hua!"', options: ['Gabbar Singh', 'Crime Master Gogo', 'Mogambo', 'Shakal'], correctOptionIndex: 2, order: 1 },
        { gameId: createdGames[1]._id, questionText: 'Who said: "Rishte mein toh hum tumhare baap lagte hain!"?', mediaContent: '💬 "Rishte mein..."', options: ['Amitabh Bachchan', 'Shah Rukh Khan', 'Salman Khan', 'Amrish Puri'], correctOptionIndex: 0, order: 2 },
        { gameId: createdGames[1]._id, questionText: 'Who said: "Picture abhi baaki hai mere dost!"?', mediaContent: '💬 "Picture abhi..."', options: ['Ranbir Kapoor', 'Shah Rukh Khan', 'Aamir Khan', 'Hrithik Roshan'], correctOptionIndex: 1, order: 3 },
        { gameId: createdGames[1]._id, questionText: 'Who said: "Kitne aadmi the?"', mediaContent: '💬 "Kitne aadmi..."', options: ['Kalia', 'Gabbar Singh', 'Sambha', 'Thakur'], correctOptionIndex: 1, order: 4 },
        { gameId: createdGames[1]._id, questionText: 'Who said: "Babu moshai, zindagi badi honi chahiye, lambi nahi!"?', mediaContent: '💬 "Zindagi badi..."', options: ['Rajesh Khanna', 'Amitabh Bachchan', 'Dharmendra', 'Sanjeev Kumar'], correctOptionIndex: 0, order: 5 },
        { gameId: createdGames[1]._id, questionText: 'Who said: "Pushpa, I hate tears!"?', mediaContent: '💬 "Pushpa..."', options: ['Rajesh Khanna', 'Dev Anand', 'Jeetendra', 'Shashi Kapoor'], correctOptionIndex: 0, order: 6 },
        { gameId: createdGames[1]._id, questionText: 'Who said: "Don ko pakadna mushkil hi nahi, namumkin hai!"?', mediaContent: '💬 "Don ko..."', options: ['Shah Rukh Khan', 'Amitabh Bachchan', 'Both iconic SRK & Bachchan', 'Ranveer Singh'], correctOptionIndex: 2, order: 7 },
        { gameId: createdGames[1]._id, questionText: 'Who said: "Tension lene ka nahi, sirf dene ka!"?', mediaContent: '💬 "Tension..."', options: ['Circuit', 'Munna Bhai (Sanjay Dutt)', 'Dr. Asthana', 'Lucky Singh'], correctOptionIndex: 1, order: 8 },
        { gameId: createdGames[1]._id, questionText: 'Who said: "Main apni favorite hoon!"?', mediaContent: '💬 "Main apni..."', options: ['Kareena Kapoor (Geet)', 'Poo', 'Simran', 'Shanaya'], correctOptionIndex: 0, order: 9 },
        { gameId: createdGames[1]._id, questionText: 'Who said: "All is well!"?', mediaContent: '💬 "All is well..."', options: ['Rancho (Aamir Khan)', 'Farhan', 'Raju', 'Virus'], correctOptionIndex: 0, order: 10 }
    ]);
    // GAME 3: Complete the Dialogue (5 Questions)
    await Question_js_1.Question.create([
        { gameId: createdGames[2]._id, questionText: 'Perform Mogambo villain laugh on stage!', mediaContent: '🎭 "Mogambo Khush Hua!"', options: ['Pass (10/10)', 'Try Again'], correctOptionIndex: 0, order: 1 },
        { gameId: createdGames[2]._id, questionText: 'Deliver Amitabh Bachchan Mohabbatein dialogue!', mediaContent: '🎭 "Parampara, Pratishtha, Anushasan!"', options: ['Pass (10/10)', 'Try Again'], correctOptionIndex: 0, order: 2 },
        { gameId: createdGames[2]._id, questionText: 'Deliver SRK romantic line!', mediaContent: '🎭 "Rahul... naam toh suna hoga!"', options: ['Pass (10/10)', 'Try Again'], correctOptionIndex: 0, order: 3 },
        { gameId: createdGames[2]._id, questionText: 'Deliver Sunny Deol courtroom line!', mediaContent: '🎭 "Tareekh pe tareekh!"', options: ['Pass (10/10)', 'Try Again'], correctOptionIndex: 0, order: 4 },
        { gameId: createdGames[2]._id, questionText: 'Deliver Dabangg dialogue!', mediaContent: '🎭 "Thappad se darr nahi lagta..."', options: ['Pass (10/10)', 'Try Again'], correctOptionIndex: 0, order: 5 }
    ]);
    // GAME 4: Memory Challenge (5 Questions)
    await Question_js_1.Question.create([
        { gameId: createdGames[3]._id, questionText: 'Remember the sequence: 🍎 🚗 🎸 🐱 ⚽', mediaContent: '🍎 🚗 🎸 🐱 ⚽', options: ['All 5 Correct', 'Failed'], correctOptionIndex: 0, order: 1 },
        { gameId: createdGames[3]._id, questionText: 'Recall Color Pattern: Red - Blue - Yellow - Green - Purple', mediaContent: '🔴 🔵 🟡 🟢 🟣', options: ['All 5 Correct', 'Failed'], correctOptionIndex: 0, order: 2 },
        { gameId: createdGames[3]._id, questionText: 'Recall Number Flash: 7 - 3 - 9 - 2 - 5 - 8', mediaContent: '🔢 7-3-9-2-5-8', options: ['Correct', 'Incorrect'], correctOptionIndex: 0, order: 3 },
        { gameId: createdGames[3]._id, questionText: 'Recall Faculty Names Sequence shown on screen!', mediaContent: '👨‍🏫 HOD - Principal - Dean', options: ['Correct', 'Incorrect'], correctOptionIndex: 0, order: 4 },
        { gameId: createdGames[3]._id, questionText: 'Recall 7 Campus Landmarks in correct order!', mediaContent: '🏫 Campus Tour Landmarks', options: ['Correct', 'Incorrect'], correctOptionIndex: 0, order: 5 }
    ]);
    pino_js_1.logger.info('Database seeded successfully with strictly 4 games and full questions! Zero dummy students.');
};
exports.seedData = seedData;
if (process.argv[1]?.includes('seed.ts')) {
    (0, exports.seedData)().then(() => process.exit(0)).catch(err => {
        pino_js_1.logger.error(err);
        process.exit(1);
    });
}
