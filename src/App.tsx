import { useState } from "react";
import reactLogo from "./assets/react.svg";
import "ag-grid-enterprise/dist/styles/ag-grid.css"; // Core grid CSS, always needed
import "ag-grid-enterprise/dist/styles/ag-theme-alpine.css"; // Optional theme CSS
import { AgGridReact } from "ag-grid-react";
import "./App.css";
import { ColDef, GridApi, IHeaderParams } from "ag-grid-enterprise";

function App() {
  const [count, setCount] = useState(0);
  const [renderGrid, setRenderGrid] = useState(false);

  return (
    <div className="App">
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src="/vite.svg" className="logo" alt="Vite logo" />
        </a>
        <a href="https://reactjs.org" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <button onClick={() => setRenderGrid((cur) => !cur)}>
          Render the AG-Grid
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      {renderGrid && <Grid />}
    </div>
  );
}

export type TemplateRow = {
  templateValue: string;
  fromDocument: string;
  [name: string]: string;
};

const DEFAULT_COLUMN_DEF = () => [
  {
    field: "fromDocument",
    editable: false,
    headerName: "Matches",
    lockPosition: true,
    initialWidth: 300,
    pinned: true,
    cellStyle: {
      opacity: "0.5",
      background: "white",
    },
  },
  {
    field: "templateValue",
    headerName: "Find and replace",
    editable: true,
  },
];

export interface ICustomHeaderParams extends IHeaderParams {
  menuIcon: string;
  editableName: boolean;
  uniqueId: string;
  updateColumnHeaderName: (uniqueId: string, newName: string) => void;
  updateSelectedColId: (colValue: string) => void;
}
export const TemplateGridCustomHeader = ({
  editableName,
  displayName,
  uniqueId,
  updateColumnHeaderName,
  updateSelectedColId,
  column,
}: ICustomHeaderParams) => {
  const [editableDisplayName, setEditableDisplayName] = useState(displayName);
  const customHeaderComponent = editableName ? (
    <div>
      <input
        type="text"
        value={editableDisplayName}
        style={{
          border: "none",
          background: "transparent",
          color: "#000",
        }}
        onFocus={() => updateSelectedColId(column.getId())}
        onBlur={() => {
          updateColumnHeaderName(uniqueId, editableDisplayName);
        }}
        onKeyPress={(e) => {
          if (e.key === "Enter") {
            updateSelectedColId("");
            updateColumnHeaderName(uniqueId, editableDisplayName);
          }
        }}
        onChange={(e) => {
          updateSelectedColId(column.getId());

          setEditableDisplayName(e.target.value.toString());
        }}
      />
    </div>
  ) : (
    <div>{displayName}</div>
  );

  return customHeaderComponent;
};

const customColumnHeaders = {
  agColumnHeader: TemplateGridCustomHeader,
};

const defaultColDef = {
  editable: true,
  sortable: false,
  flex: 0,
  minWidth: 100,
  initialWidth: 150,
  filter: false,
  resizable: true,
  headerComponentParams: {
    editableName: false,
  },
};

function Grid() {
  const [gridApi, setGridApi] = useState<GridApi>();
  const [rowData, setRowData] = useState<TemplateRow[]>([]);
  const [columnDefs, setColumnDefs] = useState<ColDef[]>(DEFAULT_COLUMN_DEF);
  return (
    <AgGridReact
      onGridReady={(r) => setGridApi(r.api)}
      rowData={rowData}
      enterMovesDown={true}
      undoRedoCellEditing={true}
      headerHeight={25}
      enterMovesDownAfterEdit={true}
      suppressScrollOnNewData={true}
      suppressMovableColumns={true}
      columnDefs={columnDefs}
      components={customColumnHeaders}
      rowSelection="multiple"
      suppressColumnMoveAnimation={true}
      defaultColDef={defaultColDef}
    />
  );
}

export default App;
