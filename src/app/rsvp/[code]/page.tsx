"use client";

import { use } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { RsvpForm } from "@/components/sections/RsvpForm";

export default function RsvpPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);

  return (
    <>
      <Navbar />
      <main className="pt-20">
        <RsvpForm invitationCode={code} />
      </main>
    </>
  );
}
