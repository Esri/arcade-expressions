# Attribute Rule Calculation expressions

This folder contains Attribute Rule Calculation expression templates and functions that may be used in the [attribute-rule-calculation profile](https://developers.arcgis.com/arcade/guide/profiles/#attribute-rule-calculation).

## General workflow

Each expression lives in a Markdown file, which contains a general description of the expression, its use case, a depiction of the result, the code to copy, and an example of an executable form of the expression along with its output. It may also include a sample database with the rule defined on a dataset.

> Note that expressions living in this folder don't have to be exclusively used in the attribute rule calculation profile. They can likely be used in different profiles, though they were originally designed for the attribute rule calculation profile.

See the list below for shared expressions.

- [Calculate attributes from edge](./CalcEdgeFields.md)
- [Calculate attributes from junction](./CalcJunctionFields.md)
- [Calculate M values of a line using vertex distance](./SetMValues.md)
- [Calculate slope of line](./CalcSlopeOfLine.md)
- [Calculate top elevation](./CalculateTopElevation.md)
- [Calculate volume or surface area of a pipe or line](./CalcVolumeSurfaceAreaPipe.md)
- [Contain feature in a container within a search distance](./ContainFeatureInContainerUsingRules.js)
- [Copy start or end Z of a line to a field](./CopyStartEndZtoField.md)
- [Copy a value from an intersecting feature](./CopyValueIntersectingFeature.md)
- [Create a junction to junction association when a feature is placed](./CreateAssociation.md)
- [Create attachment to structure within distance](./CreateAttachmentAssociationByProximity.md)
- [Create content in a line](./ContainAndJunctionJunction.md)
- [Create laterals](./CreateLateralDevSummitPlenary2023.md)
- [Create points along line](./CreatePointsAlongLine.md)
- [Create strand fiber content](./CreateStrandFiberContent.md)
- [Generate unique ID](./GenerateID.md)
- [Get address from centerline](./GetAddressFromCenterline.md)
- [Last value](./LastValue.md)
- [Return value base on criteria](./ReturnValueBaseOnCriteria.md)
- [Rotate feature by intersected line](./RotateFeatureByIntersectedLine.md)
- [Set Ms to index](./SetMsToIndex.md)
- [Split intersecting line](./SplitIntersectingLine.md)
- [Update an attribute in the parent feature](./MoveFieldToParent.js)
- [Update an intersecting feature](./UpdateIntersectingFeature.md)
- [Update associated features](./UpdateAssociatedFeatures.md)
- [Update container feature when content is changed](./UpdateContainerViaAssociations.md)
- [Update container and structures associated features location](./UpdateContentLocation.md)
- [Update containers Z value when feature is the lowest feature](./UpdateContainersGeometryViaAssociations.md)
- [Update parent features](./UpdateParentFeature.md)


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
