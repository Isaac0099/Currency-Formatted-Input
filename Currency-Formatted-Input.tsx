// Example use:

// <FormattedInput
//   id="income"
//   name="income"
//   value={formData.income}
//   setValue={handleIncomeChange}
//   showCents={false}
//   placeholder="Enter annual income"  // Add your placeholder text here
//   minValue={0}
//   maxValue={100000000}
//   className="w-full"
// />

import * as React from "react";
import { cn } from "@/lib/utils";

interface FormattedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  value: number;
  setValue: (value: number) => void;
  minValue?: number;
  maxValue?: number;
  currency?: string;
  showCents?: boolean;
  showCurrencySymbol?: boolean;
  className?: string;
  placeholder?: string;
}

const FormattedInput = React.forwardRef<HTMLInputElement, FormattedInputProps>(
  (
    {
      className,
      value,
      setValue,
      minValue = 0,
      maxValue = Number.MAX_SAFE_INTEGER,
      currency = "USD",
      showCents = false,
      showCurrencySymbol = true,
      placeholder = "",
      ...props
    },
    ref
  ) => {
    const [displayValue, setDisplayValue] = React.useState("");
    const [isFocused, setIsFocused] = React.useState(false);

    // Add commas to number
    const addCommas = (num: string) => {
      const parts = num.split(".");
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return parts.join(".");
    };

    // Format for display with $ and commas
    const formatForDisplay = (value: string) => {
      // Remove any existing formatting
      const cleanValue = value.replace(/[^\d.]/g, "");
      if (!cleanValue) return "";

      let formattedValue = cleanValue;

      if (showCents) {
        // Handle decimal places for cents
        const parts = cleanValue.split(".");
        formattedValue = parts[0] + (parts.length > 1 ? "." + parts[1].slice(0, 2) : "");
      } else {
        // Remove any decimal places if cents are disabled
        formattedValue = cleanValue.split(".")[0];
      }

      if (!showCurrencySymbol) {
        return `${addCommas(formattedValue)}`;
      }

      return `$${addCommas(formattedValue)}`;
    };

    // Update display value when component value changes
    React.useEffect(() => {
      if (!isFocused && value === 0 && displayValue === "") {
        setDisplayValue("");
      } else if (value !== undefined) {
        const formatter = new Intl.NumberFormat("en-US", {
          style: showCurrencySymbol ? "currency" : "decimal",
          currency: currency,
          minimumFractionDigits: showCents ? 2 : 0,
          maximumFractionDigits: showCents ? 2 : 0,
        });
        setDisplayValue(value === 0 && displayValue === "" ? "" : formatter.format(value));
      }
    }, [value, showCents, isFocused]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;

      // Remove any non-digit characters except decimal point (if cents enabled)
      const numericValue = inputValue.replace(/[^\d.]/g, "");

      // Handle decimal points based on showCents setting
      let cleanValue = numericValue;
      if (showCents) {
        const parts = numericValue.split(".");
        cleanValue = parts[0] + (parts.length > 1 ? "." + parts[1] : "");
      } else {
        cleanValue = numericValue.split(".")[0];
      }

      // Format display with $ and commas
      setDisplayValue(formatForDisplay(cleanValue));

      if (cleanValue === "") {
        setValue(0);
        return;
      }

      // Convert to number and clamp between min and max
      const parsedValue = parseFloat(cleanValue);
      if (!isNaN(parsedValue)) {
        const clampedValue = Math.min(maxValue, Math.max(minValue, parsedValue));
        setValue(showCents ? clampedValue : Math.floor(clampedValue));
      }
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      if (value === 0) {
        setDisplayValue("$");
      } else {
        // Keep the $ and formatting when focused
        const formatter = new Intl.NumberFormat("en-US", {
          style: showCurrencySymbol ? "currency" : "decimal",
          currency: currency,
          minimumFractionDigits: showCents ? 2 : 0,
          maximumFractionDigits: showCents ? 2 : 0,
        });
        setDisplayValue(formatter.format(value));
      }
      props.onFocus?.(e);

      // Move cursor to end of input
      requestAnimationFrame(() => {
        const length = e.target.value.length;
        e.target.setSelectionRange(length, length);
      });
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      if (value === 0 && displayValue === "$") {
        setDisplayValue("");
      } else if (value !== 0) {
        const formatter = new Intl.NumberFormat("en-US", {
          style: showCurrencySymbol ? "currency" : "decimal",
          currency: currency,
          minimumFractionDigits: showCents ? 2 : 0,
          maximumFractionDigits: showCents ? 2 : 0,
        });
        setDisplayValue(formatter.format(value));
      }
      props.onBlur?.(e);
    };

    return (
      <input
        {...props}
        type="text"
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder || "Enter amount"}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
      />
    );
  }
);

FormattedInput.displayName = "FormattedInput";

export { FormattedInput };
