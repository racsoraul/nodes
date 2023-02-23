import { RefObject, useEffect, useRef, useState } from "react"

const useMouseCoords = (ref: RefObject<HTMLElement>): [number, number] => {
    const [coords, setCoords] = useState<[number, number]>([0, 0])
    const handler = useRef<(event: globalThis.MouseEvent) => void>()

    useEffect(() => {
        if (ref.current === null || handler.current === null) {
            return
        }
        handler.current = (event: globalThis.MouseEvent) => {
            setCoords([event.clientX, event.clientY])
        }
        ref.current.addEventListener("mousemove", handler.current)

        return () => {
            if (ref.current === null) {
                return
            }
            ref.current.removeEventListener("mousemove", handler.current!)
        }
    }, [ref])
    return coords
}

export default useMouseCoords