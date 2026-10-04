import { useState } from "react";

const COPIED_FEEDBACK_DURATION_MILLISECONDS = 2000;

type CopyButtonProps = {
  textToCopy: string;
  textToCopyDescription: string;
};

export function CopyButton({ textToCopy, textToCopyDescription }: CopyButtonProps) {
  const [isCopied, setIsCopied] = useState(false);

  async function copyText() {
    await navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), COPIED_FEEDBACK_DURATION_MILLISECONDS);
  }

  return (
    <button
      type="button"
      onClick={copyText}
      aria-label={`Copy ${textToCopyDescription}`}
      className="text-xs text-green-500 hover:text-green-400 transition-colors"
    >
      {isCopied ? "Copied!" : "Copy"}
    </button>
  );
}
