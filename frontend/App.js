import React, { useEffect, useState, useCallback } from 'react';
import {
    Box, Dialog, Heading, Text,
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

const MAP_TOOL_URL = "https://ruralinnovation.shinyapps.io/cims-map-tool/?geoids=";

function App() {
    // YOUR CODE GOES HERE
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

    // keep track of whether we have up update currently in progress - if there is, we want to hide
    // the update button so you can't have two updates running at once.
    const [isUpdateInProgress, setIsUpdateInProgress] = useState(false);

    const base = useBase();
    const cursor = useCursor();

    const table = base.getTableByName('Current Selection');
    const queryResult = table.selectRecords();
    const fields = table.fields;
    const records = useRecords(table.selectRecords());

    console.log("Current Selection fields", fields);
    console.log("Current Selection records", records);

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

        setMapURL(MAP_TOOL_URL + values(geoIDs).join(","));
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

            setMapURL(MAP_TOOL_URL + values(geoIDs).join(","));

            return setUpdateDetails(
                `${(recordState !== null)? details[recordState].length : 0} records(s) updated at ${Date.now()}`
            );
        });

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

            if (table.name === 'Current Selection') {

                console.log("Active Table", table);

                for (const p in model._cursorData) {
                    if (model._cursorData.hasOwnProperty(p)) {
                        console.log(p, ": ", model._cursorData[p]);
                        if (p === 'selectedRecordIdSet') {
                            let idx = 0;
                            let newRecords = [];
                            for (const rid in model._cursorData[p]) {
                                if (model._cursorData[p].hasOwnProperty(rid) && !!model._cursorData[p][rid]) {
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
                                                    geoids.push(geoid);
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
            }

            // Reload map tool with only feature selected by cursor
            if (geoids.length > 0) {
                setMapURL(MAP_TOOL_URL + geoids.join(","));
            }

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

    // This watch deletes the cached selectedRecordId and selectedFieldId when
    // the user moves to a new table or view. This prevents the following
    // scenario: User selects a record that contains a preview url. The preview appears.
    // User switches to a different table. The preview disappears. The user
    // switches back to the original table. Weirdly, the previously viewed preview
    // reappears, even though no record is selected.
    useWatchable(cursor, ['activeTableId', 'activeViewId'], () => {
        setSelectedRecordId(null);
        setSelectedFieldId(null);
    });

    // return <div>🦊 Hello world 🚀</div>;
    return (
        <Box>
            {isSettingsOpen ? (
                <SettingsForm setIsSettingsOpen={setIsSettingsOpen}/>
            ) : (
                // `Preview (${updateDetails}): ${mapURL}`
                <RecordPreviewWithDialog
                    activeTable={table}
                    url = {mapURL}
                    setIsSettingsOpen={setIsSettingsOpen}
                />
            )}<br/>
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
