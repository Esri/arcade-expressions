# Calculate the current time

When performing inspections, it’s often useful to set the inspection date to the current date and time. While the mobile worker can do this in the mobile app with a few taps, it can be more efficient to auto-populate this information using an Arcade expression.

## Examples

I’m filling out a damage inspection report and need to set the inspection date and time. I only want to return the current date and time when creating a new inspection.

```js
// if updating an existing inspection, return current date/time
if ($editcontext.editType == 'INSERT'){
    return Now(); 
}

// otherwise return the original date
return $originalFeature.inspectionDate;   
```

I’m filling out a damage inspection report and need to set the inspection date. I only want to return the current date when creating a new inspection.

```js
// if updating an existing inspection, return current date
if ($editcontext.editType == 'INSERT'){
    return Today(); 
}

// otherwise return the original date
return $originalFeature.inspectionDate;   
```
