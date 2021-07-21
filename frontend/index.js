import {
    Button,
    colors,
    initializeBlock,
    useBase,
    useLoadable,
    useRecordById, useRecordIds,
    useRecords,
    useWatchable
} from '@airtable/blocks/ui';
import React, { Fragment, useEffect, useState } from 'react';
import { tryAsyncReadWrite } from './modules/TryAsyncReadWrite';


// Airtable SDK limit: we can only update 50 records at a time. For more details, see
// https://github.com/Airtable/blocks/blob/master/packages/sdk/docs/guide_writes.md#size-limits--rate-limits
const MAX_RECORDS_PER_UPDATE = 50;

let addFieldAgain = true;

function AirtableBlocksApp() {

    // YOUR CODE GOES HERE
    const [ changeDetails, setChangeDetails ] = useState('No changes yet');

    const base = useBase();
    const table = base.getTableByName('App sections');
    const queryResult = table.selectRecords();
    const records = useRecords(table.selectRecords());

    console.log(records);

    useLoadable(queryResult);

    useWatchable(queryResult, 'cellValues', (model, key, details) => {
        return setChangeDetails(
            `${ details.fieldIds.length } field(s) in ${
                details.recordIds.length
            } records(s) at ${Date.now()}`
        );
    });

    console.log(typeof useEffect);

    console.log(useRecordById(table, useRecordIds(table)[9]));

    async function onButtonClick() {
        let recordUpdates = [];
        if (!!addFieldAgain) {
            addFieldAgain = false;
            recordUpdates = await tryAsyncReadWrite(table, records);
        }
        if (recordUpdates.length > 0) {
            await updateRecordsInBatchesAsync(table, recordUpdates);
        }
    }

    // return <div>🦊 Hello world 🚀</div>;
    return <div>🦊 Last change:  🚀 <br />
        {changeDetails} <br />
        <Fragment>
            <Button
                variant="primary"
                onClick={onButtonClick}
                marginBottom={3}
            >
                Update summaries and images
            </Button>
        </Fragment>
        {/*<MyComponent table={table} records={records} />*/}
    </div>;
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

class MyComponent extends React.Component {
    render() {
        console.log(this.props.table);

        return <div>{this.props.records.map(r => {
            const recordElm = [];
            const propElms = [];
            for (const p in r) {
                if (p in r /*&& r.hasOwnProperty(p)*/) {
                    let property = "";
                    if (typeof r[p] === 'object') try {
                        property = JSON.stringify(r[p])
                    } catch (e) {
                        property = r[p].toString();
                    } else {
                        property = r[p];
                    }
                    propElms.push(<span>{p}: {property}<br /></span>)
                }
            }
            recordElm.push(<div>{propElms}<hr /></div>)
            return recordElm;
        })}</div>
    }
}

initializeBlock(() => <AirtableBlocksApp/>);
