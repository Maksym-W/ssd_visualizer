import { Page } from "../../lib/Page";

export default function SSDPage({ page, pageNumber, pageIndex }: { page: Page, pageNumber?: number, pageIndex?: number }) {
  let status = (pageNumber) ? `${pageNumber} (${pageIndex})` : ''
  status = (page.status.startsWith("Stale")) ? "X" : (page.status.startsWith("Empty") ? "." : status);
  return (
    <div className={`${page.bgColour} border border-green-700 flex items-center justify-center text-xs text-black`}>
      <p>{status}</p>
    </div>
  );
};
