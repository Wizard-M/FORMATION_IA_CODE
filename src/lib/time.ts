import { LUNCH_SLOT, SLOT_COUNT, START_HOUR } from '../types';

/** Libellé d'un créneau, ex. slot 0 -> "08:00" */
export function slotLabel(slot: number): string {
  const hour = START_HOUR + slot;
  return `${String(hour).padStart(2, '0')}:00`;
}

export function slotRangeLabel(slot: number, durationSlots: number): string {
  return `${slotLabel(slot)} – ${slotLabel(slot + durationSlots)}`;
}

/** Un créneau est valide s'il ne déborde pas et ne chevauche pas la pause déjeuner. */
export function isSlotAllowed(slot: number, durationSlots: number): boolean {
  if (slot < 0 || durationSlots < 1) return false;
  if (slot + durationSlots > SLOT_COUNT) return false;
  if (slot === LUNCH_SLOT) return false;
  if (slot < LUNCH_SLOT && slot + durationSlots > LUNCH_SLOT) return false;
  return true;
}

export function nextAllowedSlot(slot: number, durationSlots: number): number {
  let candidate = slot;
  while (candidate < SLOT_COUNT && !isSlotAllowed(candidate, durationSlots)) {
    candidate += 1;
  }
  return Math.min(candidate, SLOT_COUNT - durationSlots);
}

export function formatHours(hours: number): string {
  return `${hours} h`;
}
