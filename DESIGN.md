# [Airtable CIMS Map Tool](https://docs.google.com/document/d/1Cc1iDV3i79r-dyQuHj2rcw7EBSq1NWdE-CSlE79loA8/edit#)
Updated Dec 14, 2021

MDA Team (John Hall)

## Overview of Capabilities

Given the prominence of Airtable as a data management tool within CORI/RISI and our heavy utilization of geographically enriched data, we would like to create a [CIMS Map Tool](https://github.com/ruralinnovation/cims-map-tool/) that can be used within the Airtable web interface. Development and maintenance of this tool should enhance our ability to:

* Explore data
* Ability to select location(s) that match the following (example) criteria:
    * Community must be rural
    * Minimum 75% of pop has access to broadband
        * Ideally access to *fiber* in downtown core
    * Partnership with local post-secondary institution
    * Commitment to building Digital Economy Infrastructure from leadership (of applicant organization)
* Visualize selected location as filter criteria are updated (map view)
    * Initialize with useful overview of mapped features (looks good when you first open it)
    * Drill down on individual features (see attributes)
    * Responsive loading of data after single initialization cycle
    * Relatively easy to configure app with appropriate data layers
    * Click on individual records in Airtable tables and render them on map with a context that is specific to selected record (i.e. if record == place, then map selected place and all county subdivisions, counties, etc. that intersect with place)

* Publish/Print results
    * From selections made/filtered within map view return a list of features as records to an Airtable table(s)

## Design Considerations

### Motivation

The collection of lists and tables that make up CIMS are the basis for our process of modeling a certain kind of ecosystem development with the aim of understanding the factors that contribute to the growth and success of enterprises that support _digital_ jobs and operate in _rural_ locations (with the understanding that "rural" has multiple, context-dependent definitions). One (among many) of the measures that we use to test these models is the ability of a community (i.e. place or micro-region) to produce a recipient of the ["Build to Scale" Venture Challenge](https://eda.gov/oie/buildtoscale/venture/) (formerly "i6 Challenge") award which is a program run by the Office of Innovation and Entrepreneurship (OIE; operating within EDA). We have written a [retrospective report](https://docs.google.com/document/d/1jjSVh75pdSrd7ZqsJ_m1sCdxZZvI2oLD1YxhmqR4HHU) based on our experience in supporting applicants, during both the application process and continuing education/training intended to optimize an organization's ability to discover and utilize local Digital Economy Ecosystem resources.

A fundamental assumption of this modeling process is that the local organizations and entities that are best positioned to receive and capitalize on these awards are most likely to be found in locations where specific components that make up a Digital Economy Ecosystem are already present and developed to a certain level of maturity. This assumption is also the basis for producing a [Digital Economy Diagnostic report](https://github.com/ruralinnovation/dee-r). The Airtable deployment of this application is intended to allow the researcher to discover and/or verify assets by geospatial proximity to the locus of a given a community and/or communities by geospatial proximity to specific assets, with the Airtable interfaces serving as a method to provide input parameters to the mapping function.

### Use-cases

* Given an entry point selection of one or more polygons, all which must be of a single geography type, either **CBSA**, **County**, **County Subdivision** or **Place**:

 * Filter and subset data selection by geographical context …
   * Show all features of other geography types which spatially intersect that selection
   * Also show other types of features (i.e. airports, breweries, colleges, etc.) which either
     * Spatial intersection with selection
     * Spatial intersection with a feature of a special type (i.e., 30-minutes drive times)

 * Visually validate geographical context of pre-selected data (selected in Airtable)...
   * Are the individual features of this subset too close together (spatially)?
   * Are the features of the selection mostly in one or another of the larger regions of the country (i.e. all in the North East or all in the Midwest)?
   * What is the heterogeneity of the geographics size (by type and by area) of this selection of features?

## Architectural Overview

### Design Alternatives

## Components & Modules

### Airtable UI
…

### Map UI

#### Title Bar
The app will have a simple header section with a solid color background and left justified text which displays the title of the app, as well as the type of the currently selected geography (if any) in parenthesis.

#### Layer (+Info) Pane
Pane will show available feature layers (currently served from Carto). Specifically for CIMS/Airtable, some layers will parallel the various types of geographic selections (i.e. CBSA, County, etc.) and the currently selected type should be highlighted as in the title bar (above).

#### Map (+Tools) Pane
...

### Immediate TODO’s:

1. **Remove selection table; allow user to choose any view from a County or Place table (other geos to follow)**

2. **To cope with potentially enormous selections (1000’s of records), initialize map with drop pins on lat/lon of each feature and *no* Carto layers (or possibly only boundary layers, spatially selected by point-in-poly intersection; depending on performance w/ 1000’s of points)**

3. **When the user clicks on a single feature on the map OR a single record in Airtable, switch to boundary representation of that feature and zoom-in**

4. **Nice to have: when a user clicks on a feature in one of the Carto layers, if that layer is also represented as a table in Airtable, expand the Airtable record that corresponds to that feature.**

5. **[Don't render map if more that X records in view](https://app.asana.com/0/1199688664205091/1200917230099964)**

6. **[Do not filter point layers](https://app.asana.com/0/1199688664205091/1200917230099976)**
   1. **“Filter Layers …” is off by default (on init)**

7. **[Get rid of "selected" tables and select button widget](https://app.asana.com/0/1199688664205091/1200917230099974)**
   1. **“Selected …” tables are not a dependency of the either the CIMS map tool airtable or shiny app, so the instruction is simply, “Do not deploy Selected tables and button to CIMS: EDA”**

8. **[Minimize legend](https://app.asana.com/0/1199688664205091/1200917230099968)**

9. **[Turn on all Carto layers after selecting geo record](https://app.asana.com/0/1199688664205091/1200917230099966)**
   1. **Only turn on “enabled” layers**
       1. **Some layers are only enabled if the “Filter Layers …” is on**
           1. **… as specified per layer in params.yml **
           2. **“Filter layers …” req should be applied to any poly layer (Carto)**

10. **[BUG: Use Airtable view record selection to change map selection](https://app.asana.com/0/1199688664205091/1200917230099972)**
    1. **Broken on chrome (support for ?)**

11. **[Filter layer features by geoid instead of spatial query](https://app.asana.com/0/1199688664205091/1200917230099970)**__** (geometry)**__
    1. **This is determined by columns available in Carto, however…**
    2. **Secondary filter (join) should *always* be by geometry**

12. **[Move basemap selector into side-panel (dropdown)](https://app.asana.com/0/1199688664205091/1200739315527428)**

13. **[Auto-zoom based on size of selected geography](https://app.asana.com/0/1199688664205091/1200739315527400)**

14. **[Clicking on multiple layers populates multiple info boxes/tabs with feature attr](https://app.asana.com/0/1199688664205091/1200739315527416)**

15. **[Loading indicator for Carto Layers in side layer panel](https://app.asana.com/0/1199688664205091/1200739315527425)**

16. **[Provide format spec for Selected Geo and Carto Layer attributes](https://app.asana.com/0/1199688664205091/1200739315527422)**

17. **[Replace layer name in feature attr panel with layer label](https://app.asana.com/0/1199688664205091/1200739315527408)**

18. **[BUG: Default style does not highlight features when hovering](https://app.asana.com/0/1199688664205091/1200739315527413)**

19. **[BUG: Sometimes Carto layer features are not clickable](https://app.asana.com/0/1199688664205091/1200739315527405)**

20. ...
