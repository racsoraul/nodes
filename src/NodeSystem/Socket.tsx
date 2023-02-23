import { Variable, VariableType } from "./Node"
import { ElementType } from "./NodeSystem"
import classes from "./Socket.module.css"

export const enum SocketType {
    Input,
    Output
}

interface SocketProps {
    nodeID: number
    index: number
    type: SocketType
    variable: Variable
    active: boolean
}

function Socket(props: SocketProps) {
    return <div className={`${classes.container} ${props.type === SocketType.Output ? classes.alignToRightBorder : classes.alignToLeftBorder}`}>
        <div
            id={`${props.nodeID}_${props.type}_${props.variable.type}_${props.index}`}
            data-element-type={ElementType.Socket}
            className={`${classes.connector} ${props.active ? classes.active : ""}`}
            style={{ backgroundColor: getColorFromType(props.variable.type) }}
        />
        {renderValue(props.type, props.variable)}
    </div>
}

export default Socket

/**
 * Returns the hex color associated to the variable type.
 * @param type Variable type.
 * @returns Hex color for the given variable type.
 */
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

export function getNodeFromSocketID(id: string): HTMLElement | null {
    return document.getElementById(id.split("_")[0])
}

export function getNodeIDFromSocketID(id: string): number {
    return Number(id.split("_")[0])
}

export function getTypeFromSocketID(id: string): SocketType {
    if (id.length == 0) {
        throw new Error("Invalid socket ID")
    }
    const socketType = Number(id.split("_")[1])
    switch (socketType) {
        case SocketType.Input:
            return SocketType.Input
        case SocketType.Output:
            return SocketType.Output
        default:
            throw new Error("Invalid socket type")
    }
}