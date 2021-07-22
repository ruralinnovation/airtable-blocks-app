import React from "react";

export class MyComponent extends React.Component {
    render() {
        console.log(this.props.table);

        return <div>{this.props.records.map(r => {
            const recordElm = [];
            // Use key={...} to solve for Warning: Each child
            // in a list should have a unique "key" prop
            const recordId = r['_id'];
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
                    propElms.push(<span key={recordId + "." + p}>{p}: {property}<br /></span>)
                }
            }
            recordElm.push(<div key={recordId}>{propElms}<hr /></div>)
            return recordElm;
        })}</div>
    }
}
