import { MouseEvent, useEffect, useRef, useState } from "react"
import Socket, { SocketType } from "./Socket"
import classes from "./Node.module.css"

export const enum VariableType {
    Number = "Number",
    Text = "Text"
}

export interface Variable {
    type: VariableType
    name: string
}

export interface Coordinate {
    x: number
    y: number
}

export interface NodeDragEvent {
    id: number,
    position: Coordinate,
    sockets?: {
        [socketID: string]: Coordinate
    }
}

interface BaseNodeProps {
    title: string
    inputs: Variable[]
    outputs: Variable[]
    activeNodeID: number
    onCreation: () => void
    onActive: (id: number) => void
    onDragging: (event: NodeDragEvent) => void
}

function Node(props: BaseNodeProps) {
    const nodeRef = useRef<HTMLDivElement>(null)
    const [id, setId] = useState(0)
    const [offset, setOffet] = useState<Coordinate>({ x: 0, y: 0 })
    const [currentPos, setCurrentPos] = useState<Coordinate>({ x: 0, y: 0 })
    const [isDragging, setIsDragging] = useState(false)
    const [currentZIndex, setCurrentZIndex] = useState(1)

    useEffect(() => {
        const newId = Math.floor(Math.random() * 1000)
        setId(newId)
        // TODO: onCreation Event
        props.onCreation()
    }, [props.onCreation])

    useEffect(() => {
        if (isActive(id, props.activeNodeID)) {
            setCurrentZIndex(2)
        } else {
            setCurrentZIndex(1)
        }
    }, [props.activeNodeID])

    const handleMouseDown = (event: MouseEvent<HTMLDivElement>) => {
        if (!nodeRef.current) {
            return
        }
        setIsDragging(true)
        props.onActive(id)
        setOffet({
            x: nodeRef.current.offsetLeft - event.clientX,
            y: nodeRef.current.offsetTop - event.clientY,
        })
    }

    const handleRelease = () => {
        setIsDragging(false)
    }

    const handleOnMouseMove = (event: MouseEvent<HTMLDivElement>) => {
        event.preventDefault()
        if (!isDragging) {
            return
        }
        if (!nodeRef.current) {
            return
        }
        const nextPos = {
            x: offset.x + event.clientX,
            y: offset.y + event.clientY,
        }
        setCurrentPos({
            x: nextPos.x < 0 ? 0 : nextPos.x,
            y: nextPos.y < 0 ? 0 : nextPos.y,
        })
        props.onDragging({
            id: id,
            position: nextPos,
        })
    }

    return <div
        id={`${id}`}
        ref={nodeRef}
        className={`${classes.container} ${isActive(id, props.activeNodeID) ? classes.active : ""}`}
        style={{
            left: currentPos.x,
            top: currentPos.y,
            zIndex: currentZIndex,
        }}
    >
        <header
            className={classes.header}
            onMouseDown={handleMouseDown}
            onMouseMove={handleOnMouseMove}
            onMouseUp={handleRelease}
            onMouseLeave={handleRelease}
            style={{ cursor: isDragging ? "grabbing" : "grab" }}
        >
            <h1>{props.title}</h1>
        </header>
        <div className={classes.body}>
            <div className={classes.outputs}>
                {props.outputs.map(
                    (output, index) => <Socket
                        key={index}
                        nodeID={id}
                        index={index}
                        active={isActive(id, props.activeNodeID)}
                        type={SocketType.Output}
                        variable={output}
                    />
                )}
            </div>
            <div className={classes.options}>
                <select>
                    <option>Add</option>
                    <option>Subtract</option>
                    <option>Multiply</option>
                    <option>Divide</option>
                </select>
            </div>
            <div className={classes.inputs}>
                {props.inputs.map(
                    (input, index) => <Socket
                        key={index}
                        nodeID={id}
                        index={index}
                        active={isActive(id, props.activeNodeID)}
                        type={SocketType.Input}
                        variable={input}
                    />
                )}
            </div>
        </div>
    </div>
}

export default Node

/**
 * Returns whether the current Node of `id` is active or not.
 * 
 * @param id of current Node.
 * @param targetID ID of the current active Node.
 * @returns A boolean indicating whether the current Node is active or not.
 */
function isActive(id: number, targetID: number): boolean {
    return id === targetID
}