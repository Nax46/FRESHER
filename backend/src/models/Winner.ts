import mongoose, { Schema, Document } from 'mongoose';

export type WinnerStatus = 'CANDIDATE' | 'APPROVED' | 'PUBLISHED' | 'REJECTED';
export type PrizeStatus = 'PENDING' | 'DISTRIBUTED';

export interface IWinner extends Document {
  gameId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  status: WinnerStatus;
  prizeStatus: PrizeStatus;
  prizeAmount: number;
  score?: number;
  responseTimeMs?: number;
  selectedAnswerText?: string;
  approvedBy?: string;
  approvedAt?: Date;
  publishedAt?: Date;
}

const WinnerSchema: Schema = new Schema(
  {
    gameId: { type: Schema.Types.ObjectId, ref: 'Game', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    status: {
      type: String,
      enum: ['CANDIDATE', 'APPROVED', 'PUBLISHED', 'REJECTED'],
      default: 'CANDIDATE',
      index: true
    },
    prizeStatus: { type: String, enum: ['PENDING', 'DISTRIBUTED'], default: 'PENDING' },
    prizeAmount: { type: Number, default: 50 },
    score: { type: Number },
    responseTimeMs: { type: Number },
    selectedAnswerText: { type: String },
    approvedBy: { type: String },
    approvedAt: { type: Date },
    publishedAt: { type: Date }
  },
  { timestamps: true }
);

export const Winner = mongoose.model<IWinner>('Winner', WinnerSchema);
