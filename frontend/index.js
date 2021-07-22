/**
 * This starter app is specifically designed to be used with the "Product planning" base in the free Airtable course
 */

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

    console.log(useRecordById(table, useRecordIds(table)[0]));

    async function onButtonClick() {
        let recordUpdates = [];
        if (!!addFieldAgain) {
            addFieldAgain = false;
            recordUpdates = await tryAsyncReadWrite(table, records);
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
