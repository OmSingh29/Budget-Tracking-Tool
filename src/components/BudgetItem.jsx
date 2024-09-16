import { Form, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { BanknotesIcon, TrashIcon } from "@heroicons/react/24/outline";
import {
  calculateSpentByBudget,
  formatCurrency,
  formatPercentage,
} from "../helpers";

const BudgetItem = ({ budget, showDelete = false }) => {
  const { id, name, color } = budget;
  const spent = calculateSpentByBudget(id);
  
  // Load adjustedAmount from localStorage if it exists, otherwise use budget.amount
  const [adjustedAmount, setAdjustedAmount] = useState(() => {
    const savedAmount = localStorage.getItem(`budget-${id}`);
    return savedAmount ? Number(savedAmount) : budget.amount;
  });

  const [showExtraExpense, setShowExtraExpense] = useState(false); // Initially don't show extra expense

  // Calculate remaining and extra expense
  const remaining = adjustedAmount - spent;
  const extraExpense = spent - adjustedAmount;

  useEffect(() => {
    // Only set showExtraExpense when the user exceeds the budget
    if (spent > adjustedAmount) {
      setShowExtraExpense(true);
    } else {
      setShowExtraExpense(false);
    }
  }, [spent, adjustedAmount]);

  const handleBudgetCheck = (event) => {
    if (spent > adjustedAmount) {
      const confirmOverwrite = window.confirm(
        "Spent amount exceeds the budget. Do you want to overwrite the budget amount?"
      );

      if (confirmOverwrite) {
        // User confirmed to overwrite the amount
        setAdjustedAmount(spent); // Set the budget to the spent amount
        setShowExtraExpense(false); // Disable extra expense notification
        localStorage.setItem(`budget-${id}`, spent); // Persist the new amount in localStorage
      } else {
        // Prevent the button's default action if user declines
        event.preventDefault();
      }
    }
  };

  return (
    <div
      className="budget"
      style={{
        "--accent": color,
      }}
    >
      <div className="progress-text">
        <h3>{name}</h3>
        <p>{formatCurrency(adjustedAmount)} Budgeted</p>
      </div>

      <progress max={adjustedAmount} value={spent}>
        {formatPercentage(spent / adjustedAmount)}
      </progress>

      <div className="progress-text">
        <small>{formatCurrency(spent)} spent</small>

        {/* Show remaining or extra expense if needed */}
        {showExtraExpense ? (
          <small style={{ color: "red" }}>
            {formatCurrency(extraExpense)} over budget
          </small>
        ) : (
          <small>{formatCurrency(remaining >= 0 ? remaining : 0)} remaining</small>
        )}
      </div>

      {/* Adjust Budget button triggers the overwrite confirmation */}
      <div className="flex-sm">
        <button
          style={{
            backgroundColor: "#1ae5c84f",
            color: "black",
            fontSize: 15,
            width: 120,
            height: 45,
            borderRadius: 4,
            outlineColor: "none",
          }}
          onClick={handleBudgetCheck} // Handle overspending confirmation
        >
          Adjust Budget
        </button>
        <Link to={`/budget/${id}`} className="btn">
          <span>View Details</span>
          <BanknotesIcon width={20} />
        </Link>
      </div>
      {/* Delete Button if showDelete is true */}
      {showDelete && (
        <div className="flex-sm">
          <Form
            method="post"
            action="delete"
            onSubmit={(event) => {
              if (
                !window.confirm(
                  "Are you sure you want to permanently delete this budget?"
                )
              ) {
                event.preventDefault();
              }
            }}
          >
            <button type="submit" className="btn">
              <span>Delete Budget</span>
              <TrashIcon width={20} />
            </button>
          </Form>
        </div>
      )}
    </div>
  );
};

export default BudgetItem;
