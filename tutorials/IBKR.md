# Export of data in IBKR

To export the compatible CSV data, go to "Performance & Reports" > "Flex queries" and create a new query with the following configuration:

1. Create the query (one-time)

![Screenshot of IBKR, indicating where one can create a new flex query](./ibkr_create_flex_query.png)

- Select "Trades"
   - Select "ISIN"
   - Select "Date/Time"
   - Select "Quantity"
- Set format to "CSV"
- Include header and trailer records "No"
- Include column header "Yes"
- Include section code and line descriptor "No"
- Date Format: "yyyy-MM-dd"
- Time Format: "HHmmss"
- Date/Time Separator "; (semi-colon)"
- Include Canceled Trades? "No"
- Include Currency Rates? "No"
- Include Audit Trail Fields? "No
- Display Account Alias in Place of Account ID? "No"
- Breakout by Day? "No"

2. Run the query (for every tax year)

- Period: "Custom date range"
- From date: YYYY-01-01
- To date: YYYY-12-31
- Format: CSV

3. Import the downloaded file in your tax declaration, after specifying the ISIN.
