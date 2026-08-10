"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CaseStudyView from "@/components/CaseStudyView";
import PasswordGate from "@/components/PasswordGate";
import { readAccessUnlocked } from "@/lib/access";
import type { Study } from "@/sanity/types";

/**
 * Standalone `/work/[slug]` gate. Work overlay opens already go through
 * WorkBody → requestAccess; this page was previously unguarded.
 */
export default function CaseStudyAccess({
  project,
  prev,
  next,
}: {
  project: Study;
  prev: Study;
  next: Study;
}) {
  const router = useRouter();
  const needsGate = Boolean(project.passwordProtected);
  const [allowed, setAllowed] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);

  useEffect(() => {
    if (!needsGate) {
      setAllowed(true);
      setGateOpen(false);
      return;
    }
    if (readAccessUnlocked()) {
      setAllowed(true);
      setGateOpen(false);
      return;
    }
    setAllowed(false);
    setGateOpen(true);
  }, [needsGate, project.slug]);

  const dismiss = () => {
    setGateOpen(false);
    if (!allowed) router.push("/work");
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
          variant="page"
        />
      ) : (
        <div className="min-h-dvh bg-page" aria-hidden />
      )}
      <PasswordGate
        open={needsGate && !allowed && gateOpen}
        message="This case study is password protected. To view it, please enter the password below."
        onClose={dismiss}
        onSuccess={onSuccess}
      />
    </>
  );
}
