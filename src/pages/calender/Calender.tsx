"use client";

import React, { useState, useEffect, useCallback } from "react";

import Api from "@/utils/api";

import Footer from "@/component/Footer/Footer";
import DayView from "./CalenderComponents/CalenderViews";
import WeekView from "./CalenderComponents/WeeklyView";
import MonthView from "./CalenderComponents/MonthView";
import CalendarHeader from "./CalenderComponents/CalendarHeader";
import CalendarSidebar from "./CalenderComponents/CalendarSidebar";
import EventModal from "./CalenderComponents/EventModal";
import CalendarDetails from "./CalenderComponents/CalendarDetails";
import EditEventModal from "./CalenderComponents/EditEventModal";
import DeleteConfirmationModal from "./CalenderComponents/DeleteConfirmationModal";

const Calender = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"day" | "week" | "month">("month");
  const [events, setEvents] = useState<any[]>([]);
  const [allEvents, setAllEvents] = useState<any[]>([]); // For sidebar
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all events for sidebar
      const allRes = await Api.get("/calender");
      setAllEvents(allRes.data);

      // Fetch specific events for the current view if needed
      if (view === "month") {
        const res = await Api.get(
          `/calender/month?year=${currentDate.getFullYear()}&month=${currentDate.getMonth() + 1}`,
        );
        setEvents(res.data);
      } else {
        setEvents(allRes.data);
      }
    } catch (error) {
      console.error("Error fetching events", error);
    } finally {
      setLoading(false);
    }
  }, [currentDate, view]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleNavigate = (direction: "prev" | "next" | "today") => {
    const newDate = new Date(currentDate);
    if (direction === "today") {
      setCurrentDate(new Date());
      return;
    }

    if (view === "month") {
      newDate.setMonth(
        currentDate.getMonth() + (direction === "prev" ? -1 : 1),
      );
    } else if (view === "week") {
      newDate.setDate(currentDate.getDate() + (direction === "prev" ? -7 : 7));
    } else {
      newDate.setDate(currentDate.getDate() + (direction === "prev" ? -1 : 1));
    }
    setCurrentDate(newDate);
  };

  const handleEventClick = async (event: any) => {
    try {
      const res = await Api.get(`/calender/${event.id}`);
      setSelectedEvent(res.data);
      setIsDetailsModalOpen(true);
    } catch (error) {
      console.error("Error fetching event details", error);
      // Fallback to the passed event if fetch fails
      setSelectedEvent(event);
      setIsDetailsModalOpen(true);
    }
  };

  const handleEditClick = (event: any) => {
    setSelectedEvent(event);
    setIsDetailsModalOpen(false);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (event: any) => {
    setSelectedEvent(event);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    setIsDetailsModalOpen(false);
    fetchEvents();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsDetailsModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedEvent(null);
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const renderView = () => {
    const props = {
      currentDate,
      events,
      onEventClick: handleEventClick,
    };

    switch (view) {
      case "day":
        return <DayView {...props} />;
      case "week":
        return <WeekView {...props} />;
      case "month":
        return <MonthView {...props} />;
      default:
        return <MonthView {...props} />;
    }
  };

  return (
    <div>
      {/* <main className='pb-18'>  <Navbar /></main> */}

      <div className="flex flex-col h-screen bg-white">
        <CalendarHeader
          currentDate={currentDate}
          onNavigate={handleNavigate}
          view={view}
          onViewChange={setView}
          onToggleSidebar={toggleSidebar}
        />

        <div className="flex flex-1 overflow-hidden relative">
          {/* Sidebar with mobile drawer behavior */}
          <div
            className={`
          absolute inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out bg-white md:relative md:translate-x-0
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          shadow-xl md:shadow-none
        `}
          >
            <CalendarSidebar
              currentDate={currentDate}
              onDateSelect={(date) => {
                setCurrentDate(date);
                if (window.innerWidth < 768) setIsSidebarOpen(false);
              }}
              onCreateEvent={() => {
                setIsModalOpen(true);
                if (window.innerWidth < 768) setIsSidebarOpen(false);
              }}
              onEventClick={handleEventClick}
              events={allEvents}
            />
          </div>

          {/* Mobile Sidebar Overlay */}
          {isSidebarOpen && (
            <div
              className="fixed inset-0 bg-black/30 z-30 md:hidden animate-in fade-in duration-300"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          <main className="flex-1 relative overflow-hidden flex flex-col">
            {loading && (
              <div className="absolute inset-0 bg-white/50 z-20 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-[#95D700] border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            <div className="flex-1 overflow-auto">{renderView()}</div>
          </main>
        </div>

        <EventModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onSave={fetchEvents}
          initialDate={currentDate}
        />

        <CalendarDetails
          isOpen={isDetailsModalOpen}
          onClose={closeModal}
          event={selectedEvent}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
        />

        <EditEventModal
          isOpen={isEditModalOpen}
          onClose={closeModal}
          onSave={fetchEvents}
          eventToEdit={selectedEvent}
        />

        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={closeModal}
          onConfirm={handleConfirmDelete}
          eventId={selectedEvent?.id}
          eventTitle={selectedEvent?.title}
        />
      </div>
      <Footer />
    </div>
  );
};

export default Calender;
