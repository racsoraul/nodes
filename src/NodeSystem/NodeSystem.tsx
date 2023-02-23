import { MouseEvent, RefObject, useCallback, useRef, useState } from "react"
import Node, { Coordinate, NodeDragEvent, VariableType } from "./Node"
import { SocketType, getNodeFromSocketID, getNodeIDFromSocketID, getTypeFromSocketID } from "./Socket"
import useMouseCoords from "../hooks/useMouseCoords"
import classes from "./NodeSystem.module.css"

export const enum ElementType {
    Socket = "Socket",
}

interface Socket {
    id: string
    type: SocketType
    position: Coordinate
}

interface ConnectionLine {
    id: string
    from: Socket
    to: Socket
}

interface ActiveSocket {
    origin: Socket
}

interface NodeSystemProps {
    width: number
    height: number
}

function NodeSystem(props: NodeSystemProps) {
    const svgContainerRef = useRef<SVGSVGElement>(null)
    const nodesContainerRef = useRef<HTMLDivElement>(null)
    const [activeNodeID, setActiveNodeID] = useState(0)
    const [activeSocket, setActiveSocket] = useState<ActiveSocket | null>(null)
    const [connectionLines, setConnectionLines] = useState<ConnectionLine[]>([])

    const [mouseX, mouseY] = useMouseCoords(nodesContainerRef)

    const handleOnNewNode = useCallback(() => { }, [])

    const handleOnSetActive = (id: number) => {
        setActiveNodeID(id)
    }

    const handleOnClick = (event: MouseEvent<HTMLDivElement>) => {
        if (event.target === event.currentTarget) {
            setActiveNodeID(0)
            setActiveSocket(null)
            return
        }

        if (svgContainerRef.current === null) {
            return
        }

        const targetElement = event.target as (EventTarget & HTMLElement)
        if (!targetElement.dataset["element-type"]) {
            return
        }

        const socketID = targetElement.id

        // Display an active socket.
        if (activeSocket === null) {
            const node = getNodeFromSocketID(socketID)
            if (node === null) {
                return
            }

            const { x, y, width, height } = targetElement.getBoundingClientRect()
            setActiveSocket({
                origin: {
                    id: socketID,
                    position: {
                        x: x + (width / 2),
                        y: y + (height / 2),
                    },
                    type: getTypeFromSocketID(socketID)
                }
            })
            return
        }

        // Connect active socket to another socket.
        if (activeSocket.origin.id !== socketID) {
            const { x, y, width, height } = targetElement.getBoundingClientRect()
            const targetSocket: Socket = {
                id: socketID,
                position: {
                    x: x + (width / 2),
                    y: y + (height / 2),
                },
                type: getTypeFromSocketID(socketID),
            }
            if (!isValidConnection(activeSocket.origin, targetSocket)) {
                console.log("invalid connection")
                return
            }

            const cl: ConnectionLine = {
                id: `${activeSocket.origin.id}:${socketID}`,
                from: targetSocket.type === SocketType.Input
                    ? targetSocket
                    : activeSocket.origin,
                to: targetSocket.type !== SocketType.Input
                    ? targetSocket
                    : activeSocket.origin,
            }

            setConnectionLines(prevState => {
                return prevState.concat(cl)
            })
            setActiveSocket(null)
        }
    }

    const handleOnDraggingNode = (event: NodeDragEvent) => {
        console.log("NodeDragEvent:", event);
        setActiveSocket(null)
    }

    return <div className={classes.container}>
        <svg
            viewBox={`0 0 ${props.width} ${props.height}`}
            ref={svgContainerRef}
            className={classes.connectors}
            style={{ width: props.width, height: props.height }}
        >
            <BackgroundGrid />
            <ActiveConnectingLine
                svgRef={svgContainerRef}
                activeSocket={activeSocket}
                mouseCoords={{ x: mouseX, y: mouseY }}
            />
            {connectionLines.map(line =>
                <ConnectingLine
                    key={line.id}
                    svgRef={svgContainerRef}
                    from={line.from.position}
                    to={line.to.position}
                />)}
        </svg>
        <div
            ref={nodesContainerRef}
            id="nodes_container"
            className={classes.nodes}
            style={{ width: props.width, height: props.height }}
            onClick={handleOnClick}
        >
            <Node
                title="Math"
                inputs={[
                    { type: VariableType.Number, name: "Value" },
                    { type: VariableType.Number, name: "Value" },
                ]}
                outputs={[
                    { type: VariableType.Number, name: "Value" },
                ]}
                activeNodeID={activeNodeID}
                onCreation={handleOnNewNode}
                onActive={handleOnSetActive}
                onDragging={handleOnDraggingNode}
            />
            <Node
                title="Preview"
                inputs={[
                    { type: VariableType.Number, name: "Value" },
                ]}
                outputs={[]}
                activeNodeID={activeNodeID}
                onCreation={handleOnNewNode}
                onActive={handleOnSetActive}
                onDragging={handleOnDraggingNode}
            />
        </div>
    </div>
}

