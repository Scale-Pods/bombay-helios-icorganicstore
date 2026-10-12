import React from "react";
import "./globals.css";
import { ClientWrapper } from "./ClientWrapper";

export const metadata = {
  title: "Helios & IC Organic Growth OS",
  description: "Enterprise operating system for Bombay Helios and IC Organic Store.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light">
      <body>
        <ClientWrapper>
          {children}
        </ClientWrapper>
      </body>
    </html>
  );
}
