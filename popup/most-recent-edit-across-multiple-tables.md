# Return Most Recent Editing Summary Across Multiple Tables

This expression will return an edit summary for the most recent edit across *multiple* tables.
Note: This expression assumes the use of standard editor tracking field names `last_edited_date` and `last_edited_user`.

## Use case

In a feature service with multiple related tables, it may be useful to see the single most recent edit tied to a parent feature. Currently, a popup can be configured to show editing information for the feature, as well as return information from each related table.

To use a more concrete example, consider a layer of Health Complaints. Each complaint may have any number of violations associated with it, and each investigation must allow for adding to a running log of contacts, notes, and attachments. Each of these may be edited and added to at any time over the course of an investigation.

From a management perspective, an edit to any of these three tables equates to an edit to the *investigation*. Looking at three timestamps and comparing them is an unnecessary step. This expression can convey the desired information at a glance.

## Workflow

Copy and paste the expression found in the expression template below to the pop-up Arcade editor in ArcGIS Online, the relevant location in ArcGIS Pro, or the relevant location in a custom app.

To configure the script for your layers, add your related tables to the `feats` dict

```js
// Custom function to return most recent feature
function MostRecent(lyr){
    return First(OrderBy(lyr, 'last_edited_date'))
}

// Dict of features
var feats = [
    {table: 'Complaint Details', feat: $feature},
    {table: 'Violations', feat: MostRecent(FeatureSetByRelationshipName($feature, "EH_Complaints_violations"))},
    {table: 'Narrative', feat: MostRecent(FeatureSetByRelationshipName($feature, "EH_Complaints_narrative"))}
]

function DateSort(a, b){
    if (a['feat']['last_edited_date'] > b['feat']['last_edited_date']){
        return -1
    } else {
        return 1
    }
}

var most_recent = First(Sort(feats, DateSort))

// Return a formatted output string based on the most recent feature
return `${most_recent['table']} table
edited ${Text(most_recent['feat']['last_edited_date'], 'DD-MMM-YYYY')}
by ${GetUser(Portal('https://maps.co.kendall.il.us/portal'), most_recent['feat']['last_edited_user'])['fullName']}`
```

## Example output

```
Narrative table
edited 29-Nov-2021
by Joshua Carlson
```
