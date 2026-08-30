// Sayfa govdesi: genislik siniri ve kenar bosluklari. Dort ayri sayfada
// (liste, hata, 404, yukleme) ayni class dizisini tekrarlamak yerine tek
// yerde tutuyoruz; birinde bosluk degisince digerleri geride kalmiyor.
export function PageContainer({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <main
      className={`mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-8 sm:px-6 sm:py-12 ${className}`}
    >
      {children}
    </main>
  )
}
