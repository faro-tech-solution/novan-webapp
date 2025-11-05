"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ReportIssueDialog } from "./ReportIssueDialog";
import { useAuth } from "@/contexts/AuthContext";

export const ReportIssueButton = () => {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  // Only show button if user is authenticated
  if (!user) {
    return null;
  }

  return (
    <>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Button
            onClick={() => setOpen(true)}
            className="fixed bottom-6 left-6 z-50 rounded-full shadow-lg h-14 w-14 p-0"
            size="lg"
            variant="default"
            aria-label="گزارش مشکل"
          >
            <AlertCircle className="h-6 w-6" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-red-500 text-white border-red-600">
          <p>گزارش مشکل</p>
        </TooltipContent>
      </Tooltip>
      <ReportIssueDialog open={open} onOpenChange={setOpen} />
    </>
  );
};
