import mongoose, { Schema, Document } from 'mongoose';

export interface IStudent extends Document {
  name: string;
  enrollmentNo: string;
  tokenNo: number;
  luckyNo: number;
  spotlightNo: number;
  sessionId?: string;
  socketId?: string;
  isOnline: boolean;
  registeredAt: Date;
  lastActiveAt: Date;
}

const StudentSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    enrollmentNo: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    tokenNo: { type: Number, required: true, unique: true, index: true },
    luckyNo: { type: Number, required: true, unique: true, index: true },
    spotlightNo: { type: Number, required: true, unique: true, index: true },
    sessionId: { type: String },
    socketId: { type: String },
    isOnline: { type: Boolean, default: false },
    registeredAt: { type: Date, default: Date.now },
    lastActiveAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// MongoDB Native TTL Index: Auto-delete student document after 24 hours (86400 seconds)
StudentSchema.index({ registeredAt: 1 }, { expireAfterSeconds: 86400 });

export const Student = mongoose.model<IStudent>('Student', StudentSchema);
