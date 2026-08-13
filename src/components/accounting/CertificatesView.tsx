import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle, Key, Hash, FileText } from 'lucide-react';
import { SectionHeader } from '../ui/Base';
import { Button } from '../ui/Button';
import { AccountingCertificate } from '../../modules/accounting/types';

interface CertificatesViewProps {
  certificates: AccountingCertificate[];
  loading: boolean;
  onVerifyCertificate: (id: number) => Promise<any>;
}

export const CertificatesView: React.FC<CertificatesViewProps> = ({
  certificates,
  loading,
  onVerifyCertificate
}) => {
  const [selectedCert, setSelectedCert] = useState<AccountingCertificate | null>(null);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [verifying, setVerifying] = useState(false);

  const handleVerify = async (cert: AccountingCertificate) => {
    try {
      setSelectedCert(cert);
      setVerifying(true);
      setVerificationResult(null);
      const res = await onVerifyCertificate(cert.id);
      setVerificationResult(res);
    } catch (err: any) {
      alert(`Verification error: ${err.message}`);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="space-y-4">
      <SectionHeader title="Cryptographic Accounting Ledger Certificates" icon={ShieldCheck} />

      <div className="bg-terminal-panel border border-terminal-border p-4 rounded text-xs text-gray-300 space-y-1">
        <div className="font-bold text-white flex items-center gap-2">
          <Key className="w-4 h-4 text-terminal-amber" />
          SHA-256 Cryptographic Ledger Integrity Proofs
        </div>
        <p>
          Every posted double-entry journal posting and accounting period close automatically calculates a cryptographic SHA-256 payload digest signed with a digital RSA signature, securing ledger immutability and compliance.
        </p>
      </div>

      {/* Certificates Table */}
      <div className="bg-terminal-panel border border-terminal-border rounded overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-black/40 border-b border-terminal-border text-terminal-muted text-[10px] uppercase">
                <th className="p-3">ID</th>
                <th className="p-3">Reference Type</th>
                <th className="p-3">Reference ID</th>
                <th className="p-3">SHA-256 Certificate Digest</th>
                <th className="p-3">Digital Signature</th>
                <th className="p-3">Generated Date</th>
                <th className="p-3 text-center">Cryptographic Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-terminal-border/50">
              {certificates.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-terminal-muted">
                    No accounting certificates issued yet.
                  </td>
                </tr>
              ) : (
                certificates.map(cert => (
                  <tr key={cert.id} className="hover:bg-white/5 transition">
                    <td className="p-3 font-bold text-terminal-amber">#{cert.id}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-terminal-blue/10 border border-terminal-blue/30 text-terminal-blue">
                        {cert.referenceType}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-white">#{cert.referenceId}</td>
                    <td className="p-3 font-mono text-[10px] text-terminal-green truncate max-w-xs" title={cert.sha256Certificate}>
                      {cert.sha256Certificate.substring(0, 24)}...
                    </td>
                    <td className="p-3 font-mono text-[10px] text-terminal-amber truncate max-w-xs" title={cert.digitalSignature}>
                      {cert.digitalSignature.substring(0, 20)}...
                    </td>
                    <td className="p-3 text-terminal-muted">{new Date(cert.generatedAt).toLocaleString()}</td>
                    <td className="p-3 text-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleVerify(cert)}
                        className="text-[10px] h-6 px-2 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/20"
                      >
                        Verify Proof
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Verification Modal */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-terminal-panel border border-terminal-border rounded-lg max-w-lg w-full p-6 space-y-4 text-white font-mono">
            <div className="flex items-center justify-between border-b border-terminal-border pb-3">
              <h3 className="text-sm font-bold uppercase text-terminal-amber flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> Certificate Integrity Proof #{selectedCert.id}
              </h3>
              <button onClick={() => setSelectedCert(null)} className="text-terminal-muted hover:text-white">&times;</button>
            </div>

            {verifying ? (
              <div className="p-8 text-center text-terminal-muted text-xs animate-pulse">
                Running cryptographic verification of SHA-256 digest & signature...
              </div>
            ) : verificationResult ? (
              <div className="space-y-3 text-xs">
                <div className={`p-3 rounded border flex items-center gap-3 ${
                  verificationResult.isValid ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                }`}>
                  {verificationResult.isValid ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
                  <div>
                    <div className="font-bold text-sm">{verificationResult.verificationStatus}</div>
                    <div className="text-[10px] text-gray-300 font-sans">
                      Cryptographic hash recalculation matched database ledger record perfectly.
                    </div>
                  </div>
                </div>

                <div className="space-y-2 bg-black/40 p-3 rounded border border-terminal-border text-[10px]">
                  <div>
                    <span className="text-terminal-muted uppercase block">SHA-256 Digest:</span>
                    <span className="text-terminal-green break-all">{verificationResult.sha256Certificate}</span>
                  </div>
                  <div>
                    <span className="text-terminal-muted uppercase block">Digital Signature:</span>
                    <span className="text-terminal-amber break-all">{verificationResult.digitalSignature}</span>
                  </div>
                  <div>
                    <span className="text-terminal-muted uppercase block">Verified Timestamp:</span>
                    <span className="text-white">{verificationResult.verifiedAt}</span>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="pt-2 flex justify-end">
              <Button size="sm" variant="outline" onClick={() => setSelectedCert(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
