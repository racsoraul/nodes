import Bezier from './Bezier/Bezier'
import NodeSystem from './NodeSystem/NodeSystem'
import classes from "./App.module.css"

function App() {
  return (
    <div className={classes.container}>
      {/* <Bezier viewBoxWidth={500} viewBoxHeight={500} /> */}
      <NodeSystem />
    </div>
  )
}

export default App
