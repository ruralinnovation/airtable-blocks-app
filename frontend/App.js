import React, { Fragment, Component, useEffect, useState } from 'react';
import {
    Box,
    Button, Dialog, Heading,
    Loader, Text,
    useBase,
    useCursor,
    useLoadable,
    useRecordById,
    useRecordIds,
    useRecords, useSettingsButton,
    useWatchable
} from '@airtable/blocks/ui';
import { MyComponent } from './modules/MyComponent';
import { tryAsyncReadWrite } from "./modules/TryAsyncReadWrite";
import SettingsForm from "./SettingsForm";
import { RecordPreviewWithDialog } from "./modules/RecordPreviewWithDialog";

function App() {
    // YOUR CODE GOES HERE
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    useSettingsButton(() => setIsSettingsOpen(!isSettingsOpen));

    const [selectionDetails, setSelectionDetails] = useState('No changes yet');
    const [updateDetails, setUpdateDetails] = useState('No changes yet');
    const [mapURL, setMapURL] = useState('');
    const [geoIDs, setGeoIDs] = useState({});

    // keep track of whether we have up update currently in progress - if there is, we want to hide
    // the update button so you can't have two updates running at once.
    const [isUpdateInProgress, setIsUpdateInProgress] = useState(false);

    const base = useBase();
    const cursor = useCursor();

    const table = base.getTableByName('Current Selection');
    const queryResult = table.selectRecords();
    const fields = table.fields;
    const records = useRecords(table.selectRecords());

    console.log("fields", fields);
    console.log("records", records);

    useEffect(() => {
        const geoids = values(geoIDs);
        let idx = 0;
        for (const record of records) {
            // work with the data in the query result
            console.log("Records in Current Selection (" + (++idx) + "): ", record);
            for (const p in record) {
                if (p in record && typeof record[p] === 'function') {
                    console.log(p + "()");
                }
            }
            for (const f of fields) {
                console.log(f.name, record.getCellValue(f));
                if (record.getCellValue(f) !== null) {
                    if (f.name.match(/Geoid/i) !== null) {
                        const geoid = record.getCellValue(f)[0].value;
                        if (geoids.filter(id => geoid === id).length < 1) {
                            const temp = geoIDs;
                            temp[record.id] = geoid;
                            console.log("Add " + geoid, temp);
                            setGeoIDs(temp);
                            console.log("GEOIDS: ", geoIDs);
                        }
                    }
                }
            }
        }

        setMapURL("https://ruralinnovation.shinyapps.io/broadband_county_assessment_tool/?geoids=" + values(geoIDs).join(","));
    }, []);

    console.log("useEffect", typeof useEffect);
    console.log("useRecordById", typeof useRecordById);

    useLoadable(queryResult);
    useWatchable(queryResult,
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

            if (recordState !== null) {
                let idx = 0;
                const geoids = values(geoIDs);
                for (const rid of details[recordState]) {
                    if (recordState === "recordIds" || recordState === "addedRecordIds") {
                        const record = queryResult.getRecordById(rid);
                        console.log("Records in Current Selection (" + (++idx) + "): ", record);
                        for (const p in record) {
                            if (p in record && typeof record[p] === 'function') {
                                console.log(p + "()");
                            }
                        }
                        for (const f of fields) {
                            console.log(f.name, record.getCellValue(f));
                            if (record.getCellValue(f) !== null) {
                                if (f.name.match(/Geoid/i) !== null) {
                                    const geoid = record.getCellValue(f)[0].value;
                                    if (geoids.filter(id => id === geoid).length < 1) {
                                        const temp = geoIDs;
                                        temp[record.id] = geoid;
                                        console.log("Add " + geoid, temp);
                                        setGeoIDs(temp);
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

            setMapURL("https://ruralinnovation.shinyapps.io/broadband_county_assessment_tool/?geoids=" + values(geoIDs).join(","));

            return setUpdateDetails(
                `${(recordState !== null)? details[recordState].length : 0} records(s) updated at ${Date.now()}`
            );
        });

    // // load selected records
    // useLoadable(cursor);
    // // re-render whenever the list of selected records changes
    // useWatchable(cursor, ['selectedRecordIds'], (model, key, details) => {
    //
    //     const selectedRecordIds = [];
    //
    //     for (const p in model._cursorData) {
    //         if (model._cursorData.hasOwnProperty(p)) {
    //             // console.log(p, ": ", model._cursorData.hasOwnProperty(p));
    //             if (p === 'selectedRecordIdSet') {
    //                 for (const id in model._cursorData[p]) {
    //                     if (model._cursorData[p].hasOwnProperty(id) && !!model._cursorData[p][id]) {
    //                         selectedRecordIds.push(id);
    //                     }
    //                 }
    //             }
    //         }
    //     }
    //
    //     return setSelectionDetails(
    //         `${selectedRecordIds.join(', ')}`
    //     );
    // });

    //
    // async function onButtonClick() {
    //     setIsUpdateInProgress(true);
    //     await tryAsyncReadWrite(table, records);
    //     setIsUpdateInProgress(false);
    // }

    // return <div>🦊 Hello world 🚀</div>;
    return (
        <Box>
            {isSettingsOpen ? (
                "Settings"
                // <SettingsForm setIsSettingsOpen={setIsSettingsOpen}/>
            ) : (
                // `Preview (${updateDetails}): ${mapURL}`
                <RecordPreviewWithDialog
                    activeTable={table}
                    url = {mapURL}
                    setIsSettingsOpen={setIsSettingsOpen}
                />
            )}<br/>
            {"Error"}
            {/*{recordActionErrorMessage && (*/}
            {/*    <Dialog onClose={() => setRecordActionErrorMessage('')} maxWidth={400}>*/}
            {/*        <Dialog.CloseButton/>*/}
            {/*        <Heading size="small">Can&apos;t preview URL</Heading>*/}
            {/*        <Text variant="paragraph" marginBottom={0}>*/}
            {/*            {recordActionErrorMessage}*/}
            {/*        </Text>*/}
            {/*    </Dialog>*/}
            {/*)}*/}
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
