// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract P2PLending is ReentrancyGuard {
    struct Loan {
        address borrower;
        uint256 targetAmount;
        uint256 durationSeconds;
        uint256 interestRate; // e.g., 10% = 1000 (1000/100)
        uint256 fundedAt;
        bool canceled;
        bool repaid;
    }

    Loan public currentLoan;
    mapping(address => uint256) public contribution;
    address[] private lenders;

    event LoanCreated(address borrower, uint256 targetAmount, uint256 durationSeconds, uint256 interestRate);
    event LoanFunded(address lender, uint256 amount);
    event LoanRepaid(address borrower);
    event LoanCanceled(address borrower);
    event Withdrawn(address lender, uint256 amount);

    function createLoan(
        uint256 _targetAmount,
        uint256 _durationSeconds,
        uint256 _interestRate
    ) external {
        require(currentLoan.targetAmount == 0, "Loan already exists");
        require(_targetAmount > 0, "Target amount must be > 0");
        require(_durationSeconds > 0, "Duration must be > 0");

        currentLoan = Loan({
            borrower: msg.sender,
            targetAmount: _targetAmount,
            durationSeconds: _durationSeconds,
            interestRate: _interestRate,
            fundedAt: 0,
            canceled: false,
            repaid: false
        });

        emit LoanCreated(msg.sender, _targetAmount, _durationSeconds, _interestRate);
    }

    function fundLoan() external payable nonReentrant {
        require(currentLoan.targetAmount > 0, "No active loan");
        require(!currentLoan.canceled, "Loan canceled");
        require(!currentLoan.repaid, "Loan already repaid");
        require(msg.value > 0, "Funding amount must be > 0");

        contribution[msg.sender] += msg.value;
        lenders.push(msg.sender);

        if (currentLoan.fundedAt == 0) {
            currentLoan.fundedAt = block.timestamp;
        }

        emit LoanFunded(msg.sender, msg.value);
    }

    function repayLoan() external payable nonReentrant {
        require(msg.sender == currentLoan.borrower, "Only borrower can repay");
        require(!currentLoan.canceled, "Loan canceled");
        require(!currentLoan.repaid, "Loan already repaid");
        require(block.timestamp <= currentLoan.fundedAt + currentLoan.durationSeconds, "Loan expired");

        uint256 totalRepayment = (currentLoan.targetAmount * (1000 + currentLoan.interestRate)) / 1000;
        require(msg.value >= totalRepayment, "Insufficient repayment amount");

        currentLoan.repaid = true;
        emit LoanRepaid(msg.sender);
    }

    function withdrawAsLender() external nonReentrant {
        require(currentLoan.repaid || currentLoan.canceled, "Loan not repaid or canceled");
        uint256 amount = contribution[msg.sender];
        require(amount > 0, "No contribution to withdraw");

        contribution[msg.sender] = 0;
        (bool ok, ) = msg.sender.call{value: amount}("");
        require(ok, "Withdrawal failed");

        emit Withdrawn(msg.sender, amount);
    }

    function cancelLoan() external nonReentrant {
        require(msg.sender == currentLoan.borrower, "Only borrower can cancel");
        require(!currentLoan.repaid, "Loan already repaid");
        require(!currentLoan.canceled, "Loan already canceled");

        currentLoan.canceled = true;
        emit LoanCanceled(msg.sender);
    }
}
