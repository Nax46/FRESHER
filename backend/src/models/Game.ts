import mongoose, { Schema, Document } from 'mongoose';

export type GameType =
  | 'SPEED_MCQ'
  | 'SPOTLIGHT_CHALLENGE'
  | 'LUCKY_NUMBER'
  | 'AUDIENCE'
  | 'PHYSICAL';

export type GameState =
  | 'DRAFT'
  | 'READY'
  | 'OPEN'
  | 'LIVE'
  | 'CLOSED'
  | 'REVIEW'
  | 'APPROVED'
  | 'PUBLISHED';

export interface IGame extends Document {
  eventId: mongoose.Types.ObjectId;
  title: string;
  subtitle?: string;
  type: GameType;
  status: GameState;
  timeLimit: number; // in seconds
  prize: number; // in INR e.g. 50
  attemptRule: 'ONE_ATTEMPT' | 'MULTIPLE_ATTEMPTS';
  winnerRule: 'FIRST_CORRECT' | 'JUDGE_SCORE' | 'MANUAL_SELECT';
  description?: string;
  currentQuestionIndex: number;
  totalQuestions: number;
  selectedStudentId?: mongoose.Types.ObjectId;
  drawnNumber?: number;
  drawnType?: 'SPOTLIGHT' | 'LUCKY';
  createdAt: Date;
  updatedAt: Date;
}

const GameSchema: Schema = new Schema(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    title: { type: String, required: true },
    subtitle: { type: String },
    type: {
      type: String,
      enum: ['SPEED_MCQ', 'SPOTLIGHT_CHALLENGE', 'LUCKY_NUMBER', 'AUDIENCE', 'PHYSICAL'],
      required: true
    },
    status: {
      type: String,
      enum: ['DRAFT', 'READY', 'OPEN', 'LIVE', 'CLOSED', 'REVIEW', 'APPROVED', 'PUBLISHED'],
      default: 'DRAFT',
      index: true
    },
    timeLimit: { type: Number, default: 30 },
    prize: { type: Number, default: 50 },
    attemptRule: { type: String, enum: ['ONE_ATTEMPT', 'MULTIPLE_ATTEMPTS'], default: 'ONE_ATTEMPT' },
    winnerRule: { type: String, enum: ['FIRST_CORRECT', 'JUDGE_SCORE', 'MANUAL_SELECT'], default: 'FIRST_CORRECT' },
    description: { type: String },
    currentQuestionIndex: { type: Number, default: 0 },
    totalQuestions: { type: Number, default: 1 },
    selectedStudentId: { type: Schema.Types.ObjectId, ref: 'Student' },
    drawnNumber: { type: Number },
    drawnType: { type: String, enum: ['SPOTLIGHT', 'LUCKY'] }
  },
  { timestamps: true }
);

export const Game = mongoose.model<IGame>('Game', GameSchema);
