# Sample data expressions

This folder contains sample [data expressions](https://doc.arcgis.com/en/dashboards/get-started/create-data-expressions.htm) and recommended charts. Dashboard authors can create data expressions using the [Arcade function library](https://developers.arcgis.com/arcade/function-reference/) to unlock insights and create robust visualizations. Data expressions are authored, saved, and executed within the context of a Dashboard. They must return [FeatureSets](https://developers.arcgis.com/arcade/guide/types/) which can drive data driven elements in Dashboards. Refer to [best practices for working with data expressions](https://doc.arcgis.com/en/dashboards/reference/authoring-data-expressions.htm) for tips on authoring performant expressions. 

Note: Data expressions and advanced formatting in Dashboards are separate [Arcade profiles](https://developers.arcgis.com/arcade/guide/profiles/).  

See the list below for shared expressions:

- [Aggregate by day of week](./AggregateByDOW(SerialChart).md)
- [Aggregate by spatial relationship](./SpatialAggregation.md)
- [ArcGIS Workforce - Obtain the the worker name & description of assignment type from a FeatureSet](./WorkforceWorkerNameAssignmentType.md)
- [Calculate a statistic on a virtual field](./GroupBySQLExpressionAverage(SerialChart).md)
- [Calculate multiple statistics using Arcade's GroupBy() function](./GroupByMultiStats(List).md)
- [Calculations across fields](./CalculationAcrossFields.md)
- [Combined multiple layers](./CombineMultipleLayers(SerialChart).md)
- [Get most recent records](./MostRecentRecords(IndicatorOrGuage).md)
- [HAVING clause](./HavingClause(SerialChart).md)
- [Join attributes from a layer to a table](./JoinLayerFieldsToTable.md)
- [Split comma separated values across multiple rows](./SplitCategories(PieChart).md)
