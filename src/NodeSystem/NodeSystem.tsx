import { useEffect, useRef, useState } from "react"
import Node, { VariableType } from "./Node"
import classes from "./NodeSystem.module.css"

export interface NodeRef {
    id: number
    connections: string[]
}

interface NodesState {
    [key: string]: NodeRef
}

interface NodeSystemProps {
    width: number
    height: number
}

function NodeSystem(props: NodeSystemProps) {
    const svgContainerRef = useRef<SVGSVGElement>(null)
    const nodesContainerRef = useRef<HTMLDivElement>(null)
    const [nodeRefs, setNodeRefs] = useState<NodesState>({})
    const [activeNodeID, setActiveNodeID] = useState(0)

    // useEffect(() => {
    //     if (svgContainerRef.current && nodesContainerRef.current) {
    //         const path = document.createElementNS("http://www.w3.org/2000/svg", "path")
    //         const ncx = nodesContainerRef.current.getBoundingClientRect().left || 0
    //         const ncy = nodesContainerRef.current.getBoundingClientRect().top || 0

    //         const origin = new DOMPointReadOnly(ncx, ncy)
    //         const originDOMPoint = origin.matrixTransform(svgContainerRef.current.getScreenCTM()?.inverse())
    //         const end = new DOMPointReadOnly(ncx + 1000, ncy + 1000)
    //         const endDOMPoint = end.matrixTransform(svgContainerRef.current.getScreenCTM()?.inverse())
    //         path.setAttribute("d", `M ${originDOMPoint.x},${originDOMPoint.y} L ${endDOMPoint.x},${endDOMPoint.y}`)
    //         path.setAttribute("stroke", "white")
    //         svgContainerRef.current.appendChild(path)
    //         svgContainerRef.current.append()
    //         return () => path.remove()
    //     }
    // }, [])

    const handleOnNewNode = (ref: NodeRef) => {
        setNodeRefs(prevState => {
            return {
                ...prevState,
                [ref.id]: ref
            }
        })
    }

    const handleOnSetActive = (id: number) => {
        console.log(id);
        setActiveNodeID(id)
    }

    return <div className={classes.container}>
        <svg
            viewBox={`0 0 ${props.width} ${props.height}`}
            ref={svgContainerRef}
            className={classes.connectors}
            style={{ width: props.width, height: props.height }}
        >
            <defs>
                <pattern id="tenthGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                    <path d="M 10 0 L 10 10 0 10" fill="none" stroke="silver" strokeWidth="0.5" />
                </pattern>
                <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
                    <rect width="100" height="100" fill="url(#tenthGrid)" />
                    <path d="M 100 0 L 100 100 0 100" fill="none" stroke="white" strokeOpacity="0.5" strokeWidth="1" />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)"/>
        </svg>
        <div
            ref={nodesContainerRef}
            id="nodes_container"
            className={classes.nodes}
            style={{ width: props.width, height: props.height }}
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
            />
        </div>
    </div>
}

export default NodeSystem
