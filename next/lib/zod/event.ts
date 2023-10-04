import { DrupalNode } from "next-drupal";
import { z } from "zod";

import { MetatagsSchema } from "@/lib/zod/metatag";
import {
  AccordionSchema,
  FileAttachmentsSchema,
  FormattedTextSchema,
  HeroSchema,
  ImageSchema,
  LinksSchema,
  ListingArticlesSchema,
  VideoSchema,
} from "@/lib/zod/paragraph";

const EventElementsSchema = z.discriminatedUnion("type", [
  FormattedTextSchema,
  ImageSchema,
  VideoSchema,
  LinksSchema,
  AccordionSchema,
  HeroSchema,
  ListingArticlesSchema,
  FileAttachmentsSchema,
]);

export const EventSchema = z.object({
  type: z.literal("node--event"),
  id: z.string(),
  title: z.string(),
  field_content_elements: z.array(EventElementsSchema),
  metatag: MetatagsSchema.optional(),
});

export function validateAndCleanupEvent(event: DrupalNode): Event | null {
  try {
    // Validate the top level fields first.
    const topLevelEventData = EventSchema.omit({
      field_content_elements: true,
    }).parse(event);

    // Validate the field_content_elements separately, one by one.
    // This way, if one of them is invalid, we can still return the rest of the page contents.
    const validatedParagraphs = event.field_content_elements
      .map((paragraph: any) => {
        const result = EventElementsSchema.safeParse(paragraph);

        switch (result.success) {
          case true:
            return result.data;
          case false:
            console.log(
              `Error validating event paragraph ${paragraph.type}: `,
              JSON.stringify(result.error, null, 2),
            );
            return null;
        }
      })
      .filter(Boolean);

    return {
      ...topLevelEventData,
      field_content_elements: validatedParagraphs,
    };
  } catch (error) {
    const { name = "ZodError", issues = [] } = error;
    console.log(JSON.stringify({ name, issues, event }, null, 2));
    return null;
  }
}

export type Event = z.infer<typeof EventSchema>;
