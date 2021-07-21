import { colors } from "@airtable/blocks/ui";
import { FieldType } from '@airtable/blocks/models';
import React from "react";

// Airtable SDK limit: we can only update 50 records at a time. For more details, see
// https://github.com/Airtable/blocks/blob/master/packages/sdk/docs/guide_writes.md#size-limits--rate-limits
const MAX_RECORDS_PER_UPDATE = 50;

const FIELD_NAME = 'Facets';

export async function tryAsyncReadWrite (table, records) {
    console.log(colors.RED);
    console.log(colors.YELLOW);
    console.log(colors.GREEN);

    const tryNewField = await table.createFieldAsync('Status', FieldType.SINGLE_SELECT, {
        choices: [
            { name: 'Not started', color: 'redLight2' },
            { name: 'In Progress', color: 'yellowLight2' },
            { name: 'Done', color: 'greenLight2' },
        ]
    });

    let idx = 0;

    const recordUpdates = [];
    for (const record of records) {

        if (idx++ === (records.length - 1)) {
            
            // Update single record
            await table.updateRecordAsync(record, {
                [FIELD_NAME]: [
                    { "id":"recUrwpV0sZ7g5qBW","name":"Global" }
                ]
            });

            recordUpdates.push({
                id: record.id,
                fields: {
                    [FIELD_NAME]: [
                        { "id":"recUrwpV0sZ7g5qBW","name":"Global" }
                    ]
                },
            });

            console.log(record);

            await delayAsync(50);
        }
    }
    
    // Update multiple records in batch
    if (recordUpdates.length > 0) {
        await updateRecordsInBatchesAsync(table, recordUpdates);
    }

    return recordUpdates;
}

async function updateRecordsInBatchesAsync(table, recordUpdates) {
    // Fetches & saves the updates in batches of MAX_RECORDS_PER_UPDATE to stay under size limits.
    let i = 0;
    while (i < recordUpdates.length) {
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
