import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './config';

function App() {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);
  
  // Loan state
  const [currentLoan, setCurrentLoan] = useState(null);
  const [myContribution, setMyContribution] = useState('0');
  const [totalFunded, setTotalFunded] = useState('0');
  
  // Form states
  const [loanAmount, setLoanAmount] = useState('');
  const [loanDuration, setLoanDuration] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [fundAmount, setFundAmount] = useState('');
  const [repayAmount, setRepayAmount] = useState('');

  // Check if MetaMask is installed on component mount
  useEffect(() => {
    const checkMetaMask = () => {
      if (typeof window.ethereum !== 'undefined') {
        setIsMetaMaskInstalled(true);
        console.log('✅ MetaMask is installed!');
      } else {
        setIsMetaMaskInstalled(false);
        console.log('❌ MetaMask is NOT installed');
      }
    };
    
    checkMetaMask();
    
    // Listen for MetaMask installation
    window.addEventListener('ethereum#initialized', checkMetaMask);
    
    return () => {
      window.removeEventListener('ethereum#initialized', checkMetaMask);
    };
  }, []);

  // Connect wallet
  const connectWallet = async () => {
    console.log('🔄 Attempting to connect wallet...');
    
    try {
      setError('');
      setLoading(true);
      
      // Check if MetaMask is installed
      if (typeof window.ethereum === 'undefined') {
        const errorMsg = 'MetaMask is not installed! Please install MetaMask extension from metamask.io';
        setError(errorMsg);
        console.error('❌', errorMsg);
        window.open('https://metamask.io/download/', '_blank');
        return;
      }

      console.log('✅ MetaMask detected, requesting accounts...');

      // Request account access
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      
      console.log('✅ Accounts received:', accounts);

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please unlock MetaMask.');
      }

      const signer = await provider.getSigner();
      const network = await provider.getNetwork();
      
      console.log('✅ Connected to network:', network.name, 'Chain ID:', network.chainId);
      
      // Check if on correct network
      if (network.chainId !== 11155111n) { // Sepolia chainId
        setError('⚠️ Please switch to Sepolia Test Network in MetaMask!');
        console.warn('⚠️ Wrong network. Expected Sepolia (11155111), got:', network.chainId);
      }

      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      console.log('✅ Contract initialized at:', CONTRACT_ADDRESS);

      setProvider(provider);
      setSigner(signer);
      setAccount(accounts[0]);
      setContract(contract);
      setSuccess('✅ Wallet connected successfully!');
      console.log('🎉 Connection successful! Account:', accounts[0]);
      
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      console.error('❌ Connection error:', err);
      
      let errorMessage = 'Failed to connect wallet';
      
      if (err.code === 4001) {
        errorMessage = 'Connection rejected. Please approve the connection in MetaMask.';
      } else if (err.code === -32002) {
        errorMessage = 'Connection request pending. Please open MetaMask and approve.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Load loan data
  const loadLoanData = async () => {
    if (!contract || !account) return;
    
    try {
      const loan = await contract.currentLoan();
      
      if (loan.targetAmount > 0) {
        setCurrentLoan({
          borrower: loan.borrower,
          targetAmount: ethers.formatEther(loan.targetAmount),
          durationSeconds: Number(loan.durationSeconds),
          interestRate: Number(loan.interestRate) / 10,
          fundedAt: Number(loan.fundedAt),
          canceled: loan.canceled,
          repaid: loan.repaid
        });
        
        // Get user's contribution
        const contrib = await contract.contribution(account);
        setMyContribution(ethers.formatEther(contrib));
        
        // Calculate total funded
        const balance = await provider.getBalance(CONTRACT_ADDRESS);
        setTotalFunded(ethers.formatEther(balance));
      } else {
        setCurrentLoan(null);
      }
    } catch (err) {
      console.error('Error loading loan data:', err);
    }
  };

  // Create loan
  const createLoan = async (e) => {
    e.preventDefault();
    if (!contract) return;

    try {
      setLoading(true);
      setError('');
      
      const amountWei = ethers.parseEther(loanAmount);
      const durationSec = Number(loanDuration) * 86400;
      const rateInBasisPoints = Number(interestRate) * 10;

      const tx = await contract.createLoan(amountWei, durationSec, rateInBasisPoints);
      await tx.wait();
      
      setSuccess('Loan created successfully!');
      setLoanAmount('');
      setLoanDuration('');
      setInterestRate('');
      await loadLoanData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to create loan: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fund loan
  const fundLoan = async (e) => {
    e.preventDefault();
    if (!contract) return;

    try {
      setLoading(true);
      setError('');
      
      const amountWei = ethers.parseEther(fundAmount);
      const tx = await contract.fundLoan({ value: amountWei });
      await tx.wait();
      
      setSuccess('Loan funded successfully!');
      setFundAmount('');
      await loadLoanData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to fund loan: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Repay loan
  const repayLoan = async (e) => {
    e.preventDefault();
    if (!contract) return;

    try {
      setLoading(true);
      setError('');
      
      const amountWei = ethers.parseEther(repayAmount);
      const tx = await contract.repayLoan({ value: amountWei });
      await tx.wait();
      
      setSuccess('Loan repaid successfully!');
      setRepayAmount('');
      await loadLoanData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to repay loan: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Withdraw as lender
  const withdrawFunds = async () => {
    if (!contract) return;

    try {
      setLoading(true);
      setError('');
      
      const tx = await contract.withdrawAsLender();
      await tx.wait();
      
      setSuccess('Funds withdrawn successfully!');
      await loadLoanData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to withdraw: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Cancel loan
  const cancelLoan = async () => {
    if (!contract) return;

    try {
      setLoading(true);
      setError('');
      
      const tx = await contract.cancelLoan();
      await tx.wait();
      
      setSuccess('Loan canceled successfully!');
      await loadLoanData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to cancel loan: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Calculate repayment amount
  const calculateRepayment = () => {
    if (!currentLoan) return '0';
    const principal = parseFloat(currentLoan.targetAmount);
    const rate = parseFloat(currentLoan.interestRate) / 100;
    return (principal * (1 + rate)).toFixed(4);
  };

  // Calculate time remaining
  const getTimeRemaining = () => {
    if (!currentLoan || currentLoan.fundedAt === 0) return 'Not funded yet';
    
    const now = Math.floor(Date.now() / 1000);
    const deadline = currentLoan.fundedAt + currentLoan.durationSeconds;
    const remaining = deadline - now;
    
    if (remaining <= 0) return 'Expired';
    
    const days = Math.floor(remaining / 86400);
    const hours = Math.floor((remaining % 86400) / 3600);
    return `${days}d ${hours}h`;
  };

  // Get loan status
  const getLoanStatus = () => {
    if (!currentLoan) return { text: 'No active loan', class: 'badge-info' };
    if (currentLoan.repaid) return { text: 'Repaid', class: 'badge-success' };
    if (currentLoan.canceled) return { text: 'Canceled', class: 'badge-danger' };
    if (currentLoan.fundedAt === 0) return { text: 'Waiting for funding', class: 'badge-warning' };
    return { text: 'Active', class: 'badge-success' };
  };

  // Auto-load data when wallet connects
  useEffect(() => {
    if (contract && account) {
      loadLoanData();
      const interval = setInterval(loadLoanData, 10000);
      return () => clearInterval(interval);
    }
  }, [contract, account]);

  return (
    <div className="app">
      <header>
        <h1>🤝 P2P Lending DApp</h1>
        <p>Decentralized Peer-to-Peer Lending Platform</p>
      </header>

      {!account ? (
        <div className="section">
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <h2>Welcome to P2P Lending</h2>
            <p style={{ margin: '20px 0', color: '#666' }}>
              Connect your wallet to get started
            </p>
            
            {!isMetaMaskInstalled && (
              <div className="error" style={{ marginBottom: '20px' }}>
                ⚠️ MetaMask is not installed!
                <br />
                <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer" 
                   style={{ color: '#667eea', textDecoration: 'underline', marginTop: '10px', display: 'inline-block' }}>
                  Click here to install MetaMask
                </a>
              </div>
            )}
            
            <button 
              className="btn" 
              onClick={connectWallet}
              disabled={loading}
            >
              {loading ? 'Connecting...' : 'Connect MetaMask'}
            </button>
            
            {error && (
              <div className="error" style={{ marginTop: '20px' }}>
                {error}
              </div>
            )}
            
            <div style={{ marginTop: '30px', fontSize: '0.9em', color: '#666' }}>
              <p>📝 <strong>Don't have MetaMask?</strong></p>
              <p>1. Install MetaMask from <a href="https://metamask.io" target="_blank" rel="noopener noreferrer" style={{ color: '#667eea' }}>metamask.io</a></p>
              <p>2. Create a wallet</p>
              <p>3. Switch to Sepolia Test Network</p>
              <p>4. Get free test ETH from <a href="https://sepoliafaucet.com" target="_blank" rel="noopener noreferrer" style={{ color: '#667eea' }}>faucet</a></p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="wallet-info">
            <div>
              <strong>Connected:</strong>
              <div className="wallet-address">
                {account.slice(0, 6)}...{account.slice(-4)}
              </div>
            </div>
            <button className="btn btn-secondary" onClick={loadLoanData}>
              Refresh Data
            </button>
          </div>

          {error && <div className="error">❌ {error}</div>}
          {success && <div className="success">✅ {success}</div>}

          {/* Current Loan Status */}
          <div className="section">
            <h2>📊 Current Loan Status</h2>
            
            {currentLoan ? (
              <div className="loan-status">
                <div style={{ marginBottom: '15px' }}>
                  <span className={`badge ${getLoanStatus().class}`}>
                    {getLoanStatus().text}
                  </span>
                </div>

                <div className="status-grid">
                  <div className="status-item">
                    <div className="status-label">Borrower</div>
                    <div className="status-value" style={{ fontSize: '1em' }}>
                      {currentLoan.borrower.slice(0, 6)}...{currentLoan.borrower.slice(-4)}
                    </div>
                  </div>

                  <div className="status-item">
                    <div className="status-label">Target Amount</div>
                    <div className="status-value">{currentLoan.targetAmount} ETH</div>
                  </div>

                  <div className="status-item">
                    <div className="status-label">Interest Rate</div>
                    <div className="status-value">{currentLoan.interestRate}%</div>
                  </div>

                  <div className="status-item">
                    <div className="status-label">Duration</div>
                    <div className="status-value">{currentLoan.durationSeconds / 86400} days</div>
                  </div>

                  <div className="status-item">
                    <div className="status-label">Total Repayment</div>
                    <div className="status-value">{calculateRepayment()} ETH</div>
                  </div>

                  <div className="status-item">
                    <div className="status-label">Time Remaining</div>
                    <div className="status-value" style={{ fontSize: '1em' }}>
                      {getTimeRemaining()}
                    </div>
                  </div>

                  <div className="status-item">
                    <div className="status-label">Total Funded</div>
                    <div className="status-value">{totalFunded} ETH</div>
                  </div>

                  <div className="status-item">
                    <div className="status-label">My Contribution</div>
                    <div className="status-value">{myContribution} ETH</div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: `${Math.min((parseFloat(totalFunded) / parseFloat(currentLoan.targetAmount)) * 100, 100)}%` 
                    }}
                  >
                    {((parseFloat(totalFunded) / parseFloat(currentLoan.targetAmount)) * 100).toFixed(1)}%
                  </div>
                </div>

                {/* Action buttons */}
                <div className="action-buttons">
                  {currentLoan.borrower.toLowerCase() === account.toLowerCase() && !currentLoan.repaid && !currentLoan.canceled && (
                    <>
                      <button className="btn btn-danger" onClick={cancelLoan} disabled={loading}>
                        Cancel Loan
                      </button>
                    </>
                  )}
                  
                  {parseFloat(myContribution) > 0 && (currentLoan.repaid || currentLoan.canceled) && (
                    <button className="btn btn-success" onClick={withdrawFunds} disabled={loading}>
                      Withdraw My Funds
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="no-loan">
                <p>No active loan at the moment</p>
              </div>
            )}
          </div>

          {/* Create Loan Form */}
          {!currentLoan && (
            <div className="section">
              <h2>💰 Create a Loan Request</h2>
              <form onSubmit={createLoan}>
                <div className="form-group">
                  <label>Loan Amount (ETH)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                    placeholder="0.1"
                    required
                  />
                  <div className="input-hint">How much do you need to borrow?</div>
                </div>

                <div className="form-group">
                  <label>Duration (Days)</label>
                  <input
                    type="number"
                    value={loanDuration}
                    onChange={(e) => setLoanDuration(e.target.value)}
                    placeholder="30"
                    required
                  />
                  <div className="input-hint">How many days to repay?</div>
                </div>

                <div className="form-group">
                  <label>Interest Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    placeholder="10"
                    required
                  />
                  <div className="input-hint">Interest rate you're willing to pay (e.g., 10 for 10%)</div>
                </div>

                <button type="submit" className="btn" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Loan Request'}
                </button>
              </form>
            </div>
          )}

          {/* Fund Loan Form */}
          {currentLoan && !currentLoan.repaid && !currentLoan.canceled && currentLoan.borrower.toLowerCase() !== account.toLowerCase() && (
            <div className="section">
              <h2>🎯 Fund this Loan</h2>
              <form onSubmit={fundLoan}>
                <div className="form-group">
                  <label>Amount to Fund (ETH)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={fundAmount}
                    onChange={(e) => setFundAmount(e.target.value)}
                    placeholder="0.01"
                    required
                  />
                  <div className="input-hint">
                    Target: {currentLoan.targetAmount} ETH | 
                    Already funded: {totalFunded} ETH
                  </div>
                </div>

                <button type="submit" className="btn btn-success" disabled={loading}>
                  {loading ? 'Funding...' : 'Fund Loan'}
                </button>
              </form>
            </div>
          )}

          {/* Repay Loan Form */}
          {currentLoan && !currentLoan.repaid && !currentLoan.canceled && currentLoan.borrower.toLowerCase() === account.toLowerCase() && currentLoan.fundedAt > 0 && (
            <div className="section">
              <h2>💸 Repay Loan</h2>
              <form onSubmit={repayLoan}>
                <div className="form-group">
                  <label>Repayment Amount (ETH)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={repayAmount}
                    onChange={(e) => setRepayAmount(e.target.value)}
                    placeholder={calculateRepayment()}
                    required
                  />
                  <div className="input-hint">
                    Total repayment required: {calculateRepayment()} ETH
                    (Principal: {currentLoan.targetAmount} ETH + {currentLoan.interestRate}% interest)
                  </div>
                </div>

                <button type="submit" className="btn btn-success" disabled={loading}>
                  {loading ? 'Repaying...' : 'Repay Loan'}
                </button>
              </form>
            </div>
          )}

          {loading && (
            <div className="loading">
              <div className="spinner"></div>
              Processing transaction...
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
