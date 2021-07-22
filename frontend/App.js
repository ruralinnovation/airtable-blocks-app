import React, { Fragment, Component, useEffect, useState } from 'react';
import {
  Button,
  initializeBlock,
  useBase,
  useLoadable,
  useRecordById, useRecordIds,
  useRecords,
  useWatchable
} from '@airtable/blocks/ui';
import { MyComponent } from './modules/MyComponent';
import { tryAsyncReadWrite } from "./modules/TryAsyncReadWrite";

let addFieldAgain = true;

function App() {
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

  console.log("useEffect", typeof useEffect);

  console.log("useRecordById", typeof useRecordById);

  console.log(useRecordById(table, useRecordIds(table)[0]));

  try {
      const field = table.getFieldByName('Status');
      console.log(field);
      if (!!field && field !== null ) {
          addFieldAgain = false;
      }
  } catch (e) {
      console.log('Status does not exist')
  }

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
              disabled={!addFieldAgain}
              marginBottom={3}
          >
              Update summaries and images
          </Button>
      </Fragment>
      <MyComponent table={table} records={records} />
  </div>;
}

export default App;
