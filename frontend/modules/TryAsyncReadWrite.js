import { colors } from "@airtable/blocks/ui";
import { FieldType } from '@airtable/blocks/models';
import React from "react";

// Airtable SDK limit: we can only update 50 records at a time. For more details, see
// https://github.com/Airtable/blocks/blob/master/packages/sdk/docs/guide_writes.md#size-limits--rate-limits
const MAX_RECORDS_PER_UPDATE = 50;

const API_ENDPOINT = 'https://en.wikipedia.org/api/rest_v1/page/summary';
const FIELD_NAME = 'County';
const EXTRACT_FIELD_NAME = 'Summary';
const IMAGE_FIELD_NAME = 'Image';

export async function tryAsyncReadWrite (table, records) {
    console.log(colors.RED);
    console.log(colors.YELLOW);
    console.log(colors.GREEN);

    // const tryNewField = await table.createFieldAsync('Status', FieldType.SINGLE_SELECT, {
    //     choices: [
    //         { name: 'Not started', color: 'redLight2' },
    //         { name: 'In Progress', color: 'yellowLight2' },
    //         { name: 'Done', color: 'greenLight2' },
    //     ]
    // });

    const recordUpdates = [];
    for (const record of records) {
        // for each record, we take the article title and make an API request:
        const articleTitle = record.getCellValueAsString(FIELD_NAME).replace(" [", ", ").replace("]", "");
        const requestUrl = `${API_ENDPOINT}/${encodeURIComponent(articleTitle)}?redirect=true`;
        const response = await fetch(requestUrl, {cors: true});
        const pageSummary = await response.json();

        // then, we can use the result of that API request to decide how we want to update our
        // record. To update an attachment, you need an array of objects with a `url` property.
        recordUpdates.push({
            id: record.id,
            fields: {
                [EXTRACT_FIELD_NAME]: pageSummary.extract,
                [IMAGE_FIELD_NAME]: pageSummary.originalimage
                    ? [{url: pageSummary.originalimage.source}]
                    : undefined,
            },
        });

        // out of respect for the wikipedia API, a free public resource, we wait a short time
        // between making requests. If you change this example to use a different API, you might
        // not need this.
        await delayAsync(50);
    }
    
    // Update multiple records in batch
    if (recordUpdates.length > 0) {
        console.log("SEND SELECTED RECORDS TO UPDATE FUNCTION");
        await updateRecordsInBatchesAsync(table, recordUpdates);
    }

    return recordUpdates;
}

async function updateRecordsInBatchesAsync(table, recordUpdates) {
    // Fetches & saves the updates in batches of MAX_RECORDS_PER_UPDATE to stay under size limits.
    let i = 0;
    while (i < recordUpdates.length) {
        console.log(`SELECT RECORDS ${i} - ${i + MAX_RECORDS_PER_UPDATE}`);
        const updateBatch = recordUpdates.slice(i, i + MAX_RECORDS_PER_UPDATE);
        // await is used to wait for the update to finish saving to Airtable servers before
        // continuing. This means we'll stay under the rate limit for writes.
        await table.updateRecordsAsync(updateBatch);
        console.log(recordUpdates);
        i += MAX_RECORDS_PER_UPDATE;
    }
}

function delayAsync(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
