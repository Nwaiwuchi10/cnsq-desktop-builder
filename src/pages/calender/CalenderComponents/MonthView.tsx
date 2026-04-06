import {
  DAYS_OF_WEEK,
  getCalendarGrid,
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
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      style={{
        backgroundColor: event.color || "#22C55E",
        ...style,
      }}
      className="text-white text-[10px] md:text-[11px] px-1.5 py-0.5 rounded shadow-sm cursor-pointer overflow-hidden whitespace-nowrap group transition-all hover:brightness-95 z-10 border-l-[3px] border-black/10"
      title={event.title}
    >
      <div className="font-bold truncate leading-tight">{event.title}</div>
      <div className="opacity-90 font-medium text-[9px]">
        {new Date(event.startTime).toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })}
      </div>
    </div>
  );
};

const EventDot: React.FC<{ event: Event; onClick: () => void }> = ({
  event,
  onClick,
}) => {
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="flex items-center gap-1.5 px-1.5 py-0.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors cursor-pointer group"
      title={`${event.title} (Recurring)`}
    >
      <div
        className="w-2 h-2 rounded-full flex-shrink-0 group-hover:scale-125 transition-transform"
        style={{ backgroundColor: event.color || "#22C55E" }}
      />
      <span className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold truncate hidden md:inline">
        {event.title}
      </span>
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
      <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#141414] items-center justify-center transition-colors">
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
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#141414] transition-colors">
      <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-gray-50 dark:bg-[#1a1a1a] z-10">
        {DAYS_OF_WEEK.map((day) => (
          <div
            key={day}
            className="py-2 text-center text-[10px] md:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700 last:border-r-0"
          >
            <span className="md:hidden">{day[0]}</span>
            <span className="hidden md:inline">{day}</span>
          </div>
        ))}
      </div>
      <div className="flex-1 grid grid-cols-7 grid-rows-6 auto-rows-fr bg-gray-200 dark:bg-gray-700 gap-[1px] overflow-auto">
        {grid.map((item, idx) => {
          const dayEvents = events.filter((e) =>
            isEventVisibleOnDate(e, item.date),
          );

          // Separate source events from recurring ones
          const sourceEvents = dayEvents.filter((e) =>
            isSameDay(new Date(e.startTime), item.date),
          );
          const recurringEvents = dayEvents.filter(
            (e) => !isSameDay(new Date(e.startTime), item.date),
          );

          const isToday = isSameDay(item.date, today);

          return (
            <div
              key={idx}
              className={`bg-white dark:bg-[#141414] p-0.5 md:p-1 min-h-[100px] md:min-h-[140px] flex flex-col gap-0.5 md:gap-1.5 ${!item.isCurrentMonth ? "bg-gray-50/50 dark:bg-[#1a1a1a]/50 opacity-60" : ""}`}
            >
              <div className="flex justify-between items-center mb-0.5">
                <span
                  className={`text-[10px] md:text-sm font-bold w-5 h-5 md:w-8 md:h-8 flex items-center justify-center rounded-full transition-colors ${isToday
                    ? "bg-[#95D700] text-white shadow-sm"
                    : item.isCurrentMonth
                      ? "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      : "text-gray-300 dark:text-gray-600"
                    }`}
                >
                  {item.date.getDate()}
                </span>
                {dayEvents.length > 5 && (
                  <span className="text-[10px] font-bold text-gray-400 md:pr-1">
                    +{dayEvents.length - 5}
                  </span>
                )}
              </div>
              <div className="flex-1 flex flex-col gap-1 overflow-hidden">
                {/* Display up to 5 source events as blocks */}
                {sourceEvents.slice(0, 5).map((event) => (
                  <div key={event.id} className="hidden md:block">
                    <EventCard
                      event={event}
                      onClick={() => onEventClick(event)}
                    />
                  </div>
                ))}

                {/* Display recurring dots only if we haven't reached 5 blocks */}
                {sourceEvents.length < 5 && (
                  <div className="flex flex-col gap-0.5 mt-auto">
                    {recurringEvents
                      .slice(0, 5 - sourceEvents.length)
                      .map((event) => (
                        <div key={`${event.id}-rec`} className="hidden md:block">
                          <EventDot
                            event={event}
                            onClick={() => onEventClick(event)}
                          />
                        </div>
                      ))}
                  </div>
                )}

                {/* Mobile view dots combine both, now clickable */}
                {dayEvents.length > 0 && (
                  <div className="md:hidden flex flex-wrap gap-0.5 justify-center mt-1">
                    {dayEvents.slice(0, 4).map((event) => (
                      <div
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick(event);
                        }}
                        className="w-1.5 h-1.5 rounded-full cursor-pointer active:scale-125 transition-transform"
                        style={{ backgroundColor: event.color || "#22C55E" }}
                      />
                    ))}
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
