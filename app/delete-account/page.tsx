export default function DeleteAccountPage() {
  return (
    <main className="max-w-2xl mx-auto p-6 font-sans">
      <h1 className="text-3xl font-bold mb-4">
        StuManage Account Deletion
      </h1>

      <p className="mb-4">
        Users can request deletion of their StuManage account and associated
        data by emailing support@stumanage.in from their registered email
        address.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">
        Data Deleted
      </h2>

      <ul className="list-disc pl-6">
        <li>Account information</li>
        <li>Student records</li>
        <li>Seat allocations</li>
        <li>Fee tracking data</li>
        <li>Reminder history</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">
        Data Retained
      </h2>

      <p>
        Payment transaction records may be retained for legal,
        accounting, fraud prevention, and tax compliance purposes.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">
        Retention Period
      </h2>

      <p>
        Payment records may be retained for up to 7 years where required
        by applicable law.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">
        Processing Time
      </h2>

      <p>
        Account deletion requests are processed within 7 business days.
      </p>
    </main>
  );
}
