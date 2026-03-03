export default function MapPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Interactive Map</h1>
      <div className="guild-card overflow-hidden" style={{ height: "calc(100vh - 180px)" }}>
        <iframe
          src="https://genshin-impact-map.appsample.com/"
          className="w-full h-full border-0"
          title="Teyvat Interactive Map"
          allow="fullscreen"
        />
      </div>
    </div>
  );
}
