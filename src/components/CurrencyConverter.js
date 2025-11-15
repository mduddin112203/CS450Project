const INR_TO_USD = 83;

function CurrencyConverter({ value, showBoth = false }) {
  if (!value || value === 0) {
    return <span>₹0</span>;
  }

  const formattedINR = `₹${Math.round(value).toLocaleString('en-IN')}`;
  const usdAmount = value / INR_TO_USD;
  const formattedUSD = `$${usdAmount.toFixed(2).toLocaleString()}`;

  if (showBoth) {
    return (
      <span>
        {formattedINR} <span style={{ opacity: 0.7, fontSize: '0.9em' }}>({formattedUSD})</span>
      </span>
    );
  }

  return <span>{formattedINR}</span>;
}

export default CurrencyConverter;

