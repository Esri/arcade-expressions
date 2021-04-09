# Combined Multiple Layers 

This expression combines features from multiple feature layers. Each of the three sample data contains a record of how many vaccinations were allocated by each manufacturer (Moderna, Pfizer, and Janssen).   

```
var portal = Portal("https://www.arcgis.com/");
// Create a FeatureSet for each manufacturer Feature Layer containing vaccination allocation data. 
// Group the features by the week of allocation 
var moderna = GroupBy(
  FeatureSetByPortalItem(portal,"20a80cd89db74c568db7cc9d2a13dc27",0,["*"],false),
  ["week_of_allocations"],
  [
    { name: "moderna_1", expression: "F_1st_dose_allocations", statistic: "SUM" },
    { name: "moderna_2", expression: "	F_2nd_dose_allocations", statistic: "SUM" },
  ]
);

var pfizer = GroupBy(
  FeatureSetByPortalItem(portal,"45c991b4fd6642be8256a6b55f809311",0,["*"],false),
  ["week_of_allocations"],
  [
    { name: "pfizer_1", expression: "F_1st_dose_allocations", statistic: "SUM" },
    { name: "pfizer_2", expression: "	F_2nd_dose_allocations", statistic: "SUM" },
  ]
);

var janssen = GroupBy(
  FeatureSetByPortalItem(portal,"d6bf72497e7e4bc69ef9c468e362ca3b",0,["*"],false),
  ["week_of_allocations"],
  [{ name: "janssen", expression: "F_1st_dose_allocations", statistic: "SUM" }]
);

var combinedDict = {
  fields: [
    { name: "manufacturer", type: "esriFieldTypeString" },
    { name: "week_of_allocation", type: "esriFieldTypeString" },
    { name: "count_of_doses", type: "esriFieldTypeInteger" },
  ],
  geometryType: "",
  features: [],
};

// Loop through each of the three FeatureSets and store attributes into a combined dictionary.
var i = 0;
for (var m in moderna) {
  combinedDict.features[i] = {
    attributes: {
      manufacturer: "Moderna",
      week_of_allocation: m["week_of_allocations"],
      count_of_doses: SUM(m["moderna_1"], m["moderna_2"]),
    },
  };
  i++;
}

for (var p in pfizer) {
  combinedDict.features[i] = {
    attributes: {
      manufacturer: "Pfizer",
      week_of_allocation: p["week_of_allocations"],
      count_of_doses: SUM(p["pfizer_1"], p["pfizer_2"]),
    },
  };
  i++;
}

for (var j in janssen) {
  combinedDict.features[i] = {
    attributes: {
      manufacturer: "Janssen",
      week_of_allocation: j["week_of_allocations"],
      count_of_doses: j["janssen"],
    },
  };
  i++;
}

// Return dictionary cast as a feature set 
return FeatureSet(Text(combinedDict));

```

We can use this expression to create a serial chart that shows both the cumulative count of vaccinations allocated each week and how many doses were allocated by each manufacturer. 

![Serial chart](/Data%20Expressions/images/combined-serial-chart.png)