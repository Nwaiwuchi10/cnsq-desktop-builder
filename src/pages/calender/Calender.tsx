"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";

import Api from "@/utils/api";

import Footer from "@/component/Footer/Footer";
import DayView from "./CalenderComponents/CalenderViews";
import WeekView from "./CalenderComponents/WeeklyView";
import MonthView from "./CalenderComponents/MonthView";
import CalendarLayout from "./CalenderComponents/CalendarLayout";
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
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedStaffIds, setSelectedStaffIds] = useState<number[]>([]);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const userIdStr = localStorage.getItem("userId");
      const userId = userIdStr ? parseInt(userIdStr, 10) : null;

      // Fetch all events for sidebar
      const allRes = await Api.get("/calender");
      let filteredAll = allRes.data;

      if (userId !== null) {
        filteredAll = allRes.data.filter((event: any) => {
          const isCreator =
            event.createdBy?.id === userId || event.creatorId === userId;
          const isAttendee = event.attendees?.some(
            (a: any) => a.id === userId || a === userId,
          );
          return isCreator || isAttendee;
        });
      }
      setAllEvents(filteredAll);

      // Fetch events based on selected staffs using staff endpoint
      let displayEvents = filteredAll;
      if (selectedStaffIds.length > 0) {
        try {
          const staffIdsParam = selectedStaffIds.join(",");
          const year = currentDate.getFullYear();
          const month = currentDate.getMonth() + 1;
          const staffRes = await Api.get(
            `/calender/staff?staffIds=${staffIdsParam}&year=${year}&month=${month}`,
          );
          displayEvents = staffRes.data || [];
        } catch (error) {
          console.error("Error fetching staff calendar events", error);
          // Fallback to local filtering if API fails
          displayEvents = filteredAll.filter((event: any) => {
            const creatorMatch =
              event.createdBy?.id &&
              selectedStaffIds.includes(event.createdBy.id);
            const attendeeMatch = event.attendees?.some((attendee: any) =>
              selectedStaffIds.includes(attendee.id || attendee),
            );
            return creatorMatch || attendeeMatch;
          });
        }
      }

      setEvents(displayEvents);
    } catch (error) {
      console.error("Error fetching events", error);
    } finally {
      setLoading(false);
    }
  }, [currentDate, view, selectedStaffIds]);

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

  const handleStaffSelectionChange = (staffIds: number[]) => {
    setSelectedStaffIds(staffIds);
  };

  return (
    <div>
      <CalendarLayout
        currentDate={currentDate}
        onNavigate={handleNavigate}
        view={view}
        onViewChange={setView}
        onDateSelect={setCurrentDate}
        onCreateEvent={() => setIsModalOpen(true)}
        onEventClick={handleEventClick}
        events={allEvents}
        selectedStaffIds={selectedStaffIds}
        onStaffSelectionChange={handleStaffSelectionChange}
      >
        {loading && (
          <div className="absolute inset-0 bg-white/50 z-20 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-[#95D700] border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        <div className="flex-1 overflow-auto">{renderView()}</div>
      </CalendarLayout>

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
      <Footer />
    </div>
  );
};

export default Calender;
