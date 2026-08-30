// Liste yuklenirken gosterilen iskelet. Bos ekran yerine gercek kartlarla
// ayni olculerde kutular gosteriyoruz ki icerik gelince sayfa kaymasin. Boylece UI daha stabil gorunuyor.
export function TaskListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <ul className="flex flex-col gap-3" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <li
          key={index}
          className="flex flex-col gap-3 rounded-xl border border-black/10 p-4 dark:border-white/15"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="h-4 w-1/2 animate-pulse rounded bg-black/10 dark:bg-white/10" />
            <div className="h-4 w-24 animate-pulse rounded-full bg-black/10 dark:bg-white/10" />
          </div>
          <div className="h-3 w-3/4 animate-pulse rounded bg-black/10 dark:bg-white/10" />
          <div className="h-3 w-20 animate-pulse rounded bg-black/10 dark:bg-white/10" />
        </li>
      ))}
    </ul>
  )
}
