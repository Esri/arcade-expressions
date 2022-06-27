# Form Calculation Expressions

This folder contains Arcade expression templates and functions that may be used in the [Form Calculation Profile](https://developers.arcgis.com/arcade/guide/profiles/#form-calculation). Calculated expressions automatically calculate and populate data in the form, saving time for mobile workers in the field or data editors in the office. Forms and form calculations are supported in [Field Maps](https://doc.arcgis.com/en/field-maps/android/help/configure-the-form.htm#ESRI_SECTION2_5F65DF4B642C4A4D9CAFE6A4BF6BB676), [Map Viewer](https://doc.arcgis.com/en/arcgis-online/create-maps/create-form-mv.htm), and any other web application that uses the [Feature Form widget](https://developers.arcgis.com/javascript/latest/api-reference/esri-widgets-FeatureForm.html).

Many of these are included in the [Common Calculated Expressions for ArcGIS Field Maps blog post](https://www.esri.com/arcgis-blog/products/field-maps/field-mobility/common-calculated-expressions-for-arcgis-field-maps/).

## General workflow

Each expression lives in a Markdown file, which contains a general description of the concept and one or more specific examples with code.

See the list below for sample expressions:

- [Spatial Inheritance (Fetch an attribute from an underlying polygon)](SpatialInheritance.md)
- [Fetch an attribute from a related record](FetchAttributeFromRelatedRecord.md)
- [Store a users's name or email address](FetchUserInfo.md)
- [Calculate the current time](CurrentTime.md)
- [Store geometry as an attribute](GeometryAsAttribute.md)
- [Calculate a value from other fields](CalculateValueUsingOtherFields.md)
- [Store info about a nearby feature](FetchAttributeFromNearbyFeature.md)

## Resources

* [ArcGIS Arcade Documentation](https://developers.arcgis.com/arcade/)
* [ArcGIS Arcade Playground](https://developers.arcgis.com/arcade/playground/)

## Contributing

Esri welcomes [contributions](CONTRIBUTING.md) from anyone and everyone. Please see our [guidelines for contributing](https://github.com/esri/contributing).

## License

Copyright 2018 Esri

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

A copy of the license is available in the repository's [LICENSE](LICENSE) file.
