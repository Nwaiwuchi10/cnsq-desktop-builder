import {
  DAYS_OF_WEEK,
  getCalendarGrid,
  isSameDay,
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
        backgroundColor: event.color || "#22c55e",
        ...style,
      }}
      className="text-white text-[10px] p-1 rounded-sm shadow-sm cursor-pointer overflow-hidden whitespace-nowrap group transition-all hover:brightness-95 z-10"
      title={event.title}
    >
      <div className="font-semibold truncate">{event.title}</div>
      <div className="opacity-80">
        {new Date(event.startTime).toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })}
      </div>
    </div>
  );
};
export default function MonthView({
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
  const grid = getCalendarGrid(
    currentDate.getFullYear(),
    currentDate.getMonth(),
  );
  const today = new Date();

  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      <div className="grid grid-cols-7 border-b border-gray-200 sticky top-0 bg-gray-50 z-10">
        {DAYS_OF_WEEK.map((day) => (
          <div
            key={day}
            className="py-2 text-center text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200 last:border-r-0"
          >
            <span className="md:hidden">{day[0]}</span>
            <span className="hidden md:inline">{day}</span>
          </div>
        ))}
      </div>
      <div className="flex-1 grid grid-cols-7 grid-rows-6 auto-rows-fr bg-gray-200 gap-[1px] overflow-auto">
        {grid.map((item, idx) => {
          const dayEvents = events.filter((e) =>
            isSameDay(new Date(e.startTime), item.date),
          );
          const isToday = isSameDay(item.date, today);

          return (
            <div
              key={idx}
              className={`bg-white p-0.5 md:p-1 min-h-[80px] md:min-h-[120px] flex flex-col gap-0.5 md:gap-1 ${!item.isCurrentMonth ? "bg-gray-50/50" : ""}`}
            >
              <div className="flex justify-center md:justify-end">
                <span
                  className={`text-[10px] md:text-xs font-semibold w-5 h-5 md:w-7 md:h-7 flex items-center justify-center rounded-full ${
                    isToday
                      ? "bg-blue-600 text-white"
                      : item.isCurrentMonth
                        ? "text-gray-700"
                        : "text-gray-300"
                  }`}
                >
                  {item.date.getDate()}
                </span>
              </div>
              <div className="flex flex-col gap-0.5 overflow-hidden">
                {dayEvents.map((event) => (
                  <div key={event.id} className="hidden md:block">
                    <EventCard
                      event={event}
                      onClick={() => onEventClick(event)}
                    />
                  </div>
                ))}
                {dayEvents.length > 0 && (
                  <div className="md:hidden flex flex-wrap gap-0.5 justify-center mt-1">
                    {dayEvents.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: event.color || "#22c55e" }}
                      />
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-[8px] text-gray-400 font-bold">
                        +
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
