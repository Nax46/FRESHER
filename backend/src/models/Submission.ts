import mongoose, { Schema, Document } from 'mongoose';

export interface ISubmission extends Document {
  gameId: mongoose.Types.ObjectId;
  questionId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  selectedOptionIndex: number;
  isCorrect: boolean;
  responseTimeMs: number;
  serverTimestamp: Date;
}

const SubmissionSchema: Schema = new Schema(
  {
    gameId: { type: Schema.Types.Mixed, required: true, index: true },
    questionId: { type: Schema.Types.Mixed, required: true, index: true },
    studentId: { type: Schema.Types.Mixed, required: true, index: true },
    selectedOptionIndex: { type: Number, required: true },
    isCorrect: { type: Boolean, required: true },
    responseTimeMs: { type: Number, required: true },
    serverTimestamp: { type: Date, default: Date.now, index: true }
  },
  { timestamps: true }
);

// Compound unique index per (game, question, student) to allow multi-question submissions per game!
SubmissionSchema.index({ gameId: 1, questionId: 1, studentId: 1 }, { unique: true });

export const Submission = mongoose.model<ISubmission>('Submission', SubmissionSchema);
