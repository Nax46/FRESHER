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

  logger.info('Seeding initial data with full 5-10 questions per game...');

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
      title: '🎵 Finish the Lyrics',
      subtitle: 'Complete the missing song line before anyone else',
      type: 'SPEED_MCQ',
      status: 'READY',
      timeLimit: 30,
      prize: 50,
      attemptRule: 'ONE_ATTEMPT',
      winnerRule: 'FIRST_CORRECT',
      description: 'Test your Bollywood music knowledge in real-time!',
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
      totalQuestions: 5
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
      totalQuestions: 5
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
      totalQuestions: 5
    }
  ];

  const createdGames = await Game.insertMany(gamesData);

  // GAME 1: Guess the Emoji (10 Questions)
  await Question.create([
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

  // GAME 2: Finish the Lyrics (10 Questions)
  await Question.create([
    { gameId: createdGames[1]._id, questionText: 'Complete: "Apna Time _____!"', mediaContent: '🎤 "Apna Time _____!"', options: ['Kab Aayega', 'Aayega', 'Aa Gaya', 'Hoga'], correctOptionIndex: 1, order: 1 },
    { gameId: createdGames[1]._id, questionText: 'Complete: "Tum hi ho, ab tum hi ho..."', mediaContent: '🎵 "Zindagani _____!"', options: ['Meri Tum', 'Ab Tum Hi Ho', 'Bas Tum Hi', 'Har Pal'], correctOptionIndex: 1, order: 2 },
    { gameId: createdGames[1]._id, questionText: 'Complete: "Senorita, suno suno _____!"', mediaContent: '🎶 "Senorita..."', options: ['Senorita', 'Jaane Jana', 'Zindagi', 'Naach'], correctOptionIndex: 0, order: 3 },
    { gameId: createdGames[1]._id, questionText: 'Complete: "Kal Ho Naa _____!"', mediaContent: '🎵 "Kal Ho Naa..."', options: ['Hoga', 'Ho', 'Aaye', 'Dekho'], correctOptionIndex: 1, order: 4 },
    { gameId: createdGames[1]._id, questionText: 'Complete: "Kesariya tera _____"!', mediaContent: '🎤 "Kesariya tera..."', options: ['Rang Hai', 'Ishq Hai Piya', 'Roop Hai', 'Jaadu'], correctOptionIndex: 1, order: 5 },
    { gameId: createdGames[1]._id, questionText: 'Complete: "Channa Mereya _____"!', mediaContent: '🎶 "Channa..."', options: ['Mereya', 'Jaane', 'Piya', 'Dilbar'], correctOptionIndex: 0, order: 6 },
    { gameId: createdGames[1]._id, questionText: 'Complete: "Balam Pichkari jo _____!"', mediaContent: '🎵 "Tune Mujhe..."', options: ['Mari', 'Maari', 'Di', 'Feenki'], correctOptionIndex: 1, order: 7 },
    { gameId: createdGames[1]._id, questionText: 'Complete: "Jai Ho, Jai Ho, _____!"', mediaContent: '🎶 "Jai Ho..."', options: ['Jai Ho', 'Vande', 'Bharat', 'Shaan'], correctOptionIndex: 0, order: 8 },
    { gameId: createdGames[1]._id, questionText: 'Complete: "Kabira maan jaa _____"!', mediaContent: '🎤 "Kabira..."', options: ['Maan Jaa', 'Sun Le', 'Re Kabira', 'Aaja'], correctOptionIndex: 0, order: 9 },
    { gameId: createdGames[1]._id, questionText: 'Complete: "Tera Ban Jaunga _____!"', mediaContent: '🎵 "Tera Ban..."', options: ['Jaunga', 'Raha', 'Dil', 'Saath'], correctOptionIndex: 0, order: 10 }
  ]);

  // GAME 3: Who Said This? (10 Questions)
  await Question.create([
    { gameId: createdGames[2]._id, questionText: 'Who said: "Mogambo Khush Hua!"?', mediaContent: '💬 "Mogambo Khush Hua!"', options: ['Gabbar Singh', 'Crime Master Gogo', 'Mogambo', 'Shakal'], correctOptionIndex: 2, order: 1 },
    { gameId: createdGames[2]._id, questionText: 'Who said: "Rishte mein toh hum tumhare baap lagte hain!"?', mediaContent: '💬 "Rishte mein..."', options: ['Amitabh Bachchan', 'Shah Rukh Khan', 'Salman Khan', 'Amrish Puri'], correctOptionIndex: 0, order: 2 },
    { gameId: createdGames[2]._id, questionText: 'Who said: "Picture abhi baaki hai mere dost!"?', mediaContent: '💬 "Picture abhi..."', options: ['Ranbir Kapoor', 'Shah Rukh Khan', 'Aamir Khan', 'Hrithik Roshan'], correctOptionIndex: 1, order: 3 },
    { gameId: createdGames[2]._id, questionText: 'Who said: "Kitne aadmi the?"', mediaContent: '💬 "Kitne aadmi..."', options: ['Kalia', 'Gabbar Singh', 'Sambha', 'Thakur'], correctOptionIndex: 1, order: 4 },
    { gameId: createdGames[2]._id, questionText: 'Who said: "Babu moshai, zindagi badi honi chahiye, lambi nahi!"?', mediaContent: '💬 "Zindagi badi..."', options: ['Rajesh Khanna', 'Amitabh Bachchan', 'Dharmendra', 'Sanjeev Kumar'], correctOptionIndex: 0, order: 5 },
    { gameId: createdGames[2]._id, questionText: 'Who said: "Pushpa, I hate tears!"?', mediaContent: '💬 "Pushpa..."', options: ['Rajesh Khanna', 'Dev Anand', 'Jeetendra', 'Shashi Kapoor'], correctOptionIndex: 0, order: 6 },
    { gameId: createdGames[2]._id, questionText: 'Who said: "Don ko pakadna mushkil hi nahi, namumkin hai!"?', mediaContent: '💬 "Don ko..."', options: ['Shah Rukh Khan', 'Amitabh Bachchan', 'Both iconic SRK & Bachchan', 'Ranveer Singh'], correctOptionIndex: 2, order: 7 },
    { gameId: createdGames[2]._id, questionText: 'Who said: "Tension lene ka nahi, sirf dene ka!"?', mediaContent: '💬 "Tension..."', options: ['Circuit', 'Munna Bhai (Sanjay Dutt)', 'Dr. Asthana', 'Lucky Singh'], correctOptionIndex: 1, order: 8 },
    { gameId: createdGames[2]._id, questionText: 'Who said: "Main apni favorite hoon!"?', mediaContent: '💬 "Main apni..."', options: ['Kareena Kapoor (Geet)', 'Poo', 'Simran', 'Shanaya'], correctOptionIndex: 0, order: 9 },
    { gameId: createdGames[2]._id, questionText: 'Who said: "All is well!"?', mediaContent: '💬 "All is well..."', options: ['Rancho (Aamir Khan)', 'Farhan', 'Raju', 'Virus'], correctOptionIndex: 0, order: 10 }
  ]);

  // GAME 4: Complete the Dialogue (5 Questions)
  await Question.create([
    { gameId: createdGames[3]._id, questionText: 'Perform Mogambo villain laugh on stage!', mediaContent: '🎭 "Mogambo Khush Hua!"', options: ['Pass (10/10)', 'Try Again'], correctOptionIndex: 0, order: 1 },
    { gameId: createdGames[3]._id, questionText: 'Deliver Amitabh Bachchan Mohabbatein dialogue!', mediaContent: '🎭 "Parampara, Pratishtha, Anushasan!"', options: ['Pass (10/10)', 'Try Again'], correctOptionIndex: 0, order: 2 },
    { gameId: createdGames[3]._id, questionText: 'Deliver SRK romantic line!', mediaContent: '🎭 "Rahul... naam toh suna hoga!"', options: ['Pass (10/10)', 'Try Again'], correctOptionIndex: 0, order: 3 },
    { gameId: createdGames[3]._id, questionText: 'Deliver Sunny Deol courtroom line!', mediaContent: '🎭 "Tareekh pe tareekh!"', options: ['Pass (10/10)', 'Try Again'], correctOptionIndex: 0, order: 4 },
    { gameId: createdGames[3]._id, questionText: 'Deliver Dabangg dialogue!', mediaContent: '🎭 "Thappad se darr nahi lagta..."', options: ['Pass (10/10)', 'Try Again'], correctOptionIndex: 0, order: 5 }
  ]);

  // GAME 5: Memory Challenge (5 Questions)
  await Question.create([
    { gameId: createdGames[4]._id, questionText: 'Remember the sequence: 🍎 🚗 🎸 🐱 ⚽', mediaContent: '🍎 🚗 🎸 🐱 ⚽', options: ['All 5 Correct', 'Failed'], correctOptionIndex: 0, order: 1 },
    { gameId: createdGames[4]._id, questionText: 'Recall Color Pattern: Red - Blue - Yellow - Green - Purple', mediaContent: '🔴 🔵 🟡 🟢 🟣', options: ['All 5 Correct', 'Failed'], correctOptionIndex: 0, order: 2 },
    { gameId: createdGames[4]._id, questionText: 'Recall Number Flash: 7 - 3 - 9 - 2 - 5 - 8', mediaContent: '🔢 7-3-9-2-5-8', options: ['Correct', 'Incorrect'], correctOptionIndex: 0, order: 3 },
    { gameId: createdGames[4]._id, questionText: 'Recall Faculty Names Sequence shown on screen!', mediaContent: '👨‍🏫 HOD - Principal - Dean', options: ['Correct', 'Incorrect'], correctOptionIndex: 0, order: 4 },
    { gameId: createdGames[4]._id, questionText: 'Recall 7 Campus Landmarks in correct order!', mediaContent: '🏫 Campus Tour Landmarks', options: ['Correct', 'Incorrect'], correctOptionIndex: 0, order: 5 }
  ]);

  // GAME 6: Faculty 1v1 (5 Questions / Tasks)
  await Question.create([
    { gameId: createdGames[5]._id, questionText: 'Paper Airplane Target Throwing against Professor!', mediaContent: '✈️ Target Throwing', options: ['Student Wins', 'Faculty Wins'], correctOptionIndex: 0, order: 1 },
    { gameId: createdGames[5]._id, questionText: 'Bollywood Trivia Faceoff against HOD!', mediaContent: '🎬 Rapid Fire Trivia', options: ['Student Wins', 'Faculty Wins'], correctOptionIndex: 0, order: 2 },
    { gameId: createdGames[5]._id, questionText: 'Stacking 10 Cups in 30 Seconds competition!', mediaContent: '🥤 Cup Stacking Challenge', options: ['Student Wins', 'Faculty Wins'], correctOptionIndex: 0, order: 3 },
    { gameId: createdGames[5]._id, questionText: 'Tongue Twister Challenge — 5 times without stuttering!', mediaContent: '🗣️ Tongue Twister', options: ['Student Wins', 'Faculty Wins'], correctOptionIndex: 0, order: 4 },
    { gameId: createdGames[5]._id, questionText: 'Minute-to-win-it Coin Flip challenge!', mediaContent: '🪙 Coin Flip Showdown', options: ['Student Wins', 'Faculty Wins'], correctOptionIndex: 0, order: 5 }
  ]);

  // GAME 7: Never Have I Ever (5 Questions)
  await Question.create([
    { gameId: createdGames[6]._id, questionText: 'Never Have I Ever fallen asleep in an 8 AM lecture!', mediaContent: '🙈 Audience Poll', options: ['I Have 🙋‍♂️', 'I Never 😇'], correctOptionIndex: 0, order: 1 },
    { gameId: createdGames[6]._id, questionText: 'Never Have I Ever proxied attendance for a friend!', mediaContent: '🙈 Audience Poll', options: ['I Have 🙋‍♂️', 'I Never 😇'], correctOptionIndex: 0, order: 2 },
    { gameId: createdGames[6]._id, questionText: 'Never Have I Ever eaten tiffin during an ongoing class!', mediaContent: '🙈 Audience Poll', options: ['I Have 🙋‍♂️', 'I Never 😇'], correctOptionIndex: 0, order: 3 },
    { gameId: createdGames[6]._id, questionText: 'Never Have I Ever stalked a senior on Instagram!', mediaContent: '🙈 Audience Poll', options: ['I Have 🙋‍♂️', 'I Never 😇'], correctOptionIndex: 0, order: 4 },
    { gameId: createdGames[6]._id, questionText: 'Never Have I Ever blamed bad Wi-Fi for missing a deadline!', mediaContent: '🙈 Audience Poll', options: ['I Have 🙋‍♂️', 'I Never 😇'], correctOptionIndex: 0, order: 5 }
  ]);

  // GAME 8: 30-Second Challenge (5 Questions / Tasks)
  await Question.create([
    { gameId: createdGames[7]._id, questionText: 'Do 20 Jumping Jacks in 30 seconds on stage!', mediaContent: '⚡ 20 Jumping Jacks', options: ['Completed', 'Failed'], correctOptionIndex: 0, order: 1 },
    { gameId: createdGames[7]._id, questionText: 'Inflate and pop 3 balloons in 30 seconds!', mediaContent: '⚡ Balloon Pop Task', options: ['Completed', 'Failed'], correctOptionIndex: 0, order: 2 },
    { gameId: createdGames[7]._id, questionText: 'Name 10 Indian states starting with vowels in 30 seconds!', mediaContent: '⚡ Vowel States Rapid Fire', options: ['Completed', 'Failed'], correctOptionIndex: 0, order: 3 },
    { gameId: createdGames[7]._id, questionText: 'Tie a necktie properly in 30 seconds!', mediaContent: '⚡ Necktie Challenge', options: ['Completed', 'Failed'], correctOptionIndex: 0, order: 4 },
    { gameId: createdGames[7]._id, questionText: 'Balance a book on your head and walk across stage!', mediaContent: '⚡ Book Walk Task', options: ['Completed', 'Failed'], correctOptionIndex: 0, order: 5 }
  ]);

  logger.info('Database seeded successfully with all 8 games and 5-10 questions each! Zero dummy students.');
};

if (process.argv[1]?.includes('seed.ts')) {
  seedData().then(() => process.exit(0)).catch(err => {
    logger.error(err);
    process.exit(1);
  });
}
