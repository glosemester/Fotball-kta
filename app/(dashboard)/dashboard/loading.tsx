export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse p-4">
      {/* Hilsen Skeleton */}
      <div>
        <div className="h-10 bg-white/5 rounded-lg w-1/2 mb-2"></div>
        <div className="h-4 bg-white/5 rounded w-1/3"></div>
      </div>

      {/* Lagvelger Skeleton */}
      <div className="flex gap-2">
        <div className="h-10 w-24 bg-white/5 rounded-2xl"></div>
        <div className="h-10 w-24 bg-white/5 rounded-2xl"></div>
      </div>

      {/* Hovedhandlinger Skeleton */}
      <div className="grid grid-cols-2 gap-3">
        <div className="h-14 bg-white/5 rounded-2xl"></div>
        <div className="h-14 bg-white/5 rounded-2xl"></div>
        <div className="h-12 bg-white/5 rounded-2xl"></div>
        <div className="h-12 bg-white/5 rounded-2xl"></div>
      </div>

      {/* Ukesplan Skeleton */}
      <div>
        <div className="h-8 bg-white/5 rounded-lg w-1/3 mb-4 mt-2"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="flex items-center gap-4 bg-white/5 rounded-3xl p-4 h-20">
              <div className="w-12 h-6 bg-white/10 rounded"></div>
              <div className="w-12 h-12 rounded-2xl bg-white/10"></div>
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-white/10 rounded w-1/2"></div>
                <div className="h-4 bg-white/10 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
