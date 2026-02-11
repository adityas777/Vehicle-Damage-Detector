
import React from 'react';
import { ClaimsInformation } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface ClaimsGuideProps {
    claimsInfo: ClaimsInformation | null;
}

const ClaimsGuide: React.FC<ClaimsGuideProps> = ({ claimsInfo }) => {
    if (!claimsInfo) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center min-h-[40vh]">
                <LoadingSpinner />
                <p className="text-lg mt-4 text-brand-gray">Loading claims information...</p>
            </div>
        );
    }
    return (
        <div className="space-y-8 p-4 bg-gray-900/50 rounded-lg animate-fade-in">
            <div>
                <h3 className="text-2xl font-bold text-white mb-4">Eligible Claims</h3>
                <div className="space-y-4">
                    {claimsInfo.eligibleClaims.map((claim, index) => (
                        <div key={index} className="bg-gray-800 p-4 rounded-lg border border-gray-700 transition-all duration-300 hover:border-brand-primary/50 hover:shadow-glow-primary-light transition-shadow">
                            <h4 className="font-semibold text-brand-primary">{claim.claimType}</h4>
                            <p className="text-gray-300 mt-1">{claim.description}</p>
                        </div>
                    ))}
                </div>
            </div>
             <div>
                <h3 className="text-2xl font-bold text-white mb-4">Claim Filing Procedure</h3>
                <div className="bg-gray-800 p-5 rounded-lg border border-gray-700 transition-all duration-300 hover:border-brand-primary/50 hover:shadow-glow-primary-light transition-shadow">
                    <ol className="list-decimal list-inside space-y-3 text-gray-300">
                        {claimsInfo.claimProcedure.map((step, index) => <li key={index}>{step}</li>)}
                    </ol>
                </div>
            </div>
             <div>
                <h3 className="text-2xl font-bold text-white mb-4">Required Documents</h3>
                <div className="bg-gray-800 p-5 rounded-lg border border-gray-700 transition-all duration-300 hover:border-brand-primary/50 hover:shadow-glow-primary-light transition-shadow">
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-gray-300">
                        {claimsInfo.requiredDocuments.map((doc, index) => 
                            <li key={index} className="list-disc list-inside">{doc}</li>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ClaimsGuide;
