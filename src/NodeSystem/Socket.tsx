import { Variable, VariableType } from "./Node"
import classes from "./Socket.module.css"

export const enum SocketType {
    Input,
    Output
}

interface SocketProps {
    type: SocketType
    variable: Variable
    active: boolean
}

function Socket({ type, variable, active }: SocketProps) {
    return <div className={`${classes.container} ${type === SocketType.Output ? classes.alignToRightBorder : classes.alignToLeftBorder}`}>
        <div
            className={`${classes.connector} ${active ? classes.active : ""}`}
            style={{ backgroundColor: getColorFromType(variable.type) }}
        />
        {renderValue(type, variable)}
    </div>
}

export default Socket

function getColorFromType(type: VariableType): string {
    switch (type) {
        case VariableType.Number:
            return "#0000FF"
        case VariableType.Text:
            return "#00FFFF"
    }
}

function renderValue(type: SocketType, variable: Variable) {
    switch (variable.type) {
        case VariableType.Number:
            return <div
                className={`${type === SocketType.Input ? classes.valueInput : classes.valueOutput}`}
            >
                <input readOnly={SocketType.Output === type} type="number" placeholder={variable.name} />
            </div>

        default:
            break;
    }
}