import { colors } from "@airtable/blocks/ui";
import { FieldType } from '@airtable/blocks/models';
import React from "react";

const EXTRACT_FIELD_NAME = 'Facets';

export async function tryAsyncReadWrite (table, records) {
    // console.log(colors.RED_LIGHT_1);
    // console.log(colors.YELLOW_LIGHT_1);
    // console.log(colors.GREEN_LIGHT_1);
    //
    // const tryNewField = await table.createFieldAsync('Status', FieldType.SINGLE_SELECT, {
    //     choices: [
    //         { name: 'Not started', color: colors.RED_LIGHT_1 },
    //         { name: 'In Progress', color: colors.YELLOW_LIGHT_1 },
    //         { name: 'Done', color: colors.GREEN_LIGHT_1 },
    //     ]
    // });

    let idx = 0;

    const recordUpdates = [];
    for (const record of records) {

        if (idx++ === (records.length - 1)) {
            // await table.updateRecordAsync(record, {"Facets": "Global"});

            recordUpdates.push({
                id: record.id,
                fields: {
                    [EXTRACT_FIELD_NAME]: [
                        { "id":"recUrwpV0sZ7g5qBW","name":"Global" }
                    ]
                },
            });

            console.log(record);

            await delayAsync(50);
        }
    }

    return recordUpdates;
}

function delayAsync(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
