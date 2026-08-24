import { LexoRank } from "lexorank";

/** Next LexoRank strings for drag-order fields (`orderRank`). */
export function nextLexoRanks(count: number): string[] {
  let rank = LexoRank.min();
  const ranks: string[] = [];
  for (let i = 0; i < count; i++) {
    rank = rank.genNext().genNext();
    ranks.push(rank.toString());
  }
  return ranks;
}

export type OrderRankDoc = { _id: string; orderRank?: string };

/** Assign LexoRank orderRank in list order (published docs only). */
export async function commitLexoRankOrder(
  client: { transaction: () => { patch: (id: string, fn: (p: { set: (v: object) => void }) => void) => unknown; commit: () => Promise<unknown> } },
  docs: OrderRankDoc[],
): Promise<number> {
  if (!docs.length) return 0;
  const ranks = nextLexoRanks(docs.length);
  let tx = client.transaction();
  docs.forEach((doc, i) => {
    tx = tx.patch(doc._id, (p) => p.set({ orderRank: ranks[i] })) as typeof tx;
  });
  await tx.commit();
  return docs.length;
}
