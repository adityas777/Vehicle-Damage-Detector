
import React, { useState, useCallback } from 'react';
import { AnalysisResult, ClaimsInformation } from './types';
import { analyzeVehicleDamage, generateClaimsGuide } from './services/geminiService';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import DamageReport from './components/DamageReport';
import LoadingSpinner from './components/LoadingSpinner';

const App: React.FC = () => {
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[] | null>(null);
  const [claimsInfo, setClaimsInfo] = useState<ClaimsInformation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleFileAnalysis = useCallback(async (files: File[]) => {
    if (files.length === 0) return;

    setIsLoading(true);
    setError(null);
    setAnalysisResults(null);
    setClaimsInfo(null);

    try {
      setLoadingMessage('Performing advanced vehicle analysis...');
      const previews = files.map(file => URL.createObjectURL(file));
      const analyses = await Promise.all(
        files.map(file => analyzeVehicleDamage(file))
      );
      
      const results: AnalysisResult[] = previews.map((preview, index) => ({
        image: preview,
        analysis: analyses[index],
      }));
      setAnalysisResults(results);

      setLoadingMessage('Generating tailored insurance guide...');
      const summary = results
        .flatMap(r => r.analysis.damages)
        .map(d => `${d.severity} ${d.damageType} on ${d.location}`)
        .join('; ');
      
      if (summary) {
        const claimsData = await generateClaimsGuide(summary);
        setClaimsInfo(claimsData);
      } else {
         setClaimsInfo({
          eligibleClaims: [{claimType: "No Claim Recommended", description: "No significant damage was detected that would typically warrant an insurance claim."}],
          claimProcedure: ["No action is needed at this time."],
          requiredDocuments: ["None, as no claim is being filed."],
        });
      }

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred during analysis.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, []);

  const handleReset = () => {
    setAnalysisResults(null);
    setClaimsInfo(null);
    setError(null);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-brand-dark text-brand-light font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center text-center h-96">
            <LoadingSpinner />
            <p className="text-lg mt-4 text-brand-primary">{loadingMessage}</p>
            <p className="text-sm text-brand-gray">Our advanced AI is performing a detailed analysis. This may take a bit longer.</p>
          </div>
        ) : error ? (
           <div className="text-center p-8 bg-red-900/50 border border-red-500 rounded-lg">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Analysis Failed</h2>
            <p className="text-red-300 mb-6">{error}</p>
            <button
              onClick={handleReset}
              className="px-6 py-2 bg-brand-primary hover:bg-brand-secondary text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-glow-primary"
            >
              Try Again
            </button>
          </div>
        ) : analysisResults ? (
          <DamageReport results={analysisResults} claimsInfo={claimsInfo} onReset={handleReset} />
        ) : (
          <FileUpload onFilesSelected={handleFileAnalysis} />
        )}
      </main>
      <footer className="text-center p-4 text-xs text-gray-500">
        <p>&copy; {new Date().getFullYear()} AI Vehicle Damage Detector. All rights reserved.</p>
        <p>Estimates are for informational purposes only and not a guarantee of cost.</p>
      </footer>
    </div>
  );
};

export default App;
