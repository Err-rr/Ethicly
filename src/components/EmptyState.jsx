import Button from "./Button.jsx";
import Card from "./Card.jsx";

export default function EmptyState({ title, message, actionLabel = "Upload Dataset", to = "/upload" }) {
  return (
    <Card className="border-dashed border-[#c9d7f8] px-6 py-12 text-center">
      <div className="mx-auto grid size-16 place-items-center rounded-xl bg-[#edf4ff] text-2xl font-bold text-google-blue ring-1 ring-[#d8e7ff]">
        E
      </div>
      <h2 className="mt-5 text-xl font-bold text-[#202124]">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#5f6368]">{message}</p>
      <Button to={to} className="mt-6">
        {actionLabel}
      </Button>
    </Card>
  );
}
