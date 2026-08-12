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
      orderableDocumentListDeskItem({
        type: "testimonial",
        title: "Testimonials",
        S,
        context,
      }),
      S.divider(),
      S.listItem()
        .title("Site Settings")
        .id("siteSettings")
        .child(
          S.document().schemaType("siteSettings").documentId("siteSettings"),
        ),
      S.listItem()
        .title("Home Page")
        .id("homePage")
        .child(S.document().schemaType("homePage").documentId("homePage")),
      S.listItem()
        .title("About Page")
        .id("aboutPage")
        .child(S.document().schemaType("aboutPage").documentId("aboutPage")),
      S.listItem()
        .title("Work Page")
        .id("workPage")
        .child(S.document().schemaType("workPage").documentId("workPage")),
      S.listItem()
        .title("Research Page")
        .id("researchPage")
        .child(
          S.document().schemaType("researchPage").documentId("researchPage"),
        ),
      S.listItem()
        .title("Teaching Page")
        .id("teachingPage")
        .child(
          S.document().schemaType("teachingPage").documentId("teachingPage"),
        ),
      S.listItem()
        .title("Build Page")
        .id("buildPage")
        .child(S.document().schemaType("buildPage").documentId("buildPage")),
      S.listItem()
        .title("Approach Page")
        .id("leadershipPage")
        .child(
          S.document()
            .schemaType("leadershipPage")
            .documentId("leadershipPage"),
        ),
      S.listItem()
        .title("Blogs & Media Page")
        .id("blogsPage")
        .child(S.document().schemaType("blogsPage").documentId("blogsPage")),
    ]);
