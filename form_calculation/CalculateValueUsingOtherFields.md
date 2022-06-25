# Calcualte a Value From Other Fields

Often, it can be useful to calculate a value based on one or more fields that the user fills out.

## Example

 I need to calculate the score when doing a damage assessment report. Certain things (e.g., the roof, foundation, habitability.) are scored based on their damage level. I need to sum all these independent scores into a single value to use for filtering and visualization.

 ```js
 $feature["foundation_condition"] + $feature["roof_condition"] + $feature["habitability"]
 ```