import mongoose, { Schema, Document } from 'mongoose';

export interface IEvent extends Document {
  name: string;
  code: string;
  status: 'DRAFT' | 'LIVE' | 'ENDED';
  currentGameId?: mongoose.Types.ObjectId;
  auditoriumState: {
    state: string;
    payload?: any;
    updatedAt: Date;
  };
}

const EventSchema: Schema = new Schema(
  {
    name: { type: String, required: true, default: '🎉 FRESHER 2026' },
    code: { type: String, required: true, unique: true, default: 'FRESHER2026' },
    status: { type: String, enum: ['DRAFT', 'LIVE', 'ENDED'], default: 'LIVE' },
    currentGameId: { type: Schema.Types.Mixed },
    auditoriumState: {
      state: { type: String, default: 'WELCOME' },
      payload: { type: Schema.Types.Mixed, default: {} },
      updatedAt: { type: Date, default: Date.now }
    }
  },
  { timestamps: true }
);

export const EventModel = mongoose.model<IEvent>('Event', EventSchema);
