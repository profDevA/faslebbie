/** Figma 16:2783 card art — MCP asset URLs (re-fetch from node 16:2783 if expired). */
export const BUILD_COVER_URLS: { id: string; url: string }[] = [
  {
    id: "leoney",
    url: "https://www.figma.com/api/mcp/asset/468cbce3-3671-4f05-b205-812eee452fe4.png",
  },
  {
    id: "pebble",
    url: "https://www.figma.com/api/mcp/asset/817145e1-6c2c-4f78-95a8-708c9b09a7d6.png",
  },
  {
    id: "rookieball",
    url: "https://www.figma.com/api/mcp/asset/a6fcbb64-1b11-475f-9d8a-43f7fba0dc6a.png",
  },
  {
    id: "root-diamonds",
    url: "https://www.figma.com/api/mcp/asset/561d0edf-70e5-4953-b222-73176fb172fc.png",
  },
  {
    id: "deepsocal-agent",
    url: "https://www.figma.com/api/mcp/asset/0dd9005b-1801-4db6-a073-d08ab97393b5.png",
  },
  {
    id: "model-affiliate",
    url: "https://www.figma.com/api/mcp/asset/4120b1ee-29f2-41b5-b899-8bb3bd8f8b3b.png",
  },
  {
    id: "provify",
    url: "https://www.figma.com/api/mcp/asset/c26ae5fe-63d0-40be-8350-e5fc2f6fce4e.png",
  },
];

/** Figma leaves these as white placeholders — no cover image. */
export const BUILD_PLACEHOLDER_IDS = new Set(["gradstudio", "mineral-pulse"]);
