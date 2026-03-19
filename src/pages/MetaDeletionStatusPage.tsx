import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle, Clock, XCircle } from "lucide-react";

interface DeletionRecord {
  confirmation_code: string;
  status: string;
  deleted_accounts: number;
  requested_at: string;
  processed_at: string | null;
}

export default function MetaDeletionStatusPage() {
  const [params] = useSearchParams();
  const code = params.get("code") || "";
  const [record, setRecord] = useState<DeletionRecord | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!code) {
      setError("No confirmation code provided.");
      setLoading(false);
      return;
    }
    fetch(`/api/social/meta/data-deletion/status?code=${encodeURIComponent(code)}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((data) => { setRecord(data); setLoading(false); })
      .catch(() => { setError("No deletion request found for this confirmation code."); setLoading(false); });
  }, [code]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#1877F2] flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6">
              <path d="M24 12.073C24 5.404 18.628 0 12 0S0 5.404 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.413c0-3.018 1.793-4.687 4.533-4.687 1.312 0 2.686.235 2.686.235v2.953h-1.514c-1.491 0-1.956.93-1.956 1.886v2.255h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Facebook Data Deletion</h1>
            <p className="text-sm text-gray-500">Masakhe Growth Hub</p>
          </div>
        </div>

        {loading && (
          <div className="flex items-center gap-3 text-gray-500">
            <Clock className="h-5 w-5 animate-spin" />
            <span>Looking up your request…</span>
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center text-center gap-3 py-4">
            <XCircle className="h-12 w-12 text-red-400" />
            <p className="font-medium text-gray-800">Request Not Found</p>
            <p className="text-sm text-gray-500">{error}</p>
          </div>
        )}

        {!loading && record && (
          <div className="space-y-5">
            <div className="flex flex-col items-center text-center gap-2 py-2">
              {record.status === "completed" ? (
                <CheckCircle className="h-12 w-12 text-green-500" />
              ) : (
                <Clock className="h-12 w-12 text-amber-400" />
              )}
              <p className="text-base font-semibold text-gray-900">
                {record.status === "completed" ? "Deletion Completed" : "Deletion Pending"}
              </p>
              <p className="text-sm text-gray-500">
                {record.status === "completed"
                  ? `Your Facebook-connected data has been removed from the Masakhe platform.`
                  : "Your deletion request is being processed."}
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Confirmation code</span>
                <span className="font-mono font-medium text-gray-800">{record.confirmation_code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className={`font-medium capitalize ${record.status === "completed" ? "text-green-600" : "text-amber-600"}`}>
                  {record.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Accounts removed</span>
                <span className="font-medium text-gray-800">{record.deleted_accounts}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Requested</span>
                <span className="text-gray-800">{new Date(record.requested_at).toLocaleDateString("en-ZA")}</span>
              </div>
              {record.processed_at && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Processed</span>
                  <span className="text-gray-800">{new Date(record.processed_at).toLocaleDateString("en-ZA")}</span>
                </div>
              )}
            </div>

            <p className="text-xs text-gray-400 text-center">
              Questions? Email{" "}
              <a href="mailto:support@masakhegroup.co.za" className="underline">
                support@masakhegroup.co.za
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
