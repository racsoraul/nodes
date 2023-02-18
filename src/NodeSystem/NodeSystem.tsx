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

function NodeSystem() {
    const svgContainerRef = useRef<SVGSVGElement>(null)
    const [nodeRefs, setNodeRefs] = useState<NodesState>({})
    const [recentlyActive, setRecentlyActive] = useState(0)

    useEffect(() => {
        if (svgContainerRef.current) {
            const path = document.createElementNS("http://www.w3.org/2000/svg", "path")
            path.setAttribute("d", "M 100,100 L 700,300")
            path.setAttribute("id", "asd")
            svgContainerRef.current.appendChild(path)
            return () => path.remove()
        }
    }, [])

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
        setRecentlyActive(id)
    }

    return <div className={classes.container}>
        <svg
            ref={svgContainerRef}
            className={classes.connectors}
        />
        <div id="nodes_container" className={classes.nodes}>
            <Node
                title="Math"
                inputs={[
                    { type: VariableType.Number, name: "Value" },
                    { type: VariableType.Number, name: "Value" },
                ]}
                outputs={[
                    { type: VariableType.Number, name: "Value" },
                ]}
                recentlyActive={recentlyActive}
                onCreation={handleOnNewNode}
                onActive={handleOnSetActive}
            />
            <Node
                title="Preview"
                inputs={[
                    { type: VariableType.Number, name: "Value" },
                ]}
                outputs={[]}
                recentlyActive={recentlyActive}
                onCreation={handleOnNewNode}
                onActive={handleOnSetActive}
            />
        </div>
    </div>
}

export default NodeSystem
