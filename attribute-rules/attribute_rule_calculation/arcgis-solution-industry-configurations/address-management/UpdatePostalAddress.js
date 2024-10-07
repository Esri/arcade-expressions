// This rule will update the postal address when a new postal address record is added from the related site address point

// Get the site address id. 
// If it is null or the postal address is not null return the postal address
var siteAddressID = $feature.siteaddid;
if (IsEmpty(siteAddressID) || !IsEmpty($feature.pstladdress)) return $feature.pstladdress;

// Find the first related site address point and return its full address
var siteAddresses = Filter(FeatureSetByName($datastore, "SiteAddressPoint"), "siteaddid = '" + siteAddressID + "'");
if (Count(siteAddresses) == 0) return $feature.pstladdress;
return First(siteAddresses).fulladdr;