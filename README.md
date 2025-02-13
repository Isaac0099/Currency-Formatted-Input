# Currency-Formatted-Input
A simple TS React input component that adds the $ symbol and commas for separating numbers into more readable format (i.e. 1000000 displays as $1,000,000) While still passing a number.

Can be used to show normal number with comma separation, just set showCurrencySymbol={false} when you use it


To use, just copy and paste into your code then use it like:

 <FormattedInput
   id="income"
   name="income"
   value={formData.income}
   setValue={handleIncomeChange}
   showCents={false}
   placeholder="Enter annual income"  // Add your placeholder text here
   minValue={0}
   maxValue={100000000}
   className="w-full"
/>




