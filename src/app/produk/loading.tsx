export default function LoadingProduk() {
  return (
    <div className="p-8">
      <div className="animate-pulse grid grid-cols-1 md:grid-cols-3 gap-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-gray-200 rounded-lg h-48 w-full mb-4" />
        ))}
      </div>
      <div className="mt-4 animate-pulse">
        <div className="bg-gray-200 h-6 w-1/3 mb-2 rounded" />
        <div className="bg-gray-200 h-4 w-2/3 mb-2 rounded" />
        <div className="bg-gray-200 h-4 w-1/2 rounded" />
      </div>
    </div>
  );
}
