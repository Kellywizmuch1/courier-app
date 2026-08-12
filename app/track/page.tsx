"use client";

export default function TrackPage() {
  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-lg p-10 text-center max-w-lg w-full">
        <h1 className="text-3xl font-black text-blue-950">
          ATLAS TRACKING TEST
        </h1>

        <p className="mt-4 text-lg font-bold text-green-600">
          NEW TRACK PAGE IS RUNNING
        </p>

        <p className="mt-3 text-slate-600">
          If you can see this message on the deployed
          Atlas website, Vercel is using this file.
        </p>

        <div className="mt-6 bg-slate-100 rounded-xl p-4">
          <p className="text-sm font-bold text-slate-700">
            Test code: ATLAS-TRACK-V2
          </p>
        </div>
      </div>
    </main>
  );
}