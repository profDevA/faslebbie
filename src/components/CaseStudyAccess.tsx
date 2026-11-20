"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CaseStudyView from "@/components/CaseStudyView";
import PasswordGate from "@/components/PasswordGate";
import { readAccessUnlocked } from "@/lib/access";
import {
  readRememberedWorkView,
  workListingHref,
  type WorkListingView,
} from "@/lib/caseStudyNav";
import type { Study } from "@/sanity/types";

/**
 * Standalone `/work/[slug]` gate. Work overlay opens already go through
 * WorkBody → requestAccess; this page was previously unguarded.
 */
export default function CaseStudyAccess({
  project,
  prev,
  next,
  pager,
  listingView = null,
  listingHref: serverListingHref = "/work",
}: {
  project: Study;
  prev: Study;
  next: Study;
  /** Every study in order + the current one — dot pager in the bottom bar. */
  pager?: { hrefs: string[]; labels: string[]; active: number };
  listingView?: WorkListingView | null;
  listingHref?: string;
}) {
  const router = useRouter();
  // No ?view= in the URL (Nov 17): go back to the Work view this tab came from.
  const [listingHref, setListingHref] = useState(serverListingHref);
  useEffect(() => {
    if (listingView) return;
    const remembered = readRememberedWorkView();
    if (remembered) setListingHref(workListingHref(remembered));
  }, [listingView]);
  const needsGate = Boolean(project.passwordProtected);
  const own = Boolean(project.hasOwnPassword);
  const [allowed, setAllowed] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);

  useEffect(() => {
    if (!needsGate) {
      setAllowed(true);
      setGateOpen(false);
      return;
    }
    if (readAccessUnlocked({ slug: project.slug, own })) {
      setAllowed(true);
      setGateOpen(false);
      return;
    }
    setAllowed(false);
    setGateOpen(true);
  }, [needsGate, own, project.slug]);

  const dismiss = () => {
    setGateOpen(false);
    if (!allowed) router.push(listingHref);
  };

  // PasswordGate → verifyAccessPassword already sets sessionStorage.
  const onSuccess = () => {
    setAllowed(true);
    setGateOpen(false);
  };

  return (
    <>
      {allowed ? (
        <CaseStudyView
          project={project}
          prev={prev}
          next={next}
          pager={pager}
          listingView={listingView}
          listingHref={listingHref}
        />
      ) : (
        <div className="min-h-dvh bg-page" aria-hidden />
      )}
      <PasswordGate
        open={needsGate && !allowed && gateOpen}
        message="Please enter your password."
        scope={{ slug: project.slug, own }}
        onClose={dismiss}
        onSuccess={onSuccess}
      />
    </>
  );
}
