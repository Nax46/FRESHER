import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion extends Document {
  gameId: mongoose.Types.ObjectId;
  questionText: string;
  mediaContent?: string; // Emoji representation like "🦁 + 👑" or image/lyric line
  options: string[];
  correctOptionIndex: number;
  order: number;
}

const QuestionSchema: Schema = new Schema(
  {
    gameId: { type: Schema.Types.ObjectId, ref: 'Game', required: true, index: true },
    questionText: { type: String, required: true },
    mediaContent: { type: String },
    options: [{ type: String, required: true }],
    correctOptionIndex: { type: Number, required: true },
    order: { type: Number, default: 1 }
  },
  { timestamps: true }
);

export const Question = mongoose.model<IQuestion>('Question', QuestionSchema);
