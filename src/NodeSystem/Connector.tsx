import { RefObject } from "react"
import { ActiveSocket } from "./NodeSystem"
import { Coordinate } from "./Node"
import { SocketType } from "./Socket"

interface ConnectorProps {
    svgRef: RefObject<SVGSVGElement>
    from: Coordinate
    to: Coordinate
}

export function Connector({ svgRef, from, to }: ConnectorProps) {
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

interface ActiveConnector {
    svgRef: RefObject<SVGSVGElement>
    activeSocket: ActiveSocket | null
    mouseCoords: Coordinate
}

export function ActiveConnector({ svgRef, activeSocket, mouseCoords }: ActiveConnector) {
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