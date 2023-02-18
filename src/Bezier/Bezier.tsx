import { MouseEvent, TouchEvent, useRef, useState } from "react"
import classes from "./Bezier.module.css"

interface IPoint {
    x: number
    y: number
}

// Describes a bezier curve.
interface IBezierCurve {
    start: IPoint
    control: IPoint
    end: IPoint
}

type HandleID = keyof (IBezierCurve) | "none"

// Initial state of the bezier curve.
const initialBCState: IBezierCurve = {
    start: { x: 10, y: 10 },
    control: { x: 190, y: 100 },
    end: { x: 10, y: 190 },
}

interface IProps {
    viewBoxWidth: number
    viewBoxHeight: number
}

function Bezier(props: IProps) {
    const [bcState, setBCState] = useState<IBezierCurve>(initialBCState)
    const [currentDraggingHandleID, setCurrentDraggingHandleID] = useState<HandleID>("none")
    const svgContainerRef = useRef<SVGSVGElement>(null)

    const handleSetActiveHandle = (handleID: HandleID) => {
        setCurrentDraggingHandleID(handleID)
    }
    const handleRelease = () => {
        setCurrentDraggingHandleID("none")
    }

    const handleMouseMove = (event: MouseEvent<SVGSVGElement>) => {
        handleDrag(event.clientX, event.clientY)
    }

    const handleTouchMove = (event: TouchEvent<SVGSVGElement>) => {

        if (event.touches) {
            event.preventDefault()
            const touch = event.touches[0]
            handleDrag(touch.clientX, touch.clientY)
        }
    }

    const handleDrag = (clientX: number, clientY: number) => {
        if (currentDraggingHandleID === "none") {
            return
        }
        if (!svgContainerRef.current) {
            return
        }

        const screenPoint = new DOMPointReadOnly(clientX, clientY)
        const svgPoint = screenPoint.matrixTransform(svgContainerRef.current.getScreenCTM()?.inverse())

        setBCState((prevState) => {
            return {
                ...prevState,
                [currentDraggingHandleID]: {
                    x: svgPoint.x,
                    y: svgPoint.y,
                }
            }
        })
    }

    const instructions = `
      M ${bcState.start.x},${bcState.start.y}
      Q ${bcState.control.x},${bcState.control.y}
        ${bcState.end.x},${bcState.end.y}`

    return <svg
        className={classes.container}
        ref={svgContainerRef}
        viewBox={`0 0 ${props.viewBoxWidth} ${props.viewBoxHeight}`}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        onMouseUp={handleRelease}
        onMouseLeave={handleRelease}
        onTouchEnd={handleRelease}
    >
        <ConnectingLine from={bcState.start} to={bcState.control} />
        <ConnectingLine from={bcState.control} to={bcState.end} />
        <Curve instructions={instructions} />
        <LargeHandle
            coordinates={bcState.start}
            onMouseDown={() => handleSetActiveHandle("start")}
            onTouchStart={() => handleSetActiveHandle("start")}
        />
        <SmallHandle
            coordinates={bcState.control}
            onMouseDown={() => handleSetActiveHandle("control")}
            onTouchStart={() => handleSetActiveHandle("control")} />
        <LargeHandle
            coordinates={bcState.end}
            onMouseDown={() => handleSetActiveHandle("end")}
            onTouchStart={() => handleSetActiveHandle("end")}
        />
    </svg>
}

export default Bezier

interface IConnectingLineProps {
    from: IPoint
    to: IPoint
}

function ConnectingLine({ from, to }: IConnectingLineProps) {
    return <line
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        stroke="white"
        strokeDasharray="5,5"
        strokeWidth={2}
    />
}

interface ICurveProps {
    instructions: string
}

export function Curve({ instructions }: ICurveProps) {
    return <path
        d={instructions}
        fill="none"
        stroke="rgb(213, 0, 249)"
        strokeWidth={5}
    />
}

interface IHandleProps {
    coordinates: IPoint
    onMouseDown: () => void
    onTouchStart: () => void
}

function LargeHandle({ coordinates, onMouseDown, onTouchStart }: IHandleProps) {
    return <ellipse
        className={classes.handle}
        cx={coordinates.x}
        cy={coordinates.y}
        rx={15}
        ry={15}
        fill="rgb(244, 0, 137)"
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
    />
}

function SmallHandle({ coordinates, onMouseDown, onTouchStart }: IHandleProps) {
    return <ellipse
        className={classes.handle}
        cx={coordinates.x}
        cy={coordinates.y}
        rx={8}
        ry={8}
        fill="rgb(255, 255, 255)"
        stroke="rgb(244, 0, 137)"
        strokeWidth={2}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
    />
}