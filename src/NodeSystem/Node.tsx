import { MouseEvent, useEffect, useRef, useState } from "react"
import classes from "./Node.module.css"
import Socket, { SocketType } from "./Socket"
import { NodeRef } from "./NodeSystem"

export const enum VariableType {
    Number = "Number",
    Text = "Text"
}

export interface Variable {
    type: VariableType
    name: string
}

interface Coordinate {
    x: number
    y: number
}

interface BaseNodeProps {
    title: string
    inputs: Variable[]
    outputs: Variable[]
    activeNodeID: number
    onCreation: (ref: NodeRef) => void
    onActive: (id: number) => void
}

function Node(props: BaseNodeProps) {
    const nodeRef = useRef<HTMLDivElement>(null)
    const [offset, setOffet] = useState<Coordinate>({ x: 0, y: 0 })
    const [currentPos, setCurrentPos] = useState<Coordinate>({ x: 0, y: 0 })
    const [isDragging, setIsDragging] = useState(false)
    const [currentZIndex, setCurrentZIndex] = useState(1)
    const id = useRef(0)

    useEffect(() => {
        id.current = Math.floor(Math.random() * 1000)
        props.onCreation({
            id: id.current,
            connections: [],
        })
    }, [])

    useEffect(() => {
        if (isActive(id.current, props.activeNodeID)) {
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
        props.onActive(id.current)
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
        console.log(nextPos);
        setCurrentPos({
            x: nextPos.x < 0 ? 0 : nextPos.x,
            y: nextPos.y < 0 ? 0 : nextPos.y,
        })
    }

    return <div
        ref={nodeRef}
        className={`${classes.container} ${isActive(id.current, props.activeNodeID) ? classes.active : ""}`}
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
                        active={isActive(id.current, props.activeNodeID)}
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
                        active={isActive(id.current, props.activeNodeID)}
                        type={SocketType.Input}
                        variable={input}
                    />
                )}
            </div>
        </div>
    </div>
}

export default Node

function isActive(id: number, targetID: number): boolean {
    return id === targetID
}