import { Paragraph } from "@/components/paragraph";
import type { Event } from "@/lib/zod/event";

interface PageProps {
  event: Event;
}

export function Event({ event }: PageProps) {
  return (
    <div className="grid gap-4">
      {event.field_content_elements?.map((paragraph) => (
        <Paragraph key={paragraph.id} paragraph={paragraph} />
      ))}
    </div>
  );
}
