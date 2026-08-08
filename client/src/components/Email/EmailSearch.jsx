import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useEmail from '../../hooks/useEmail';
import EmailCard from './EmailCard';

const EmailSearch = () => {
  const { smartSearch, searchResults, setSearchResults, emails } = useEmail();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleSearch = (value) => {
    setQuery(value);
    if (value.trim().length > 1) {
      smartSearch(value);
      setIsOpen(true);
    } else {
      setSearchResults([]);
      setIsOpen(false);
    }
  };

  const suggestions = [
    'Show unread emails',
    'Show emails from HR',
    'Show invoices',
    'Show emails from yesterday',
    'Show emails waiting for reply',
    'Show high priority emails',
  ];

  return (
    <div className="relative">
      <div className="relative">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search emails naturally... (e.g. 'Show unread from HR')"
          className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/30 transition-all"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setSearchResults([]); setIsOpen(false); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {!query && (
        <div className="flex gap-2 mt-3 flex-wrap">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => { setQuery(s); handleSearch(s); }}
              className="px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.04] text-[11px] text-gray-600 hover:text-gray-400 hover:bg-white/[0.06] transition-all"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {isOpen && searchResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 space-y-2 max-h-96 overflow-y-auto scrollbar-thin"
          >
            <p className="text-xs text-gray-500 mb-2">Found {searchResults.length} results</p>
            {searchResults.map((e, i) => (
              <EmailCard key={e.id} email={e} index={i} compact />
            ))}
          </motion.div>
        )}
        {isOpen && query && searchResults.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 p-6 rounded-2xl bg-white/[0.03] text-center"
          >
            <p className="text-sm text-gray-500">No emails match "{query}"</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EmailSearch;
