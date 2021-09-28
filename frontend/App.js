import React, { useEffect, useState, useCallback, Fragment } from 'react';
import {
    Box, Dialog, Heading, Loader, Text,
    registerRecordActionDataCallback,
    useBase,
    useCursor,
    useLoadable,
    useRecordById,
    useRecords, useSettingsButton,
    useWatchable
} from '@airtable/blocks/ui';
import { RecordPreviewWithDialog } from "./modules/RecordPreviewWithDialog";
import SettingsForm from "./SettingsForm";
import { useSettings } from "./settings";
import {  } from "@airtable/blocks/ui";

// '<META HTTP-EQUIV="Access-Control-Allow-Origin" CONTENT="http://www.example.org">'
// Try adding meta data header to page
const links = [
    "https://airtable.com",
    "https://*.airtable.com",
    "https://*.airtableblocks.com"
]
for (const l of links) {
    const link = document.createElement('META');
    link.setAttribute("CONTENT", l);
    link.setAttribute("HTTP-EQUIV", "Access-Control-Allow-Origin");
    link.content = document.location;
    document.getElementsByTagName('head')[0].appendChild(link);
}

const MAX_RECORDS_TO_MAP = 300;

const MAP_TOOL_DOMAIN = "https://ruralinnovation.shinyapps.io"
const MAP_TOOL_URL = MAP_TOOL_DOMAIN + "/cims-map-tool/?geoids=";
// const MAP_TOOL_DOMAIN = "http://127.0.0.1:4321"
// const MAP_TOOL_URL = MAP_TOOL_DOMAIN + "?geoids=";

const COUNTY_TABLE = 'County';
// const SELECTED_COUNTIES_TABLE = 'Selected Counties';
// const SELECTED_PLACES_TABLE = 'Selected Places';

