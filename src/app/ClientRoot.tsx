"use client";

import React from "react";
import AppEvents from "./AppEvents";

export default function ClientRoot({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AppEvents />
      {children}
    </>
  );
}
