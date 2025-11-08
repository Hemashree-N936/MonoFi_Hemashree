// 🔥 Contract deployed and configured!

export const CONTRACT_ADDRESS = "0xf8e81D47203A594245E36C48e151709F0C19fBe8"; // Your deployed contract

export const CONTRACT_ABI = [
  "function createLoan(uint256 _targetAmount, uint256 _durationSeconds, uint256 _interestRate) external",
  "function fundLoan() external payable",
  "function repayLoan() external payable",
  "function withdrawAsLender() external",
  "function cancelLoan() external",
  "function currentLoan() view returns (address borrower, uint256 targetAmount, uint256 durationSeconds, uint256 interestRate, uint256 fundedAt, bool canceled, bool repaid)",
  "function contribution(address) view returns (uint256)",
  "event LoanCreated(address borrower, uint256 targetAmount, uint256 durationSeconds, uint256 interestRate)",
  "event LoanFunded(address lender, uint256 amount)",
  "event LoanRepaid(address borrower)",
  "event LoanCanceled(address borrower)",
  "event Withdrawn(address lender, uint256 amount)"
];

// Supported networks
export const NETWORKS = {
  sepolia: {
    chainId: "0xaa36a7", // 11155111 in hex
    chainName: "Sepolia Test Network",
    rpcUrls: ["https://sepolia.infura.io/v3/"],
    blockExplorerUrls: ["https://sepolia.etherscan.io"]
  },
  mumbai: {
    chainId: "0x13881", // 80001 in hex
    chainName: "Mumbai Testnet",
    rpcUrls: ["https://rpc-mumbai.maticvigil.com"],
    blockExplorerUrls: ["https://mumbai.polygonscan.com"]
  }
};
