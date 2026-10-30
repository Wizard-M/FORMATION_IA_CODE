import { SEED_ROOMS } from '../data/seed';
import { ROOM_TYPE_LABEL, type Session } from '../types';
import { Icon } from './Icons';

interface RoomsProps {
  sessions: Session[];
  onSeePlanning: (roomId: string) => void;
}

const USABLE_HOURS = 45;

export function Rooms({ sessions, onSeePlanning }: RoomsProps) {
  const totalCapacity = SEED_ROOMS.reduce((sum, room) => sum + room.capacity, 0);

  return (
    <section className="page">
      <div className="page-head">
        <div>
          <h1>Salles et laboratoires</h1>
          <p>
            {SEED_ROOMS.length} espaces · {totalCapacity} places au total · {USABLE_HOURS} h ouvrées par semaine
          </p>
        </div>
      </div>

      <div className="room-grid">
        {SEED_ROOMS.map((room) => {
          const roomSessions = sessions.filter((session) => session.roomId === room.id);
          const hours = roomSessions.reduce((sum, session) => sum + session.durationSlots, 0);
          const ratio = Math.min(1, hours / USABLE_HOURS);

          return (
            <article className="card room-card" key={room.id}>
              <div className="room-head">
                <span className={`room-icon type-${room.type}`}>
                  <Icon name="door" size={18} />
                </span>
                <div>
                  <h3>{room.name}</h3>
                  <span className="muted">{ROOM_TYPE_LABEL[room.type]}</span>
                </div>
                <span className="room-capacity">{room.capacity} pl.</span>
              </div>

              <div className="load-bar" aria-hidden="true">
                <span className={`load-fill ${ratio > 0.8 ? 'is-warn' : ''}`} style={{ width: `${Math.max(2, ratio * 100)}%` }} />
              </div>
              <div className="room-metrics">
                <span>{hours} h occupées</span>
                <span>{Math.round(ratio * 100)} %</span>
              </div>

              <div className="teacher-courses">
                {room.equipment.map((equipment) => (
                  <span className="chip subtle" key={equipment}>
                    {equipment}
                  </span>
                ))}
              </div>

              <button type="button" className="btn ghost block" onClick={() => onSeePlanning(room.id)}>
                Voir l’occupation
                <Icon name="arrow" size={15} />
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
