What's working:
- Parsing default templates (not fully complete)
- Exporting with changes
- Importing custom events (partial)

Usage:
- Create an event in Bakin.
- To define the variables / lines of the event that should be changeable through parameters, create a comment event just above the line that needs to be shown, in the format of #keyword, with keyword being a keyword of your choice.
  - **If a single parameter is used multiple times throughout the event**, place another comment over each line that should use a unique field in the template with the same keyword.
  - For different parameters, use a different keyword.
