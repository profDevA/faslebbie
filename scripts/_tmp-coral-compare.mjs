import { config } from "dotenv";
import { createClient } from "@sanity/client";

config({ path: ".env.local" });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2025-01-01",
  token: process.env.SANITY_API_READ_TOKEN,
  useCdn: false,
});

const q = `{
  "pub": *[_id=="cs-coral-health"][0]{
    sections[]{
      _type, _key,
      _type=="heroSection"=>{ "heroImg": image.asset->_id },
      _type=="motionShowcase"=>{ "rows": count(rows), "rowKeys": rows[]._key },
      _type=="showcaseGallery"=>{ "items": count(items), "nullKeys": count(items[!defined(_key)]) },
      _type=="highlightReel"=>{ "cells": count(cells) }
    }
  },
  "draft": *[_id=="drafts.cs-coral-health"][0]{
    sections[]{
      _type, _key,
      _type=="heroSection"=>{ "heroImg": image.asset->_id },
      _type=="motionShowcase"=>{ "rows": count(rows) },
      _type=="highlightReel"=>{ "cells": count(cells) }
    }
  }
}`;

console.log(JSON.stringify(await client.fetch(q), null, 2));
