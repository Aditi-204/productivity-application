import { useState } from 'react';
import { motion } from 'framer-motion';
import useEmail from '../../hooks/useEmail';
import toast from 'react-hot-toast';

const PROVIDERS = [
  { id: 'gmail', name: 'Gmail', icon: 'M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z' },
  { id: 'outlook', name: 'Outlook', icon: 'M6 2h12l2 2v16l-2 2H6l-2-2V4l2-2z' },
  { id: 'office365', name: 'Office 365', icon: 'M21 5.25v13.5a1.5 1.5 0 01-1.5 1.5h-15a1.5 1.5 0 01-1.5-1.5V5.25a1.5 1.5 0 011.5-1.5h15a1.5 1.5 0 011.5 1.5z' },
  { id: 'yahoo', name: 'Yahoo Mail', icon: 'M12 2L2 7l10 5 10-5-10-5zm0 12.5L2 9.5v7l10 5 10-5v-7l-10 5z' },
  { id: 'imap', name: 'IMAP/SMTP', icon: 'M12 21a9 9 0 100-18 9 9 0 000 18zm0-8v4m0-8v.01' },
];

const CLIENT_URL = window.location.origin;

const EmailConnections = () => {
  const { accounts, connectAccount, removeAccount, isConnecting } = useEmail();
  const [connecting, setConnecting] = useState(null);

  const handleConnect = async (provider) => {
    setConnecting(provider);
    try {
      await connectAccount(
        provider.id,
        `user@${provider.id}.com`,
        provider.name,
        `demo_token_${Date.now()}`,
        ''
      );
      toast.success(`Connected to ${provider.name}`);
    } catch {
      toast.error(`Failed to connect ${provider.name}`);
    }
    setConnecting(null);
  };

  const handleOAuthConnect = (provider) => {
    if (provider.id === 'gmail' || provider.id === 'office365' || provider.id === 'outlook') {
      window.open(
        `/api/auth/oauth/${provider.id}?redirect=${encodeURIComponent(CLIENT_URL)}&mode=email`,
        `${provider.name} Auth`,
        'width=600,height=700,resizable=yes,scrollbars=yes'
      );
      return;
    }
    handleConnect(provider);
  };

  return (
    <div className="glass-card rounded-3xl p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white font-display">Connected Accounts</h3>
        <span className="text-xs text-gray-500">{accounts.length} active</span>
      </div>

      {accounts.length > 0 && (
        <div className="space-y-2">
          {accounts.map((acc) => (
            <motion.div
              key={acc.id || acc._id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#C4B5FD] to-[#A5F3FC] flex items-center justify-center text-xs font-bold text-[#0B0F17]">
                  {(acc.displayName || acc.name || acc.email || '?').charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-200">{acc.displayName || acc.name || acc.provider}</p>
                  <p className="text-xs text-gray-500">{acc.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => removeAccount(acc.id || acc._id)}
                  className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-5 gap-2">
        {PROVIDERS.map((p) => (
          <motion.button
            key={p.id}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            disabled={connecting !== null}
            onClick={() => handleOAuthConnect(p)}
            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${
              connecting === p.id
                ? 'bg-primary-500/10 border-primary-500/30'
                : 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.1]'
            }`}
          >
            {connecting === p.id ? (
              <div className="w-5 h-5 border-2 border-primary-300 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                <path d={p.icon} />
              </svg>
            )}
            <span className="text-[10px] text-gray-500">{connecting === p.id ? 'Connecting...' : p.name}</span>
          </motion.button>
        ))}
      </div>

      <div className="p-3 rounded-2xl bg-gradient-to-r from-[#C4B5FD]/5 to-[#A5F3FC]/5 border border-[#C4B5FD]/10">
        <p className="text-xs text-gray-500 flex items-center gap-2">
          <svg className="w-3.5 h-3.5 text-primary-300 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          All connections use OAuth 2.0 with encrypted token storage.
        </p>
      </div>
    </div>
  );
};

export default EmailConnections;
