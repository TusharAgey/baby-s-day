export type EventType = "sleep" | "feed" | "stool" | "tummy" | "medicine";

export interface BabyEvent {
  id: string;
  type: EventType;
  timestamp: Date;
  duration?: number;
  metadata?: Record<string, any>;
}
