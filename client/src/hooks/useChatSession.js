import { useState, useRef, useEffect, useCallback } from 'react';

export function useChatSession(token, onUnauthorized) {
  const [repoUrl, setRepoUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [repoSummary, setRepoSummary] = useState(null);

  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isAsking, setIsAsking] = useState(false);

  const [savedSessions, setSavedSessions] = useState([]);

  const chatContainerRef = useRef(null);

  useEffect(() => {
    const el = chatContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [chatHistory, isAsking]);

  // Kept in a ref: the callback is recreated on every render, and depending on it
  // directly would re-run the history fetch in a loop.
  const onUnauthorizedRef = useRef(onUnauthorized);
  useEffect(() => {
    onUnauthorizedRef.current = onUnauthorized;
  });

  // Every call carries the token; a 401 means it expired, so sign out instead of failing quietly.
  const apiFetch = useCallback(
    async (path, options = {}) => {
      const res = await fetch(path, {
        ...options,
        headers: { ...options.headers, Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) onUnauthorizedRef.current?.();
      return res;
    },
    [token],
  );

  const fetchHistory = useCallback(async () => {
    try {
      const res = await apiFetch('/api/history');
      if (res.ok) setSavedSessions(await res.json());
    } catch (e) {
      console.error('Failed to load history', e);
    }
  }, [apiFetch]);

  useEffect(() => {
    if (token) fetchHistory();
  }, [token, fetchHistory]);

  const startNew = () => {
    setRepoUrl('');
    setIsReady(false);
    setChatHistory([]);
    setAnalysisStatus(null);
    setRepoSummary(null);
    setQuestion('');
  };

  const loadSession = async (url) => {
    setRepoUrl(url);
    setIsReady(true);
    setAnalysisStatus(null);
    setRepoSummary(null);
    setChatHistory([]);

    try {
      const res = await apiFetch(`/api/history/repo?repoUrl=${encodeURIComponent(url)}`);
      if (res.ok) {
        const data = await res.json();
        setChatHistory(data.messages || []);
      }

      const summaryRes = await apiFetch(`/api/summary?repoUrl=${encodeURIComponent(url)}`);
      if (summaryRes.ok) {
        const summaryData = await summaryRes.json();
        if (summaryData.summary) setRepoSummary(summaryData.summary);
      }
    } catch (e) {
      console.error('Failed to load session messages or summary', e);
    }
  };

  const handleDeleteSession = async (url) => {
    try {
      const res = await apiFetch(`/api/history/repo?repoUrl=${encodeURIComponent(url)}`, { method: 'DELETE' });
      if (res.ok) {
        if (repoUrl === url) startNew();
        fetchHistory();
      }
    } catch (e) {
      console.error('Failed to delete session', e);
    }
  };

  const handleAnalyze = async (e) => {
    e?.preventDefault();
    if (!repoUrl) return;

    setIsAnalyzing(true);
    setIsReady(false);
    setAnalysisStatus({ type: 'loading', msg: 'Reading files, embedding chunks and writing a summary.' });
    setChatHistory([]);
    setRepoSummary(null);

    try {
      const response = await apiFetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl }),
      });
      const data = await response.json();

      if (response.ok) {
        setAnalysisStatus(null);
        setIsReady(true);
        if (data.summary) setRepoSummary(data.summary);
        fetchHistory();
      } else {
        setAnalysisStatus({ type: 'error', msg: data.error || 'The repository couldn’t be indexed.' });
      }
    } catch {
      setAnalysisStatus({ type: 'error', msg: 'Couldn’t reach the server. Check your connection and try again.' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAskQuestion = async (e, customQuestion) => {
    if (e?.preventDefault) e.preventDefault();
    const activeQuestion = (typeof customQuestion === 'string' ? customQuestion : question)?.trim();
    if (!activeQuestion || !isReady || isAsking) return;

    const newChat = [...chatHistory, { role: 'user', text: activeQuestion }];
    setChatHistory(newChat);
    setQuestion('');
    setIsAsking(true);

    try {
      const response = await apiFetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: activeQuestion, repoUrl }),
      });
      const data = await response.json();

      if (response.ok && data.answer) {
        setChatHistory([...newChat, { role: 'agent', text: data.answer }]);
        fetchHistory();
      } else {
        setChatHistory([...newChat, { role: 'agent', error: true, text: data.error || 'No answer came back.' }]);
      }
    } catch {
      setChatHistory([...newChat, { role: 'agent', error: true, text: 'Couldn’t reach the server.' }]);
    } finally {
      setIsAsking(false);
    }
  };

  return {
    repoUrl, setRepoUrl,
    isAnalyzing,
    analysisStatus,
    isReady,
    repoSummary,
    question, setQuestion,
    chatHistory,
    isAsking,
    savedSessions,
    chatContainerRef,
    startNew,
    loadSession,
    handleDeleteSession,
    handleAnalyze,
    handleAskQuestion,
  };
}
