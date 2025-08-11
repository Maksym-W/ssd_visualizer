import { Page } from "../page";

export default function SSDPage({ page, pageNumber, pageIndex }: { page: Page, pageNumber?: number, pageIndex?: number }) {
  const status = (pageNumber) ? `${pageNumber} (${pageIndex})` : ''
  return (
    <div className={`${page.bgColour} border border-green-700 flex items-center justify-center text-xs text-black`}>
      <p>{pageNumber}</p>
    </div>
  );
};
