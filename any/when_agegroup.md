# when_agegroup

This expression assigns a value of a certain age group based on the value of a number column.

## Use cases

To categorize your age data into age groups for easier analysis and visualization.

## Workflow

Create a new field of type "String" in your feature layer and name it "AgeGroup". In the "field calculator" create the following Arcade expression:

// replace "applicant_age" with the name of a number
// field in your layer
var numberField = $feature["applicant_age"];

When(
  numberField < 15, 'Under 15',
  numberField >= 15 && numberField < 25, '16-25', 
'NA' );

In the above expression we only had two categories ('Under 15' and '16-25') but you can add as many categories as needed.

You need to always have a default value at the end of eexpression (in our example - 'NA') or you will recieve an error.
