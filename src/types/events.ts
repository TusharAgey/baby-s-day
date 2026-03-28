export type EventType = "sleep" | "feed" | "stool" | "tummy";

export interface BabyEvent {
  id: string;
  type: EventType;
  timestamp: Date;
  duration?: number;
  metadata?: Record<string, any>;
}
