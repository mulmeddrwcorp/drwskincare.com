'use client';

import { useState } from 'react';

export default function DebugPage() {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const fixMetadata = async () => {
    setLoading(true);
    setStatus('Memperbaiki metadata...');
    
    try {
      const response = await fetch('/api/debug/fix-metadata', {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setStatus('✅ Metadata berhasil diperbaiki! Silakan coba akses dashboard/profil sekarang.');
      } else {
        setStatus(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setStatus(`❌ Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };
  const checkStatus = async () => {
    setLoading(true);
    setStatus('Mengecek status...');
    
    try {
      const response = await fetch('/api/debug/complete-status');
      const data = await response.json();
      
      if (data.error) {
        setStatus(`❌ Error: ${data.error}`);
      } else {
        let statusText = `=== USER DEBUG INFO ===\n`;
        statusText += `User ID: ${data.userId}\n`;
        statusText += `Email: ${data.userEmail}\n\n`;
        
        statusText += `=== MIDDLEWARE CHECKS ===\n`;
        statusText += `Has Role: ${data.middlewareChecks.hasRole ? '✅' : '❌'} (${data.middlewareChecks.role || 'None'})\n`;
        statusText += `Profile Complete: ${data.middlewareChecks.hasProfileComplete ? '✅' : '❌'}\n`;
        statusText += `Should Redirect to Role Selection: ${data.middlewareChecks.shouldRedirectToRoleSelection ? '❌' : '✅'}\n`;
        statusText += `Reseller in Database: ${data.middlewareChecks.isResellerInDB ? '✅' : '❌'}\n\n`;
        
        if (data.recommendations.length > 0) {
          statusText += `=== ISSUES FOUND ===\n`;
          data.recommendations.forEach((rec, i) => {
            statusText += `${i + 1}. ${rec}\n`;
          });
          statusText += '\n';
        }
        
        statusText += `=== CLERK METADATA ===\n`;
        statusText += JSON.stringify(data.clerkPrivateMetadata, null, 2) + '\n\n';
        
        if (data.hasReseller) {
          statusText += `=== RESELLER DATA ===\n`;
          statusText += JSON.stringify(data.resellerData, null, 2);
        } else {
          statusText += `=== RESELLER DATA ===\nNo reseller found in database`;
        }
        
        setStatus(statusText);
      }
    } catch (error) {
      setStatus(`❌ Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Debug Page</h1>
        
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold">Perbaikan Masalah Redirect</h2>
          
          <p className="text-gray-600">
            Jika Anda mengalami masalah redirect terus-menerus ke halaman pilih-peran, 
            klik tombol di bawah untuk memperbaiki metadata user.
          </p>
          
          <div className="space-x-4">
            <button
              onClick={fixMetadata}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Perbaiki Metadata'}
            </button>
            
            <button
              onClick={checkStatus}
              disabled={loading}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Cek Status'}
            </button>
          </div>
          
          {status && (
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <pre className="whitespace-pre-wrap text-sm">{status}</pre>
            </div>
          )}
          
          <div className="mt-6 pt-6 border-t">
            <h3 className="font-semibold mb-2">Quick Links:</h3>
            <div className="space-x-4">
              <a href="/dashboard" className="text-blue-600 hover:underline">Dashboard</a>
              <a href="/dashboard/profil" className="text-blue-600 hover:underline">Profile Page</a>
              <a href="/pilih-peran" className="text-blue-600 hover:underline">Pilih Peran</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
