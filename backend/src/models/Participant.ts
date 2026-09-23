import mongoose, { Schema, Document } from 'mongoose';

export interface IParticipant extends Document {
  gameId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  joinedAt: Date;
  status: 'JOINED' | 'SUBMITTED' | 'DISQUALIFIED';
}

const ParticipantSchema: Schema = new Schema(
  {
    gameId: { type: Schema.Types.ObjectId, ref: 'Game', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    joinedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['JOINED', 'SUBMITTED', 'DISQUALIFIED'], default: 'JOINED' }
  },
  { timestamps: true }
);

ParticipantSchema.index({ gameId: 1, studentId: 1 }, { unique: true });

export const Participant = mongoose.model<IParticipant>('Participant', ParticipantSchema);
