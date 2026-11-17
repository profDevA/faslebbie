import { useEffect, useState } from "react";
import { useClient, type StringInputProps } from "sanity";

/**
 * Case study → "Own password". Empty shows the shared Site Settings password
 * as the placeholder (Fas, Nov 16 evening: "once I toggle it on it will show
 * the 123456 and then I can change this specific case study to 556").
 */
export function StudyPasswordInput(props: StringInputProps) {
  const client = useClient({ apiVersion: "2024-01-01" });
  const [shared, setShared] = useState<string>("");

  useEffect(() => {
    let live = true;
    client
      .fetch<string | null>(`*[_type == "siteSettings"][0].accessPassword`)
      .then((v) => {
        if (live) setShared((v ?? "").trim());
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [client]);

  return props.renderDefault({
    ...props,
    elementProps: {
      ...props.elementProps,
      placeholder: shared ? `${shared} (shared password)` : "Shared password (Site Settings → Access)",
    },
  });
}
