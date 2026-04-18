import Card from "./Card.jsx";

export default function MetricCard({ label, value, detail, tone = "blue" }) {
  const toneClasses = {
    blue: "bg-[#edf4ff] text-google-blue ring-[#d8e7ff]",
    green: "bg-[#eaf6ee] text-google-green ring-[#d8efdf]",
    yellow: "bg-[#fff8df] text-[#8a6500] ring-[#ffedaa]",
    red: "bg-[#fdecea] text-google-red ring-[#f8d1cc]"
  };

  return (
    <Card className="min-h-44">
      <div className="flex h-full items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[#5f6368]">{label}</p>
          <p className="mt-4 text-4xl font-bold tracking-normal text-[#202124]">{value}</p>
          <p className="mt-3 text-sm leading-6 text-[#5f6368]">{detail}</p>
        </div>
        <span className={`rounded-lg px-3 py-1 text-xs font-semibold ring-1 ${toneClasses[tone]}`}>Live</span>
      </div>
    </Card>
  );
}
