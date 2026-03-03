import React, { useState } from 'react';
import { Search, TrendingUp, Brain, Globe, Loader2, Check, AlertCircle, BarChart3 } from 'lucide-react';

const API_URL = 'http://localhost:5001/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('multi');
  const [query, setQuery] = useState('');
  const [selectedSources, setSelectedSources] = useState(['reddit', 'news']);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [singleText, setSingleText] = useState('');
  const [singleResult, setSingleResult] = useState(null);
  const [csvResults, setCsvResults] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const sources = [
    { id: 'reddit', name: 'Reddit', icon: '🔴', desc: 'Posts & Comments' },
    { id: 'news', name: 'News', icon: '📰', desc: 'Latest Articles' },
    { id: 'youtube', name: 'YouTube', icon: '🎥', desc: 'Video Comments' }
  ];

  const quickSearches = ['iPhone 15', 'Tesla Cybertruck', 'ChatGPT', 'Climate Change', 'Bitcoin'];

  const toggleSource = (sourceId) => {
    setSelectedSources(prev => 
      prev.includes(sourceId) 
        ? prev.filter(s => s !== sourceId)
        : [...prev, sourceId]
    );
  };

  const handleAnalyze = async () => {
    if (!query.trim()) {
      setError('Please enter a search topic');
      return;
    }

    if (selectedSources.length === 0) {
      setError('Please select at least one data source');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          sources: selectedSources,
          limit: 50
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      setResults(data);
    } catch (err) {
      setError(err.message || 'Failed to analyze. Make sure the Flask API is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  const handleSingleTextAnalysis = async () => {
    if (!singleText.trim()) {
      setError('Please enter some text to analyze');
      return;
    }

    setLoading(true);
    setError(null);
    setSingleResult(null);

    try {
      const response = await fetch(`${API_URL}/analyze-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: singleText })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      setSingleResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCsvUpload = async (event) => {
    const file = event.target.files[0];
    
    if (!file) return;
    
    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    setLoading(true);
    setError(null);
    setCsvResults(null);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_URL}/analyze-csv`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'CSV analysis failed');
      }

      setCsvResults(data);
      setUploadProgress(100);
    } catch (err) {
      setError(err.message || 'Failed to analyze CSV. Make sure it has a "review" column.');
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (sentiment) => {
    if (sentiment === 'Positive') return 'text-green-600 bg-green-50 border-green-200';
    if (sentiment === 'Negative') return 'text-red-600 bg-red-50 border-red-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getSentimentBg = (sentiment) => {
    if (sentiment === 'Positive') return 'bg-green-500';
    if (sentiment === 'Negative') return 'bg-red-500';
    return 'bg-gray-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4 flex items-center justify-center gap-3">
              <Brain className="w-12 h-12" />
              Multi-Source Sentiment Analysis
            </h1>
            <p className="text-xl text-purple-100 mb-6">
              Analyze sentiment across multiple platforms using 6 AI algorithms
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <span className="px-4 py-2 bg-white/20 rounded-full text-sm">🔴 Reddit</span>
              <span className="px-4 py-2 bg-white/20 rounded-full text-sm">📰 News</span>
              <span className="px-4 py-2 bg-white/20 rounded-full text-sm">🎥 YouTube</span>
              <span className="px-4 py-2 bg-white/20 rounded-full text-sm">🤖 6 AI Models</span>
              <span className="px-4 py-2 bg-white/20 rounded-full text-sm">📊 Real-Time</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-white rounded-lg p-2 shadow-sm">
          <button
            onClick={() => setActiveTab('multi')}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-all ${
              activeTab === 'multi'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Globe className="w-5 h-5 inline mr-2" />
            Multi-Source Analysis
          </button>
          <button
            onClick={() => setActiveTab('csv')}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-all ${
              activeTab === 'csv'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <BarChart3 className="w-5 h-5 inline mr-2" />
            CSV Upload
          </button>
          <button
            onClick={() => setActiveTab('single')}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-all ${
              activeTab === 'single'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Search className="w-5 h-5 inline mr-2" />
            Quick Test
          </button>
        </div>

        {/* Multi-Source Tab */}
        {activeTab === 'multi' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-2">🌐 Analyze Across Multiple Platforms</h2>
            <p className="text-gray-600 mb-6">
              Select data sources and get comprehensive sentiment analysis
            </p>

            {/* Source Selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-3">Select Data Sources:</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {sources.map(source => (
                  <div
                    key={source.id}
                    onClick={() => toggleSource(source.id)}
                    className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedSources.includes(source.id)
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-4xl mb-2">{source.icon}</div>
                    <div className="font-bold text-lg">{source.name}</div>
                    <div className="text-sm text-gray-600">{source.desc}</div>
                    <div className="mt-2">
                      <input
                        type="checkbox"
                        checked={selectedSources.includes(source.id)}
                        onChange={() => {}}
                        className="w-4 h-4"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Search Input */}
            <div className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
                  placeholder="Enter topic (e.g., iPhone 15, Tesla, Climate Change)"
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-lg"
                />
                <button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="px-8 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-400 transition-colors flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      Analyze
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Searches */}
            <div className="mb-6">
              <span className="text-sm text-gray-600 mr-2">Popular searches:</span>
              {quickSearches.map(search => (
                <button
                  key={search}
                  onClick={() => {
                    setQuery(search);
                    setTimeout(handleAnalyze, 100);
                  }}
                  className="inline-block px-3 py-1 mr-2 mb-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                >
                  {search}
                </button>
              ))}
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-800 font-medium">Error</p>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="text-center py-12">
                <Loader2 className="w-16 h-16 text-purple-600 animate-spin mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-700">
                  Fetching data from multiple sources...
                </p>
                <p className="text-sm text-gray-500 mt-2">This may take 20-40 seconds</p>
              </div>
            )}

            {/* Results */}
            {results && !loading && (
              <div className="mt-8 space-y-6">
                {/* Summary */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Analysis Summary
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Query:</strong> "{results.query}"</p>
                    <p><strong>Total Posts:</strong> {results.metrics.total_posts} from {Object.keys(results.source_comparison).length} source(s)</p>
                    <p><strong>Algorithm Agreement:</strong> {results.metrics.avg_agreement}% ({results.metrics.avg_agreement > 80 ? 'High consensus' : results.metrics.avg_agreement > 60 ? 'Moderate consensus' : 'Low consensus'})</p>
                  </div>
                </div>

                {/* Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white border-2 rounded-lg p-6 text-center">
                    <div className="text-3xl font-bold text-gray-800">{results.metrics.total_posts}</div>
                    <div className="text-sm text-gray-600 mt-1">Total Posts</div>
                  </div>
                  <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 text-center">
                    <div className="text-3xl font-bold text-green-600">{results.metrics.positive_percent}%</div>
                    <div className="text-sm text-gray-600 mt-1">Positive</div>
                  </div>
                  <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 text-center">
                    <div className="text-3xl font-bold text-red-600">{results.metrics.negative_percent}%</div>
                    <div className="text-sm text-gray-600 mt-1">Negative</div>
                  </div>
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 text-center">
                    <div className="text-3xl font-bold text-blue-600">{results.metrics.avg_agreement}%</div>
                    <div className="text-sm text-gray-600 mt-1">Agreement</div>
                  </div>
                </div>

                {/* Algorithm Comparison */}
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-lg font-bold mb-4">🤖 Algorithm Comparison</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left font-semibold">Algorithm</th>
                          <th className="px-4 py-2 text-center font-semibold">Positive</th>
                          <th className="px-4 py-2 text-center font-semibold">Negative</th>
                          <th className="px-4 py-2 text-center font-semibold">Neutral</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(results.algorithm_stats).map(([algo, stats]) => {
                          const total = stats.Positive + stats.Negative + stats.Neutral;
                          return (
                            <tr key={algo} className="border-t">
                              <td className="px-4 py-3 font-medium">{algo}</td>
                              <td className="px-4 py-3 text-center text-green-600">
                                {stats.Positive} ({Math.round(stats.Positive/total*100)}%)
                              </td>
                              <td className="px-4 py-3 text-center text-red-600">
                                {stats.Negative} ({Math.round(stats.Negative/total*100)}%)
                              </td>
                              <td className="px-4 py-3 text-center text-gray-600">
                                {stats.Neutral} ({Math.round(stats.Neutral/total*100)}%)
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Source Comparison */}
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-lg font-bold mb-4">📊 Source Comparison</h3>
                  {Object.entries(results.source_comparison).map(([source, stats]) => (
                    <div key={source} className="mb-4">
                      <div className="flex justify-between mb-2">
                        <span className="font-semibold">{source}</span>
                        <span className="text-sm text-gray-600">{stats.total} posts</span>
                      </div>
                      <div className="h-8 flex rounded-lg overflow-hidden">
                        <div 
                          className="bg-green-500 flex items-center justify-center text-white text-xs font-medium"
                          style={{ width: `${stats.positive_percent}%` }}
                        >
                          {stats.positive_percent > 10 && `${stats.positive_percent}%`}
                        </div>
                        <div 
                          className="bg-red-500 flex items-center justify-center text-white text-xs font-medium"
                          style={{ width: `${stats.negative_percent}%` }}
                        >
                          {stats.negative_percent > 10 && `${stats.negative_percent}%`}
                        </div>
                        <div 
                          className="bg-gray-500 flex items-center justify-center text-white text-xs font-medium"
                          style={{ width: `${stats.neutral_percent}%` }}
                        >
                          {stats.neutral_percent > 10 && `${stats.neutral_percent}%`}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Keywords */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white border rounded-lg p-6">
                    <h3 className="text-lg font-bold mb-3 text-green-600">✅ Positive Keywords</h3>
                    <div className="flex flex-wrap gap-2">
                      {results.keywords.positive.slice(0, 10).map(word => (
                        <span key={word} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                          {word}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white border rounded-lg p-6">
                    <h3 className="text-lg font-bold mb-3 text-red-600">⚠️ Negative Keywords</h3>
                    <div className="flex flex-wrap gap-2">
                      {results.keywords.negative.slice(0, 10).map(word => (
                        <span key={word} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                          {word}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sample Posts */}
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-lg font-bold mb-4">📝 Sample Posts with Multi-Algorithm Analysis</h3>
                  <div className="space-y-4">
                    {results.results.slice(0, 5).map((post, idx) => (
                      <div key={idx} className="border rounded-lg p-4 relative">
                        <div className="absolute top-2 right-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                            {post.agreement}% agree
                          </span>
                        </div>
                        <div className="flex gap-2 mb-2">
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                            {post.source} - {post.type}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium border ${getSentimentColor(post.sentiment)}`}>
                            {post.sentiment}
                          </span>
                        </div>
                        <p className="text-sm mb-2">{post.text}</p>
                        <p className="text-xs text-gray-500 mb-3">by {post.user}</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {Object.entries(post.algorithms).slice(0, 6).map(([algo, data]) => (
                            <div key={algo} className="text-xs">
                              <div className="font-medium text-gray-700">{algo}</div>
                              <div className={`inline-block px-2 py-0.5 rounded ${getSentimentColor(data.sentiment)}`}>
                                {data.sentiment}
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                                <div 
                                  className="bg-gradient-to-r from-green-500 to-blue-500 h-1.5 rounded-full"
                                  style={{ width: `${Math.round(data.confidence * 100)}%` }}
                                />
                              </div>
                              <div className="text-gray-500 mt-0.5">{Math.round(data.confidence * 100)}%</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* CSV Upload Tab */}
        {activeTab === 'csv' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-2">📊 CSV Batch Analysis</h2>
            <p className="text-gray-600 mb-6">
              Upload a CSV file with reviews for comprehensive multi-algorithm analysis
            </p>

            {/* File Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-500 transition-colors">
              <input
                type="file"
                accept=".csv"
                onChange={handleCsvUpload}
                className="hidden"
                id="csv-upload"
                disabled={loading}
              />
              <label
                htmlFor="csv-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <BarChart3 className="w-8 h-8 text-purple-600" />
                </div>
                <p className="text-lg font-medium mb-2">
                  {loading ? 'Analyzing CSV...' : 'Click to upload CSV file'}
                </p>
                <p className="text-sm text-gray-500">
                  CSV should have a "review" column (required)
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Optional columns: user, product, sentiment (for model training)
                </p>
              </label>
            </div>

            {/* Upload Progress */}
            {loading && (
              <div className="mt-6">
                <div className="flex justify-between text-sm mb-2">
                  <span>Processing...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-800 font-medium">Error</p>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* CSV Results */}
            {csvResults && !loading && (
              <div className="mt-8 space-y-6">
                {/* Summary */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                
                  <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Analysis Summary
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Total Rows</p>
                      <p className="text-2xl font-bold">{csvResults.total_rows}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Processed</p>
                      <p className="text-2xl font-bold">{csvResults.processed_rows}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Avg Agreement</p>
                      <p className="text-2xl font-bold">{csvResults.metrics.avg_agreement}%</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Positive</p>
                      <p className="text-2xl font-bold text-green-600">{csvResults.metrics.positive_percent}%</p>
                    </div>
                  </div>
                </div>

                  {/* Algorithm Agreement Metrics - Works WITHOUT ground truth */}
                {csvResults.metrics.algorithm_agreement_metrics && (
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                      🤝 Algorithm Analysis & Agreement
                      <span className="text-sm font-normal text-gray-600">(All 6 Algorithms)</span>
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Shows how each algorithm classified your reviews and their prediction confidence
                    </p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gradient-to-r from-blue-100 to-purple-100">
                          <tr>
                            <th className="px-4 py-3 text-left font-semibold">Algorithm</th>
                            <th className="px-4 py-3 text-center font-semibold">Positive Rate</th>
                            <th className="px-4 py-3 text-center font-semibold">Negative Rate</th>
                            <th className="px-4 py-3 text-center font-semibold">Neutral Rate</th>
                            <th className="px-4 py-3 text-center font-semibold">Confidence</th>
                            <th className="px-4 py-3 text-center font-semibold">Reviews Analyzed</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(csvResults.metrics.algorithm_agreement_metrics).map(([algo, metrics]) => (
                            <tr key={algo} className="border-t hover:bg-white/50">
                              <td className="px-4 py-3 font-medium">{algo}</td>
                              <td className="px-4 py-3 text-center">
                                <span className="text-green-600 font-medium">{metrics.positive_rate}%</span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className="text-red-600 font-medium">{metrics.negative_rate}%</span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className="text-gray-600 font-medium">{metrics.neutral_rate}%</span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <div className="w-20 bg-gray-200 rounded-full h-2">
                                    <div 
                                      className={`h-2 rounded-full ${
                                        metrics.confidence >= 70 ? 'bg-green-500' :
                                        metrics.confidence >= 50 ? 'bg-yellow-500' :
                                        'bg-red-500'
                                      }`}
                                      style={{ width: `${metrics.confidence}%` }}
                                    />
                                  </div>
                                  <span className="font-medium">{metrics.confidence}%</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-center text-gray-600">
                                {metrics.total_analyzed}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg text-xs text-gray-600">
                      <strong>💡 Note:</strong> Confidence shows how decisive each algorithm is. Higher confidence means 
                      the algorithm consistently chose one sentiment over others.
                    </div>
                  </div>
                )}

                {/* Model Evaluation (if sentiment column exists) */}
                {csvResults.metrics.model_evaluation && (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-lg p-6">
                      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        🎯 Overall Model Performance
                        <span className="text-sm font-normal text-gray-600">(Trained on Your Data)</span>
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center bg-white rounded-lg p-4 shadow-sm">
                          <p className="text-3xl font-bold text-green-600">
                            {(csvResults.metrics.model_evaluation.accuracy * 100).toFixed(1)}%
                          </p>
                          <p className="text-sm text-gray-600 mt-1">F1 Score</p>
                          <p className="text-xs text-gray-500 mt-1">Balanced measure</p>
                        </div>
                      </div>
                    </div>

                    {/* Individual Algorithm Metrics */}
                    {csvResults.metrics.algorithm_metrics && (
                      <div className="bg-white border rounded-lg p-6">
                        <h3 className="text-lg font-bold mb-4">📊 Detailed Algorithm Metrics</h3>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-gradient-to-r from-purple-50 to-blue-50">
                              <tr>
                                <th className="px-4 py-3 text-left font-semibold">Algorithm</th>
                                <th className="px-4 py-3 text-center font-semibold">Accuracy</th>
                                <th className="px-4 py-3 text-center font-semibold">Precision</th>
                                <th className="px-4 py-3 text-center font-semibold">Recall</th>
                                <th className="px-4 py-3 text-center font-semibold">F1 Score</th>
                                <th className="px-4 py-3 text-center font-semibold">MAE</th>
                                <th className="px-4 py-3 text-center font-semibold">RMSE</th>
                              </tr>
                            </thead>
                            <tbody>
                              {Object.entries(csvResults.metrics.algorithm_metrics).map(([algo, metrics]) => (
                                <tr key={algo} className="border-t hover:bg-gray-50">
                                  <td className="px-4 py-3 font-medium">{algo}</td>
                                  <td className="px-4 py-3 text-center">
                                    <span className={`inline-block px-2 py-1 rounded ${
                                      metrics.accuracy >= 0.8 ? 'bg-green-100 text-green-700' :
                                      metrics.accuracy >= 0.6 ? 'bg-yellow-100 text-yellow-700' :
                                      'bg-red-100 text-red-700'
                                    }`}>
                                      {(metrics.accuracy * 100).toFixed(1)}%
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <span className="text-blue-600 font-medium">
                                      {(metrics.precision * 100).toFixed(1)}%
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <span className="text-purple-600 font-medium">
                                      {(metrics.recall * 100).toFixed(1)}%
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <span className="text-orange-600 font-medium">
                                      {(metrics.f1_score * 100).toFixed(1)}%
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-center text-gray-600">
                                    {metrics.mae.toFixed(3)}
                                  </td>
                                  <td className="px-4 py-3 text-center text-gray-600">
                                    {metrics.rmse.toFixed(3)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        
                        {/* Metrics Legend */}
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-semibold text-sm mb-2">📖 Metrics Guide:</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600">
                            <div><strong>Accuracy:</strong> % of correct predictions overall</div>
                            <div><strong>Precision:</strong> % of positive predictions that were correct</div>
                            <div><strong>Recall:</strong> % of actual positives correctly identified</div>
                            <div><strong>F1 Score:</strong> Balanced average of precision & recall</div>
                            <div><strong>MAE:</strong> Mean Absolute Error (lower is better)</div>
                            <div><strong>RMSE:</strong> Root Mean Square Error (lower is better)</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {/* Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 text-center">
                    <div className="text-3xl font-bold text-green-600">{csvResults.metrics.positive_count}</div>
                    <div className="text-sm text-gray-600 mt-1">Positive ({csvResults.metrics.positive_percent}%)</div>
                  </div>
                  <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 text-center">
                    <div className="text-3xl font-bold text-red-600">{csvResults.metrics.negative_count}</div>
                    <div className="text-sm text-gray-600 mt-1">Negative ({csvResults.metrics.negative_percent}%)</div>
                  </div>
                  <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6 text-center">
                    <div className="text-3xl font-bold text-gray-600">{csvResults.metrics.neutral_count}</div>
                    <div className="text-sm text-gray-600 mt-1">Neutral ({csvResults.metrics.neutral_percent}%)</div>
                  </div>
                </div>

                {/* Algorithm Comparison */}
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-lg font-bold mb-4">🤖 Algorithm Comparison</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left font-semibold">Algorithm</th>
                          <th className="px-4 py-2 text-center font-semibold">Positive</th>
                          <th className="px-4 py-2 text-center font-semibold">Negative</th>
                          <th className="px-4 py-2 text-center font-semibold">Neutral</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(csvResults.algorithm_stats).map(([algo, stats]) => {
                          const total = stats.Positive + stats.Negative + stats.Neutral;
                          return (
                            <tr key={algo} className="border-t">
                              <td className="px-4 py-3 font-medium">{algo}</td>
                              <td className="px-4 py-3 text-center text-green-600">
                                {stats.Positive} ({Math.round(stats.Positive/total*100)}%)
                              </td>
                              <td className="px-4 py-3 text-center text-red-600">
                                {stats.Negative} ({Math.round(stats.Negative/total*100)}%)
                              </td>
                              <td className="px-4 py-3 text-center text-gray-600">
                                {stats.Neutral} ({Math.round(stats.Neutral/total*100)}%)
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Product Analysis */}
                {Object.keys(csvResults.product_analysis).length > 1 && (
                  <div className="bg-white border rounded-lg p-6">
                    <h3 className="text-lg font-bold mb-4">📦 Product Analysis</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left font-semibold">Product</th>
                            <th className="px-4 py-2 text-center font-semibold">Avg Rating</th>
                            <th className="px-4 py-2 text-center font-semibold">Review Count</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(csvResults.product_analysis).map(([product, data]) => (
                            <tr key={product} className="border-t">
                              <td className="px-4 py-3 font-medium">{product}</td>
                              <td className="px-4 py-3 text-center">
                                <span className={`px-2 py-1 rounded ${
                                  data.avg_rating >= 4 ? 'bg-green-100 text-green-700' :
                                  data.avg_rating >= 3 ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {data.avg_rating}/5
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center">{data.count}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Keywords */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white border rounded-lg p-6">
                    <h3 className="text-lg font-bold mb-3 text-green-600">✅ Positive Keywords</h3>
                    <div className="flex flex-wrap gap-2">
                      {csvResults.keywords.positive.slice(0, 10).map(word => (
                        <span key={word} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                          {word}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white border rounded-lg p-6">
                    <h3 className="text-lg font-bold mb-3 text-red-600">⚠️ Negative Keywords</h3>
                    <div className="flex flex-wrap gap-2">
                      {csvResults.keywords.negative.slice(0, 10).map(word => (
                        <span key={word} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                          {word}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sample Reviews */}
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-lg font-bold mb-4">📝 Sample Reviews</h3>
                  <div className="space-y-3">
                    {csvResults.results.slice(0, 10).map((review) => (
                      <div key={review.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex gap-2">
                            <span className="text-sm text-gray-600">{review.user}</span>
                            {review.product !== 'N/A' && (
                              <span className="text-sm text-gray-400">• {review.product}</span>
                            )}
                          </div>
                          <div className="flex gap-2 items-center">
                            <span className={`px-2 py-1 rounded text-xs font-medium border ${getSentimentColor(review.sentiment)}`}>
                              {review.sentiment}
                            </span>
                            <span className="text-xs text-gray-500">{review.agreement}% agree</span>
                          </div>
                        </div>
                        <p className="text-sm">{review.review}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Single Text Tab */}
        {activeTab === 'single' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-2">✍️ Quick Sentiment Test</h2>
            <p className="text-gray-600 mb-6">Test any text with all algorithms instantly</p>

            <textarea
              value={singleText}
              onChange={(e) => setSingleText(e.target.value)}
              placeholder="Enter any text, review, or opinion..."
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none mb-4"
              rows="4"
            />

            <button
              onClick={handleSingleTextAnalysis}
              disabled={loading}
              className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Analyze with All Algorithms
                </>
              )}
            </button>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {singleResult && (
              <div className="mt-6 space-y-4">
                <div className={`p-6 border-2 rounded-lg ${getSentimentColor(singleResult.consensus)}`}>
                  <h3 className="text-xl font-bold mb-2">Result: {singleResult.consensus}</h3>
                  <p className="text-sm italic mb-2">"{singleResult.text}"</p>
                  <p className="text-sm">Agreement: {singleResult.agreement}%</p>
                </div>

                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-lg font-bold mb-4">Algorithm Breakdown</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(singleResult.algorithms).map(([algo, data]) => (
                      <div key={algo} className="border rounded-lg p-4">
                        <div className="font-semibold mb-2">{algo}</div>
                        <div className={`inline-block px-3 py-1 rounded-full font-medium ${getSentimentColor(data.sentiment)}`}>
                          {data.sentiment}
                        </div>
                        <div className="mt-2">
                          <div className="text-sm text-gray-600 mb-1">Confidence: {Math.round(data.confidence * 100)}%</div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all"
                              style={{ width: `${Math.round(data.confidence * 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}