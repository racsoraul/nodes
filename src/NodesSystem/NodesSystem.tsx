import { MouseEvent, useRef, useState } from "react"
import Node, { Coordinate, NodeDragEvent, VariableType } from "./Node"
import { SocketType, getNodeFromSocketID, getNodeIDFromSocketID, getTypeFromSocketID } from "./Socket"
import { ActiveConnector, Connector } from "./Connector"
import useMouseCoords from "../hooks/useMouseCoords"
import classes from "./NodesSystem.module.css"

export const enum ElementType {
    Socket = "Socket",
}

interface Socket {
    id: string
    type: SocketType
    position: Coordinate
}

export interface ActiveSocket {
    origin: Socket
}
interface ConnectorState {
    id: string
    from: Socket
    to: Socket
}

interface NodeSystemProps {
    width: number
    height: number
}

function NodesSystem(props: NodeSystemProps) {
    const svgContainerRef = useRef<SVGSVGElement>(null)
    const nodesContainerRef = useRef<HTMLDivElement>(null)
    const [activeNodeID, setActiveNodeID] = useState(0)
    const [activeSocket, setActiveSocket] = useState<ActiveSocket | null>(null)
    const [connectors, setConnectors] = useState<ConnectorState[]>([])

    const [mouseX, mouseY] = useMouseCoords(nodesContainerRef)

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

            const fromSocket = targetSocket.type === SocketType.Input
                ? targetSocket
                : activeSocket.origin
            const toSocket = targetSocket.type !== SocketType.Input
                ? targetSocket
                : activeSocket.origin

            const cl: ConnectorState = {
                id: `${fromSocket.id}:${toSocket.id}`,
                from: fromSocket,
                to: toSocket,
            }

            // Prevent duplicate connections.
            for (let index = 0; index < connectors.length; index++) {
                if (connectors[index].id === cl.id) {
                    setActiveSocket(null)
                    return
                }
            }

            setConnectors(prevState => {
                return prevState.concat(cl)
            })
            setActiveSocket(null)
        }
    }

    const handleOnDraggingNode = (nodeEvent: NodeDragEvent) => {
        setActiveSocket(null)
        setConnectors(prevState => {
            let cache: { [id: string]: Coordinate } = {}
            const nextState = prevState.concat()
            for (let index = 0; index < nextState.length; index++) {
                const fromSocketID = nextState[index].from.id
                const toSocketID = nextState[index].to.id
                const fromNodeID = getNodeIDFromSocketID(fromSocketID)
                const toNodeID = getNodeIDFromSocketID(toSocketID)

                if (nodeEvent.id === fromNodeID) {
                    if (cache[fromSocketID]) {
                        nextState[index].from.position = cache[fromSocketID]
                    } else {
                        const { x, y, width, height } = nodeEvent.sockets[fromSocketID].ref.getBoundingClientRect()
                        const PosX = x + (width / 2)
                        const PosY = y + (height / 2)
                        nextState[index].from.position = { x: PosX, y: PosY }
                        cache[fromSocketID] = { x: PosX, y: PosY }
                    }
                }

                if (nodeEvent.id === toNodeID) {
                    if (cache[toSocketID]) {
                        nextState[index].to.position = cache[toSocketID]
                    } else if (nodeEvent.sockets[toSocketID].ref) {
                        const { x, y, width, height } = nodeEvent.sockets[toSocketID].ref.getBoundingClientRect()
                        const PosX = x + (width / 2)
                        const PosY = y + (height / 2)
                        nextState[index].to.position = { x: PosX, y: PosY }
                        cache[toSocketID] = { x: PosX, y: PosY }
                    }
                }
            }
            return nextState
        })
    }

    return <div className={classes.container}>
        <svg
            viewBox={`0 0 ${props.width} ${props.height}`}
            ref={svgContainerRef}
            className={classes.connectors}
            style={{ width: props.width, height: props.height }}
        >
            <BackgroundGrid />
            <ActiveConnector
                svgRef={svgContainerRef}
                activeSocket={activeSocket}
                mouseCoords={{ x: mouseX, y: mouseY }}
            />
            {connectors.map(conn =>
                <Connector
                    key={conn.id}
                    svgRef={svgContainerRef}
                    from={conn.from.position}
                    to={conn.to.position}
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
                onActive={handleOnSetActive}
                onDragging={handleOnDraggingNode}
            />
            <Node
                title="Preview Two"
                inputs={[
                    { type: VariableType.Number, name: "Value" },
                ]}
                outputs={[]}
                activeNodeID={activeNodeID}
                onActive={handleOnSetActive}
                onDragging={handleOnDraggingNode}
            />
        </div>
    </div>
}

export default NodesSystem

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
