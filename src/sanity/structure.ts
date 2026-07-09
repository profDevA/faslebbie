import type { StructureResolver } from "sanity/structure";
import { orderableDocumentListDeskItem } from "@sanity/orderable-document-list";

// Desk: orderable Case Studies + Categories, and a Work Page singleton.
export const structure: StructureResolver = (S, context) =>
  S.list()
    .title("Content")
    .items([
      orderableDocumentListDeskItem({
        type: "caseStudy",
        title: "Case Studies",
        S,
        context,
      }),
      orderableDocumentListDeskItem({
        type: "category",
        title: "Categories",
        S,
        context,
      }),
      S.divider(),
      S.listItem()
        .title("Work Page")
        .id("workPage")
        .child(S.document().schemaType("workPage").documentId("workPage")),
    ]);