function App() {
    // YOUR CODE GOES HERE
    const [isLoading, setIsLoading] = useState(true);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    useSettingsButton(() => setIsSettingsOpen(!isSettingsOpen));

    const {
        isValid,
        settings: {isEnforced, urlTable},
    } = useSettings();

    // Caches the currently selected record and field in state. If the user
    // selects a record and a preview appears, and then the user de-selects the
    // record (but does not select another), the preview will remain. This is
    // useful when, for example, the user resizes the apps pane.
    const [selectedRecordId, setSelectedRecordId] = useState(null);
    const [selectedFieldId, setSelectedFieldId] = useState(null);

    const [recordActionErrorMessage, setRecordActionErrorMessage] = useState('');
    const [selectionDetails, setSelectionDetails] = useState('No changes yet');
    const [updateDetails, setUpdateDetails] = useState('No changes yet');
    const [mapURL, setMapURL] = useState('');
    const [geoIDs, setGeoIDs] = useState({});
    const [geoType, setGeoType] = useState('County');
    const [totalSelectedRecords, setTotalSelectedRecords] = useState(0);

    // keep track of whether we have up update currently in progress - if there is, we want to hide
    // the update button so you can't have two updates running at once.
    const [isUpdateInProgress, setIsUpdateInProgress] = useState(false);

    const base = useBase();
    const cursor = useCursor();

    let activeTable = base.getTableByIdIfExists(cursor.activeTableId);
    let activeView = null;

    const counties = base.getTableByName(COUNTY_TABLE);
    // const countySelection = base.getTableByName(SELECTED_COUNTIES_TABLE);
    // const placeSelection = base.getTableByName(SELECTED_PLACES_TABLE);
    const countyFields = counties.fields;
    // const selectedCountyFields = countySelection.fields;
    // const placeFields = placeSelection.fields;
    let countyRecords = useRecords(counties.selectRecords());
    // let selectedCountyRecords = useRecords(countySelection.selectRecords());
    // let placeRecords = useRecords(placeSelection.selectRecords());
    const countyQueryResult = counties.selectRecords();
    // const selectedCountyQueryResult = countySelection.selectRecords();
    // const placeQueryResult = placeSelection.selectRecords();
    //console.log("Active Table: " + activeTable.name, activeTable );
    // console.log("Active View ID: " + cursor.activeViewId);

    async function mapCounties(recordPromise, geoIdUpdate) {
        const geoids = (geoType === "Place") ?
            [] : (!!geoIdUpdate) ? values(geoIdUpdate) :
            values(geoIDs);
        setGeoType('County');
        const temp = {};
        const records = (!!recordPromise) ?
            (await recordPromise).records :
            countyRecords;

        // console.log("Counties fields", countyFields);
        // console.log("Counties records", countyRecords);

        let total = (!!geoids && geoids !== null) ? geoids.length : 0;
        setTotalSelectedRecords(total);

        setIsLoading(true);

        for (const record of records) {
            for (const f of countyFields) {
                if (record.getCellValue(f) !== null) {
                    if (f.name.match(/^Geoid/i) !== null) {
                        // console.log(f.name, record.getCellValue(f));
                        const geoid = record.getCellValue(f)[0].value || record.getCellValue(f);
                        if (geoids.filter(id => geoid === id).length < 1) {
                            geoids.push(geoid);
                            temp[record.id] = geoid;
                            // console.log("Add " + geoid, temp);
                            setGeoIDs(temp);
                            setTotalSelectedRecords(++total);
                            // console.log(total);
                        }
                    }
                }
            }
        }

        if (typeof records.unloadData === 'function') {
            records.unloadData();
        }

        if (total <= MAX_RECORDS_TO_MAP) {
            console.log("Update embedded URL: ", MAP_TOOL_URL + geoids.join(","))
            setMapURL(MAP_TOOL_URL + geoids.join(","));
        }

        setIsLoading(false);
    }

    // async function mapCountySelection(recordPromise, geoIdUpdate) {
    //     const geoids = (geoType === "Place") ?
    //         [] : (!!geoIdUpdate) ? values(geoIdUpdate) :
    //         values(geoIDs);
    //     setGeoType('County');
    //     const temp = {};
    //     const records = (!!recordPromise) ?
    //         (await recordPromise).records :
    //         selectedCountyRecords;
    //
    //     // console.log("Selected Counties fields", selectedCountyFields);
    //     // console.log("Selected Counties records", selectedCountyRecords);
    //
    //     let total = (!!geoids && geoids !== null) ? geoids.length : 0;
    //     setTotalSelectedRecords(total);
    //
    //     setIsLoading(true);
    //
    //     for (const record of records) {
    //         for (const f of selectedCountyFields) {
    //             if (record.getCellValue(f) !== null) {
    //                 if (f.name.match(/^Geoid/i) !== null) {
    //                     // console.log(f.name, record.getCellValue(f));
    //                     const geoid = record.getCellValue(f)[0].value;
    //                     if (geoids.filter(id => geoid === id).length < 1) {
    //                         geoids.push(geoid);
    //                         temp[record.id] = geoid;
    //                         // console.log("Add " + geoid, temp);
    //                         setGeoIDs(temp);
    //                         setTotalSelectedRecords(++total);
    //                         // console.log(total);
    //                     }
    //                 }
    //             }
    //         }
    //     }
    //
    //     if (typeof records.unloadData === 'function') {
    //         records.unloadData();
    //     }
    //
    //     if (total <= MAX_RECORDS_TO_MAP) {
    //         console.log("Update embedded URL: ", MAP_TOOL_URL + geoids.join(","))
    //         setMapURL(MAP_TOOL_URL + geoids.join(","));
    //     }
    //
    //     setIsLoading(false);
    // }

    // async function mapPlaceSelection(recordPromise, geoIdUpdate) {
    //     const geoids = (geoType === "County") ?
    //         [] : (!!geoIdUpdate) ? values(geoIdUpdate) :
    //         values(geoIDs);
    //     setGeoType('Place');
    //     const temp = {};
    //     const records = (!!recordPromise) ?
    //         (await recordPromise).records :
    //         placeRecords;
    //
    //     // console.log("Selected Places fields", placeFields);
    //     // console.log("Selected Places records", placeRecords);
    //
    //     let total = (!!geoids && geoids !== null) ? geoids.length : 0;
    //     setTotalSelectedRecords(total);
    //
    //     setIsLoading(true);
    //
    //     for (const record of placeRecords) {
    //
    //         for (const f of placeFields) {
    //             if (record.getCellValue(f) !== null) {
    //                 if (f.name.match(/GEOID$/) !== null) {
    //                     // console.log(f.name, record.getCellValue(f));
    //                     const geoid = record.getCellValue(f)[0].value;
    //                     if (geoids.filter(id => geoid === id).length < 1) {
    //                         geoids.push(geoid);
    //                         temp[record.id] = geoid;
    //                         // console.log("Add " + geoid, temp);
    //                         setGeoIDs(temp);
    //                         setTotalSelectedRecords(++total);
    //                         // console.log(total);
    //                     }
    //                 }
    //             }
    //         }
    //     }
    //
    //     if (typeof records.unloadData === 'function') {
    //         records.unloadData();
    //     }
    //
    //     if (total <= MAX_RECORDS_TO_MAP) {
    //         console.log("Update embedded URL: ", MAP_TOOL_URL + geoids.join(","))
    //         setMapURL(MAP_TOOL_URL + geoids.join(","));
    //     }
    //
    //     setIsLoading(false);
    // }

    useEffect(() => {

        activeTable = base.getTableByIdIfExists(cursor.activeTableId);
        // console.log("Active Table: " + activeTable.name, activeTable );
        for (const view of activeTable.views) {
            if (view.id === cursor.activeViewId) {
                if (activeTable.name === COUNTY_TABLE) {
                    activeView = view;

                // } else if (activeTable.name === SELECTED_COUNTIES_TABLE) {
                //     activeView = view;
                //
                // } else if (activeTable.name === SELECTED_PLACES_TABLE) {
                //     activeView = view;

                }
            }
        }

        if (activeView !== null) {
            console.log("View: " + activeView.name);
            console.log("Active: " + (activeView.id === cursor.activeViewId));

            if (activeTable.name === COUNTY_TABLE) {
                mapCounties(activeView.selectRecordsAsync());

            // } else if (activeTable.name === SELECTED_COUNTIES_TABLE) {
            //     mapCountySelection(activeView.selectRecordsAsync());
            //
            // } else if (activeTable.name === SELECTED_PLACES_TABLE) {
            //     mapPlaceSelection(activeView.selectRecordsAsync());

            }
        } else {
            if (activeTable.name === COUNTY_TABLE) {
                mapCounties();

            // } else if (activeTable.name === SELECTED_COUNTIES_TABLE) {
            //     mapCountySelection();
            //
            // } else if (activeTable.name === SELECTED_PLACES_TABLE) {
            //     mapPlaceSelection();

            } else {
                console.log("Default to Selected Counties")
                mapCounties();
            }
        }

    }, []);

    // This watch deletes the cached selectedRecordId and selectedFieldId when
    // the user moves to a new table or view. This prevents the following
    // scenario: User selects a record that contains a preview url. The preview appears.
    // User switches to a different table. The preview disappears. The user
    // switches back to the original table. Weirdly, the previously viewed preview
    // reappears, even though no record is selected.
    useWatchable(cursor, ['activeTableId', 'activeViewId'], () => {

        activeTable = base.getTableByIdIfExists(cursor.activeTableId);
        console.log("Active Table: " + activeTable.name, activeTable );

        for (const view of activeTable.views) {
            if (view.id === cursor.activeViewId) {
                if (activeTable.name === COUNTY_TABLE) {
                    activeView = view;

                // } else if (activeTable.name === SELECTED_COUNTIES_TABLE) {
                //     activeView = view;
                //
                // } else if (activeTable.name === SELECTED_PLACES_TABLE) {
                //     activeView = view;

                }
            }
        }

        if (activeView !== null) {
            console.log("View: " + activeView.name);
            console.log("Active: " + (activeView.id === cursor.activeViewId));
            console.log("VIEW CHANGE!");

            if (activeTable.name === COUNTY_TABLE) {

                setIsLoading(true);
                mapCounties(activeView.selectRecordsAsync(), {});

            // } else if (activeTable.name === SELECTED_COUNTIES_TABLE) {
            //
            //     setIsLoading(true);
            //     mapCountySelection(activeView.selectRecordsAsync(), {});
            //
            // } else if (activeTable.name === SELECTED_PLACES_TABLE) {
            //
            //     setIsLoading(true);
            //     mapPlaceSelection(activeView.selectRecordsAsync(), {});

            }

        } else {
            if (activeTable.name === COUNTY_TABLE) {

                setIsLoading(true);
                mapCounties();

            // } if (activeTable.name === SELECTED_COUNTIES_TABLE) {
            //
            //     setIsLoading(true);
            //     mapCountySelection();
            //
            // } else if (activeTable.name === SELECTED_PLACES_TABLE) {
            //
            //     setIsLoading(true);
            //     mapPlaceSelection();

            } else {
                setSelectedRecordId(null);
                setSelectedFieldId(null);
            }
        }
    });

    // console.log("useEffect", typeof useEffect);
    // console.log("useRecordById", typeof useRecordById);

    // useLoadable(selectedCountyQueryResult);
    // useWatchable(selectedCountyQueryResult,
    //     ['cellValues', 'records'],
    //     (model, key, details) => {
    //         for (const p in model) {
    //             if (model.hasOwnProperty(p)) {
    //                 console.log(p, ": ", model[p]);
    //                 // if (p === 'selectedRecordIdSet') {
    //                 //     for (const id in model[p]) {
    //                 //         if (model[p].hasOwnProperty(id) && !!model[p][id]) {
    //                 //             selectedRecordIds.push(id);
    //                 //         }
    //                 //     }
    //                 // }
    //             }
    //         }
    //
    //         console.log("key", key);
    //         console.log("details", details);
    //
    //         let total = 0;
    //         setTotalSelectedRecords(total);
    //
    //         const recordState = (details.hasOwnProperty("recordIds"))?
    //             "recordIds" :
    //             (details.hasOwnProperty("addedRecordIds") && details["addedRecordIds"].length > 0)?
    //                 "addedRecordIds" :
    //             (details.hasOwnProperty("removedRecordIds") && details["removedRecordIds"].length > 0)?
    //                 "removedRecordIds" :
    //                 null;
    //
    //         if (recordState !== null) {
    //             let idx = 0;
    //             const geoids = values(geoIDs);
    //             for (const rid of details[recordState]) {
    //                 if (recordState === "recordIds" || recordState === "addedRecordIds") {
    //                     const record = selectedCountyQueryResult.getRecordById(rid);
    //                     console.log("Records in Selected Counties (" + (++idx) + "): ", record);
    //                     for (const p in record) {
    //                         if (p in record && typeof record[p] === 'function') {
    //                             console.log(p + "()");
    //                         }
    //                     }
    //                     for (const f of selectedCountyFields) {
    //                         console.log(f.name, record.getCellValue(f));
    //                         if (record.getCellValue(f) !== null) {
    //                             if (f.name.match(/^Geoid/i) !== null) {
    //                                 const geoid = record.getCellValue(f)[0].value;
    //                                 if (geoids.filter(id => id === geoid).length < 1) {
    //                                     const temp = geoIDs;
    //                                     temp[record.id] = geoid;
    //                                     console.log("Add " + geoid, temp);
    //                                     setGeoIDs(temp);
    //                                     console.log("GEOIDS: ", geoIDs);
    //                                 }
    //                             }
    //                         }
    //                     }
    //                 } else {
    //                     const temp = geoIDs;
    //                     delete temp[rid];
    //                     setGeoIDs(temp);
    //                     // setTotalSelectedRecords(++total);
    //                     // console.log(total);
    //                     console.log("GEOIDS: ", geoIDs);
    //                 }
    //             }
    //         }
    //
    //         if (total <= MAX_RECORDS_TO_MAP) {
    //             console.log("Update embedded URL: ", MAP_TOOL_URL + values(geoIDs).join(","))
    //             setMapURL(MAP_TOOL_URL + values(geoIDs).join(","));
    //         }
    //
    //         return setUpdateDetails(
    //             `${(recordState !== null)? details[recordState].length : 0} records(s) updated at ${Date.now()}`
    //         );
    //     });

    useLoadable(countyQueryResult);
    useWatchable(countyQueryResult,
        ['cellValues', 'records'],
        (model, key, details) => {
            for (const p in model) {
                if (model.hasOwnProperty(p)) {
                    console.log(p, ": ", model[p]);
                    // if (p === 'selectedRecordIdSet') {
                    //     for (const id in model[p]) {
                    //         if (model[p].hasOwnProperty(id) && !!model[p][id]) {
                    //             selectedRecordIds.push(id);
                    //         }
                    //     }
                    // }
                }
            }

            console.log("key", key);
            console.log("details", details);

            const recordState = (details.hasOwnProperty("recordIds"))?
                "recordIds" :
                (details.hasOwnProperty("addedRecordIds") && details["addedRecordIds"].length > 0)?
                    "addedRecordIds" :
                (details.hasOwnProperty("removedRecordIds") && details["removedRecordIds"].length > 0)?
                    "removedRecordIds" :
                    null;

            let total = 0;
            setTotalSelectedRecords(total);

            if (recordState !== null) {
                let idx = 0;
                const geoids = values(geoIDs);
                for (const rid of details[recordState]) {
                    if (recordState === "recordIds" || recordState === "addedRecordIds") {
                        const record = countyQueryResult.getRecordById(rid);
                        console.log("Records in Selected Counties (" + (++idx) + "): ", record);
                        for (const p in record) {
                            if (p in record && typeof record[p] === 'function') {
                                console.log(p + "()");
                            }
                        }
                        for (const f of countyFields) {
                            console.log(f.name, record.getCellValue(f));
                            if (record.getCellValue(f) !== null) {
                                if (f.name.match(/^Geoid/i) !== null) {
                                    const geoid = record.getCellValue(f)[0].value;
                                    if (geoids.filter(id => id === geoid).length < 1) {
                                        const temp = geoIDs;
                                        temp[record.id] = geoid;
                                        console.log("Add " + geoid, temp);
                                        setGeoIDs(temp);
                                        setTotalSelectedRecords(++total);
                                        console.log(total);
                                        console.log("GEOIDS: ", geoIDs);
                                    }
                                }
                            }
                        }
                    } else {
                        const temp = geoIDs;
                        delete temp[rid];
                        setGeoIDs(temp);
                        console.log("GEOIDS: ", geoIDs);
                    }
                }
            }

            if (total <= MAX_RECORDS_TO_MAP) {
                console.log("Update embedded URL: ", MAP_TOOL_URL + values(geoIDs).join(","))
                setMapURL(MAP_TOOL_URL + values(geoIDs).join(","));
            }

            return setUpdateDetails(
                `${(recordState !== null)? details[recordState].length : 0} records(s) updated at ${Date.now()}`
            );
        });

    // useLoadable(placeQueryResult);
    // useWatchable(placeQueryResult,
    //     ['cellValues', 'records'],
    //     (model, key, details) => {
    //         for (const p in model) {
    //             if (model.hasOwnProperty(p)) {
    //                 console.log(p, ": ", model[p]);
    //                 // if (p === 'selectedRecordIdSet') {
    //                 //     for (const id in model[p]) {
    //                 //         if (model[p].hasOwnProperty(id) && !!model[p][id]) {
    //                 //             selectedRecordIds.push(id);
    //                 //         }
    //                 //     }
    //                 // }
    //             }
    //         }
    //
    //         console.log("key", key);
    //         console.log("details", details);
    //
    //         let total = 0;
    //         setTotalSelectedRecords(total);
    //
    //         const recordState = (details.hasOwnProperty("recordIds"))?
    //             "recordIds" :
    //             (details.hasOwnProperty("addedRecordIds") && details["addedRecordIds"].length > 0)?
    //                 "addedRecordIds" :
    //             (details.hasOwnProperty("removedRecordIds") && details["removedRecordIds"].length > 0)?
    //                 "removedRecordIds" :
    //                 null;
    //
    //         if (recordState !== null) {
    //             let idx = 0;
    //             const geoids = values(geoIDs);
    //             for (const rid of details[recordState]) {
    //                 if (recordState === "recordIds" || recordState === "addedRecordIds") {
    //                     const record = placeQueryResult.getRecordById(rid);
    //                     console.log("Records in Selected Places (" + (++idx) + "): ", record);
    //                     for (const p in record) {
    //                         if (p in record && typeof record[p] === 'function') {
    //                             console.log(p + "()");
    //                         }
    //                     }
    //                     for (const f of placeFields) {
    //                         console.log(f.name, record.getCellValue(f));
    //                         if (record.getCellValue(f) !== null) {
    //                             if (f.name.match(/GEOID/i) !== null) {
    //                                 const geoid = record.getCellValue(f)[0].value;
    //                                 if (geoids.filter(id => id === geoid).length < 1) {
    //                                     const temp = geoIDs;
    //                                     temp[record.id] = geoid;
    //                                     console.log("Add " + geoid, temp);
    //                                     setGeoIDs(temp);
    //                                     console.log("GEOIDS: ", geoIDs);
    //                                 }
    //                             }
    //                         }
    //                     }
    //                 } else {
    //                     const temp = geoIDs;
    //                     delete temp[rid];
    //                     setGeoIDs(temp);
    //                     // setTotalSelectedRecords(++total);
    //                     // console.log(total);
    //                     console.log("GEOIDS: ", geoIDs);
    //                 }
    //             }
    //         }
    //
    //         // if (total <= MAX_RECORDS_TO_MAP) {
    //         //     console.log("Update embedded URL: ", MAP_TOOL_URL + values(geoIDs).join(","))
    //         //     setMapURL(MAP_TOOL_URL + values(geoIDs).join(","));
    //         // }
    //
    //         return setUpdateDetails(
    //             `${(recordState !== null)? details[recordState].length : 0} records(s) updated at ${Date.now()}`
    //         );
    //     });

    // load selected records
    useLoadable(cursor);
    // re-render whenever the list of selected records changes
    useWatchable(cursor,
        ['selectedRecordIds'],
        (model, key, details) => {
            console.log("key", key);
            console.log("details", details);

            const geoids = [];
            const selectedRecordIds = [];
            const table = (model._cursorData.hasOwnProperty('activeTableId'))?
                base.getTableById(model._cursorData['activeTableId']) :
                null;

            let total = (!!geoids && geoids !== null) ? geoids.length : 0;
            setTotalSelectedRecords(total);

            setIsLoading(true);

            if (table.name === COUNTY_TABLE) {

                console.log("Active Table " + table.name, table);

                for (const p in model._cursorData) {
                    if (model._cursorData.hasOwnProperty(p)) {
                        console.log(p, ": ", model._cursorData[p]);
                        if (p === 'selectedRecordIdSet') {
                            let idx = 0;
                            let newRecords = [];
                            for (const rid in model._cursorData[p]) {
                                if (model._cursorData[p].hasOwnProperty(rid) && !!model._cursorData[p][rid]) {
                                    const record = countyQueryResult.getRecordById(rid);
                                    console.log("Records in Counties (" + (++idx) + "): ", record);
                                    for (const p in record) {
                                        if (p in record && typeof record[p] === 'function') {
                                            console.log(p + "()");
                                        }
                                    }
                                    for (const f of countyFields) {
                                        if (record.getCellValue(f) !== null) {
                                            if (f.name.match(/^Geoid/i) !== null) {
                                                console.log(f.name, record.getCellValue(f));
                                                const geoid = record.getCellValue(f)[0].value || record.getCellValue(f);
                                                if (geoids.filter(id => id === geoid).length < 1) {
                                                    geoids.push(geoid);
                                                    setTotalSelectedRecords(++total);
                                                    console.log(total);
                                                    console.log("Select only " + geoid);
                                                }
                                            }
                                        }
                                    }

                                }
                            }
                        }
                    }
                }

            // } else if (table.name === SELECTED_COUNTIES_TABLE) {
            //
            //     console.log("Active Table " + table.name, table);
            //
            //     for (const p in model._cursorData) {
            //         if (model._cursorData.hasOwnProperty(p)) {
            //             console.log(p, ": ", model._cursorData[p]);
            //             if (p === 'selectedRecordIdSet') {
            //                 let idx = 0;
            //                 let newRecords = [];
            //                 for (const rid in model._cursorData[p]) {
            //                     if (model._cursorData[p].hasOwnProperty(rid) && !!model._cursorData[p][rid]) {
            //                         const record = selectedCountyQueryResult.getRecordById(rid);
            //                         console.log("Records in Selected Counties (" + (++idx) + "): ", record);
            //                         for (const p in record) {
            //                             if (p in record && typeof record[p] === 'function') {
            //                                 console.log(p + "()");
            //                             }
            //                         }
            //                         for (const f of selectedCountyFields) {
            //                             console.log(f.name, record.getCellValue(f));
            //                             if (record.getCellValue(f) !== null) {
            //                                 if (f.name.match(/^Geoid/i) !== null) {
            //                                     const geoid = record.getCellValue(f)[0].value;
            //                                     if (geoids.filter(id => id === geoid).length < 1) {
            //                                         geoids.push(geoid);
            //                                         setTotalSelectedRecords(++total);
            //                                         console.log(total);
            //                                         console.log("Select only " + geoid);
            //                                     }
            //                                 }
            //                             }
            //                         }
            //
            //                     }
            //                 }
            //             }
            //         }
            //     }
            //
            // } else if (table.name === SELECTED_PLACES_TABLE) {
            //
            //     console.log("Active Table " + table.name, table);
            //
            //     for (const p in model._cursorData) {
            //         if (model._cursorData.hasOwnProperty(p)) {
            //             console.log(p, ": ", model._cursorData[p]);
            //             if (p === 'selectedRecordIdSet') {
            //                 let idx = 0;
            //                 let newRecords = [];
            //                 for (const rid in model._cursorData[p]) {
            //                     if (model._cursorData[p].hasOwnProperty(rid) && !!model._cursorData[p][rid]) {
            //                         const record = placeQueryResult.getRecordById(rid);
            //                         console.log("Records in Selected Places (" + (++idx) + "): ", record);
            //                         for (const p in record) {
            //                             if (p in record && typeof record[p] === 'function') {
            //                                 console.log(p + "()");
            //                             }
            //                         }
            //                         for (const f of placeFields) {
            //                             console.log(f.name, record.getCellValue(f));
            //                             if (record.getCellValue(f) !== null) {
            //                                 if (f.name.match(/GEOID/i) !== null) {
            //                                     const geoid = record.getCellValue(f)[0].value;
            //                                     if (geoids.filter(id => id === geoid).length < 1) {
            //                                         geoids.push(geoid);
            //                                         setTotalSelectedRecords(++total);
            //                                         console.log(total);
            //                                         console.log("Select only " + geoid);
            //                                     }
            //                                 }
            //                             }
            //                         }
            //
            //                     }
            //                 }
            //             }
            //         }
            //     }
            }

            // Update URL HASH of map tool with selected GEO
            if (geoids.length > 0 && total <= 1) {
                console.log("Select geo in URL: ", mapURL + "#!selectedGeo=" + values(geoIDs).join(","))
                document.querySelectorAll('iframe').forEach(elm => {
                    console.log("MAP WINDOW: ", typeof elm.contentWindow, elm.contentWindow);
                    elm.contentWindow.postMessage(
                        "#!selectedGeo=" + geoids.join(","),
                        MAP_TOOL_DOMAIN
                    )
                });
            }

            setIsLoading(false);

            return setSelectionDetails(
                `${selectedRecordIds.join(', ')}`
            );
        });

    // Close the record action error dialog whenever settings are opened or the selected record
    // is updated. (This means you don't have to close the modal to see the settings, or when
    // you've opened a different record.)
    useEffect(() => {
        setRecordActionErrorMessage('');
    }, [isSettingsOpen, selectedRecordId]);

    // Register a callback to be called whenever a record action occurs (via button field)
    // useCallback is used to memoize the callback, to avoid having to register/unregister
    // it unnecessarily.
    const onRecordAction = useCallback(
        data => {
            // Ignore the event if settings are already open.
            // This means we can assume settings are valid (since we force settings to be open if
            // they are invalid).
            if (!isSettingsOpen) {
                if (isEnforced) {
                    if (data.tableId === urlTable.id) {
                        setSelectedRecordId(data.recordId);
                    } else {
                        // Record is from a mismatching table.
                        setRecordActionErrorMessage(
                            `This app is set up to preview URLs using records from the "${urlTable.name}" table, but was opened from a different table.`,
                        );
                    }
                } else {
                    // Preview is not supported in this case, as we wouldn't know what field to preview.
                    // Show a dialog to the user instead.
                    setRecordActionErrorMessage(
                        'You must enable "Use a specific field for previews" to preview URLs with a button field.',
                    );
                }
            }
        },
        [isSettingsOpen, isEnforced, urlTable],
    );
    useEffect(() => {
        // Return the unsubscribe function to ensure we clean up the handler.
        return registerRecordActionDataCallback(onRecordAction);
    }, [onRecordAction]);

    // return <div>🦊 Hello world 🚀</div>;
    return (
        <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            backgroundColor="white"
            padding={0}
            height={500} >
            {/*Active table: {cursor.activeTableId} <br />*/}
            {isSettingsOpen ? (
                <SettingsForm setIsSettingsOpen={setIsSettingsOpen}/>
            ) : (isLoading) ?
                <Loader scale={0.3}  fillColor={'#777'} /> :
                (totalSelectedRecords > MAX_RECORDS_TO_MAP) ? (
                    <Fragment>
                        <Text>To map records in the current view, you must filter the view to less than {MAX_RECORDS_TO_MAP} records ({totalSelectedRecords}).</Text>
                    </Fragment>
                ) : (
                    // `Preview (${updateDetails}): ${mapURL}`
                    <RecordPreviewWithDialog
                        activeTable={activeTable}
                        url = {mapURL}
                        setIsSettingsOpen={setIsSettingsOpen}
                    />
                )
            }
            <br/>
            {recordActionErrorMessage && (
                <Dialog onClose={() => setRecordActionErrorMessage('')} maxWidth={400}>
                    <Dialog.CloseButton/>
                    <Heading size="small">Can&apos;t preview URL</Heading>
                    <Text variant="paragraph" marginBottom={0}>
                        {recordActionErrorMessage}
                    </Text>
                </Dialog>
            )}
        </Box>
    );
}

function values(object) {
    const vals = [];
    for (const p in object) {
        if (object.hasOwnProperty(p) && typeof object[p] !== "function") {
            vals.push(object[p])
        }
    }
    return vals;
}

export default App;
