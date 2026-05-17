"use client";

import { useState } from "react";
import Icon from "./Icon";
import { useDict, useLocale } from "../i18n/I18nProvider";
import { encodeShare, timersToSteps } from "../lib/share";
import type { Timer } from "../types";

type Props = {
  timer: Timer;
  buttonClassName: string;
  iconClassName?: string;
};

export default function TimerShareButton({
  timer,
  buttonClassName,
  iconClassName,
}: Props) {
  const dict = useDict();
  const locale = useLocale();
  const [copied, setCopied] = useState(false);

  const onClick = async () => {
    const url = `${window.location.origin}/${locale}?s=${encodeShare(
      timersToSteps([timer]),
    )}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      window.prompt(dict.library.copyLink, url);
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={dict.library.copyLink}
      className={buttonClassName}
    >
      <Icon name={copied ? "check" : "share"} className={iconClassName} />
    </button>
  );
}
