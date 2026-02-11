import React, { useRef, useState } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { AnalysisResult, ClaimsInformation } from '../types';
import ClaimsGuide from './ClaimsGuide';
import Chatbot from './Chatbot';

interface DamageReportProps {
  results: AnalysisResult[];
  claimsInfo: ClaimsInformation | null;
  onReset: () => void;
}

const DownloadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const RestartIcon: React.FC = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 4l1.5 1.5A9 9 0 0112 3v0a9 9 0 017.5 13.5M20 20l-1.5-1.5A9 9 0 0012 21v0a9 9 0 00-7.5-13.5" />
    </svg>
);

const SeverityBadge: React.FC<{ severity: 'Low' | 'Medium' | 'High' }> = ({ severity }) => {
  const severityClasses = {
    Low: 'bg-severity-low text-green-100',
    Medium: 'bg-severity-medium text-orange-100',
    High: 'bg-severity-high text-red-100',
  };
  return (
    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${severityClasses[severity]}`}>
      {severity}
    </span>
  );
};

// FIX: Define a specific type for tab names to ensure type safety.
type ActiveTab = 'details' | 'claims' | 'chat';

const TabButton: React.FC<{
    tabName: ActiveTab;
    currentTab: ActiveTab;
    setTab: (tabName: ActiveTab) => void;
    children: React.ReactNode;
}> = ({ tabName, currentTab, setTab, children }) => {
    const isActive = tabName === currentTab;
    return (
        <button
            onClick={() => setTab(tabName)}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-all duration-300 relative ${isActive ? 'text-white' : 'text-brand-gray hover:text-white'}`}
        >
            {children}
            {isActive && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary shadow-glow-primary-light"></div>}
        </button>
    );
};


