import { useState, useRef, useEffect } from 'react';

export function useChatSession(token) {
  const [repoUrl, setRepoUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [repoSummary, setRepoSummary] = useState(null);
  
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isAsking, setIsAsking] = useState(false);

  const [savedSessions, setSavedSessions] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, isAsking]);

  useEffect(() => {
    if (token) {
      fetchHistory();
    }
  }, [token]);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSavedSessions(data);
      }
    } catch (e) {
      console.error("Failed to load history", e);
    }
  };

  const loadSession = async (url) => {
    setRepoUrl(url);
    setIsReady(true);
    setAnalysisStatus({ type: 'success', msg: 'Loaded previous session.' });
    setRepoSummary(null);
    
    try {
      const res = await fetch(`/api/history/repo?repoUrl=${encodeURIComponent(url)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setChatHistory(data.messages || []);
      }

      const summaryRes = await fetch(`/api/summary?repoUrl=${encodeURIComponent(url)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (summaryRes.ok) {
        const summaryData = await summaryRes.json();
        if (summaryData.summary) setRepoSummary(summaryData.summary);
      }
    } catch (e) {
      console.error("Failed to load session messages or summary", e);
    }
  };

  const handleDeleteSession = async (url) => {
    try {
      const res = await fetch(`/api/history/repo?repoUrl=${encodeURIComponent(url)}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        if (repoUrl === url) {
          setRepoUrl('');
          setIsReady(false);
          setChatHistory([]);
          setAnalysisStatus(null);
          setRepoSummary(null);
        }
        fetchHistory();
      }
    } catch (e) {
      console.error("Failed to delete session", e);
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!repoUrl) return;

    if (!token || token === 'null' || token === 'undefined') {
      setAnalysisStatus({ type: 'error', msg: 'You are not logged in. Please log in to analyze a repository.' });
      return;
    }

    setIsAnalyzing(true);
    setIsReady(false);

    setAnalysisStatus({ type: 'loading', msg: 'Cloning repository, generating architecture diagram & embedding chunks...' });
    setChatHistory([]);
    setRepoSummary(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ repoUrl })
      });
      const data = await response.json();
      
      if (response.ok) {
        setAnalysisStatus({ type: 'success', msg: 'Repository analyzed and embedded successfully! You can now ask questions.' });
        setIsReady(true);
        if (data.summary) {
          setRepoSummary(data.summary);
        }
        fetchHistory();
      } else {
        setAnalysisStatus({ type: 'error', msg: data.error });
      }
    } catch (error) {
      setAnalysisStatus({ type: 'error', msg: 'Failed to connect to backend server.' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAskQuestion = async (e, customQuestion) => {
    if (e && e.preventDefault) e.preventDefault();
    const activeQuestion = (typeof customQuestion === 'string' ? customQuestion : question)?.trim();
    if (!activeQuestion || !isReady || isAsking) return;

    const newChat = [...chatHistory, { role: 'user', text: activeQuestion }];
    setChatHistory(newChat);
    setQuestion('');
    setIsAsking(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ question: activeQuestion, repoUrl })
      });
      const data = await response.json();

      if (response.ok && data.answer) {
        setChatHistory([...newChat, { role: 'agent', text: data.answer }]);
        fetchHistory();
      } else {
        setChatHistory([...newChat, { role: 'agent', text: `❌ Error: ${data.error || 'Failed to get answer.'}` }]);
      }
    } catch (error) {
      setChatHistory([...newChat, { role: 'agent', text: '❌ Error connecting to backend.' }]);
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
    isSidebarOpen, setIsSidebarOpen,
    chatContainerRef,
    loadSession,
    handleDeleteSession,
    handleAnalyze,
    handleAskQuestion
  };
}
