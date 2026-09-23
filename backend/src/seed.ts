import { connectDB } from './config/db.js';
import { EventModel } from './models/Event.js';
import { Game } from './models/Game.js';
import { Question } from './models/Question.js';
import { Student } from './models/Student.js';
import { logger } from './config/pino.js';

export const seedData = async () => {
  const isConnected = await connectDB();
  if (!isConnected) {
    logger.warn('Skipping DB seeding because MongoDB connection is not active.');
    return;
  }

  logger.info('Seeding initial data...');

  await EventModel.deleteMany({});
  await Game.deleteMany({});
  await Question.deleteMany({});
  await Student.deleteMany({});

  const event = await EventModel.create({
    name: '🎉 FRESHER 2026',
    code: 'FRESHER2026',
    status: 'LIVE',
    auditoriumState: {
      state: 'WELCOME',
      payload: { title: '🎉 FRESHER 2026', subtitle: 'Welcome to the Game Arena!' },
      updatedAt: new Date()
    }
  });

  const games = [
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
      totalQuestions: 3
    },
    {
      eventId: event._id,
      title: '🎵 Finish the Lyrics',
      subtitle: 'Complete the missing song line before anyone else',
      type: 'SPEED_MCQ',
      status: 'READY',
      timeLimit: 30,
      prize: 50,
      attemptRule: 'ONE_ATTEMPT',
      winnerRule: 'FIRST_CORRECT',
      description: 'Test your Bollywood music knowledge in real-time!',
      totalQuestions: 3
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
      totalQuestions: 3
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
      totalQuestions: 2
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
      totalQuestions: 2
    },
    {
      eventId: event._id,
      title: '🎯 Faculty 1v1',
      subtitle: 'Student vs Faculty stage showdown',
      type: 'LUCKY_NUMBER',
      status: 'READY',
      timeLimit: 120,
      prize: 200,
      attemptRule: 'ONE_ATTEMPT',
      winnerRule: 'MANUAL_SELECT',
      description: 'Draw Lucky Number → Student competes live against a professor!',
      totalQuestions: 1
    },
    {
      eventId: event._id,
      title: '🙈 Never Have I Ever',
      subtitle: 'Audience interactive participation',
      type: 'AUDIENCE',
      status: 'READY',
      timeLimit: 60,
      prize: 0,
      attemptRule: 'MULTIPLE_ATTEMPTS',
      winnerRule: 'MANUAL_SELECT',
      description: 'Fun ice-breaking audience poll.',
      totalQuestions: 2
    },
    {
      eventId: event._id,
      title: '⚡ 30-Second Challenge',
      subtitle: 'Physical quick task on stage',
      type: 'PHYSICAL',
      status: 'READY',
      timeLimit: 30,
      prize: 50,
      attemptRule: 'ONE_ATTEMPT',
      winnerRule: 'MANUAL_SELECT',
      description: 'Physical rapid-fire activity on stage.',
      totalQuestions: 1
    }
  ];

  const createdGames = await Game.insertMany(games);

  // SEED MULTIPLE QUESTIONS FOR GAME 1 (Guess Emoji)
  await Question.create([
    {
      gameId: createdGames[0]._id,
      questionText: 'What movie does this represent?',
      mediaContent: '🦁 + 👑',
      options: ['Jungle Book', 'Lion King', 'Madagascar', 'Simba'],
      correctOptionIndex: 1, // Lion King
      order: 1
    },
    {
      gameId: createdGames[0]._id,
      questionText: 'Which blockbuster movie is this?',
      mediaContent: '🕷️ + 👨',
      options: ['Batman', 'Iron Man', 'Spider-Man', 'Superman'],
      correctOptionIndex: 2, // Spider-Man
      order: 2
    },
    {
      gameId: createdGames[0]._id,
      questionText: 'Guess the iconic movie title!',
      mediaContent: '🚢 + ❄️ + 🧊',
      options: ['Titanic', 'Avatar', 'Pirates of Caribbean', 'Life of Pi'],
      correctOptionIndex: 0, // Titanic
      order: 3
    }
  ]);

  // SEED MULTIPLE QUESTIONS FOR GAME 2 (Finish Lyrics)
  await Question.create([
    {
      gameId: createdGames[1]._id,
      questionText: 'Complete the lyric: "Apna Time _____!"',
      mediaContent: '🎤 "Apna Time _____!"',
      options: ['Kab Aayega', 'Aayega', 'Aa Gaya', 'Hoga'],
      correctOptionIndex: 1, // Aayega
      order: 1
    },
    {
      gameId: createdGames[1]._id,
      questionText: 'Complete the line: "Tum hi ho, ab tum hi ho, zindagani _____!"',
      mediaContent: '🎵 "Tum hi ho..."',
      options: ['Meri Tum', 'Ab Tum Hi Ho', 'Bas Tum Hi', 'Har Pal Tum'],
      correctOptionIndex: 1, // Ab Tum Hi Ho
      order: 2
    },
    {
      gameId: createdGames[1]._id,
      questionText: 'Complete the song: "Senorita, suno suno _____!"',
      mediaContent: '🎶 "Senorita..."',
      options: ['Senorita', 'Jaane Jana', 'Zindagi', 'Naach Meri Jaan'],
      correctOptionIndex: 0,
      order: 3
    }
  ]);

  // SEED MULTIPLE QUESTIONS FOR GAME 3 (Who Said This)
  await Question.create([
    {
      gameId: createdGames[2]._id,
      questionText: 'Who said: "Mogambo Khush Hua!"?',
      mediaContent: '💬 "Mogambo Khush Hua!"',
      options: ['Gabbar Singh', 'Crime Master Gogo', 'Mogambo', 'Shakal'],
      correctOptionIndex: 2, // Mogambo
      order: 1
    },
    {
      gameId: createdGames[2]._id,
      questionText: 'Who said: "Rishte mein toh hum tumhare baap lagte hain!"?',
      mediaContent: '💬 "Rishte mein..."',
      options: ['Amitabh Bachchan', 'Shah Rukh Khan', 'Salman Khan', 'Amrish Puri'],
      correctOptionIndex: 0, // Amitabh Bachchan
      order: 2
    },
    {
      gameId: createdGames[2]._id,
      questionText: 'Who said: "Picture abhi baaki hai mere dost!"?',
      mediaContent: '💬 "Picture abhi..."',
      options: ['Ranbir Kapoor', 'Shah Rukh Khan', 'Aamir Khan', 'Hrithik Roshan'],
      correctOptionIndex: 1, // Shah Rukh Khan
      order: 3
    }
  ]);

  // Clear out any stale students on fresh seed
  await Student.deleteMany({});

  logger.info('Database seeded successfully with games and questions! Zero dummy students.');
};

if (process.argv[1]?.includes('seed.ts')) {
  seedData().then(() => process.exit(0)).catch(err => {
    logger.error(err);
    process.exit(1);
  });
}
