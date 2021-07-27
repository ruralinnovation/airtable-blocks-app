import React, { Fragment, useState, useEffect } from 'react';
import { ViewType } from '@airtable/blocks/models';
import {
    initializeBlock,
    registerRecordActionDataCallback,
    useBase,
    useRecordById,
    useLoadable,
    useSettingsButton,
    useWatchable,
    Box,
    Dialog,
    Heading,
    Link,
    Text,
    TextButton,
} from '@airtable/blocks/ui';

import { useSettings } from '../settings';
import SettingsForm from '../SettingsForm';
import { converters } from "../utils/converters";

// Shows a preview, or a dialog that displays information about what
// kind of services (URLs) are supported by this app.
export function RecordPreviewWithDialog({
                                     activeTable,
                                     url,
                                     setIsSettingsOpen,
                                 }) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Close the dialog when the selected record is changed.
    // The new record might have a preview, so we don't want to hide it behind this dialog.
    useEffect(() => {
        setIsDialogOpen(false);
    }, []);

    return (
        <Fragment>
            <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
            >
                <RecordPreview
                    activeTable={activeTable}
                    url={url}
                    setIsDialogOpen={setIsDialogOpen}
                    setIsSettingsOpen={setIsSettingsOpen}
                />
            </Box>
            {isDialogOpen && (
                <Dialog onClose={() => setIsDialogOpen(false)} maxWidth={400}>
                    <Dialog.CloseButton/>
                    <Heading size="small">Supported services</Heading>
                    <Text marginTop={2}>Previews are supported for these services:</Text>
                    <Text marginTop={2}>
                        <Link
                            href="https://support.airtable.com/hc/en-us/articles/205752117-Creating-a-base-share-link-or-a-view-share-link"
                            target="_blank"
                        >
                            Airtable share links
                        </Link>
                        , Figma, SoundCloud, Spotify, Vimeo, YouTube, Loom share links, Google Drive
                        share links, Google Docs, Google Sheets, Google Slides
                    </Text>
                    <Link
                        marginTop={2}
                        href="https://airtable.com/shrQSwIety6rqfJZX"
                        target="_blank"
                    >
                        Request a new service
                    </Link>
                </Dialog>
            )}
        </Fragment>
    );
}

// Shows a preview, or a message about what the user should do to see a preview.
export function RecordPreview({
                           activeTable,
                           url,
                           setIsDialogOpen,
                           setIsSettingsOpen,
                       }) {
    const {
        settings: {isEnforced, urlField, urlTable},
    } = useSettings();

    const table = (isEnforced && urlTable) || activeTable;

    // This button is re-used in two states so it's pulled out in a constant here.
    const viewSupportedURLsButton = (
        <TextButton size="small" marginTop={3} onClick={() => setIsDialogOpen(true)}>
            View supported URLs
        </TextButton>
    );

    if (
        // If there is/was a specified table enforced, but the cursor
        // is not presently in the specified table, display a message to the user.
        // Exception: selected record is from the specified table (has been opened
        // via button field or other means while cursor is on a different table.)
        isEnforced
    ) {
        return (
            <Fragment>
                <Text paddingX={3}>Switch to the “{table.name}” table to see previews.</Text>
                <TextButton size="small" marginTop={3} onClick={() => setIsSettingsOpen(true)}>
                    Settings
                </TextButton>
            </Fragment>
        );
    } else {

        if (!url) {
            return (
                <Fragment>
                    <Text>There is no Map Tool URL</Text>
                    {viewSupportedURLsButton}
                </Fragment>
            );
        } else {
            let previewUrl = null;

            if (!!url && url !== null) {

                // Try to extract the preview URL from the URL using regular expression
                // based helper functions for each service we support.
                //
                for (const converter of converters) {
                    if (previewUrl === null) previewUrl = converter(url);
                }
            }

            // In this case, the FIELD_NAME field of the currently selected
            // record either contains no URL, or contains a that cannot be
            // resolved to a supported preview.
            if (!previewUrl) {
                return (
                    <Fragment>
                        <Text>No preview</Text>
                        {viewSupportedURLsButton}
                    </Fragment>
                );
            } else {
                return (
                    <iframe
                        // Using `key=previewUrl` will immediately unmount the
                        // old iframe when we're switching to a new
                        // preview. Otherwise, the old iframe would be reused,
                        // and the old preview would stay onscreen while the new
                        // one was loading, which would be a confusing user
                        // experience.
                        key={previewUrl}
                        style={{flex: 'auto', width: '100%'}}
                        src={previewUrl}
                        frameBorder="0"
                        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                );
            }
        }
    }
}