const DamageReport: React.FC<DamageReportProps> = ({ results, claimsInfo, onReset }) => {
  const reportRef = useRef<HTMLDivElement>(null);
  // FIX: Use the ActiveTab type for the state to fix type errors.
  const [activeTab, setActiveTab] = useState<ActiveTab>('details');

  const handleDownloadPdf = () => {
    const input = reportRef.current;
    if (!input) return;

    // Temporarily show all sections for PDF generation
    const tabContent = input.querySelectorAll('[data-tab-content]');
    tabContent.forEach(el => (el as HTMLElement).style.display = 'block');
    const originalBackgroundColor = document.body.style.backgroundColor;
    document.body.style.backgroundColor = '#111827'; // Ensure PDF has dark BG

    html2canvas(input, { scale: 2, backgroundColor: '#111827' }).then(canvas => {
      // Restore view
      document.body.style.backgroundColor = originalBackgroundColor;
      tabContent.forEach(el => (el as HTMLElement).style.display = '');
      (input.querySelector(`[data-tab-content="${activeTab}"]`) as HTMLElement).style.display = 'block';

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgProps= pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();

      while (heightLeft > 0) {
        position = position - pdf.internal.pageSize.getHeight();
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
      }
      pdf.save('vehicle-damage-report.pdf');
    });
  };

  const grandTotalCost = results.reduce((total, result) => total + result.analysis.totalEstimatedCostINR, 0);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Damage Assessment Report</h2>
          <p className="text-brand-gray">AI-generated analysis of your vehicle's condition.</p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={handleDownloadPdf} className="flex items-center justify-center px-4 py-2 bg-brand-secondary text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-glow-primary transition-shadow">
            <DownloadIcon/> Download PDF
          </button>
           <button onClick={onReset} className="flex items-center justify-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-glow-primary-light transition-shadow">
            <RestartIcon/> New Analysis
          </button>
        </div>
      </div>

      <div className="bg-gray-900/50 rounded-xl border border-gray-700 p-4 md:p-8">
          <div className="bg-brand-dark rounded-lg p-6 mb-8 text-center border border-brand-primary/30 shadow-lg relative overflow-hidden">
             <div className="absolute inset-0 bg-grid-pattern bg-grid-pattern opacity-20"></div>
             <div className="absolute inset-0 bg-radial-spotlight"></div>
            <h3 className="text-lg font-semibold text-brand-gray uppercase tracking-wider relative z-10">Grand Total Estimated Repair Cost</h3>
            <p className="text-5xl font-extrabold text-brand-primary my-2 relative z-10">
              ₹{grandTotalCost.toLocaleString('en-IN')}
            </p>
            <p className="text-sm text-brand-gray relative z-10">Based on {results.length} analyzed image{results.length > 1 ? 's' : ''}.</p>
          </div>
          
          <div className="border-b border-gray-700 mb-6">
              <nav className="flex space-x-2" aria-label="Tabs">
                  <TabButton tabName="details" currentTab={activeTab} setTab={setActiveTab}>Damage Details</TabButton>
                  <TabButton tabName="claims" currentTab={activeTab} setTab={setActiveTab}>Claims Guide</TabButton>
                  <TabButton tabName="chat" currentTab={activeTab} setTab={setActiveTab}>AI Assistant</TabButton>
              </nav>
          </div>

          <div ref={reportRef}>
              <div data-tab-content="details" className={activeTab === 'details' ? 'block animate-fade-in' : 'hidden'}>
                  <div className="space-y-12">
                      {results.map((result, index) => (
                          <div key={index} className="bg-brand-dark/50 p-6 rounded-lg border border-gray-800 shadow-md transition-all duration-300 hover:border-brand-primary/50 hover:shadow-glow-primary-light transition-shadow">
                              <h3 className="text-2xl font-bold mb-4 text-white">Analysis for Image {index + 1}</h3>
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                  <div>
                                      <img src={result.image} alt={`Vehicle damage ${index + 1}`} className="rounded-lg object-cover w-full aspect-video border-2 border-gray-700" />
                                  </div>
                                  <div className="flex flex-col gap-4">
                                      <div className="bg-gray-800 rounded-lg p-4 text-center border border-gray-700">
                                          <h4 className="text-md font-semibold text-brand-gray uppercase tracking-wider">Image Estimated Cost</h4>
                                          <p className="text-3xl font-bold text-brand-primary my-1">
                                              ₹{result.analysis.totalEstimatedCostINR.toLocaleString('en-IN')}
                                          </p>
                                      </div>
                                      <div>
                                          <h4 className="text-xl font-bold mb-2 text-white">Factors Affecting Cost</h4>
                                          <ul className="space-y-1 list-disc list-inside text-gray-300 bg-gray-800 p-4 rounded-lg border border-gray-700">
                                              {result.analysis.costFactors.map((factor, fIndex) => <li key={fIndex}>{factor}</li>)}
                                          </ul>
                                      </div>
                                  </div>
                              </div>

                              <div className="mt-8">
                                  <h4 className="text-xl font-bold mb-4 text-white">Detected Damages</h4>
                                  <div className="overflow-x-auto">
                                      <table className="w-full text-left table-auto">
                                          <thead className="bg-gray-800/50">
                                              <tr>
                                                  <th className="p-4 font-semibold text-gray-300">Damage Type</th>
                                                  <th className="p-4 font-semibold text-gray-300">Location</th>
                                                  <th className="p-4 font-semibold text-gray-300">Severity</th>
                                                  <th className="p-4 font-semibold text-gray-300 text-right">Est. Cost (INR)</th>
                                                  <th className="p-4 font-semibold text-gray-300 text-right">Confidence</th>
                                              </tr>
                                          </thead>
                                          <tbody>
                                              {result.analysis.damages.length > 0 ? (
                                                  result.analysis.damages.map((damage, dIndex) => (
                                                      <tr key={dIndex} className="border-b border-gray-800 hover:bg-brand-dark/50 transition-colors duration-200">
                                                          <td className="p-4 align-top text-gray-200">{damage.damageType}</td>
                                                          <td className="p-4 align-top text-gray-200">{damage.location}</td>
                                                          <td className="p-4 align-top"><SeverityBadge severity={damage.severity} /></td>
                                                          <td className="p-4 align-top text-right font-mono text-gray-200">₹{damage.estimatedCostINR.toLocaleString('en-IN')}</td>
                                                          <td className="p-4 align-top text-right font-mono text-gray-200">{(damage.confidenceScore * 100).toFixed(1)}%</td>
                                                      </tr>
                                                  ))
                                              ) : (
                                                  <tr>
                                                      <td colSpan={5} className="p-4 text-center text-gray-400">No damages detected in this image.</td>
                                                  </tr>
                                              )}
                                          </tbody>
                                      </table>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
              <div data-tab-content="claims" className={activeTab === 'claims' ? 'block animate-fade-in' : 'hidden'}>
                  <ClaimsGuide claimsInfo={claimsInfo} />
              </div>
              <div data-tab-content="chat" className={activeTab === 'chat' ? 'block animate-fade-in' : 'hidden'}>
                  <Chatbot analysisResults={results} />
              </div>
          </div>
      </div>
    </div>
  );
};

export default DamageReport;