export default NodeSystem

function isValidConnection(active: Socket, target: Socket): boolean {
    if (target.type === active.type) {
        return false
    }
    if (getNodeIDFromSocketID(target.id) === getNodeIDFromSocketID(active.id)) {
        return false
    }
    return true
}

function BackgroundGrid() {
    return <>
        <defs>
            <pattern id="tenthGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 10 10 0 10" fill="none" stroke="silver" strokeWidth="0.5" />
            </pattern>
            <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
                <rect width="100" height="100" fill="url(#tenthGrid)" />
                <path d="M 100 0 L 100 100 0 100" fill="none" stroke="white" strokeOpacity="0.5" strokeWidth="1" />
            </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
    </>
}

interface ConnectingLineProps {
    svgRef: RefObject<SVGSVGElement>
    from: Coordinate
    to: Coordinate
}

function ConnectingLine({ svgRef, from, to }: ConnectingLineProps) {
    if (svgRef.current === null) {
        return null
    }

    let point = new DOMPoint(from.x, from.y)
    const svgFromPoint = point.matrixTransform(
        svgRef.current.getScreenCTM()?.inverse()
    )
    point = new DOMPoint(to.x, to.y)
    const svgToPoint = point.matrixTransform(
        svgRef.current.getScreenCTM()?.inverse()
    )

    const fromControlPointX = svgFromPoint.x - 100
    const toControlPointX = svgToPoint.x + 100

    const instructions = `
      M ${svgFromPoint.x},${svgFromPoint.y}
      C ${fromControlPointX},${svgFromPoint.y} ${toControlPointX},${svgToPoint.y} ${svgToPoint.x},${svgToPoint.y}`

    return <path
        d={instructions}
        fill="none"
        stroke="rgb(255, 255, 255)"
        strokeWidth={5}
    />
}

interface ActiveConnectingLineProps {
    svgRef: RefObject<SVGSVGElement>
    activeSocket: ActiveSocket | null
    mouseCoords: Coordinate
}

function ActiveConnectingLine({ svgRef, activeSocket, mouseCoords }: ActiveConnectingLineProps) {
    if (svgRef.current === null || activeSocket === null) {
        return null
    }

    let point = new DOMPoint(
        activeSocket.origin.position.x,
        activeSocket.origin.position.y
    )
    const svgFromPoint = point.matrixTransform(
        svgRef.current.getScreenCTM()?.inverse()
    )
    point = new DOMPoint(mouseCoords.x, mouseCoords.y)
    const svgToPoint = point.matrixTransform(
        svgRef.current.getScreenCTM()?.inverse()
    )

    const isInputType = activeSocket.origin.type === SocketType.Input
    const fromControlPointX = isInputType ? svgFromPoint.x - 100 : svgFromPoint.x + 100
    const toControlPointX = !isInputType ? svgToPoint.x - 100 : svgToPoint.x + 100

    const instructions = `
      M ${svgFromPoint.x},${svgFromPoint.y}
      C ${fromControlPointX},${svgFromPoint.y} ${toControlPointX},${svgToPoint.y} ${svgToPoint.x},${svgToPoint.y}`

    return <path
        d={instructions}
        fill="none"
        stroke="rgb(255, 255, 255)"
        strokeWidth={5}
    />
}