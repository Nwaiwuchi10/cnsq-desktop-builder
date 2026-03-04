import {
  DAYS_OF_WEEK,
  formatTime,
  getWeekDays,
  isSameDay,
  isEventVisibleOnDate,
} from "@/utils/calendarDateUtils";
interface Event {
  id: string;
  title: string;
  startTime: string | Date;
  endTime: string | Date;
  color?: string;
  attendees?: any[];
}

interface ViewProps {
  currentDate: Date;
  events: Event[];
  onEventClick: (event: Event) => void;
}

interface EventCardProps {
  event: Event;
  style?: React.CSSProperties;
  onClick: () => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, style, onClick }) => {
  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: event.color || "#22C55E",
        ...style,
      }}
      className="text-white text-[10px] p-1.5 rounded shadow-sm cursor-pointer overflow-hidden whitespace-nowrap group transition-all hover:brightness-95 z-10 border-l-[3px] border-black/10"
      title={event.title}
    >
      <div className="font-bold truncate leading-tight">{event.title}</div>
      <div className="opacity-90 text-[9px]">
        {new Date(event.startTime).toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })}
      </div>
    </div>
  );
};

export default function WeekView({
  currentDate,
  events,
  onEventClick,
}: ViewProps) {
  if (!currentDate) {
    return (
      <div className="flex-1 flex flex-col h-full bg-white items-center justify-center">
        Loading...
      </div>
    );
  }
  const weekDays = getWeekDays(currentDate);
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const today = new Date();

  return (
    <div className="flex-1 flex flex-col h-full bg-white overflow-hidden">
      <div className="flex border-b border-gray-200 sticky top-0 bg-white z-20">
        <div className="w-12 md:w-20 border-r border-gray-200 bg-gray-50" />
        <div className="flex-1 grid grid-cols-7">
          {weekDays.map((day) => (
            <div
              key={day.toISOString()}
              className={`py-2 text-center border-r border-gray-200 last:border-r-0 ${isSameDay(day, today) ? "bg-blue-50/50" : ""}`}
            >
              <div className="text-[10px] md:text-xs font-bold text-gray-500 uppercase">
                <span className="md:hidden">
                  {DAYS_OF_WEEK[day.getDay()][0]}
                </span>
                <span className="hidden md:inline">
                  {DAYS_OF_WEEK[day.getDay()]}
                </span>
              </div>
              <div
                className={`mt-1 text-sm md:text-xl font-semibold inline-flex items-center justify-center w-7 h-7 md:w-10 md:h-10 rounded-full transition-colors ${isSameDay(day, today)
                    ? "bg-[#95D700] text-white shadow-sm"
                    : "text-gray-700 hover:bg-gray-100"
                  }`}
              >
                {day.getDate()}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto relative">
        <div className="flex min-h-[1440px]">
          <div className="w-12 md:w-20 flex flex-col bg-gray-50 border-r border-gray-200 sticky left-0 z-10">
            {hours.map((hour) => (
              <div
                key={hour}
                className="h-16 text-[10px] md:text-xs text-gray-400 text-right pr-2 md:pr-4 -mt-2.5"
              >
                {hour === 0 ? "" : formatTime(new Date(2024, 0, 1, hour))}
              </div>
            ))}
          </div>

          <div className="flex-1 grid grid-cols-7 relative">
            <div className="absolute inset-0 flex flex-col pointer-events-none">
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="h-16 border-b border-gray-100 last:border-b-0"
                />
              ))}
            </div>

            {weekDays.map((day) => (
              <div
                key={day.toISOString()}
                className="relative border-r border-gray-100 last:border-r-0"
              >
                {events
                  .filter((e) => isEventVisibleOnDate(e, day))
                  .map((event) => {
                    const start = new Date(event.startTime);
                    const end = new Date(event.endTime);
                    const top =
                      start.getHours() * 64 + (start.getMinutes() / 60) * 64;
                    const duration =
                      (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                    const height = Math.max(duration * 64, 20);

                    return (
                      <EventCard
                        key={event.id}
                        event={event}
                        style={{
                          position: "absolute",
                          top: `${top}px`,
                          height: `${height}px`,
                          width: "calc(100% - 4px)",
                          left: "2px",
                        }}
                        onClick={() => onEventClick(event)}
                      />
                    );
                  })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
