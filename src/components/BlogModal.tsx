"use client";

import { useEffect, useRef, useState } from "react";
import BlogArticleLayout from "@/components/BlogArticleLayout";
import PopupShell from "@/components/PopupShell";
import type { BlogPost } from "@/lib/blogs";

/** Legacy popup — listing now links to `/blogs/[slug]`; kept for deep links that still open modal. */
export default function BlogModal({
  index,
  posts,
  onClose,
  defaultAuthorAvatar = "/portrait-master.png",
}: {
  index: number | null;
  posts: BlogPost[];
  onClose: () => void;
  defaultAuthorAvatar?: string;
}) {
  const [mounted, setMounted] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  useEffect(() => setMounted(true), []);
  const shellScrollRef = useRef<HTMLDivElement>(null);
  const rightScrollRef = useRef<HTMLDivElement>(null);

  const open = index !== null;
  const post = open ? posts[index!] : null;

  useEffect(() => {
    if (!open) return;
    shellScrollRef.current?.scrollTo(0, 0);
    rightScrollRef.current?.scrollTo(0, 0);
  }, [index, open]);

  useEffect(() => {
    if (!open || index === null) return;
    const current = posts[index];
    setShareUrl(
      current.url ??
        `${window.location.origin}/blogs/${encodeURIComponent(current.slug)}`,
    );
  }, [open, index, posts]);

  if (!mounted || !open || !post) return null;

  return (
    <PopupShell
      onClose={onClose}
      label={post.title}
      crumbs={[
        { label: "Blogs", href: "/blogs?view=blogs", hideOnMobile: true },
        { label: post.title },
      ]}
      bodyRef={shellScrollRef}
      bodyClassName="flex min-h-0 flex-1 flex-col overflow-hidden"
    >
      <BlogArticleLayout
        post={post}
        shareUrl={shareUrl}
        defaultAuthorAvatar={defaultAuthorAvatar}
        rightScrollRef={rightScrollRef}
      />
    </PopupShell>
  );
}
