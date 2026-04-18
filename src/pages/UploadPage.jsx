import FileUpload from "../components/FileUpload.jsx";
import PageShell from "../components/PageShell.jsx";

export default function UploadPage() {
  return (
    <PageShell>
      <div className="mb-8 max-w-3xl">
        <p className="text-sm font-semibold text-google-blue">Dataset intake</p>
        <h1 className="mt-2 text-3xl font-bold tracking-normal text-[#202124] sm:text-4xl">Upload dataset</h1>
        <p className="mt-3 text-base leading-7 text-[#5f6368]">
          Bring your CSV into Ethicly to preview records and generate an initial fairness audit.
        </p>
      </div>
      <FileUpload />
    </PageShell>
  );
}
