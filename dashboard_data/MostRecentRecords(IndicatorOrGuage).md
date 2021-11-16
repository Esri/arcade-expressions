# Get Most Recent Records 

This expression retrieves the most recent feature (or row) from a set of features. The sample data contains COVID-19 vaccination records captured over time on a daily basis.   

```
var portal = Portal('https://www.arcgis.com/');
var fs = FeatureSetByPortalItem(
  portal,
  'b2c50a7730a74f8d808262ce0c37ac79',
  0,
  [
    'date',
    'location',
    'total_vaccinations',
    'people_vaccinated',
    'people_vaccinated_per_hundred',
    'people_fully_vaccinated',
    'people_fully_vaccinated_per_hun',
  ],
  false
);

// Find the most recent date from the date field to filter the FeatureSet for the latest record
var maxDate = Text(Date(Max(fs,'date')),'YYYY-MM-DD');
return Filter(fs, 'date = @maxDate');

```

We can use this expression to create and update indicators or gauges that show the most recent information on vaccination adiministration. 

![Indicators](/dashboard_data/images/most-recent-record.png)
