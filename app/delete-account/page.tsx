export default function DeleteAccount() {
  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>Account Deletion Request</h2>
      <p>If you wish to delete your account and all associated data from StuManage, please click the button below to send us an email request.</p>
      
      <div style={{ margin: '20px 0', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
        <strong>What happens next?</strong>
        <ul>
          <li><strong>Data Removed:</strong> Your user profile, settings, and all linked student records will be permanently deleted.</li>
          <li><strong>Retention:</strong> No data is retained after deletion.</li>
          <li><strong>Timeframe:</strong> Requests are processed within 30 days.</li>
        </ul>
      </div>

      <a 
        href="mailto:support@stumanage.app?subject=Account%20Deletion%20Request&body=Please%20delete%20my%20account%20and%20all%20associated%20data.%20My%20registered%20email%20is%3A%20"
        style={{ display: 'inline-block', padding: '10px 20px', backgroundColor: '#dc3545', color: '#fff', textDecoration: 'none', borderRadius: '5px', fontWeight: 'bold' }}
      >
        Request Account Deletion
      </a>
    </div>
  );
}
